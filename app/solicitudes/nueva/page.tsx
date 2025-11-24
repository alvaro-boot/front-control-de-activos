'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from '@/lib/notifications';

interface SolicitudForm {
  tipo: 'traslado' | 'baja' | 'repuesto' | 'mantenimiento';
  activoId?: number;
  motivo: string;
  observaciones?: string;
  // Campos para traslado
  sedeOrigenId?: number;
  sedeDestinoId?: number;
  areaOrigenId?: number;
  areaDestinoId?: number;
  // Campos para repuestos
  repuestoNombre?: string;
  repuestoCantidad?: number;
  repuestoDescripcion?: string;
}

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activoIdParam = searchParams.get('activoId');
  const tipoParam = searchParams.get('tipo') as SolicitudForm['tipo'];
  
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SolicitudForm>({
    defaultValues: {
      tipo: tipoParam || 'traslado',
      activoId: activoIdParam ? Number(activoIdParam) : undefined,
    },
  });

  const tipo = watch('tipo');

  const onSubmit = async (data: SolicitudForm) => {
    try {
      setIsLoading(true);
      await api.createSolicitud(data);
      toast.success('Solicitud creada exitosamente');
      router.push('/solicitudes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud</h1>
              <p className="mt-2 text-sm text-gray-600">
                Crea una solicitud de traslado, baja, repuesto o mantenimiento
              </p>
            </div>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Solicitud *
                </label>
                <select
                  {...register('tipo', { required: 'El tipo es requerido' })}
                  className="input"
                >
                  <option value="traslado">Traslado de Activo</option>
                  <option value="baja">Baja de Activo</option>
                  <option value="repuesto">Solicitar Repuesto</option>
                  <option value="mantenimiento">Solicitar Mantenimiento</option>
                </select>
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                )}
              </div>

              {(tipo === 'traslado' || tipo === 'baja') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Activo *
                  </label>
                  <input
                    {...register('activoId', { 
                      required: 'El ID del activo es requerido',
                      valueAsNumber: true 
                    })}
                    type="number"
                    className="input"
                    placeholder="ID del activo"
                  />
                  {errors.activoId && (
                    <p className="mt-1 text-sm text-red-600">{errors.activoId.message}</p>
                  )}
                </div>
              )}

              {tipo === 'traslado' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sede Origen
                    </label>
                    <input
                      {...register('sedeOrigenId', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="ID de sede origen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sede Destino
                    </label>
                    <input
                      {...register('sedeDestinoId', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="ID de sede destino"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área Origen
                    </label>
                    <input
                      {...register('areaOrigenId', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="ID de área origen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Área Destino
                    </label>
                    <input
                      {...register('areaDestinoId', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="ID de área destino"
                    />
                  </div>
                </div>
              )}

              {tipo === 'repuesto' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Repuesto *
                    </label>
                    <input
                      {...register('repuestoNombre', { required: tipo === 'repuesto' })}
                      type="text"
                      className="input"
                      placeholder="Nombre del repuesto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad *
                    </label>
                    <input
                      {...register('repuestoCantidad', { 
                        required: tipo === 'repuesto',
                        valueAsNumber: true 
                      })}
                      type="number"
                      className="input"
                      placeholder="Cantidad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      {...register('repuestoDescripcion')}
                      className="input"
                      rows={3}
                      placeholder="Descripción del repuesto necesario"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo *
                </label>
                <textarea
                  {...register('motivo', { required: 'El motivo es requerido' })}
                  className="input"
                  rows={4}
                  placeholder="Describe el motivo de la solicitud"
                />
                {errors.motivo && (
                  <p className="mt-1 text-sm text-red-600">{errors.motivo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Adicionales
                </label>
                <textarea
                  {...register('observaciones')}
                  className="input"
                  rows={3}
                  placeholder="Observaciones adicionales (opcional)"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/dashboard"
                  className="btn btn-secondary"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Creando...' : 'Crear Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

