'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { QrCode, CheckCircle, Package, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/notifications';

export default function InventarioFisicoPage() {
  const router = useRouter();
  const [activoId, setActivoId] = useState('');
  const [activo, setActivo] = useState<any>(null);
  const [observaciones, setObservaciones] = useState('');
  const [ubicacionVerificada, setUbicacionVerificada] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [historial, setHistorial] = useState<any[]>([]);

  useEffect(() => {
    loadHistorial();
  }, []);

  const loadHistorial = async () => {
    try {
      const data = await api.getInventarioFisico();
      setHistorial(data.slice(0, 10));
    } catch (error) {
      console.error('Error loading historial:', error);
    }
  };

  const buscarActivo = async () => {
    if (!activoId) {
      toast.error('Ingresa un ID de activo');
      return;
    }

    try {
      setIsLoading(true);
      const data = await api.getActivo(Number(activoId));
      setActivo(data);
    } catch (error: any) {
      toast.error('Activo no encontrado');
      setActivo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarActivo = async () => {
    if (!activo) {
      toast.error('Primero busca un activo');
      return;
    }

    try {
      setIsConfirming(true);
      await api.confirmarActivoInventario({
        activoId: activo.id,
        observaciones: observaciones || undefined,
        ubicacionVerificada: ubicacionVerificada || undefined,
      });
      toast.success('Activo confirmado en inventario físico');
      setActivo(null);
      setActivoId('');
      setObservaciones('');
      setUbicacionVerificada('');
      loadHistorial();
    } catch (error: any) {
      toast.error('Error al confirmar activo');
    } finally {
      setIsConfirming(false);
    }
  };

  const escanearQR = () => {
    // Redirigir a la página de QR que ya existe
    if (activoId) {
      router.push(`/activos/qr/${activoId}`);
    } else {
      toast.error('Primero ingresa o escanea el ID del activo');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['administrador', 'empleado']}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventario Físico</h1>
            <p className="mt-2 text-sm text-gray-600">
              Confirma la existencia de activos escaneando su código QR
            </p>
          </div>

          {/* Búsqueda y Confirmación */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Confirmar Activo
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Activo o Código
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={activoId}
                      onChange={(e) => setActivoId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && buscarActivo()}
                      className="input flex-1"
                      placeholder="Ingresa el ID o escanea el QR"
                    />
                    <button
                      onClick={buscarActivo}
                      disabled={isLoading}
                      className="btn btn-primary"
                    >
                      {isLoading ? 'Buscando...' : 'Buscar'}
                    </button>
                    <button
                      onClick={escanearQR}
                      className="btn btn-secondary flex items-center"
                      title="Escanear QR"
                    >
                      <QrCode className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {activo && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{activo.nombre}</h3>
                      <p className="text-sm text-gray-500">Código: {activo.codigo}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        activo.estado === 'activo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {activo.estado}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación Verificada
                    </label>
                    <input
                      type="text"
                      value={ubicacionVerificada}
                      onChange={(e) => setUbicacionVerificada(e.target.value)}
                      className="input"
                      placeholder="Ej: Sede Principal, Área IT, Piso 2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones (opcional)
                    </label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="input"
                      rows={3}
                      placeholder="Observaciones sobre el estado del activo"
                    />
                  </div>

                  <button
                    onClick={confirmarActivo}
                    disabled={isConfirming}
                    className="btn btn-primary w-full flex items-center justify-center"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    {isConfirming ? 'Confirmando...' : 'Confirmar en Inventario'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Historial Reciente */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Historial Reciente
            </h2>
            {historial.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay registros de inventario físico
              </p>
            ) : (
              <div className="space-y-3">
                {historial.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Package className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.activo?.nombre || 'Activo'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.activo?.codigo} • {item.ubicacionVerificada || 'Sin ubicación'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(item.fechaInventario).toLocaleDateString()}
                      </p>
                      {item.confirmado && (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

