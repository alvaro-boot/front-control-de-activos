'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo } from '@/types';
import { isSystemAdmin, getStoredUser } from '@/lib/auth';
import { toast } from '@/lib/notifications';
import { formatCurrency } from '@/lib/currency';
import DashboardStats from './stats';
import { Package, Sparkles } from 'lucide-react';

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
    
    // Redirigir según el rol del usuario
    const user = getStoredUser();
    if (user) {
      const userRole = typeof user.role === 'string' 
        ? user.role 
        : user.role?.nombre;
      
      if (userRole === 'administrador') {
        router.push('/dashboard/admin');
        return;
      } else if (userRole === 'tecnico') {
        router.push('/dashboard/tecnico');
        return;
      }
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan bg-clip-text text-transparent animate-gradient bg-200%">
                Dashboard
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm">
                Resumen general del sistema
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-30 animate-glow-pulse" />
              <Sparkles className="relative w-6 h-6 sm:w-8 sm:h-8 text-neon-cyan" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-30 animate-glow-pulse" />
                <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan border-t-transparent"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Estadísticas */}
              <DashboardStats />

              {/* Activos recientes */}
              <div className="card card-glow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                    <Package className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-neon-cyan" />
                    Activos Recientes
                  </h2>
                  <Link
                    href="/activos"
                    className="text-xs sm:text-sm text-neon-cyan hover:text-neon-blue transition-colors"
                  >
                    Ver todos →
                  </Link>
                </div>
                {recentActivos.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No hay activos registrados
                  </p>
                ) : (
                  <>
                    {/* Vista de tabla para desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="table w-full">
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
                            <tr key={activo.id} className="cursor-pointer hover:bg-white/40 transition-colors">
                              <td className="font-medium">
                                <Link
                                  href={`/activos/${activo.id}`}
                                  className="text-neon-cyan hover:text-neon-blue transition-colors"
                                >
                                  {activo.codigo}
                                </Link>
                              </td>
                              <td>
                                <Link
                                  href={`/activos/${activo.id}`}
                                  className="text-gray-700 hover:text-neon-cyan transition-colors"
                                >
                                  {activo.nombre}
                                </Link>
                              </td>
                              <td>
                                <span
                                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    activo.estado === 'activo'
                                      ? 'bg-green-100/80 text-green-700 border border-green-300/50'
                                      : activo.estado === 'mantenimiento'
                                      ? 'bg-yellow-100/80 text-yellow-700 border border-yellow-300/50'
                                      : 'bg-red-100/80 text-red-700 border border-red-300/50'
                                  }`}
                                >
                                  {activo.estado}
                                </span>
                              </td>
                              <td className="text-neon-cyan font-medium">
                                {formatCurrency(activo.valorActual)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Vista de cards para móvil */}
                    <div className="md:hidden space-y-3">
                      {recentActivos.map((activo) => (
                        <Link
                          key={activo.id}
                          href={`/activos/${activo.id}`}
                          className="block bg-white/40 backdrop-blur-sm border border-neon-blue/20 rounded-lg p-4 hover:bg-white/60 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-neon-cyan">{activo.codigo}</h3>
                              <p className="text-gray-800 text-sm mt-1">{activo.nombre}</p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                                activo.estado === 'activo'
                                  ? 'bg-green-100/80 text-green-700 border border-green-300/50'
                                  : activo.estado === 'mantenimiento'
                                  ? 'bg-yellow-100/80 text-yellow-700 border border-yellow-300/50'
                                  : 'bg-red-100/80 text-red-700 border border-red-300/50'
                              }`}
                            >
                              {activo.estado}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Valor: </span>
                            <span className="text-neon-cyan font-medium">{formatCurrency(activo.valorActual)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
