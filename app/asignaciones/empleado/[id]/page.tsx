'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Asignacion, Empleado } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function HistorialEmpleadoPage() {
  const params = useParams();
  const router = useRouter();
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadData(Number(params.id));
    }
  }, [params.id]);

  const loadData = async (id: number) => {
    try {
      setIsLoading(true);
      const [empleadoData, asignacionesData] = await Promise.all([
        api.getEmpleado(id),
        api.getHistorialAsignacionesEmpleado(id),
      ]);
      setEmpleado(empleadoData);
      setAsignaciones(Array.isArray(asignacionesData) ? asignacionesData : []);
    } catch (error: any) {
      toast.error('Error al cargar historial');
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/empleados"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Historial de Asignaciones
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {empleado?.nombre} - {empleado?.cargo || 'Sin cargo'}
              </p>
            </div>
          </div>

          <div className="card">
            {asignaciones.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay historial de asignaciones para este empleado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Activo</th>
                      <th>Fecha Asignación</th>
                      <th>Fecha Devolución</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.map((asignacion) => (
                      <tr key={asignacion.id}>
                        <td>
                          <div>
                            <div className="font-medium">
                              {asignacion.activo?.codigo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {asignacion.activo?.nombre}
                            </div>
                          </div>
                        </td>
                        <td>
                          {asignacion.fechaAsignacion
                            ? format(new Date(asignacion.fechaAsignacion), 'dd/MM/yyyy')
                            : 'N/A'}
                        </td>
                        <td>
                          {asignacion.fechaDevolucion
                            ? format(new Date(asignacion.fechaDevolucion), 'dd/MM/yyyy')
                            : 'Pendiente'}
                        </td>
                        <td>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              asignacion.fechaDevolucion
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {asignacion.fechaDevolucion ? 'Devuelto' : 'Activa'}
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

