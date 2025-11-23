'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo } from '@/types';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function ActivoQRPage() {
  const params = useParams();
  const router = useRouter();
  const [activo, setActivo] = useState<Activo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadActivo(Number(params.id));
    }
  }, [params.id]);

  const loadActivo = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getActivo(id);
      setActivo(data);
    } catch (error: any) {
      toast.error('Error al cargar activo');
      if (error.response?.status === 404) {
        router.push('/activos');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'retirado':
        return 'bg-gray-100 text-gray-800';
      case 'perdido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (!activo) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <p className="text-gray-600">Activo no encontrado</p>
            <Link href="/activos" className="text-primary-600 hover:text-primary-800 mt-4 inline-block">
              Volver a activos
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/activos"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activo.nombre}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Código: {activo.codigo}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/activos/${activo.id}`}
                className="btn btn-primary flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Ver detalles completos
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Principal */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información General
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Código
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{activo.codigo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <p className="mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                        activo.estado
                      )}`}
                    >
                      {activo.estado}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Categoría
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {activo.categoria?.nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Sede
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {activo.sede?.nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Área
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {activo.area?.nombre || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Responsable
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {activo.responsable?.nombreCompleto || 'N/A'}
                  </p>
                </div>
                {activo.descripcion && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Descripción
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {activo.descripcion}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información Financiera */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Financiera
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Fecha de Compra
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {activo.fechaCompra
                      ? format(new Date(activo.fechaCompra), 'dd/MM/yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Valor de Compra
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {activo.valorCompra
                      ? `$${activo.valorCompra.toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Valor Actual
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {activo.valorActual
                      ? `$${activo.valorActual.toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                {activo.empresa && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Empresa
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {activo.empresa.nombre}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

