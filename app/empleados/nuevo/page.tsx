'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Sede, Area } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface EmpleadoForm {
  empresaId: number;
  areaId: number;
  nombre: string;
  cargo?: string;
  correo?: string;
  telefono?: string;
}

export default function NuevoEmpleadoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EmpleadoForm>();

  const sedeId = watch('sedeId');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (sedeId) {
      loadAreas(Number(sedeId));
    }
  }, [sedeId]);

  const loadData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const empresaId = user?.empresaId || 1;

      const sedesData = await api.getSedes(empresaId);
      setSedes(Array.isArray(sedesData) ? sedesData : []);

      // Cargar todas las áreas de todas las sedes
      const allAreas: Area[] = [];
      for (const sede of sedesData) {
        try {
          const areasData = await api.getAreas(sede.id);
          if (Array.isArray(areasData)) {
            allAreas.push(...areasData);
          }
        } catch (error) {
          // Continuar con la siguiente sede
        }
      }
      setAreas(allAreas);
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const loadAreas = async (sedeId: number) => {
    try {
      const areasData = await api.getAreas(sedeId);
      setAreas(Array.isArray(areasData) ? areasData : []);
    } catch (error) {
      setAreas([]);
    }
  };

  const onSubmit = async (data: EmpleadoForm) => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      await api.createEmpleado({
        ...data,
        empresaId: user?.empresaId || 1,
      });
      toast.success('Empleado creado exitosamente');
      router.push('/empleados');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear empleado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/empleados"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nuevo Empleado
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Registrar un nuevo empleado
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  type="text"
                  className="input"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo
                </label>
                <input
                  {...register('cargo')}
                  type="text"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo
                </label>
                <input
                  {...register('correo', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo inválido',
                    },
                  })}
                  type="email"
                  className="input"
                />
                {errors.correo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.correo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  {...register('telefono')}
                  type="tel"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área *
                </label>
                <select
                  {...register('areaId', {
                    required: 'El área es requerida',
                    valueAsNumber: true,
                  })}
                  className="input"
                >
                  <option value="">Seleccionar área</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nombre} {area.sede ? `(${area.sede.nombre})` : ''}
                    </option>
                  ))}
                </select>
                {errors.areaId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.areaId.message}
                  </p>
                )}
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
                {isLoading ? 'Guardando...' : 'Crear Empleado'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

