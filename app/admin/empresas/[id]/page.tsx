'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ArrowLeft, Edit, Building2, Users, Package, MapPin, Wrench } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';

interface EmpresaDetallada {
  id: number;
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  usuarios?: Array<{ id: number; nombreCompleto: string; correo: string; rol: { nombre: string } }>;
  sedes?: Array<{ id: number; nombre: string; direccion?: string }>;
  activos?: Array<{ id: number; codigo: string; nombre: string; estado: string }>;
  empleados?: Array<{ id: number; nombre: string; cargo?: string }>;
  estadisticas?: {
    totalUsuarios: number;
    totalActivos: number;
    totalSedes: number;
    totalEmpleados: number;
    mantenimientosProximos: number;
  };
}

export default function EmpresaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [empresa, setEmpresa] = useState<EmpresaDetallada | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadEmpresa(Number(params.id));
    }
  }, [params.id]);

  const loadEmpresa = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getEmpresaDetallada(id);
      setEmpresa(data);
    } catch (error: any) {
      toast.error('Error al cargar empresa');
      router.push('/admin/empresas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['administrador_sistema']}>
        <AdminLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!empresa) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['administrador_sistema']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/empresas"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{empresa.nombre}</h1>
                {empresa.nit && (
                  <p className="mt-2 text-sm text-gray-600">NIT: {empresa.nit}</p>
                )}
              </div>
            </div>
            <Link
              href={`/admin/empresas/${empresa.id}/editar`}
              className="btn btn-primary flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información General */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Información General
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{empresa.nombre}</p>
                  </div>
                  {empresa.nit && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">NIT</label>
                      <p className="mt-1 text-sm text-gray-900">{empresa.nit}</p>
                    </div>
                  )}
                  {empresa.direccion && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Dirección</label>
                      <p className="mt-1 text-sm text-gray-900">{empresa.direccion}</p>
                    </div>
                  )}
                  {empresa.telefono && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="mt-1 text-sm text-gray-900">{empresa.telefono}</p>
                    </div>
                  )}
                  {empresa.correo && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Correo</label>
                      <p className="mt-1 text-sm text-gray-900">{empresa.correo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sedes */}
              {empresa.sedes && empresa.sedes.length > 0 && (
                <div className="card">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Sedes</h2>
                    <span className="ml-2 text-sm text-gray-500">
                      ({empresa.sedes.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {empresa.sedes.map((sede) => (
                      <div key={sede.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-gray-900">{sede.nombre}</p>
                        {sede.direccion && (
                          <p className="text-sm text-gray-500">{sede.direccion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Estadísticas
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Usuarios</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {empresa.estadisticas?.totalUsuarios || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Activos</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {empresa.estadisticas?.totalActivos || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Empleados</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {empresa.estadisticas?.totalEmpleados || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Wrench className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Mantenimientos</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">
                      {empresa.estadisticas?.mantenimientosProximos || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

