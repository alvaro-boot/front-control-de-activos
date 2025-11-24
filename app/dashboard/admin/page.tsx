'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Package, Wrench, AlertCircle, TrendingUp, DollarSign, FileText, Calendar, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { formatCurrency, formatCurrencyNumber } from '@/lib/currency';

interface AdminStats {
  totalActivos: number;
  activosPorEstado: {
    activo: number;
    mantenimiento: number;
    retirado: number;
    perdido: number;
  };
  mantenimientosVencidos: number;
  mantenimientosProximos: number;
  alertasDocumentos: number;
  depreciacionMensual: number;
  depreciacionFiscal: number;
  valorTotalActivos: number;
  activosSinQR: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [activos, mantenimientos, mantenimientosProgramados] = await Promise.all([
        api.getActivos(),
        api.getMantenimientos(),
        api.getMantenimientosProgramados(),
      ]);

      const activosData = Array.isArray(activos) ? activos : [];
      const mantenimientosData = Array.isArray(mantenimientos) ? mantenimientos : [];
      const mantenimientosProgramadosData = Array.isArray(mantenimientosProgramados) ? mantenimientosProgramados : [];

      const hoy = new Date();
      const mantenimientosVencidos = mantenimientosProgramadosData.filter((m: any) => {
        const fecha = new Date(m.fechaProgramada);
        return fecha < hoy && m.estado === 'pendiente';
      });

      const mantenimientosProximos = mantenimientosProgramadosData.filter((m: any) => {
        const fecha = new Date(m.fechaProgramada);
        const diasDiferencia = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        return diasDiferencia <= 7 && diasDiferencia >= 0 && m.estado === 'pendiente';
      });

      // Convertir valores DECIMAL que vienen como string desde el backend
      const valorTotal = activosData.reduce((sum: number, a: any) => {
        const valor = a.valorActual 
          ? (typeof a.valorActual === 'string' ? parseFloat(a.valorActual) : Number(a.valorActual)) 
          : 0;
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);
      
      const valorCompra = activosData.reduce((sum: number, a: any) => {
        const valor = a.valorCompra 
          ? (typeof a.valorCompra === 'string' ? parseFloat(a.valorCompra) : Number(a.valorCompra)) 
          : 0;
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);
      
      const depreciacionMensual = valorCompra > 0 ? (valorCompra - valorTotal) / 12 : 0; // Simplificado
      
      // Debug: mostrar valores en consola
      console.log('Dashboard Stats:', {
        totalActivos: activosData.length,
        valorTotal,
        valorCompra,
        depreciacionMensual,
        activosSample: activosData.slice(0, 2).map((a: any) => ({
          id: a.id,
          nombre: a.nombre,
          valorActual: a.valorActual,
          valorCompra: a.valorCompra,
          valorActualType: typeof a.valorActual,
          valorCompraType: typeof a.valorCompra,
        })),
      });

      setStats({
        totalActivos: activosData.length,
        activosPorEstado: {
          activo: activosData.filter((a: any) => a.estado === 'activo').length,
          mantenimiento: activosData.filter((a: any) => a.estado === 'mantenimiento').length,
          retirado: activosData.filter((a: any) => a.estado === 'retirado').length,
          perdido: activosData.filter((a: any) => a.estado === 'perdido').length,
        },
        mantenimientosVencidos: mantenimientosVencidos.length,
        mantenimientosProximos: mantenimientosProximos.length,
        alertasDocumentos: 0, // TODO: Implementar cuando haya documentos
        depreciacionMensual: depreciacionMensual || 0,
        depreciacionFiscal: depreciacionMensual || 0, // Simplificado
        valorTotalActivos: valorTotal || 0,
        activosSinQR: activosData.filter((a: any) => !a.qr || !a.qr.length).length,
      });
    } catch (error: any) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['administrador']}>
        <Layout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!stats) return null;

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrador</h1>
            <p className="mt-2 text-sm text-gray-600">
              Vista general de activos, mantenimientos y reportes financieros
            </p>
          </div>

          {/* Indicadores Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activos</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalActivos}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.valorTotalActivos)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mantenimientos Vencidos</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.mantenimientosVencidos}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximos (7 días)</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.mantenimientosProximos}</p>
                </div>
                <Calendar className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Activos por Estado */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activos por Estado</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.activosPorEstado.activo}</p>
                <p className="text-sm text-gray-600 mt-1">Activos</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{stats.activosPorEstado.mantenimiento}</p>
                <p className="text-sm text-gray-600 mt-1">En Mantenimiento</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{stats.activosPorEstado.retirado}</p>
                <p className="text-sm text-gray-600 mt-1">Retirados</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{stats.activosPorEstado.perdido}</p>
                <p className="text-sm text-gray-600 mt-1">Perdidos</p>
              </div>
            </div>
          </div>

          {/* Depreciación y Financiero */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Depreciación Mensual</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contable</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.depreciacionMensual)}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fiscal</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.depreciacionFiscal)}
                    </p>
                  </div>
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Alertas y Acciones</h2>
              <div className="space-y-3">
                {stats.mantenimientosVencidos > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 border-l-4 border-red-400 rounded">
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {stats.mantenimientosVencidos} mantenimientos vencidos
                      </p>
                    </div>
                    <Link href="/mantenimientos-programados" className="text-red-600 hover:text-red-800">
                      Ver →
                    </Link>
                  </div>
                )}
                {stats.activosSinQR > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        {stats.activosSinQR} activos sin QR
                      </p>
                    </div>
                    <Link href="/activos" className="text-yellow-600 hover:text-yellow-800">
                      Ver →
                    </Link>
                  </div>
                )}
                {stats.alertasDocumentos > 0 && (
                  <div className="flex items-center justify-between p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        {stats.alertasDocumentos} documentos por vencer
                      </p>
                    </div>
                  </div>
                )}
                {stats.mantenimientosVencidos === 0 && stats.activosSinQR === 0 && stats.alertasDocumentos === 0 && (
                  <div className="flex items-center p-3 bg-green-50 border-l-4 border-green-400 rounded">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm font-medium text-green-800">No hay alertas pendientes</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Accesos Rápidos */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/activos/nuevo" className="btn btn-primary text-center">
                Nuevo Activo
              </Link>
              <Link href="/mantenimientos-programados/nuevo" className="btn btn-secondary text-center">
                Programar Mantenimiento
              </Link>
              <Link href="/asignaciones/nueva" className="btn btn-secondary text-center">
                Nueva Asignación
              </Link>
              <Link href="/reportes" className="btn btn-secondary text-center">
                Ver Reportes
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

