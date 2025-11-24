'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Asignacion, Empresa } from '@/types';
import { Plus, Search, CheckCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { format } from 'date-fns';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';

export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [filteredAsignaciones, setFilteredAsignaciones] = useState<Asignacion[]>([]);
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
    loadAsignaciones();
  }, [selectedEmpresaId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = asignaciones.filter(
        (asignacion) =>
          asignacion.activo?.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asignacion.activo?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asignacion.empleado?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAsignaciones(filtered);
    } else {
      setFilteredAsignaciones(asignaciones);
    }
  }, [searchTerm, asignaciones]);

  const loadEmpresas = async () => {
    try {
      const data = await api.getEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Error al cargar empresas');
    }
  };

  const loadAsignaciones = async () => {
    try {
      setIsLoading(true);
      // El backend filtra automáticamente por empresa según el usuario
      const data = await api.getAsignaciones();
      let asignacionesData = Array.isArray(data) ? data : [];
      
      // Si es admin y seleccionó una empresa, filtrar en el frontend
      if (isAdmin && selectedEmpresaId) {
        asignacionesData = asignacionesData.filter(
          (asignacion) => asignacion.activo?.empresaId === selectedEmpresaId
        );
      }
      
      setAsignaciones(asignacionesData);
      setFilteredAsignaciones(asignacionesData);
    } catch (error: any) {
      toast.error('Error al cargar asignaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevolver = async (id: number) => {
    const { confirm: confirmAction } = await import('@/lib/confirm');
    const confirmed = await confirmAction('¿Confirmar devolución del activo?', {
      title: 'Confirmar Devolución',
      type: 'warning',
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    try {
      await api.devolverAsignacion(id, {
        fechaDevolucion: new Date().toISOString(),
      });
      toast.success('Activo devuelto exitosamente');
      loadAsignaciones();
    } catch (error: any) {
      toast.error('Error al devolver activo');
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asignaciones</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gestión de asignaciones de activos a empleados
              </p>
            </div>
            <Link
              href="/asignaciones/nueva"
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nueva Asignación
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
                placeholder="Buscar por activo o empleado..."
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
              {filteredAsignaciones.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay asignaciones registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Activo</th>
                        <th>Empleado</th>
                        <th>Fecha Asignación</th>
                        <th>Fecha Devolución</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAsignaciones.map((asignacion) => (
                        <tr key={asignacion.id}>
                          <td>
                            <div>
                              <div className="font-medium">
                                {asignacion.activo?.codigo}
                              </div>
                              <div className="text-sm text-gray-500">
                                {asignacion.activo?.nombre}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="font-medium">
                                {asignacion.empleado?.nombre}
                              </div>
                              <div className="text-sm text-gray-500">
                                {asignacion.empleado?.cargo}
                              </div>
                            </div>
                          </td>
                          <td>
                            {asignacion.fechaAsignacion
                              ? format(
                                  new Date(asignacion.fechaAsignacion),
                                  'dd/MM/yyyy'
                                )
                              : 'N/A'}
                          </td>
                          <td>
                            {asignacion.fechaDevolucion
                              ? format(
                                  new Date(asignacion.fechaDevolucion),
                                  'dd/MM/yyyy'
                                )
                              : 'Pendiente'}
                          </td>
                          <td>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                asignacion.fechaDevolucion
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {asignacion.fechaDevolucion ? 'Devuelto' : 'Activa'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/asignaciones/${asignacion.id}`}
                                className="text-primary-600 hover:text-primary-800"
                                title="Ver detalles"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                              {!asignacion.fechaDevolucion && (
                                <button
                                  onClick={() => handleDevolver(asignacion.id)}
                                  className="btn btn-secondary text-sm flex items-center"
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Devolver
                                </button>
                              )}
                            </div>
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

