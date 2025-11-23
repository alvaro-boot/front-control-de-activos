'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo, Empleado } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface AsignacionForm {
  activoId: number;
  empleadoId: number;
  fechaAsignacion?: string;
}

export default function NuevaAsignacionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AsignacionForm>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const empresaId = user?.empresaId || 1;

      const [activosData, empleadosData] = await Promise.all([
        api.getActivos(empresaId),
        api.getEmpleados(empresaId),
      ]);

      // Filtrar solo activos disponibles (activos y no asignados)
      const activosDisponibles = (Array.isArray(activosData) ? activosData : []).filter(
        (a: Activo) => a.estado === 'activo'
      );

      setActivos(activosDisponibles);
      setEmpleados(Array.isArray(empleadosData) ? empleadosData : []);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const onSubmit = async (data: AsignacionForm) => {
    setIsLoading(true);
    try {
      await api.createAsignacion({
        ...data,
        fechaAsignacion: data.fechaAsignacion || new Date().toISOString(),
      });
      toast.success('Asignación creada exitosamente');
      router.push('/asignaciones');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al crear asignación'
      );
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
              href="/asignaciones"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nueva Asignación
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Asignar un activo a un empleado
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activo *
                </label>
                <select
                  {...register('activoId', {
                    required: 'El activo es requerido',
                    valueAsNumber: true,
                  })}
                  className="input"
                >
                  <option value="">Seleccionar activo</option>
                  {activos.map((activo) => (
                    <option key={activo.id} value={activo.id}>
                      {activo.codigo} - {activo.nombre}
                    </option>
                  ))}
                </select>
                {errors.activoId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.activoId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empleado *
                </label>
                <select
                  {...register('empleadoId', {
                    required: 'El empleado es requerido',
                    valueAsNumber: true,
                  })}
                  className="input"
                >
                  <option value="">Seleccionar empleado</option>
                  {empleados.map((empleado) => (
                    <option key={empleado.id} value={empleado.id}>
                      {empleado.nombre} - {empleado.cargo || 'Sin cargo'}
                    </option>
                  ))}
                </select>
                {errors.empleadoId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.empleadoId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Asignación
                </label>
                <input
                  {...register('fechaAsignacion')}
                  type="datetime-local"
                  className="input"
                  defaultValue={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" disabled={isLoading} className="btn btn-primary">
                {isLoading ? 'Guardando...' : 'Crear Asignación'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

