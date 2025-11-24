'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Empresa } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';

interface SedeForm {
  nombre: string;
  direccion?: string;
  empresaId?: number;
}

export default function NuevaSedePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SedeForm>({
    defaultValues: {
      empresaId: user?.empresaId,
    },
  });

  useEffect(() => {
    if (isAdmin) {
      loadEmpresas();
    }
  }, [isAdmin]);

  const loadEmpresas = async () => {
    try {
      const data = await api.getEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar empresas');
    }
  };

  const onSubmit = async (data: SedeForm) => {
    setIsLoading(true);
    try {
      // Si no es admin, usar la empresa del usuario
      const sedeData = {
        nombre: data.nombre,
        direccion: data.direccion || undefined,
        empresaId: isAdmin ? data.empresaId : user?.empresaId,
      };
      await api.createSede(sedeData);
      toast.success('Sede creada exitosamente');
      router.push('/sedes');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear sede');
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
              href="/sedes"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nueva Sede
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Crear una nueva sede para la empresa
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
                placeholder="Ej: Sede Principal"
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
                placeholder="Dirección de la sede"
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
                {isLoading ? 'Guardando...' : 'Crear Sede'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

