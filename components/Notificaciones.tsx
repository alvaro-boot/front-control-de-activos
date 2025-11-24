'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { format } from 'date-fns';

interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  estado: 'no_leida' | 'leida';
  url?: string;
  creadoEn: string;
}

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadNotificaciones();
    loadContador();
    const interval = setInterval(() => {
      loadContador();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotificaciones = async () => {
    try {
      setIsLoading(true);
      const data = await api.getNotificaciones();
      setNotificaciones(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContador = async () => {
    try {
      const count = await api.contarNotificacionesNoLeidas();
      setNoLeidas(count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const handleMarcarLeida = async (id: number) => {
    try {
      await api.marcarNotificacionLeida(id);
      setNotificaciones(prev =>
        prev.map(n => n.id === id ? { ...n, estado: 'leida' as const } : n)
      );
      setNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Error al marcar notificación');
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await api.marcarTodasNotificacionesLeidas();
      setNotificaciones(prev =>
        prev.map(n => ({ ...n, estado: 'leida' as const }))
      );
      setNoLeidas(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar notificaciones');
    }
  };

  const handleEliminar = async (id: number) => {
    try {
      await api.eliminarNotificacion(id);
      setNotificaciones(prev => prev.filter(n => n.id !== id));
      toast.success('Notificación eliminada');
    } catch (error) {
      toast.error('Error al eliminar notificación');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            loadNotificaciones();
          }
        }}
        className="relative p-2 text-gray-600 hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/40 backdrop-blur-sm"
      >
        <Bell className="h-6 w-6" />
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border-2 border-white shadow-lg shadow-red-500/50">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 rounded-xl glass-light shadow-2xl z-50 border border-neon-blue/30">
            <div className="flex items-center justify-between p-4 border-b border-neon-blue/20">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Bell className="mr-2 h-5 w-5 text-neon-cyan" />
                Notificaciones
                {noLeidas > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({noLeidas} nuevas)
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {noLeidas > 0 && (
                  <button
                    onClick={handleMarcarTodasLeidas}
                    className="text-sm text-neon-cyan hover:text-neon-blue transition-colors"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-30 animate-glow-pulse" />
                    <div className="relative animate-spin rounded-full h-8 w-8 border-2 border-neon-cyan border-t-transparent"></div>
                  </div>
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No hay notificaciones
                </div>
              ) : (
                <div className="divide-y divide-neon-blue/10">
                  {notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.id}
                      className={`p-4 hover:bg-white/40 transition-colors backdrop-blur-sm ${
                        notificacion.estado === 'no_leida' ? 'bg-blue-50/60 border-l-2 border-neon-cyan' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-800">
                              {notificacion.titulo}
                            </h4>
                            {notificacion.estado === 'no_leida' && (
                              <span className="h-2 w-2 rounded-full bg-neon-cyan animate-glow-pulse"></span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            {notificacion.mensaje}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {format(new Date(notificacion.creadoEn), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {notificacion.estado === 'no_leida' && (
                            <button
                              onClick={() => handleMarcarLeida(notificacion.id)}
                              className="p-1 text-gray-500 hover:text-neon-cyan transition-colors"
                              title="Marcar como leída"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEliminar(notificacion.id)}
                            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {notificacion.url && (
                        <Link
                          href={notificacion.url}
                          onClick={() => setIsOpen(false)}
                          className="mt-2 inline-block text-sm text-neon-cyan hover:text-neon-blue transition-colors"
                        >
                          Ver detalles →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
