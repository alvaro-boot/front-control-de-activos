'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Package, UserCheck, Wrench, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface Stats {
  totalActivos: number;
  activosActivos: number;
  totalAsignaciones: number;
  mantenimientosPendientes: number;
  valorTotalActivos: number;
  activosEnMantenimiento: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalActivos: 0,
    activosActivos: 0,
    totalAsignaciones: 0,
    mantenimientosPendientes: 0,
    valorTotalActivos: 0,
    activosEnMantenimiento: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [activos, asignaciones, mantenimientos] = await Promise.all([
        api.getActivos(),
        api.getAsignaciones(),
        api.getMantenimientosProgramados(),
      ]);

      const activosData = Array.isArray(activos) ? activos : [];
      const asignacionesData = Array.isArray(asignaciones) ? asignaciones : [];
      const mantenimientosData = Array.isArray(mantenimientos) ? mantenimientos : [];

      const valorTotal = activosData.reduce(
        (sum: number, a: any) => sum + (a.valorActual || 0),
        0
      );

      setStats({
        totalActivos: activosData.length,
        activosActivos: activosData.filter((a: any) => a.estado === 'activo').length,
        totalAsignaciones: asignacionesData.filter((a: any) => !a.fechaDevolucion).length,
        mantenimientosPendientes: mantenimientosData.filter(
          (m: any) => m.estado === 'pendiente'
        ).length,
        valorTotalActivos: valorTotal,
        activosEnMantenimiento: activosData.filter((a: any) => a.estado === 'mantenimiento').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Activos',
      value: stats.totalActivos,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      name: 'Activos Activos',
      value: stats.activosActivos,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      name: 'Asignaciones Activas',
      value: stats.totalAsignaciones,
      icon: UserCheck,
      color: 'bg-purple-500',
    },
    {
      name: 'Mantenimientos Pendientes',
      value: stats.mantenimientosPendientes,
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
    {
      name: 'Valor Total Activos',
      value: `$${stats.valorTotalActivos.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
    },
    {
      name: 'En Mantenimiento',
      value: stats.activosEnMantenimiento,
      icon: Wrench,
      color: 'bg-yellow-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

