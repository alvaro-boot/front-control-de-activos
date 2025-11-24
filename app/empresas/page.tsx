'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Empresa } from '@/types';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { isSystemAdmin } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function EmpresasPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmpresas();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = empresas.filter(
        (emp) =>
          emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.nit?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmpresas(filtered);
    } else {
      setFilteredEmpresas(empresas);
    }
  }, [searchTerm, empresas]);

  const loadEmpresas = async () => {
    try {
      setIsLoading(true);
      const data = await api.getEmpresas();
      const empresasData = Array.isArray(data) ? data : [];
      setEmpresas(empresasData);
      setFilteredEmpresas(empresasData);
    } catch (error: any) {
      toast.error('Error al cargar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const { confirm } = await import('@/lib/confirm');
    const confirmed = await confirm('¿Estás seguro de eliminar esta empresa? Esta acción no se puede deshacer.', {
      title: 'Confirmar Eliminación',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    try {
      await api.deleteEmpresa(id);
      toast.success('Empresa eliminada exitosamente');
      loadEmpresas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar empresa');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['administrador_sistema']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
              <p className="mt-2 text-sm text-gray-600">
                Listado de empresas
              </p>
            </div>
            <button
              onClick={() => router.push('/empresas/nueva')}
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nueva Empresa
            </button>
          </div>

          <div className="card">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar empresa..."
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
              {filteredEmpresas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay empresas registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>NIT</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Dirección</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmpresas.map((empresa) => (
                        <tr key={empresa.id} className="hover:bg-gray-50">
                          <td className="font-medium">
                            <Link
                              href={`/empresas/${empresa.id}`}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              {empresa.nombre}
                            </Link>
                          </td>
                          <td>{empresa.nit || 'N/A'}</td>
                          <td>{empresa.correo || 'N/A'}</td>
                          <td>{empresa.telefono || 'N/A'}</td>
                          <td className="max-w-xs truncate">
                            {empresa.direccion || 'N/A'}
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/empresas/${empresa.id}`}
                                className="text-primary-600 hover:text-primary-800"
                                title="Ver detalles"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/empresas/${empresa.id}/editar`}
                                className="text-blue-600 hover:text-blue-800"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(empresa.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
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

