'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Sede, Empresa } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { isSystemAdmin } from '@/lib/auth';

interface SedeForm {
  nombre: string;
  direccion?: string;
  empresaId?: number;
}

export default function EditarSedePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sede, setSede] = useState<Sede | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const isAdmin = isSystemAdmin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SedeForm>();

  useEffect(() => {
    if (params.id) {
      loadSede(Number(params.id));
    }
    if (isAdmin) {
      loadEmpresas();
    }
  }, [params.id, isAdmin]);

  const loadSede = async (id: number) => {
    try {
      const data = await api.getSede(id);
      setSede(data);
      setValue('nombre', data.nombre);
      setValue('direccion', data.direccion || '');
      if (isAdmin) {
        setValue('empresaId', data.empresaId);
      }
    } catch (error: any) {
      toast.error('Error al cargar sede');
      router.push('/sedes');
    }
  };

  const loadEmpresas = async () => {
    try {
      const data = await api.getEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar empresas');
    }
  };

  const onSubmit = async (data: SedeForm) => {
    if (!sede) return;
    
    setIsLoading(true);
    try {
      await api.updateSede(sede.id, {
        nombre: data.nombre,
        direccion: data.direccion || undefined,
        empresaId: isAdmin ? data.empresaId : sede.empresaId,
      });
      toast.success('Sede actualizada exitosamente');
      router.push('/sedes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar sede');
    } finally {
      setIsLoading(false);
    }
  };

  if (!sede) {
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
              href="/sedes"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Sede
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Modificar información de la sede
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card card-glow space-y-6">
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa *
                </label>
                <select
                  {...register('empresaId', { required: 'La empresa es requerida', valueAsNumber: true })}
                  className="input"
                >
                  <option value="">Seleccionar empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nombre}
                    </option>
                  ))}
                </select>
                {errors.empresaId && (
                  <p className="mt-1 text-sm text-red-600">{errors.empresaId.message}</p>
                )}
              </div>
            )}

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                {...register('direccion')}
                rows={3}
                className="input"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/sedes"
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

