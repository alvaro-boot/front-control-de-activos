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
  X,
  FileText,
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react';
import { getStoredUser, clearStoredUser, isSystemAdmin } from '@/lib/auth';
import { User } from '@/types';
import Notificaciones from './Notificaciones';

// Navegación base - se filtra según el rol
const allNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['administrador', 'tecnico'] },
  { name: 'Activos', href: '/activos', icon: Package, roles: ['administrador', 'tecnico'] },
  { name: 'Asignaciones', href: '/asignaciones', icon: UserCheck, roles: ['administrador'] },
  { name: 'Mantenimientos', href: '/mantenimientos', icon: Wrench, roles: ['administrador', 'tecnico'] },
  { name: 'Mantenimientos Programados', href: '/mantenimientos-programados', icon: Calendar, roles: ['administrador'] },
  { name: 'Mantenimientos Próximos', href: '/mantenimientos-programados/proximos', icon: Calendar, roles: ['administrador', 'tecnico'] },
  { name: 'Inventario Físico', href: '/inventario-fisico', icon: Package, roles: ['administrador'] },
  { name: 'Solicitudes', href: '/solicitudes', icon: FileText, roles: ['administrador', 'tecnico'] },
  { name: 'Reportes', href: '/reportes', icon: LayoutDashboard, roles: ['administrador'] },
  { name: 'Empleados', href: '/empleados', icon: Users, roles: ['administrador'] },
  { name: 'Usuarios', href: '/usuarios', icon: Users, roles: ['administrador'] },
  { name: 'Sedes', href: '/sedes', icon: Building2, roles: ['administrador'] },
  { name: 'Áreas', href: '/areas', icon: MapPin, roles: ['administrador'] },
  { name: 'Categorías', href: '/categorias', icon: Tag, roles: ['administrador'] },
  { name: 'Empresas', href: '/empresas', icon: Building2, roles: ['administrador_sistema'] },
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
  }, [router, pathname]);

  const handleLogout = () => {
    clearStoredUser();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  const userRole = typeof user?.role === 'string' 
    ? user.role 
    : user?.role?.nombre;

  // Filtrar navegación: solo mostrar items que corresponden al rol del usuario
  const filteredNavigation = allNavigation.filter(
    (item) => userRole && item.roles?.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar móvil */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col glass border-r border-neon-blue/20 shadow-2xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-neon-blue/20">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan rounded-full blur-lg opacity-40 animate-glow-pulse" />
                <Sparkles className="relative w-6 h-6 text-neon-cyan" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent">
                PrismaAsset360
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-600 hover:text-neon-cyan transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-white/60 backdrop-blur-md text-neon-cyan border border-neon-cyan/40 shadow-lg shadow-neon-cyan/20'
                      : 'text-gray-700 hover:text-neon-blue hover:bg-white/40 backdrop-blur-sm border border-transparent'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-neon-cyan' : 'text-gray-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-neon-blue/20">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-800">{user.nombreCompleto}</p>
              <p className="text-xs text-gray-600">{user.correo}</p>
              <p className="text-xs text-neon-cyan capitalize mt-1">
                {userRole}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/60 hover:text-red-700 rounded-lg border border-red-300/50 transition-all duration-300 hover:border-red-400 hover:shadow-lg hover:shadow-red-400/20 backdrop-blur-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow glass border-r border-neon-blue/20 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-neon-blue/20">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-neon-cyan rounded-full blur-lg opacity-40 animate-glow-pulse" />
                <Sparkles className="relative w-6 h-6 text-neon-cyan" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan bg-clip-text text-transparent animate-gradient bg-200%">
                PrismaAsset360
              </h1>
            </div>
            <Notificaciones />
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-white/60 backdrop-blur-md text-neon-cyan border border-neon-cyan/40 shadow-lg shadow-neon-cyan/20'
                      : 'text-gray-700 hover:text-neon-blue hover:bg-white/40 backdrop-blur-sm border border-transparent hover:border-neon-blue/30'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-neon-cyan' : 'text-gray-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-neon-blue/20">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-800">{user.nombreCompleto}</p>
              <p className="text-xs text-gray-600">{user.correo}</p>
              <p className="text-xs text-neon-cyan capitalize mt-1">
                {userRole}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50/60 hover:text-red-700 rounded-lg border border-red-300/50 transition-all duration-300 hover:border-red-400 hover:shadow-lg hover:shadow-red-400/20 backdrop-blur-sm"
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
        <div className="sticky top-0 z-10 flex h-16 glass border-b border-neon-blue/20 lg:hidden backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-600 hover:text-neon-cyan transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-between px-4">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent">
              PrismaAsset360
            </h1>
            <Notificaciones />
          </div>
        </div>

        {/* Contenido */}
        <main className="py-4 sm:py-6 min-h-screen">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
