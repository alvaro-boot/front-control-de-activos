'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { setStoredUser, isAuthenticated } from '@/lib/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface LoginForm {
  correo: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    if (isAuthenticated()) {
      // Verificar si hay una URL de retorno
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      router.push(returnUrl || '/dashboard');
    }
  }, [router]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await api.login({
        correo: data.correo,
        password: data.password,
      });

      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setStoredUser(response.user);

      toast.success('¡Bienvenido!');
      
      // Verificar si es admin del sistema y redirigir al panel admin
      const userRole = typeof response.user.role === 'string' 
        ? response.user.role 
        : (response.user.role?.nombre || response.user.rol?.nombre);
      
      if (userRole === 'administrador_sistema') {
        router.push('/admin/dashboard');
        return;
      }
      
      // Verificar si hay una URL de retorno
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      router.push(returnUrl || '/dashboard');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al iniciar sesión'
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
            Sistema de Control de Activos
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicia sesión en tu cuenta
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="correo" className="sr-only">
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
                className="input rounded-t-md"
                placeholder="Correo electrónico"
              />
              {errors.correo && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.correo.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                  },
                })}
                type="password"
                className="input rounded-b-md"
                placeholder="Contraseña"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
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
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

