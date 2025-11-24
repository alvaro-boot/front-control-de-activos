'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Sede } from '@/types';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { useRouter } from 'next/navigation';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';
import { confirm } from '@/lib/confirm';

export default function SedesPage() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [filteredSedes, setFilteredSedes] = useState<Sede[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();

  useEffect(() => {
    loadSedes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sedes.filter(
        (sede) =>
          sede.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sede.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSedes(filtered);
    } else {
      setFilteredSedes(sedes);
    }
  }, [searchTerm, sedes]);

  const loadSedes = async () => {
    try {
      setIsLoading(true);
      const empresaId = isAdmin ? undefined : user?.empresaId;
      const data = await api.getSedes(empresaId);
      const sedesData = Array.isArray(data) ? data : [];
      setSedes(sedesData);
      setFilteredSedes(sedesData);
    } catch (error: any) {
      toast.error('Error al cargar sedes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm('¿Estás seguro de eliminar esta sede? Esta acción no se puede deshacer.', {
      title: 'Confirmar Eliminación',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    try {
      await api.deleteSede(id);
      toast.success('Sede eliminada exitosamente');
      loadSedes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar sede');
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
                <Building2 className="mr-3 h-8 w-8 text-neon-cyan" />
                Sedes
              </h1>
              <p className="text-gray-600 text-sm">
                Gestión de sedes de la empresa
              </p>
            </div>
            <Link
              href="/sedes/nueva"
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan opacity-60 group-hover:opacity-80 transition-opacity duration-300 rounded-lg" />
              <div className="relative px-6 py-3 bg-white/70 backdrop-blur-md border border-neon-cyan/50 rounded-lg font-semibold text-gray-800 group-hover:border-neon-cyan group-hover:bg-white/90 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-cyan/30 flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Nueva Sede
              </div>
            </Link>
          </div>

          {/* Filtros */}
          <div className="card card-glow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Tabla de sedes */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-30 animate-glow-pulse" />
                <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan border-t-transparent"></div>
              </div>
            </div>
          ) : (
            <div className="card card-glow">
              {filteredSedes.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No hay sedes registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Empresa</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSedes.map((sede) => (
                        <tr key={sede.id} className="hover:bg-white/40 transition-colors">
                          <td className="font-medium text-gray-800">{sede.nombre}</td>
                          <td className="text-gray-600">{sede.direccion || 'N/A'}</td>
                          <td className="text-gray-600">{sede.empresa?.nombre || 'N/A'}</td>
                          <td>
                            <div className="flex items-center space-x-3">
                              <Link
                                href={`/sedes/${sede.id}/editar`}
                                className="text-neon-blue hover:text-blue-400 transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(sede.id)}
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

