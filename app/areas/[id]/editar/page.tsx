'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Area, Sede } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';

interface AreaForm {
  nombre: string;
  sedeId: number;
}

export default function EditarAreaPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [area, setArea] = useState<Area | null>(null);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AreaForm>();

  useEffect(() => {
    if (params.id) {
      loadArea(Number(params.id));
    }
    loadSedes();
  }, [params.id]);

  const loadArea = async (id: number) => {
    try {
      const data = await api.getArea(id);
      setArea(data);
      setValue('nombre', data.nombre);
      setValue('sedeId', data.sedeId);
    } catch (error: any) {
      toast.error('Error al cargar área');
      router.push('/areas');
    }
  };

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
    if (!area) return;
    
    setIsLoading(true);
    try {
      await api.updateArea(area.id, {
        nombre: data.nombre,
        sedeId: data.sedeId,
      });
      toast.success('Área actualizada exitosamente');
      router.push('/areas');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar área');
    } finally {
      setIsLoading(false);
    }
  };

  if (!area) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-30 animate-glow-pulse" />
              <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan border-t-transparent"></div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

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
                Editar Área
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Modificar información del área
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
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

