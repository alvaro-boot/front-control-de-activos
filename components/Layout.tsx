'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  UserCheck, 
  Wrench, 
  Calendar,
  Building2,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { getStoredUser, clearStoredUser, isSystemAdmin } from '@/lib/auth';
import { User } from '@/types';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Activos', href: '/activos', icon: Package },
  { name: 'Asignaciones', href: '/asignaciones', icon: UserCheck },
  { name: 'Mantenimientos', href: '/mantenimientos', icon: Wrench },
  { name: 'Mantenimientos Programados', href: '/mantenimientos-programados', icon: Calendar },
  { name: 'Mantenimientos Próximos', href: '/mantenimientos-programados/proximos', icon: Calendar },
  { name: 'Empleados', href: '/empleados', icon: Users },
  { name: 'Usuarios', href: '/usuarios', icon: Users },
  { name: 'Empresas', href: '/empresas', icon: Building2, adminOnly: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(storedUser);
  }, [router, pathname]); // Agregar pathname para que se actualice al navegar

  const handleLogout = () => {
    clearStoredUser();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar móvil */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold text-primary-600">
              Control de Activos
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              // Ocultar opciones solo para admin del sistema si el usuario no es admin
              // Manejar tanto objeto {nombre: "..."} como string directo (compatibilidad)
              const userRole = typeof user?.role === 'string' 
                ? user.role 
                : (user?.role?.nombre || user?.rol?.nombre);
              if (item.adminOnly && userRole !== 'administrador_sistema') {
                return null;
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <h1 className="text-xl font-bold text-primary-600">
              Control de Activos
            </h1>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              // Ocultar opciones solo para admin del sistema si el usuario no es admin
              // Manejar tanto objeto {nombre: "..."} como string directo (compatibilidad)
              const userRole = typeof user?.role === 'string' 
                ? user.role 
                : (user?.role?.nombre || user?.rol?.nombre);
              if (item.adminOnly && userRole !== 'administrador_sistema') {
                return null;
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.nombreCompleto}
                </p>
                <p className="text-xs text-gray-500">{user.correo}</p>
                <p className="text-xs text-primary-600 capitalize">
                  {typeof user.role === 'string' 
                    ? user.role 
                    : (user.role?.nombre || user.rol?.nombre)}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header móvil */}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">
              Control de Activos
            </h1>
          </div>
        </div>

        {/* Contenido */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

