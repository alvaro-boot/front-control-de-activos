'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Sede } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';

interface AreaForm {
  nombre: string;
  sedeId: number;
}

export default function NuevaAreaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AreaForm>();

  const sedeId = watch('sedeId');

  useEffect(() => {
    loadSedes();
  }, []);

  const loadSedes = async () => {
    try {
      const empresaId = isAdmin ? undefined : user?.empresaId;
      const data = await api.getSedes(empresaId);
      setSedes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar sedes');
    }
  };

  const onSubmit = async (data: AreaForm) => {
    setIsLoading(true);
    try {
      await api.createArea({
        nombre: data.nombre,
        sedeId: data.sedeId,
      });
      toast.success('Área creada exitosamente');
      router.push('/areas');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear área');
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
              href="/areas"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nueva Área
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Crear una nueva área para una sede
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card card-glow space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sede *
              </label>
              <select
                {...register('sedeId', { required: 'La sede es requerida', valueAsNumber: true })}
                className="input"
              >
                <option value="">Seleccionar sede</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre} {sede.direccion ? `- ${sede.direccion}` : ''}
                  </option>
                ))}
              </select>
              {errors.sedeId && (
                <p className="mt-1 text-sm text-red-600">{errors.sedeId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                {...register('nombre', { required: 'El nombre es requerido' })}
                type="text"
                className="input"
                placeholder="Ej: Área de Producción"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/areas"
                className="btn btn-secondary"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'Guardando...' : 'Crear Área'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

