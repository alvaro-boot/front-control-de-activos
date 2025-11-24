'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Plus, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/auth';

interface Solicitud {
  id: number;
  tipo: string;
  estado: string;
  motivo: string;
  observaciones?: string;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  activo?: { id: number; nombre: string; codigo: string };
  solicitante?: { nombreCompleto: string };
  aprobadoPor?: { nombreCompleto: string };
}

export default function SolicitudesPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const user = getStoredUser();
  const userRole = typeof user?.role === 'string' 
    ? user.role 
    : (user?.role?.nombre || user?.rol?.nombre);
  const isAdmin = userRole === 'administrador' || userRole === 'administrador_sistema';

  useEffect(() => {
    loadSolicitudes();
  }, [filtroEstado]);

  const loadSolicitudes = async () => {
    try {
      setIsLoading(true);
      let data;
      if (isAdmin) {
        data = await api.getSolicitudes(filtroEstado || undefined);
      } else {
        data = await api.getMisSolicitudes();
      }
      setSolicitudes(data);
    } catch (error: any) {
      toast.error('Error al cargar solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAprobar = async (id: number) => {
    try {
      await api.aprobarSolicitud(id);
      toast.success('Solicitud aprobada');
      loadSolicitudes();
    } catch (error: any) {
      toast.error('Error al aprobar solicitud');
    }
  };

  const handleRechazar = async (id: number, observaciones: string) => {
    if (!observaciones) {
      toast.error('Debes ingresar observaciones para rechazar');
      return;
    }
    try {
      await api.rechazarSolicitud(id, observaciones);
      toast.success('Solicitud rechazada');
      loadSolicitudes();
    } catch (error: any) {
      toast.error('Error al rechazar solicitud');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 text-green-800';
      case 'rechazada': return 'bg-red-100 text-red-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'traslado': return 'bg-blue-100 text-blue-800';
      case 'baja': return 'bg-red-100 text-red-800';
      case 'repuesto': return 'bg-purple-100 text-purple-800';
      case 'mantenimiento': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'Solicitudes' : 'Mis Solicitudes'}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {isAdmin ? 'Gestiona todas las solicitudes del sistema' : 'Ver y crear solicitudes'}
              </p>
            </div>
            <Link
              href="/solicitudes/nueva"
              className="btn btn-primary flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Link>
          </div>

          {isAdmin && (
            <div className="card">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="input"
                >
                  <option value="">Todas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="aprobada">Aprobadas</option>
                  <option value="rechazada">Rechazadas</option>
                  <option value="completada">Completadas</option>
                </select>
              </div>
            </div>
          )}

          <div className="card">
            {solicitudes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay solicitudes</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isAdmin ? 'No hay solicitudes en el sistema' : 'No has creado ninguna solicitud'}
                </p>
                <div className="mt-6">
                  <Link href="/solicitudes/nueva" className="btn btn-primary">
                    Crear Primera Solicitud
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Motivo</th>
                      {isAdmin && <th>Solicitante</th>}
                      <th>Fecha</th>
                      {isAdmin && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <tr key={solicitud.id}>
                        <td>{solicitud.id}</td>
                        <td>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(solicitud.tipo)}`}>
                            {solicitud.tipo}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(solicitud.estado)}`}>
                            {solicitud.estado}
                          </span>
                        </td>
                        <td className="max-w-xs truncate">{solicitud.motivo}</td>
                        {isAdmin && (
                          <td>{solicitud.solicitante?.nombreCompleto || 'N/A'}</td>
                        )}
                        <td>
                          {format(new Date(solicitud.fechaSolicitud), 'dd/MM/yyyy')}
                        </td>
                        {isAdmin && solicitud.estado === 'pendiente' && (
                          <td>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAprobar(solicitud.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Aprobar"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  const obs = prompt('Ingresa las observaciones para rechazar:');
                                  if (obs) handleRechazar(solicitud.id, obs);
                                }}
                                className="text-red-600 hover:text-red-800"
                                title="Rechazar"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        )}
                        {isAdmin && solicitud.estado !== 'pendiente' && (
                          <td>
                            {solicitud.aprobadoPor?.nombreCompleto || 'N/A'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

