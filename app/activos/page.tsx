'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo, Empresa } from '@/types';
import { Plus, Search, Edit, Trash2, QrCode, Eye } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
      // Solo enviar empresaId si es admin del sistema y ha seleccionado una empresa
      // Si no es admin, el backend filtra automáticamente por su empresa
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
    if (!confirm('¿Estás seguro de eliminar este activo?')) return;

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
        return 'bg-green-100 text-green-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'retirado':
        return 'bg-gray-100 text-gray-800';
      case 'perdido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activos</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gestión de activos del sistema
              </p>
            </div>
            <Link
              href="/activos/nuevo"
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Activo
            </Link>
          </div>

          {/* Filtros */}
          <div className="card space-y-4">
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Empresa
                </label>
                <select
                  value={selectedEmpresaId || ''}
                  onChange={(e) => setSelectedEmpresaId(e.target.value ? Number(e.target.value) : undefined)}
                  className="input"
                >
                  <option value="">Todas las empresas</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="card">
              {filteredActivos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
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
                        <tr key={activo.id}>
                          <td className="font-medium">{activo.codigo}</td>
                          <td>{activo.nombre}</td>
                          <td>{activo.categoria?.nombre || 'N/A'}</td>
                          <td>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                                activo.estado
                              )}`}
                            >
                              {activo.estado}
                            </span>
                          </td>
                          <td>
                            {activo.valorActual
                              ? `$${activo.valorActual.toLocaleString()}`
                              : 'N/A'}
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/activos/${activo.id}`}
                                className="text-primary-600 hover:text-primary-800"
                                title="Ver detalles"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/activos/${activo.id}/historial`}
                                className="text-purple-600 hover:text-purple-800"
                                title="Ver historial"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </Link>
                              <Link
                                href={`/activos/${activo.id}/editar`}
                                className="text-blue-600 hover:text-blue-800"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleRegenerateQR(activo.id)}
                                className="text-purple-600 hover:text-purple-800"
                                title="Regenerar QR"
                              >
                                <QrCode className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(activo.id)}
                                className="text-red-600 hover:text-red-800"
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

