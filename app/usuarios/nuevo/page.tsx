'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Area, Empresa } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';

interface UsuarioForm {
  empresaId: number;
  rolId: number;
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  areaId?: number;
  activo?: number;
}

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UsuarioForm>({
    defaultValues: {
      empresaId: user?.empresaId || 1,
    },
  });

  const empresaId = watch('empresaId');

  useEffect(() => {
    if (isAdmin) {
      loadEmpresas();
    }
    loadAreas();
  }, [isAdmin]);

  useEffect(() => {
    if (empresaId) {
      loadAreasByEmpresa(empresaId);
    }
  }, [empresaId]);

  const loadEmpresas = async () => {
    try {
      const empresasData = await api.getEmpresas();
      setEmpresas(Array.isArray(empresasData) ? empresasData : []);
    } catch (error) {
      // Ignorar error
    }
  };

  const loadAreas = async () => {
    try {
      const areasData = await api.getAreas();
      setAreas(Array.isArray(areasData) ? areasData : []);
    } catch (error) {
      // Ignorar error
    }
  };

  const loadAreasByEmpresa = async (empresaId: number) => {
    try {
      // Cargar sedes de la empresa y luego áreas
      const sedesData = await api.getSedes(empresaId);
      const allAreas: Area[] = [];
      for (const sede of sedesData) {
        try {
          const areasData = await api.getAreas(sede.id);
          if (Array.isArray(areasData)) {
            allAreas.push(...areasData);
          }
        } catch (error) {
          // Continuar
        }
      }
      setAreas(allAreas);
    } catch (error) {
      // Ignorar error
    }
  };

  const onSubmit = async (data: UsuarioForm) => {
    setIsLoading(true);
    try {
      await api.createUsuario({
        ...data,
        empresaId: isAdmin ? data.empresaId : (user?.empresaId || 1),
        activo: data.activo ?? 1,
      });
      toast.success('Usuario creado exitosamente');
      router.push('/usuarios');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['administrador', 'administrador_sistema']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/usuarios"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Nuevo Usuario
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Crear un nuevo usuario del sistema
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <select
                    {...register('empresaId', {
                      required: 'La empresa es requerida',
                      valueAsNumber: true,
                    })}
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.empresaId.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  {...register('nombreCompleto', {
                    required: 'El nombre es requerido',
                  })}
                  type="text"
                  className="input"
                />
                {errors.nombreCompleto && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nombreCompleto.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  {...register('correo', {
                    required: 'El correo es requerido',
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
                  Contraseña *
                </label>
                <input
                  {...register('contrasena', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres',
                    },
                  })}
                  type="password"
                  className="input"
                />
                {errors.contrasena && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.contrasena.message}
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
                  Rol *
                </label>
                <select
                  {...register('rolId', {
                    required: 'El rol es requerido',
                    valueAsNumber: true,
                  })}
                  className="input"
                >
                  <option value="">Seleccionar rol</option>
                  <option value={1}>Administrador</option>
                  <option value={2}>Técnico</option>
                  <option value={3}>Empleado</option>
                  {isAdmin && <option value={4}>Administrador del Sistema</option>}
                </select>
                {errors.rolId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rolId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área
                </label>
                <select
                  {...register('areaId', { valueAsNumber: true })}
                  className="input"
                >
                  <option value="">Sin área</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  {...register('activo', { valueAsNumber: true })}
                  className="input"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
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
                {isLoading ? 'Guardando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

