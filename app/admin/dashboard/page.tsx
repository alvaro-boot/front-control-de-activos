'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Building2, Users, Package, Wrench, AlertCircle, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface DashboardStats {
  indicadores: {
    totalEmpresas: number;
    empresasActivas: number;
    empresasInactivas: number;
    totalUsuarios: number;
    totalActivos: number;
    mantenimientosProximos: number;
    activosSinQR: number;
  };
  graficas: {
    empresasConMasActivos: Array<{ empresaId: number; nombre: string; totalActivos: string }>;
    empresasConMasMantenimientos: Array<{ empresaId: number; nombre: string; totalMantenimientos: string }>;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      toast.error('Error al cargar estadísticas');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['administrador_sistema']}>
        <AdminLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Empresas Registradas',
      value: stats.indicadores.totalEmpresas,
      icon: Building2,
      color: 'bg-blue-500',
      subtitle: `${stats.indicadores.empresasActivas} activas`,
    },
    {
      title: 'Total de Usuarios',
      value: stats.indicadores.totalUsuarios,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Total de Activos',
      value: stats.indicadores.totalActivos,
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      title: 'Mantenimientos Próximos',
      value: stats.indicadores.mantenimientosProximos,
      icon: Wrench,
      color: 'bg-yellow-500',
    },
    {
      title: 'Activos sin QR',
      value: stats.indicadores.activosSinQR,
      icon: QrCode,
      color: 'bg-red-500',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['administrador_sistema']}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Global</h1>
            <p className="mt-2 text-sm text-gray-600">
              Vista general del sistema y todas las empresas
            </p>
          </div>

          {/* Indicadores Globales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                      {stat.subtitle && (
                        <p className="mt-1 text-sm text-gray-500">{stat.subtitle}</p>
                      )}
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Empresas con más activos */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Empresas con Más Activos
              </h2>
              <div className="space-y-3">
                {stats.graficas.empresasConMasActivos.length > 0 ? (
                  stats.graficas.empresasConMasActivos.map((empresa, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{empresa.nombre}</p>
                        <p className="text-sm text-gray-500">ID: {empresa.empresaId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">{empresa.totalActivos}</p>
                        <p className="text-xs text-gray-500">activos</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
                )}
              </div>
            </div>

            {/* Empresas con más mantenimientos */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Empresas con Más Mantenimientos Pendientes
              </h2>
              <div className="space-y-3">
                {stats.graficas.empresasConMasMantenimientos.length > 0 ? (
                  stats.graficas.empresasConMasMantenimientos.map((empresa, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{empresa.nombre}</p>
                        <p className="text-sm text-gray-500">ID: {empresa.empresaId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-600">{empresa.totalMantenimientos}</p>
                        <p className="text-xs text-gray-500">pendientes</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
                )}
              </div>
            </div>
          </div>

          {/* Alertas Globales */}
          <div className="card">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Alertas del Sistema</h2>
            </div>
            <div className="space-y-2">
              {stats.indicadores.activosSinQR > 0 && (
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>{stats.indicadores.activosSinQR}</strong> activos sin código QR generado
                  </p>
                </div>
              )}
              {stats.indicadores.mantenimientosProximos > 0 && (
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>{stats.indicadores.mantenimientosProximos}</strong> mantenimientos programados pendientes
                  </p>
                </div>
              )}
              {stats.indicadores.activosSinQR === 0 && stats.indicadores.mantenimientosProximos === 0 && (
                <p className="text-gray-500 text-center py-4">No hay alertas en este momento</p>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

