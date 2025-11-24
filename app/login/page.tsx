'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { setStoredUser, isAuthenticated } from '@/lib/auth';
import { toast } from '@/lib/notifications';
import Link from 'next/link';
import { Mail, Lock, Sparkles } from 'lucide-react';

interface LoginForm {
  correo: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    if (isAuthenticated()) {
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      router.push(returnUrl || '/dashboard');
    }
  }, [router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      
      const userRole = typeof response.user.role === 'string' 
        ? response.user.role 
        : (response.user.role?.nombre || response.user.rol?.nombre);
      
      if (userRole === 'administrador_sistema') {
        router.push('/admin/dashboard');
        return;
      }
      
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-dark-bg">
      {/* Fondo animado con gradiente */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(0, 240, 255, 0.3) 0%, rgba(255, 0, 255, 0.2) 50%, rgba(0, 255, 255, 0.3) 100%)`,
          transition: 'background 0.3s ease',
        }}
      />

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${20 + i * 10}px`,
              height: `${20 + i * 10}px`,
              left: `${10 + i * 15}%`,
              top: `${10 + i * 12}%`,
              background: i % 3 === 0 
                ? 'radial-gradient(circle, rgba(0, 240, 255, 0.6), transparent)'
                : i % 3 === 1
                ? 'radial-gradient(circle, rgba(255, 0, 255, 0.6), transparent)'
                : 'radial-gradient(circle, rgba(0, 255, 255, 0.6), transparent)',
              animationDelay: `${i * 0.5}s`,
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo/Icono animado */}
        <div className="text-center mb-8">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-neon-blue rounded-full blur-xl opacity-50 animate-glow-pulse" />
            <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-neon-cyan rounded-lg rotate-45 animate-glow-pulse" />
              <div className="absolute inset-0 border-2 border-neon-magenta rounded-lg -rotate-45 animate-glow-pulse" style={{ animationDelay: '1s' }} />
              <Sparkles className="w-10 h-10 text-neon-blue animate-glow-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan bg-clip-text text-transparent animate-gradient bg-200%">
            PrismaAsset360
          </h1>
          <p className="text-gray-400 text-sm">Sistema de Control de Activos</p>
        </div>

        {/* Card del formulario */}
        <div className="relative">
          {/* Glow effect detrás del card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan rounded-2xl blur opacity-30 animate-glow-pulse" />
          
          <div className="relative bg-dark-bg-lighter/80 backdrop-blur-xl border border-neon-blue/30 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Iniciar Sesión
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neon-cyan" />
                  </div>
                  <input
                    {...register('correo', {
                      required: 'El correo es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Correo inválido',
                      },
                    })}
                    type="email"
                    id="correo"
                    className="w-full pl-10 pr-4 py-3 bg-dark-bg/50 border border-neon-blue/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300 hover:border-neon-cyan/50"
                    placeholder="tu@correo.com"
                  />
                </div>
                {errors.correo && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.correo.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neon-magenta" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres',
                      },
                    })}
                    type="password"
                    id="password"
                    className="w-full pl-10 pr-4 py-3 bg-dark-bg/50 border border-neon-magenta/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-magenta focus:border-transparent transition-all duration-300 hover:border-neon-magenta/50"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative px-6 py-3 bg-dark-bg-lighter/50 backdrop-blur-sm border border-neon-cyan/50 rounded-lg font-semibold text-white group-hover:border-neon-cyan transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-cyan/50">
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </span>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </div>
              </button>

              {/* Links */}
              <div className="text-center pt-4">
                <Link
                  href="/forgot-password"
                  className="text-sm text-neon-cyan hover:text-neon-blue transition-colors duration-300 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-8">
          © {new Date().getFullYear()} PrismaAsset360. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
