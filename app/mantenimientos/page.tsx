'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Mantenimiento, Empresa } from '@/types';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { isSystemAdmin } from '@/lib/auth';

export default function MantenimientosPage() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [filteredMantenimientos, setFilteredMantenimientos] = useState<Mantenimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | undefined>(undefined);
  const isAdmin = isSystemAdmin();

  useEffect(() => {
    if (isAdmin) {
      loadEmpresas();
    }
  }, [isAdmin]);

  useEffect(() => {
    loadMantenimientos();
  }, [selectedEmpresaId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = mantenimientos.filter(
        (mant) =>
          mant.activo?.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mant.activo?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMantenimientos(filtered);
    } else {
      setFilteredMantenimientos(mantenimientos);
    }
  }, [searchTerm, mantenimientos]);

  const loadEmpresas = async () => {
    try {
      const data = await api.getEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Error al cargar empresas');
    }
  };

  const loadMantenimientos = async () => {
    try {
      setIsLoading(true);
      // El backend filtra automáticamente por empresa según el usuario
      // Solo enviamos empresaId si es admin y quiere filtrar
      const data = await api.getMantenimientos();
      let mantenimientosData = Array.isArray(data) ? data : [];
      
      // Si es admin y seleccionó una empresa, filtrar en el frontend
      if (isAdmin && selectedEmpresaId) {
        mantenimientosData = mantenimientosData.filter(
          (mant) => mant.activo?.empresaId === selectedEmpresaId
        );
      }
      
      setMantenimientos(mantenimientosData);
      setFilteredMantenimientos(mantenimientosData);
    } catch (error: any) {
      toast.error('Error al cargar mantenimientos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mantenimientos</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gestión de mantenimientos de activos
              </p>
            </div>
            <Link
              href="/mantenimientos/nuevo"
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Mantenimiento
            </Link>
          </div>

          <div className="card space-y-4">
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Empresa
                </label>
                <select
                  value={selectedEmpresaId || ''}
                  onChange={(e) => setSelectedEmpresaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="input"
                >
                  <option value="">Todas las empresas</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por activo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="card">
              {filteredMantenimientos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay mantenimientos registrados
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Activo</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Técnico</th>
                        <th>Costo</th>
                        <th>Notas</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMantenimientos.map((mant) => (
                        <tr key={mant.id}>
                          <td>
                            <div>
                              <div className="font-medium">
                                {mant.activo?.codigo}
                              </div>
                              <div className="text-sm text-gray-500">
                                {mant.activo?.nombre}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                mant.tipo === 'preventivo'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {mant.tipo}
                            </span>
                          </td>
                          <td>
                            {mant.fechaMantenimiento
                              ? format(new Date(mant.fechaMantenimiento), 'dd/MM/yyyy')
                              : 'N/A'}
                          </td>
                          <td>{mant.tecnico?.nombreCompleto || 'N/A'}</td>
                          <td>
                            {formatCurrency(mant.costo)}
                          </td>
                          <td className="max-w-xs truncate">
                            {mant.notas || 'Sin notas'}
                          </td>
                          <td>
                            <Link
                              href={`/mantenimientos/${mant.id}`}
                              className="text-primary-600 hover:text-primary-800 text-sm"
                            >
                              Ver detalles
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

