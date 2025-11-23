'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Building2, Plus, Edit, Trash2, Eye, Power } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Empresa {
  id: number;
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  estadisticas?: {
    totalUsuarios: number;
    totalActivos: number;
    totalSedes: number;
    totalEmpleados: number;
    mantenimientosProximos: number;
  };
}

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; empresa: Empresa | null }>({
    open: false,
    empresa: null,
  });

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllEmpresasAdmin();
      // Cargar estadísticas para cada empresa
      const empresasConStats = await Promise.all(
        data.map(async (empresa: Empresa) => {
          try {
            const detallada = await api.getEmpresaDetallada(empresa.id);
            return { ...empresa, estadisticas: detallada.estadisticas };
          } catch {
            return empresa;
          }
        })
      );
      setEmpresas(empresasConStats);
    } catch (error: any) {
      toast.error('Error al cargar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.empresa) return;

    try {
      await api.deleteEmpresaAdmin(deleteDialog.empresa.id);
      toast.success('Empresa eliminada exitosamente');
      setDeleteDialog({ open: false, empresa: null });
      loadEmpresas();
    } catch (error: any) {
      toast.error('Error al eliminar empresa');
    }
  };

  const handleToggleActiva = async (id: number, activa: boolean) => {
    try {
      await api.toggleEmpresaActiva(id, activa);
      toast.success(`Empresa ${activa ? 'activada' : 'desactivada'}`);
      loadEmpresas();
    } catch (error: any) {
      toast.error('Error al cambiar estado de empresa');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['administrador_sistema']}>
        <AdminLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['administrador_sistema']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Empresas</h1>
              <p className="mt-2 text-sm text-gray-600">
                Administra todas las empresas del sistema
              </p>
            </div>
            <Link
              href="/admin/empresas/nueva"
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Empresa
            </Link>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuarios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empleados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mantenimientos
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {empresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{empresa.nombre}</div>
                            {empresa.correo && (
                              <div className="text-sm text-gray-500">{empresa.correo}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {empresa.nit || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empresa.estadisticas?.totalUsuarios || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empresa.estadisticas?.totalActivos || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empresa.estadisticas?.totalEmpleados || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {empresa.estadisticas?.mantenimientosProximos || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/empresas/${empresa.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver detalles"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link
                            href={`/admin/empresas/${empresa.id}/editar`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleToggleActiva(empresa.id, true)}
                            className="text-green-600 hover:text-green-900"
                            title="Activar/Desactivar"
                          >
                            <Power className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ open: true, empresa })}
                            className="text-red-600 hover:text-red-900"
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
          </div>

          <ConfirmDialog
            open={deleteDialog.open}
            title="Eliminar Empresa"
            message={`¿Estás seguro de que deseas eliminar la empresa "${deleteDialog.empresa?.nombre}"? Esta acción no se puede deshacer.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteDialog({ open: false, empresa: null })}
          />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

