'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { toast } from '@/lib/notifications';
import Link from 'next/link';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';

interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Token de recuperación no válido');
      router.push('/forgot-password');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

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

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Token de recuperación no válido');
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      await api.resetPassword(token, data.newPassword);
      toast.success('Contraseña restablecida exitosamente');
      router.push('/login');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al restablecer la contraseña'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-dark-bg">
      {/* Fondo animado */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(0, 240, 255, 0.3) 0%, rgba(255, 0, 255, 0.2) 50%, rgba(0, 255, 255, 0.3) 100%)`,
          transition: 'background 0.3s ease',
        }}
      />

      {/* Partículas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${18 + i * 6}px`,
              height: `${18 + i * 6}px`,
              left: `${12 + i * 18}%`,
              top: `${15 + i * 12}%`,
              background: i % 3 === 0 
                ? 'radial-gradient(circle, rgba(0, 240, 255, 0.5), transparent)'
                : i % 3 === 1
                ? 'radial-gradient(circle, rgba(255, 0, 255, 0.5), transparent)'
                : 'radial-gradient(circle, rgba(0, 255, 255, 0.5), transparent)',
              animationDelay: `${i * 0.3}s`,
              filter: 'blur(2px)',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-neon-cyan hover:text-neon-blue mb-6 transition-colors duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </Link>

        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-50 animate-glow-pulse" />
            <Lock className="relative w-12 h-12 text-neon-cyan mx-auto animate-glow-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-magenta bg-clip-text text-transparent animate-gradient bg-200%">
            Restablecer Contraseña
          </h1>
          <p className="text-gray-400 text-sm">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-magenta rounded-2xl blur opacity-30 animate-glow-pulse" />
          
          <div className="relative bg-dark-bg-lighter/80 backdrop-blur-xl border border-neon-cyan/30 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neon-cyan" />
                  </div>
                  <input
                    {...register('newPassword', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres',
                      },
                    })}
                    type="password"
                    id="newPassword"
                    className="w-full pl-10 pr-4 py-3 bg-dark-bg/50 border border-neon-cyan/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:border-transparent transition-all duration-300 hover:border-neon-cyan/50"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neon-magenta" />
                  </div>
                  <input
                    {...register('confirmPassword', {
                      required: 'Debes confirmar la contraseña',
                      validate: (value) =>
                        value === watch('newPassword') || 'Las contraseñas no coinciden',
                    })}
                    type="password"
                    id="confirmPassword"
                    className="w-full pl-10 pr-4 py-3 bg-dark-bg/50 border border-neon-magenta/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-magenta focus:border-transparent transition-all duration-300 hover:border-neon-magenta/50"
                    placeholder="Confirma tu contraseña"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-magenta opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative px-6 py-3 bg-dark-bg-lighter/50 backdrop-blur-sm border border-neon-cyan/50 rounded-lg font-semibold text-white group-hover:border-neon-cyan transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-cyan/50">
                  {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
                </div>
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-neon-cyan hover:text-neon-blue transition-colors duration-300 hover:underline"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
