'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo, User } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface MantenimientoForm {
  activoId: number;
  tecnicoId: number;
  tipo: 'preventivo' | 'correctivo';
  notas?: string;
  fechaMantenimiento: string;
  costo?: number;
}

function NuevoMantenimientoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activoIdParam = searchParams.get('activoId');
  const [isLoading, setIsLoading] = useState(false);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MantenimientoForm>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const empresaId = user?.empresaId || 1;

      const [activosData, usuariosData] = await Promise.all([
        api.getActivos(empresaId),
        api.getUsuarios(),
      ]);

      setActivos(Array.isArray(activosData) ? activosData : []);
      
      // Filtrar solo técnicos
      const tecnicosData = (Array.isArray(usuariosData) ? usuariosData : []).filter(
        (u: User) => u.role?.nombre === 'tecnico' || u.role?.nombre === 'administrador'
      );
      setTecnicos(tecnicosData);

      // Si hay activoId en la URL, setearlo
      if (activoIdParam) {
        setValue('activoId', Number(activoIdParam));
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const onSubmit = async (data: MantenimientoForm) => {
    setIsLoading(true);
    try {
      await api.createMantenimiento(data);
      toast.success('Mantenimiento creado exitosamente');
      router.push('/mantenimientos');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al crear mantenimiento'
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
              href="/mantenimientos"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nuevo Mantenimiento
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Registrar un nuevo mantenimiento
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
                  Técnico *
                </label>
                <select
                  {...register('tecnicoId', {
                    required: 'El técnico es requerido',
                    valueAsNumber: true,
                  })}
                  className="input"
                >
                  <option value="">Seleccionar técnico</option>
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nombreCompleto}
                    </option>
                  ))}
                </select>
                {errors.tecnicoId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tecnicoId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  {...register('tipo', { required: 'El tipo es requerido' })}
                  className="input"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="preventivo">Preventivo</option>
                  <option value="correctivo">Correctivo</option>
                </select>
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.tipo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Mantenimiento *
                </label>
                <input
                  {...register('fechaMantenimiento', {
                    required: 'La fecha es requerida',
                  })}
                  type="date"
                  className="input"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
                {errors.fechaMantenimiento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fechaMantenimiento.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo
                </label>
                <input
                  {...register('costo', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  {...register('notas')}
                  rows={4}
                  className="input"
                  placeholder="Descripción del mantenimiento realizado..."
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
                {isLoading ? 'Guardando...' : 'Crear Mantenimiento'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

export default function NuevoMantenimientoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <NuevoMantenimientoForm />
    </Suspense>
  );
}

