'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
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
      gradient: 'from-neon-blue to-neon-cyan',
      borderColor: 'border-neon-blue/40',
    },
    {
      name: 'Activos Activos',
      value: stats.activosActivos,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-400',
      borderColor: 'border-green-500/40',
    },
    {
      name: 'Asignaciones Activas',
      value: stats.totalAsignaciones,
      icon: UserCheck,
      gradient: 'from-neon-magenta to-pink-400',
      borderColor: 'border-neon-magenta/40',
    },
    {
      name: 'Mantenimientos Pendientes',
      value: stats.mantenimientosPendientes,
      icon: AlertCircle,
      gradient: 'from-orange-500 to-yellow-400',
      borderColor: 'border-orange-500/40',
    },
    {
      name: 'Valor Total Activos',
      value: formatCurrency(stats.valorTotalActivos),
      icon: DollarSign,
      gradient: 'from-neon-cyan to-neon-blue',
      borderColor: 'border-neon-cyan/40',
    },
    {
      name: 'En Mantenimiento',
      value: stats.activosEnMantenimiento,
      icon: Wrench,
      gradient: 'from-yellow-500 to-orange-400',
      borderColor: 'border-yellow-500/40',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-30 animate-glow-pulse" />
          <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="card card-glow relative overflow-hidden group hover:bg-white/70 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl" style={{
              background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
            }} />
            <div className="relative flex items-center">
              <div className={`relative p-3 rounded-lg bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} shadow-lg backdrop-blur-sm`}>
                <div className="absolute inset-0 bg-white/20 rounded-lg blur-sm" />
                <Icon className="relative h-6 w-6 text-white drop-shadow-lg" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
