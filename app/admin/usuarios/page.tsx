'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Users, Plus, Edit, Trash2, Key, Power, Building2, Shield } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Usuario {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  activo: number;
  empresa?: { id: number; nombre: string };
  rol?: { id: number; nombre: string };
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; usuario: Usuario | null }>({
    open: false,
    usuario: null,
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; usuario: Usuario | null }>({
    open: false,
    usuario: null,
  });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllUsuariosAdmin();
      setUsuarios(data);
    } catch (error: any) {
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.usuario) return;

    try {
      await api.deleteUsuarioAdmin(deleteDialog.usuario.id);
      toast.success('Usuario eliminado exitosamente');
      setDeleteDialog({ open: false, usuario: null });
      loadUsuarios();
    } catch (error: any) {
      toast.error('Error al eliminar usuario');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.usuario || !newPassword) {
      toast.error('Ingresa una contraseña válida');
      return;
    }

    try {
      await api.resetPasswordAdmin(resetPasswordDialog.usuario.id, newPassword);
      toast.success('Contraseña reseteada exitosamente');
      setResetPasswordDialog({ open: false, usuario: null });
      setNewPassword('');
      loadUsuarios();
    } catch (error: any) {
      toast.error('Error al resetear contraseña');
    }
  };

  const handleToggleActivo = async (id: number, activo: boolean) => {
    try {
      await api.toggleUsuarioActivo(id, activo);
      toast.success(`Usuario ${activo ? 'activado' : 'bloqueado'}`);
      loadUsuarios();
    } catch (error: any) {
      toast.error('Error al cambiar estado del usuario');
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
              <h1 className="text-3xl font-bold text-gray-900">Gestión Global de Usuarios</h1>
              <p className="mt-2 text-sm text-gray-600">
                Administra todos los usuarios del sistema
              </p>
            </div>
            <Link
              href="/admin/usuarios/nuevo"
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </Link>
          </div>

          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.nombreCompleto}
                            </div>
                            <div className="text-sm text-gray-500">{usuario.correo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Building2 className="h-4 w-4 text-gray-400 mr-1" />
                          {usuario.empresa?.nombre || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                          {usuario.rol?.nombre || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            usuario.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {usuario.activo ? 'Activo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/usuarios/${usuario.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver detalles"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => setResetPasswordDialog({ open: true, usuario })}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Resetear contraseña"
                          >
                            <Key className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleToggleActivo(usuario.id, !usuario.activo)}
                            className={`${
                              usuario.activo
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={usuario.activo ? 'Bloquear' : 'Activar'}
                          >
                            <Power className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ open: true, usuario })}
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
            title="Eliminar Usuario"
            message={`¿Estás seguro de que deseas eliminar el usuario "${deleteDialog.usuario?.nombreCompleto}"? Esta acción no se puede deshacer.`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteDialog({ open: false, usuario: null })}
          />

          {/* Dialog para resetear contraseña */}
          {resetPasswordDialog.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resetear Contraseña
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Nueva contraseña para: {resetPasswordDialog.usuario?.nombreCompleto}
                </p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="input w-full mb-4"
                  minLength={6}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setResetPasswordDialog({ open: false, usuario: null });
                      setNewPassword('');
                    }}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={!newPassword || newPassword.length < 6}
                    className="btn btn-primary"
                  >
                    Resetear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

