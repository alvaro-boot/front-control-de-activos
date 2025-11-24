'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Mantenimiento } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';

export default function MantenimientosActivoPage() {
  const params = useParams();
  const router = useRouter();
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [activo, setActivo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadData(Number(params.id));
    }
  }, [params.id]);

  const loadData = async (id: number) => {
    try {
      setIsLoading(true);
      const [activoData, mantenimientosData] = await Promise.all([
        api.getActivo(id),
        api.getHistorialMantenimientosActivo(id),
      ]);
      setActivo(activoData);
      setMantenimientos(Array.isArray(mantenimientosData) ? mantenimientosData : []);
    } catch (error: any) {
      toast.error('Error al cargar mantenimientos');
      router.push(`/activos/${id}`);
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link
                href={`/activos/${params.id}`}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Historial de Mantenimientos
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  {activo?.codigo} - {activo?.nombre}
                </p>
              </div>
            </div>
            <Link
              href={`/mantenimientos/nuevo?activoId=${params.id}`}
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Mantenimiento
            </Link>
          </div>

          <div className="card">
            {mantenimientos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay mantenimientos registrados para este activo
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Técnico</th>
                      <th>Costo</th>
                      <th>Notas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mantenimientos.map((mant) => (
                      <tr key={mant.id}>
                        <td>
                          {mant.fechaMantenimiento
                            ? format(new Date(mant.fechaMantenimiento), 'dd/MM/yyyy')
                            : 'N/A'}
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              mant.tipo === 'preventivo'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {mant.tipo}
                          </span>
                        </td>
                        <td>{mant.tecnico?.nombreCompleto || 'N/A'}</td>
                        <td>
                          {formatCurrency(mant.costo)}
                        </td>
                        <td className="max-w-xs truncate">
                          {mant.notas || 'Sin notas'}
                        </td>
                        <td>
                          <Link
                            href={`/mantenimientos/${mant.id}`}
                            className="text-primary-600 hover:text-primary-800 text-sm"
                          >
                            Ver detalles
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

