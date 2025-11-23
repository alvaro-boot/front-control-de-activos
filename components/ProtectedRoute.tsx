'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      // Guardar la ruta actual para redirigir después del login
      const returnUrl = typeof window !== 'undefined' 
        ? window.location.pathname + window.location.search
        : pathname;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          // Verificar tanto 'role' como 'rol' (singular) para compatibilidad
          const userRole = user.role?.nombre || user.rol?.nombre;
          if (!allowedRoles.includes(userRole)) {
            router.push('/dashboard');
            return;
          }
        } catch {
          router.push('/login');
          return;
        }
      }
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [router, allowedRoles, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

