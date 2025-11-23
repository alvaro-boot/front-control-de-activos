'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo } from '@/types';
import { isSystemAdmin } from '@/lib/auth';
import toast from 'react-hot-toast';
import DashboardStats from './stats';

export default function DashboardPage() {
  const router = useRouter();
  const [recentActivos, setRecentActivos] = useState<Activo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si es admin del sistema, redirigir al panel admin
    if (isSystemAdmin()) {
      router.push('/admin/dashboard');
      return;
    }
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const activos = await api.getActivos();
      const activosData = Array.isArray(activos) ? activos : [];
      setRecentActivos(activosData.slice(0, 5));
    } catch (error: any) {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Resumen general del sistema
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Estadísticas */}
              <DashboardStats />

              {/* Activos recientes */}
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Activos Recientes
                </h2>
                {recentActivos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay activos registrados
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Nombre</th>
                          <th>Estado</th>
                          <th>Valor Actual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivos.map((activo) => (
                          <tr key={activo.id} className="cursor-pointer hover:bg-gray-50">
                            <td className="font-medium">
                              <Link
                                href={`/activos/${activo.id}`}
                                className="text-primary-600 hover:text-primary-800"
                              >
                                {activo.codigo}
                              </Link>
                            </td>
                            <td>
                              <Link
                                href={`/activos/${activo.id}`}
                                className="text-gray-900 hover:text-primary-600"
                              >
                                {activo.nombre}
                              </Link>
                            </td>
                            <td>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  activo.estado === 'activo'
                                    ? 'bg-green-100 text-green-800'
                                    : activo.estado === 'mantenimiento'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {activo.estado}
                              </span>
                            </td>
                            <td>
                              {activo.valorActual
                                ? `$${activo.valorActual.toLocaleString()}`
                                : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

