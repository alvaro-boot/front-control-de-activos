'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { MantenimientoProgramado } from '@/types';
import { Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function MantenimientosProximosPage() {
  const [mantenimientos, setMantenimientos] = useState<MantenimientoProgramado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dias, setDias] = useState(7);

  useEffect(() => {
    loadMantenimientos();
  }, [dias]);

  const loadMantenimientos = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMantenimientosProximos(dias);
      setMantenimientos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Error al cargar mantenimientos próximos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mantenimientos Próximos
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Mantenimientos programados para los próximos días
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Próximos
              </label>
              <select
                value={dias}
                onChange={(e) => setDias(Number(e.target.value))}
                className="input w-24"
              >
                <option value={7}>7 días</option>
                <option value={15}>15 días</option>
                <option value={30}>30 días</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="card">
              {mantenimientos.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-500">
                    No hay mantenimientos programados para los próximos {dias} días
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Activo</th>
                        <th>Fecha Programada</th>
                        <th>Técnico</th>
                        <th>Estado</th>
                        <th>Días Restantes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mantenimientos.map((mant) => {
                        const fechaProgramada = new Date(mant.fechaProgramada);
                        const hoy = new Date();
                        const diasRestantes = Math.ceil(
                          (fechaProgramada.getTime() - hoy.getTime()) /
                            (1000 * 60 * 60 * 24)
                        );

                        return (
                          <tr key={mant.id}>
                            <td>
                              <div>
                                <div className="font-medium">
                                  {mant.activo?.codigo}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {mant.activo?.nombre}
                                </div>
                              </div>
                            </td>
                            <td>
                              {format(fechaProgramada, 'dd/MM/yyyy')}
                            </td>
                            <td>
                              {mant.tecnico?.nombreCompleto || 'Sin asignar'}
                            </td>
                            <td>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  mant.estado === 'pendiente'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : mant.estado === 'realizado'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {mant.estado}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  diasRestantes <= 3
                                    ? 'bg-red-100 text-red-800'
                                    : diasRestantes <= 7
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {diasRestantes > 0
                                  ? `${diasRestantes} días`
                                  : diasRestantes === 0
                                  ? 'Hoy'
                                  : 'Vencido'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
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

