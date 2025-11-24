'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';

interface EmpresaForm {
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
}

export default function NuevaEmpresaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmpresaForm>();

  const onSubmit = async (data: EmpresaForm) => {
    setIsLoading(true);
    try {
      await api.createEmpresa(data);
      toast.success('Empresa creada exitosamente');
      router.push('/empresas');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear empresa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['administrador_sistema']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/empresas"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Empresa</h1>
              <p className="mt-2 text-sm text-gray-600">
                Crear una nueva empresa en el sistema
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
                  {...register('nombre', {
                    required: 'El nombre es requerido',
                  })}
                  type="text"
                  className="input"
                  placeholder="Nombre de la empresa"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nombre.message}
                  </p>
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
                  placeholder="Número de identificación tributaria"
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
                  placeholder="correo@empresa.com"
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
                  type="text"
                  className="input"
                  placeholder="Teléfono de contacto"
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
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href="/empresas"
                className="btn btn-secondary"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'Creando...' : 'Crear Empresa'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

