import { User } from '@/types';

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const clearStoredUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
};

export const hasRole = (role: string): boolean => {
  const user = getStoredUser();
  // Manejar tanto objeto {nombre: "..."} como string directo (compatibilidad)
  const userRole = typeof user?.role === 'string' 
    ? user.role 
    : (user?.role?.nombre || user?.rol?.nombre);
  return userRole === role;
};

export const canAccess = (allowedRoles: string[]): boolean => {
  const user = getStoredUser();
  if (!user) return false;
  // Manejar tanto objeto {nombre: "..."} como string directo (compatibilidad)
  const userRole = typeof user?.role === 'string' 
    ? user.role 
    : (user?.role?.nombre || user?.rol?.nombre);
  return allowedRoles.includes(userRole || '');
};

export const isSystemAdmin = (): boolean => {
  const user = getStoredUser();
  // Manejar tanto objeto {nombre: "..."} como string directo (compatibilidad)
  const userRole = typeof user?.role === 'string' 
    ? user.role 
    : (user?.role?.nombre || user?.rol?.nombre);
  return userRole === 'administrador_sistema';
};

