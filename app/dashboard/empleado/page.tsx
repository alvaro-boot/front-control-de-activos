'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Package, Bell, AlertCircle, QrCode, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';

interface EmpleadoStats {
  activosAsignados: number;
  mantenimientosProximos: number;
  notificaciones: number;
}

export default function EmpleadoDashboardPage() {
  const [stats, setStats] = useState<EmpleadoStats>({
    activosAsignados: 0,
    mantenimientosProximos: 0,
    notificaciones: 0,
  });
  const [activos, setActivos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [asignacionesData, mantenimientosData] = await Promise.all([
        api.getAsignaciones(),
        api.getMantenimientosProgramados(),
      ]);

      const asignaciones = Array.isArray(asignacionesData) ? asignacionesData : [];
      const asignacionesActivas = asignaciones.filter((a: any) => !a.fechaDevolucion);
      
      // Obtener activos asignados
      const activosIds = asignacionesActivas.map((a: any) => a.activoId);
      const activosData = await Promise.all(
        activosIds.map((id: number) => api.getActivo(id).catch(() => null))
      );
      const activosFiltrados = activosData.filter(a => a !== null);

      const mantenimientos = Array.isArray(mantenimientosData) ? mantenimientosData : [];
      const hoy = new Date();
      const proximos = mantenimientos.filter((m: any) => {
        const fecha = new Date(m.fechaProgramada);
        const diasDiferencia = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return diasDiferencia <= 7 && diasDiferencia >= 0 && m.estado === 'pendiente';
      });

      setActivos(activosFiltrados);
      setStats({
        activosAsignados: asignacionesActivas.length,
        mantenimientosProximos: proximos.length,
        notificaciones: proximos.length, // Simplificado
      });
    } catch (error: any) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['empleado']}>
        <Layout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['empleado']}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Activos asignados y notificaciones
            </p>
          </div>

          {/* Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activos Asignados</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activosAsignados}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mantenimientos Próximos</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.mantenimientosProximos}</p>
                </div>
                <Bell className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Notificaciones</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.notificaciones}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Activos Asignados */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Mis Activos</h2>
              <Link href="/activos" className="text-primary-600 hover:text-primary-800 text-sm">
                Ver todos →
              </Link>
            </div>
            {activos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tienes activos asignados</p>
            ) : (
              <div className="space-y-3">
                {activos.slice(0, 5).map((activo: any) => (
                  <div
                    key={activo.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <Link
                          href={`/activos/${activo.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {activo.nombre}
                        </Link>
                        <p className="text-sm text-gray-500">Código: {activo.codigo}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          activo.estado === 'activo'
                            ? 'bg-green-100 text-green-800'
                            : activo.estado === 'mantenimiento'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {activo.estado}
                      </span>
                      {activo.qr && (
                        <Link
                          href={`/activos/qr/${activo.id}`}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                          title="Escanear QR"
                        >
                          <QrCode className="h-5 w-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acciones Rápidas */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/activos"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Package className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Ver Mis Activos</p>
                  <p className="text-sm text-gray-500">Consultar activos asignados</p>
                </div>
              </Link>
              <Link
                href="/inventario-fisico"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100"
              >
                <QrCode className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Inventario Físico</p>
                  <p className="text-sm text-gray-500">Escanear QR para confirmar</p>
                </div>
              </Link>
              <Link
                href="/reportes/novedad"
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100"
              >
                <AlertCircle className="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Reportar Novedad</p>
                  <p className="text-sm text-gray-500">Fallas, daños, etc.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

