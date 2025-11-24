'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo, Empresa } from '@/types';
import { Plus, Search, Edit, Trash2, QrCode, Eye, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { formatCurrency } from '@/lib/currency';
import { useRouter } from 'next/navigation';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';

export default function ActivosPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [filteredActivos, setFilteredActivos] = useState<Activo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | undefined>(undefined);
  const router = useRouter();
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();

  useEffect(() => {
    if (isAdmin) {
      loadEmpresas();
    }
  }, [isAdmin]);

  useEffect(() => {
    loadActivos();
  }, [selectedEmpresaId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = activos.filter(
        (activo) =>
          activo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActivos(filtered);
    } else {
      setFilteredActivos(activos);
    }
  }, [searchTerm, activos]);

  const loadEmpresas = async () => {
    try {
      const data = await api.getEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Error al cargar empresas');
    }
  };

  const loadActivos = async () => {
    try {
      setIsLoading(true);
      const empresaId = isAdmin ? selectedEmpresaId : undefined;
      const data = await api.getActivos(empresaId);
      const activosData = Array.isArray(data) ? data : [];
      setActivos(activosData);
      setFilteredActivos(activosData);
    } catch (error: any) {
      toast.error('Error al cargar activos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const { confirm } = await import('@/lib/confirm');
    const confirmed = await confirm('¿Estás seguro de eliminar este activo?', {
      title: 'Confirmar Eliminación',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    try {
      await api.deleteActivo(id);
      toast.success('Activo eliminado');
      loadActivos();
    } catch (error: any) {
      toast.error('Error al eliminar activo');
    }
  };

  const handleRegenerateQR = async (id: number) => {
    try {
      await api.regenerateQR(id);
      toast.success('QR regenerado exitosamente');
      loadActivos();
    } catch (error: any) {
      toast.error('Error al regenerar QR');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'mantenimiento':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'retirado':
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      case 'perdido':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan bg-clip-text text-transparent animate-gradient bg-200% flex items-center">
                <Package className="mr-3 h-8 w-8 text-neon-cyan" />
                Activos
              </h1>
              <p className="text-gray-400 text-sm">
                Gestión de activos del sistema
              </p>
            </div>
            <Link
              href="/activos/nuevo"
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative px-6 py-3 bg-dark-bg-lighter/50 backdrop-blur-sm border border-neon-cyan/50 rounded-lg font-semibold text-white group-hover:border-neon-cyan transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-cyan/50 flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Nuevo Activo
              </div>
            </Link>
          </div>

          {/* Filtros */}
          <div className="card card-glow">
            {isAdmin && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Filtrar por Empresa
                </label>
                <select
                  value={selectedEmpresaId || ''}
                  onChange={(e) => setSelectedEmpresaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="input"
                >
                  <option value="" className="bg-dark-bg text-gray-400">Todas las empresas</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id} className="bg-dark-bg-lighter text-white">
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Tabla de activos */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-50 animate-glow-pulse" />
                <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan border-t-transparent"></div>
              </div>
            </div>
          ) : (
            <div className="card card-glow">
              {filteredActivos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No hay activos registrados
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Estado</th>
                        <th>Valor Actual</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivos.map((activo) => (
                        <tr key={activo.id} className="hover:bg-dark-bg/50 transition-colors">
                          <td className="font-medium text-neon-cyan">{activo.codigo}</td>
                          <td className="text-gray-300">{activo.nombre}</td>
                          <td className="text-gray-400">{activo.categoria?.nombre || 'N/A'}</td>
                          <td>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                                activo.estado
                              )}`}
                            >
                              {activo.estado}
                            </span>
                          </td>
                          <td className="text-neon-cyan font-medium">
                            {formatCurrency(activo.valorActual)}
                          </td>
                          <td>
                            <div className="flex items-center space-x-3">
                              <Link
                                href={`/activos/${activo.id}`}
                                className="text-neon-cyan hover:text-neon-blue transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/activos/${activo.id}/historial`}
                                className="text-neon-magenta hover:text-pink-400 transition-colors"
                                title="Ver historial"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </Link>
                              <Link
                                href={`/activos/${activo.id}/editar`}
                                className="text-neon-blue hover:text-blue-400 transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleRegenerateQR(activo.id)}
                                className="text-neon-magenta hover:text-pink-400 transition-colors"
                                title="Regenerar QR"
                              >
                                <QrCode className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(activo.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
