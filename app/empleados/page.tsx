'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Empleado, Empresa } from '@/types';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([]);
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
    loadEmpleados();
  }, [selectedEmpresaId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = empleados.filter(
        (emp) =>
          emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.correo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmpleados(filtered);
    } else {
      setFilteredEmpleados(empleados);
    }
  }, [searchTerm, empleados]);

  const loadEmpresas = async () => {
    try {
      const data = await api.getEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Error al cargar empresas');
    }
  };

  const loadEmpleados = async () => {
    try {
      setIsLoading(true);
      // Solo enviar empresaId si es admin del sistema y ha seleccionado una empresa
      const empresaId = isAdmin ? selectedEmpresaId : undefined;
      const data = await api.getEmpleados(empresaId);
      const empleadosData = Array.isArray(data) ? data : [];
      setEmpleados(empleadosData);
      setFilteredEmpleados(empleadosData);
    } catch (error: any) {
      toast.error('Error al cargar empleados');
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
              <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gestión de empleados
              </p>
            </div>
            <Link
              href="/empleados/nuevo"
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Empleado
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
                placeholder="Buscar empleado..."
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
              {filteredEmpleados.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay empleados registrados
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Cargo</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Área</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmpleados.map((empleado) => (
                        <tr key={empleado.id}>
                          <td className="font-medium">
                            <Link
                              href={`/empleados/${empleado.id}`}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              {empleado.nombre}
                            </Link>
                          </td>
                          <td>{empleado.cargo || 'N/A'}</td>
                          <td>{empleado.correo || 'N/A'}</td>
                          <td>{empleado.telefono || 'N/A'}</td>
                          <td>{empleado.area?.nombre || 'N/A'}</td>
                          <td>
                            <Link
                              href={`/asignaciones/empleado/${empleado.id}`}
                              className="text-sm text-primary-600 hover:text-primary-800"
                            >
                              Ver historial
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

