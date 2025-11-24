'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Wrench, Calendar, Clock, CheckCircle, AlertCircle, QrCode } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { format } from 'date-fns';

interface TecnicoStats {
  mantenimientosAsignados: number;
  mantenimientosPendientes: number;
  mantenimientosProximos: number;
  mantenimientosCompletados: number;
}

export default function TecnicoDashboardPage() {
  const [stats, setStats] = useState<TecnicoStats>({
    mantenimientosAsignados: 0,
    mantenimientosPendientes: 0,
    mantenimientosProximos: 0,
    mantenimientosCompletados: 0,
  });
  const [mantenimientos, setMantenimientos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [mantenimientosData, mantenimientosProgramadosData] = await Promise.all([
        api.getMantenimientos(),
        api.getMantenimientosProgramados(),
      ]);

      const mantenimientosList = Array.isArray(mantenimientosData) ? mantenimientosData : [];
      const mantenimientosProgramados = Array.isArray(mantenimientosProgramadosData) ? mantenimientosProgramadosData : [];

      const hoy = new Date();
      const proximos = mantenimientosProgramados.filter((m: any) => {
        const fecha = new Date(m.fechaProgramada);
        const diasDiferencia = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return diasDiferencia <= 7 && diasDiferencia >= 0 && m.estado === 'pendiente';
      });

      setMantenimientos(mantenimientosList.slice(0, 5));
      setStats({
        mantenimientosAsignados: mantenimientosList.length,
        mantenimientosPendientes: mantenimientosList.filter((m: any) => !m.fechaFinalizacion).length,
        mantenimientosProximos: proximos.length,
        mantenimientosCompletados: mantenimientosList.filter((m: any) => m.fechaFinalizacion).length,
      });
    } catch (error: any) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['tecnico']}>
        <Layout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['tecnico']}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Técnico</h1>
            <p className="mt-2 text-sm text-gray-600">
              Mantenimientos asignados y próximos
            </p>
          </div>

          {/* Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Asignados</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.mantenimientosAsignados}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.mantenimientosPendientes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximos (7 días)</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.mantenimientosProximos}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completados</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.mantenimientosCompletados}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Mantenimientos Asignados */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Mis Mantenimientos</h2>
              <Link href="/mantenimientos" className="text-primary-600 hover:text-primary-800 text-sm">
                Ver todos →
              </Link>
            </div>
            {mantenimientos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tienes mantenimientos asignados</p>
            ) : (
              <div className="space-y-3">
                {mantenimientos.map((mantenimiento: any) => (
                  <div
                    key={mantenimiento.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Wrench className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <Link
                          href={`/mantenimientos/${mantenimiento.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {mantenimiento.activo?.nombre || 'Activo'}
                        </Link>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            {mantenimiento.fechaMantenimiento
                              ? format(new Date(mantenimiento.fechaMantenimiento), 'dd/MM/yyyy')
                              : 'Sin fecha'}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              mantenimiento.tipo === 'preventivo'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {mantenimiento.tipo || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {mantenimiento.activo?.qr && (
                        <Link
                          href={`/activos/qr/${mantenimiento.activo.id}`}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                          title="Escanear QR del activo"
                        >
                          <QrCode className="h-5 w-5" />
                        </Link>
                      )}
                      <Link
                        href={`/mantenimientos/${mantenimiento.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        Ver Detalles
                      </Link>
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
                href="/mantenimientos"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Wrench className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Ver Mantenimientos</p>
                  <p className="text-sm text-gray-500">Lista completa asignada</p>
                </div>
              </Link>
              <Link
                href="/mantenimientos-programados/proximos"
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100"
              >
                <Calendar className="h-6 w-6 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Próximos</p>
                  <p className="text-sm text-gray-500">Mantenimientos programados</p>
                </div>
              </Link>
              <Link
                href="/mantenimientos/nuevo"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100"
              >
                <AlertCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Reportar Mantenimiento</p>
                  <p className="text-sm text-gray-500">Correctivo urgente</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

