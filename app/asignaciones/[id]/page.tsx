'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Asignacion } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AsignacionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadAsignacion(Number(params.id));
    }
  }, [params.id]);

  const loadAsignacion = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getAsignacion(id);
      setAsignacion(data);
    } catch (error: any) {
      toast.error('Error al cargar asignación');
      router.push('/asignaciones');
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

  if (!asignacion) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/asignaciones"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Detalle de Asignación
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Información completa de la asignación
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información del Activo
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Código
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asignacion.activo?.codigo}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asignacion.activo?.nombre}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <p className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        asignacion.activo?.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {asignacion.activo?.estado}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información del Empleado
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asignacion.empleado?.nombre}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cargo
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asignacion.empleado?.cargo || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Área
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asignacion.empleado?.area?.nombre || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Fechas
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Asignación
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asignacion.fechaAsignacion
                      ? format(new Date(asignacion.fechaAsignacion), 'dd/MM/yyyy HH:mm')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Devolución
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asignacion.fechaDevolucion
                      ? format(new Date(asignacion.fechaDevolucion), 'dd/MM/yyyy HH:mm')
                      : 'Pendiente'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <p className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        asignacion.fechaDevolucion
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {asignacion.fechaDevolucion ? 'Devuelto' : 'Activa'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Usuarios
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Entregado Por
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asignacion.entregadoPor?.nombreCompleto || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Recibido Por
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {asignacion.recibidoPor?.nombreCompleto || 'N/A'}
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

