'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface EmpresaForm {
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
}

export default function EditarEmpresaPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<EmpresaForm>();

  useEffect(() => {
    if (params.id) {
      loadEmpresa(Number(params.id));
    }
  }, [params.id]);

  const loadEmpresa = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getEmpresaDetallada(id);
      setValue('nombre', data.nombre);
      setValue('nit', data.nit || '');
      setValue('direccion', data.direccion || '');
      setValue('telefono', data.telefono || '');
      setValue('correo', data.correo || '');
    } catch (error: any) {
      toast.error('Error al cargar empresa');
      router.push('/admin/empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EmpresaForm) => {
    try {
      setIsSaving(true);
      await api.updateEmpresaAdmin(Number(params.id), data);
      toast.success('Empresa actualizada exitosamente');
      router.push('/admin/empresas');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar empresa');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['administrador_sistema']}>
        <AdminLayout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['administrador_sistema']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/empresas"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Empresa</h1>
              <p className="mt-2 text-sm text-gray-600">
                Actualiza la información de la empresa
              </p>
            </div>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa *
                  </label>
                  <input
                    {...register('nombre', { required: 'El nombre es requerido' })}
                    type="text"
                    className="input"
                    placeholder="Nombre de la empresa"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT
                  </label>
                  <input
                    {...register('nit')}
                    type="text"
                    className="input"
                    placeholder="NIT de la empresa"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <textarea
                    {...register('direccion')}
                    className="input"
                    rows={3}
                    placeholder="Dirección de la empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    {...register('telefono')}
                    type="text"
                    className="input"
                    placeholder="Teléfono de contacto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
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
                    placeholder="correo@empresa.com"
                  />
                  {errors.correo && (
                    <p className="mt-1 text-sm text-red-600">{errors.correo.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/empresas"
                  className="btn btn-secondary"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

