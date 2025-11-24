'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ArrowLeft, Edit, Key, Power, Building2, Shield } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';

interface Usuario {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  activo: number;
  empresa?: { id: number; nombre: string };
  rol?: { id: number; nombre: string };
  area?: { id: number; nombre: string };
}

export default function UsuarioDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (params.id) {
      loadUsuario(Number(params.id));
    }
  }, [params.id]);

  const loadUsuario = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getUsuarioAdmin(id);
      setUsuario(data);
    } catch (error: any) {
      toast.error('Error al cargar usuario');
      router.push('/admin/usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!usuario || !newPassword) {
      toast.error('Ingresa una contraseña válida');
      return;
    }

    try {
      await api.resetPasswordAdmin(usuario.id, newPassword);
      toast.success('Contraseña reseteada exitosamente');
      setResetPasswordDialog(false);
      setNewPassword('');
    } catch (error: any) {
      toast.error('Error al resetear contraseña');
    }
  };

  const handleToggleActivo = async () => {
    if (!usuario) return;

    try {
      await api.toggleUsuarioActivo(usuario.id, !usuario.activo);
      toast.success(`Usuario ${usuario.activo ? 'bloqueado' : 'activado'}`);
      loadUsuario(usuario.id);
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

  if (!usuario) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['administrador_sistema']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/usuarios"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{usuario.nombreCompleto}</h1>
                <p className="mt-2 text-sm text-gray-600">{usuario.correo}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/admin/usuarios/${usuario.id}/editar`}
                className="btn btn-primary flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información General */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información General
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                  <p className="mt-1 text-sm text-gray-900">{usuario.nombreCompleto}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
                  <p className="mt-1 text-sm text-gray-900">{usuario.correo}</p>
                </div>
                {usuario.telefono && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Teléfono</label>
                    <p className="mt-1 text-sm text-gray-900">{usuario.telefono}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <p className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.activo ? 'Activo' : 'Bloqueado'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Información de Empresa y Rol */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Asignación
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Empresa</label>
                  <div className="mt-1 flex items-center">
                    <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{usuario.empresa?.nombre || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rol</label>
                  <div className="mt-1 flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                      {typeof usuario.role === 'string' ? usuario.role : usuario.role?.nombre || 'N/A'}
                    </span>
                  </div>
                </div>
                {usuario.area && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Área</label>
                    <p className="mt-1 text-sm text-gray-900">{usuario.area.nombre}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Acciones Rápidas
            </h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setResetPasswordDialog(true)}
                className="btn btn-secondary flex items-center"
              >
                <Key className="mr-2 h-4 w-4" />
                Resetear Contraseña
              </button>
              <button
                onClick={handleToggleActivo}
                className={`btn flex items-center ${
                  usuario.activo ? 'btn-warning' : 'btn-success'
                }`}
              >
                <Power className="mr-2 h-4 w-4" />
                {usuario.activo ? 'Bloquear Usuario' : 'Activar Usuario'}
              </button>
            </div>
          </div>

          {/* Dialog para resetear contraseña */}
          {resetPasswordDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Resetear Contraseña
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Nueva contraseña para: {usuario.nombreCompleto}
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
                      setResetPasswordDialog(false);
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

