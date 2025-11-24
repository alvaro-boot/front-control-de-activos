'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Area, Sede } from '@/types';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { useRouter } from 'next/navigation';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';
import { confirm } from '@/lib/confirm';

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [filteredAreas, setFilteredAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [selectedSedeId, setSelectedSedeId] = useState<number | undefined>(undefined);
  const router = useRouter();
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();

  useEffect(() => {
    loadSedes();
    loadAreas();
  }, []);

  useEffect(() => {
    loadAreas();
  }, [selectedSedeId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = areas.filter(
        (area) =>
          area.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAreas(filtered);
    } else {
      setFilteredAreas(areas);
    }
  }, [searchTerm, areas]);

  const loadSedes = async () => {
    try {
      const empresaId = isAdmin ? undefined : user?.empresaId;
      const data = await api.getSedes(empresaId);
      setSedes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar sedes');
    }
  };

  const loadAreas = async () => {
    try {
      setIsLoading(true);
      const empresaId = isAdmin ? undefined : user?.empresaId;
      const data = await api.getAreas(selectedSedeId, empresaId);
      const areasData = Array.isArray(data) ? data : [];
      setAreas(areasData);
      setFilteredAreas(areasData);
    } catch (error: any) {
      toast.error('Error al cargar áreas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm('¿Estás seguro de eliminar esta área? Esta acción no se puede deshacer.', {
      title: 'Confirmar Eliminación',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    try {
      await api.deleteArea(id);
      toast.success('Área eliminada exitosamente');
      loadAreas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar área');
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
                <MapPin className="mr-3 h-8 w-8 text-neon-cyan" />
                Áreas
              </h1>
              <p className="text-gray-600 text-sm">
                Gestión de áreas de la empresa
              </p>
            </div>
            <Link
              href="/areas/nueva"
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan opacity-60 group-hover:opacity-80 transition-opacity duration-300 rounded-lg" />
              <div className="relative px-6 py-3 bg-white/70 backdrop-blur-md border border-neon-cyan/50 rounded-lg font-semibold text-gray-800 group-hover:border-neon-cyan group-hover:bg-white/90 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-cyan/30 flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Nueva Área
              </div>
            </Link>
          </div>

          {/* Filtros */}
          <div className="card card-glow space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Sede
              </label>
              <select
                value={selectedSedeId || ''}
                onChange={(e) => setSelectedSedeId(e.target.value ? Number(e.target.value) : undefined)}
                className="input"
              >
                <option value="">Todas las sedes</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Tabla de áreas */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-30 animate-glow-pulse" />
                <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan border-t-transparent"></div>
              </div>
            </div>
          ) : (
            <div className="card card-glow">
              {filteredAreas.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No hay áreas registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Sede</th>
                        <th>Empresa</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAreas.map((area) => (
                        <tr key={area.id} className="hover:bg-white/40 transition-colors">
                          <td className="font-medium text-gray-800">{area.nombre}</td>
                          <td className="text-gray-600">{area.sede?.nombre || 'N/A'}</td>
                          <td className="text-gray-600">{area.sede?.empresa?.nombre || 'N/A'}</td>
                          <td>
                            <div className="flex items-center space-x-3">
                              <Link
                                href={`/areas/${area.id}/editar`}
                                className="text-neon-blue hover:text-blue-400 transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(area.id)}
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

