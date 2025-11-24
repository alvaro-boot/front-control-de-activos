'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { toast } from '@/lib/notifications';
import Link from 'next/link';
import { ArrowLeft, Mail, Sparkles, CheckCircle } from 'lucide-react';

interface ForgotPasswordForm {
  correo: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

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

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      await api.forgotPassword(data.correo);
      setEmailSent(true);
      toast.success('Si el correo existe, recibirás un enlace para restablecer tu contraseña');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al solicitar recuperación de contraseña'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${15 + i * 8}px`,
              height: `${15 + i * 8}px`,
              left: `${15 + i * 20}%`,
              top: `${20 + i * 15}%`,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(0, 240, 255, 0.5), transparent)'
                : 'radial-gradient(circle, rgba(255, 0, 255, 0.5), transparent)',
              animationDelay: `${i * 0.4}s`,
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
            <div className="absolute inset-0 bg-neon-magenta rounded-full blur-xl opacity-50 animate-glow-pulse" />
            <Mail className="relative w-12 h-12 text-neon-magenta mx-auto animate-glow-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan bg-clip-text text-transparent animate-gradient bg-200%">
            Recuperar Contraseña
          </h1>
          <p className="text-gray-400 text-sm">
            Ingresa tu correo y te enviaremos un enlace de recuperación
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-magenta via-neon-cyan to-neon-blue rounded-2xl blur opacity-30 animate-glow-pulse" />
          
          <div className="relative bg-dark-bg-lighter/80 backdrop-blur-xl border border-neon-magenta/30 rounded-2xl p-8 shadow-2xl">
            {emailSent ? (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-block relative">
                    <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-50 animate-glow-pulse" />
                    <CheckCircle className="relative w-16 h-16 text-neon-cyan mx-auto animate-glow-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Correo Enviado
                </h3>
                <p className="text-gray-300 mb-6 text-sm">
                  Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
                  Revisa tu bandeja de entrada y carpeta de spam.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-cyan text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-neon-cyan/50 transition-all duration-300"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="correo" className="block text-sm font-medium text-gray-300 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-neon-magenta" />
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
                      className="w-full pl-10 pr-4 py-3 bg-dark-bg/50 border border-neon-magenta/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-magenta focus:border-transparent transition-all duration-300 hover:border-neon-magenta/50"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-magenta via-neon-cyan to-neon-blue opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative px-6 py-3 bg-dark-bg-lighter/50 backdrop-blur-sm border border-neon-magenta/50 rounded-lg font-semibold text-white group-hover:border-neon-magenta transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-magenta/50">
                    {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                  </div>
                </button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-neon-cyan hover:text-neon-blue transition-colors duration-300 hover:underline"
                  >
                    ¿Recordaste tu contraseña? Inicia sesión
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
