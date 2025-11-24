'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Categoria } from '@/types';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { useRouter } from 'next/navigation';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';
import { confirm } from '@/lib/confirm';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = categorias.filter(
        (categoria) =>
          categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategorias(filtered);
    } else {
      setFilteredCategorias(categorias);
    }
  }, [searchTerm, categorias]);

  const loadCategorias = async () => {
    try {
      setIsLoading(true);
      const empresaId = isAdmin ? undefined : user?.empresaId;
      const data = await api.getCategorias(empresaId);
      const categoriasData = Array.isArray(data) ? data : [];
      setCategorias(categoriasData);
      setFilteredCategorias(categoriasData);
    } catch (error: any) {
      toast.error('Error al cargar categorías');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirm('¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.', {
      title: 'Confirmar Eliminación',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    try {
      await api.deleteCategoria(id);
      toast.success('Categoría eliminada exitosamente');
      loadCategorias();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar categoría');
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
                <Tag className="mr-3 h-8 w-8 text-neon-cyan" />
                Categorías de Activos
              </h1>
              <p className="text-gray-600 text-sm">
                Gestión de categorías para clasificar activos
              </p>
            </div>
            <Link
              href="/categorias/nueva"
              className="relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan opacity-60 group-hover:opacity-80 transition-opacity duration-300 rounded-lg" />
              <div className="relative px-6 py-3 bg-white/70 backdrop-blur-md border border-neon-cyan/50 rounded-lg font-semibold text-gray-800 group-hover:border-neon-cyan group-hover:bg-white/90 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-cyan/30 flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Nueva Categoría
              </div>
            </Link>
          </div>

          {/* Filtros */}
          <div className="card card-glow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Tabla de categorías */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-30 animate-glow-pulse" />
                <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan border-t-transparent"></div>
              </div>
            </div>
          ) : (
            <div className="card card-glow">
              {filteredCategorias.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No hay categorías registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Empresa</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategorias.map((categoria) => (
                        <tr key={categoria.id} className="hover:bg-white/40 transition-colors">
                          <td className="font-medium text-gray-800">{categoria.nombre}</td>
                          <td className="text-gray-600">{categoria.descripcion || 'N/A'}</td>
                          <td className="text-gray-600">{categoria.empresa?.nombre || 'N/A'}</td>
                          <td>
                            <div className="flex items-center space-x-3">
                              <Link
                                href={`/categorias/${categoria.id}/editar`}
                                className="text-neon-blue hover:text-blue-400 transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(categoria.id)}
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

