'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { User, Empresa } from '@/types';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { isSystemAdmin } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | undefined>(undefined);
  const isAdmin = isSystemAdmin();

  useEffect(() => {
    if (isAdmin) {
      loadEmpresas();
    }
  }, [isAdmin]);

  useEffect(() => {
    loadUsuarios();
  }, [selectedEmpresaId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = usuarios.filter(
        (user) =>
          user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.correo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsuarios(filtered);
    } else {
      setFilteredUsuarios(usuarios);
    }
  }, [searchTerm, usuarios]);

  const loadEmpresas = async () => {
    try {
      const data = await api.getEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Error al cargar empresas');
    }
  };

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      // El backend filtra automáticamente por empresa según el usuario
      const data = await api.getUsuarios();
      let usuariosData = Array.isArray(data) ? data : [];
      
      // Si es admin y seleccionó una empresa, filtrar en el frontend
      if (isAdmin && selectedEmpresaId) {
        usuariosData = usuariosData.filter(
          (usuario) => usuario.empresaId === selectedEmpresaId
        );
      }
      
      setUsuarios(usuariosData);
      setFilteredUsuarios(usuariosData);
    } catch (error: any) {
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const { confirm } = await import('@/lib/confirm');
    const confirmed = await confirm('¿Estás seguro de eliminar este usuario?', {
      title: 'Confirmar Eliminación',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    try {
      await api.deleteUsuario(id);
      toast.success('Usuario eliminado exitosamente');
      loadUsuarios();
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al eliminar usuario';
      toast.error(errorMessage);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['administrador', 'administrador_sistema']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
              <p className="mt-2 text-sm text-gray-600">
                Gestión de usuarios del sistema
              </p>
            </div>
            <Link
              href="/usuarios/nuevo"
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-5 w-5" />
              Nuevo Usuario
            </Link>
          </div>

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
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="card">
              {filteredUsuarios.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay usuarios registrados
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td className="font-medium">
                            <Link
                              href={`/usuarios/${usuario.id}`}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              {usuario.nombreCompleto}
                            </Link>
                          </td>
                          <td>{usuario.correo}</td>
                          <td>{usuario.telefono || 'N/A'}</td>
                          <td>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 capitalize">
                              {usuario.role?.nombre || usuario.rol?.nombre || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                usuario.activo === 1
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {usuario.activo === 1 ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/usuarios/${usuario.id}`}
                                className="text-primary-600 hover:text-primary-800"
                                title="Ver detalles"
                              >
                                <Eye className="h-5 w-5" />
                              </Link>
                              <Link
                                href={`/usuarios/${usuario.id}/editar`}
                                className="text-blue-600 hover:text-blue-800"
                                title="Editar"
                              >
                                <Edit className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => handleDelete(usuario.id)}
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

