'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Mantenimiento } from '@/types';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';

export default function MantenimientoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mantenimiento, setMantenimiento] = useState<Mantenimiento | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadMantenimiento(Number(params.id));
    }
  }, [params.id]);

  const loadMantenimiento = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getMantenimiento(id);
      setMantenimiento(data);
    } catch (error: any) {
      toast.error('Error al cargar mantenimiento');
      router.push('/mantenimientos');
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

  if (!mantenimiento) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/mantenimientos"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Detalle de Mantenimiento
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  {mantenimiento.activo?.codigo} - {mantenimiento.activo?.nombre}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Información del Mantenimiento
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Activo
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {mantenimiento.activo?.codigo} - {mantenimiento.activo?.nombre}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo</label>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      mantenimiento.tipo === 'preventivo'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {mantenimiento.tipo}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fecha de Mantenimiento
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {mantenimiento.fechaMantenimiento
                    ? format(
                        new Date(mantenimiento.fechaMantenimiento),
                        'dd/MM/yyyy'
                      )
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Técnico
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {mantenimiento.tecnico?.nombreCompleto || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Costo</label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatCurrency(mantenimiento.costo)}
                </p>
              </div>
              {mantenimiento.notas && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Notas
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {mantenimiento.notas}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

