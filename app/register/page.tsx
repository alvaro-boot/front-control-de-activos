'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { setStoredUser, isAuthenticated } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface RegisterForm {
  empresaId: number;
  rolId: number;
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  areaId?: number;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await api.register(data);

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setStoredUser(response.user);

      toast.success('¡Registro exitoso!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al registrar usuario'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Regístrate en el sistema
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre Completo
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
              <label className="block text-sm font-medium text-gray-700">
                Correo electrónico
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
              <label className="block text-sm font-medium text-gray-700">
                Contraseña
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
              <label className="block text-sm font-medium text-gray-700">
                Teléfono (opcional)
              </label>
              <input
                {...register('telefono')}
                type="tel"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID de Empresa
              </label>
              <input
                {...register('empresaId', {
                  required: 'El ID de empresa es requerido',
                  valueAsNumber: true,
                })}
                type="number"
                className="input"
                defaultValue={1}
              />
              {errors.empresaId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.empresaId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                ID de Rol (1: Admin, 2: Técnico, 3: Empleado)
              </label>
              <input
                {...register('rolId', {
                  required: 'El ID de rol es requerido',
                  valueAsNumber: true,
                })}
                type="number"
                className="input"
                defaultValue={3}
              />
              {errors.rolId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rolId.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

