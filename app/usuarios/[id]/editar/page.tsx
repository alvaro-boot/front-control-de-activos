'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { User, Area, Empresa } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';

interface UsuarioForm {
  empresaId?: number;
  rolId?: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  areaId?: number;
  activo?: number;
}

export default function EditarUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UsuarioForm>();

  const empresaId = watch('empresaId');

  useEffect(() => {
    if (params.id) {
      loadData(Number(params.id));
    }
  }, [params.id]);

  useEffect(() => {
    if (empresaId && isAdmin) {
      loadAreasByEmpresa(empresaId);
    }
  }, [empresaId, isAdmin]);

  const loadData = async (id: number) => {
    try {
      if (isAdmin) {
        const empresasData = await api.getEmpresas();
        setEmpresas(Array.isArray(empresasData) ? empresasData : []);
      }

      const [usuarioData, areasData] = await Promise.all([
        api.getUsuario(id),
        api.getAreas(),
      ]);

      setUsuario(usuarioData);
      setAreas(Array.isArray(areasData) ? areasData : []);

      // Setear valores del formulario
      if (isAdmin) {
        setValue('empresaId', usuarioData.empresaId);
        setValue('rolId', usuarioData.rolId);
      }
      setValue('nombreCompleto', usuarioData.nombreCompleto);
      setValue('correo', usuarioData.correo);
      setValue('telefono', usuarioData.telefono || '');
      setValue('areaId', usuarioData.areaId || undefined);
      setValue('activo', usuarioData.activo);
    } catch (error: any) {
      toast.error('Error al cargar datos');
      router.push('/usuarios');
    }
  };

  const loadAreasByEmpresa = async (empresaId: number) => {
    try {
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
    if (!usuario) return;

    setIsLoading(true);
    try {
      // Preparar datos para enviar
      const updateData: any = {
        nombreCompleto: data.nombreCompleto,
        correo: data.correo,
        telefono: data.telefono,
        areaId: data.areaId,
        activo: data.activo,
      };

      // Solo incluir empresaId y rolId si es admin del sistema
      if (isAdmin) {
        if (data.empresaId) updateData.empresaId = data.empresaId;
        if (data.rolId) updateData.rolId = data.rolId;
      }

      await api.updateUsuario(usuario.id, updateData);
      toast.success('Usuario actualizado exitosamente');
      router.push(`/usuarios/${usuario.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (!usuario) {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={['administrador', 'administrador_sistema']}>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/usuarios/${usuario.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Usuario
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {usuario.correo}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isAdmin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa *
                    </label>
                    <select
                      {...register('empresaId', {
                        required: isAdmin ? 'La empresa es requerida' : false,
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol *
                    </label>
                    <select
                      {...register('rolId', {
                        required: isAdmin ? 'El rol es requerido' : false,
                        valueAsNumber: true,
                      })}
                      className="input"
                    >
                      <option value="">Seleccionar rol</option>
                      <option value={1}>Administrador</option>
                      <option value={2}>Técnico</option>
                      <option value={3}>Empleado</option>
                      <option value={4}>Administrador del Sistema</option>
                    </select>
                    {errors.rolId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.rolId.message}
                      </p>
                    )}
                  </div>
                </>
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
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

