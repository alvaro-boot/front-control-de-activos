'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Empresa } from '@/types';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { isSystemAdmin } from '@/lib/auth';

export default function EmpresaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = isSystemAdmin();

  useEffect(() => {
    if (params.id) {
      loadEmpresa(Number(params.id));
    }
  }, [params.id]);

  const loadEmpresa = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getEmpresa(id);
      setEmpresa(data);
    } catch (error: any) {
      toast.error('Error al cargar empresa');
      router.push('/empresas');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!empresa) {
    return null;
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta empresa? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await api.deleteEmpresa(empresa.id);
      toast.success('Empresa eliminada exitosamente');
      router.push('/empresas');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar empresa');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['administrador_sistema']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/empresas"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {empresa.nombre}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Información de la empresa
                </p>
              </div>
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/empresas/${empresa.id}/editar`}
                  className="btn btn-primary flex items-center"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger flex items-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información General
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{empresa.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">NIT</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empresa.nit || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Dirección
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empresa.direccion || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información de Contacto
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Correo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empresa.correo || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Teléfono
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empresa.telefono || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Creación
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empresa.creadoEn
                      ? new Date(empresa.creadoEn).toLocaleDateString('es-ES')
                      : 'N/A'}
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

