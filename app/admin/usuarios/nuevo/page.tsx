'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from '@/lib/notifications';

interface UsuarioForm {
  empresaId: number;
  rolId: number;
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  areaId?: number;
}

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UsuarioForm>();

  const empresaId = watch('empresaId');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (empresaId) {
      loadAreas(empresaId);
    }
  }, [empresaId]);

  const loadData = async () => {
    try {
      const [empresasData, rolesData] = await Promise.all([
        api.getEmpresas(),
        api.getRoles?.() || Promise.resolve([]),
      ]);
      setEmpresas(Array.isArray(empresasData) ? empresasData : []);
      // Roles básicos si no hay endpoint
      if (!rolesData || rolesData.length === 0) {
        setRoles([
          { id: 1, nombre: 'administrador' },
          { id: 2, nombre: 'tecnico' },
          { id: 3, nombre: 'empleado' },
        ]);
      } else {
        setRoles(rolesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadAreas = async (empresaId: number) => {
    try {
      const areasData = await api.getAreas();
      const filtered = Array.isArray(areasData)
        ? areasData.filter((a: any) => a.sede?.empresaId === empresaId)
        : [];
      setAreas(filtered);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const onSubmit = async (data: UsuarioForm) => {
    try {
      setIsLoading(true);
      await api.createUsuarioAdmin(data);
      toast.success('Usuario creado exitosamente');
      router.push('/admin/usuarios');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['administrador_sistema']}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/usuarios"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
              <p className="mt-2 text-sm text-gray-600">
                Crea un nuevo usuario y asígnalo a una empresa
              </p>
            </div>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <select
                    {...register('empresaId', { required: 'La empresa es requerida', valueAsNumber: true })}
                    className="input"
                  >
                    <option value="">Selecciona una empresa</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    {...register('rolId', { required: 'El rol es requerido', valueAsNumber: true })}
                    className="input"
                  >
                    <option value="">Selecciona un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.rolId && (
                    <p className="mt-1 text-sm text-red-600">{errors.rolId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    {...register('nombreCompleto', { required: 'El nombre es requerido' })}
                    type="text"
                    className="input"
                    placeholder="Nombre completo"
                  />
                  {errors.nombreCompleto && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombreCompleto.message}</p>
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
                    placeholder="correo@ejemplo.com"
                  />
                  {errors.correo && (
                    <p className="mt-1 text-sm text-red-600">{errors.correo.message}</p>
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
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.contrasena && (
                    <p className="mt-1 text-sm text-red-600">{errors.contrasena.message}</p>
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

                {empresaId && areas.length > 0 && (
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
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/usuarios"
                  className="btn btn-secondary"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

