'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2,
  Users,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { getStoredUser, clearStoredUser, isSystemAdmin } from '@/lib/auth';
import { User } from '@/types';

const adminNavigation = [
  { name: 'Dashboard Global', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Gestión de Empresas', href: '/admin/empresas', icon: Building2 },
  { name: 'Gestión de Usuarios', href: '/admin/usuarios', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    
    // Verificar que sea admin del sistema
    if (!isSystemAdmin()) {
      router.push('/dashboard');
      return;
    }
    
    setUser(storedUser);
  }, [router, pathname]);

  const handleLogout = () => {
    clearStoredUser();
    router.push('/login');
  };

  if (!user || !isSystemAdmin()) {
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
          <div className="flex h-16 items-center justify-between px-4 border-b bg-primary-600">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-white mr-2" />
              <h1 className="text-xl font-bold text-white">
                Super Admin
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
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
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.nombreCompleto}
                </p>
                <p className="text-xs text-gray-500">{user.correo}</p>
                <p className="text-xs text-primary-600 font-semibold">
                  Administrador del Sistema
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

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b bg-primary-600">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-white mr-2" />
              <h1 className="text-xl font-bold text-white">
                Super Admin
              </h1>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
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
                <p className="text-xs text-primary-600 font-semibold">
                  Administrador del Sistema
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
        <div className="sticky top-0 z-10 flex h-16 bg-primary-600 border-b border-primary-700 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-white hover:text-gray-200"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-between px-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-white mr-2" />
              <h1 className="text-lg font-semibold text-white">
                Super Admin
              </h1>
            </div>
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

