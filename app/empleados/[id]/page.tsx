'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Empleado } from '@/types';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';

export default function EmpleadoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadEmpleado(Number(params.id));
    }
  }, [params.id]);

  const loadEmpleado = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getEmpleado(id);
      setEmpleado(data);
    } catch (error: any) {
      toast.error('Error al cargar empleado');
      router.push('/empleados');
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

  if (!empleado) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/empleados"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {empleado.nombre}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Información del empleado
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Personal
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{empleado.nombre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cargo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empleado.cargo || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Correo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empleado.correo || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Teléfono
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empleado.telefono || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Organizacional
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Empresa
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empleado.empresa?.nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Área
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empleado.area?.nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Sede
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {empleado.area?.sede?.nombre || 'N/A'}
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

