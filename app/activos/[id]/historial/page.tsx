'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { format } from 'date-fns';

export default function HistorialActivoPage() {
  const params = useParams();
  const router = useRouter();
  const [historial, setHistorial] = useState<any[]>([]);
  const [activo, setActivo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadHistorial(Number(params.id));
    }
  }, [params.id]);

  const loadHistorial = async (id: number) => {
    try {
      setIsLoading(true);
      const [activoData, historialData] = await Promise.all([
        api.getActivo(id),
        api.getHistorialAsignacionesActivo(id),
      ]);
      setActivo(activoData);
      setHistorial(Array.isArray(historialData) ? historialData : []);
    } catch (error: any) {
      toast.error('Error al cargar historial');
      router.push('/activos');
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
          <div className="flex items-center space-x-4">
            <Link
              href={`/activos/${params.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Historial de Asignaciones
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {activo?.codigo} - {activo?.nombre}
              </p>
            </div>
          </div>

          <div className="card">
            {historial.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay historial de asignaciones para este activo
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Empleado</th>
                      <th>Fecha Asignación</th>
                      <th>Fecha Devolución</th>
                      <th>Entregado Por</th>
                      <th>Recibido Por</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium">
                          {item.empleado?.nombre || 'N/A'}
                        </td>
                        <td>
                          {item.fechaAsignacion
                            ? format(new Date(item.fechaAsignacion), 'dd/MM/yyyy')
                            : 'N/A'}
                        </td>
                        <td>
                          {item.fechaDevolucion
                            ? format(new Date(item.fechaDevolucion), 'dd/MM/yyyy')
                            : 'Pendiente'}
                        </td>
                        <td>{item.entregadoPor?.nombreCompleto || 'N/A'}</td>
                        <td>{item.recibidoPor?.nombreCompleto || 'N/A'}</td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.fechaDevolucion
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {item.fechaDevolucion ? 'Devuelto' : 'Activa'}
                          </span>
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

