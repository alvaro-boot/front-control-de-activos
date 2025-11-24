'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { User } from '@/types';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';

export default function UsuarioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsuario = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getUsuario(id);
      setUsuario(data);
    } catch (error: any) {
      toast.error('Error al cargar usuario');
      router.push('/usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (params.id) {
      loadUsuario(Number(params.id));
    }
  }, [params.id, loadUsuario]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['administrador', 'administrador_sistema']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/usuarios"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {usuario.nombreCompleto}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  {usuario.correo}
                </p>
              </div>
            </div>
            <Link
              href={`/usuarios/${usuario.id}/editar`}
              className="btn btn-primary flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Personal
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre Completo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {usuario.nombreCompleto}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Correo Electrónico
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{usuario.correo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Teléfono
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {usuario.telefono || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <p className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        usuario.activo === 1
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {usuario.activo === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información del Sistema
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rol
                  </label>
                  <p className="mt-1">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 capitalize">
                      {usuario.role?.nombre || 'N/A'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Empresa
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {usuario.empresa?.nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Área
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {usuario.area?.nombre || 'Sin área asignada'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

