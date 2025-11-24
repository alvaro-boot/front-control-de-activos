'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo } from '@/types';
import { ArrowLeft, Edit, QrCode, Download } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

export default function ActivoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activo, setActivo] = useState<Activo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      loadActivo(Number(params.id));
    }
  }, [params.id]);

  const loadActivo = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getActivo(id);
      setActivo(data);
      
      // Generar URL del QR (apunta al frontend)
      const frontendUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001');
      setQrUrl(`${frontendUrl}/activos/qr/${id}`);
    } catch (error: any) {
      toast.error('Error al cargar activo');
      router.push('/activos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateQR = async () => {
    if (!activo) return;
    try {
      await api.regenerateQR(activo.id);
      toast.success('QR regenerado exitosamente');
      loadActivo(activo.id);
    } catch (error: any) {
      toast.error('Error al regenerar QR');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'retirado':
        return 'bg-gray-100 text-gray-800';
      case 'perdido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!activo) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/activos"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {activo.nombre}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Código: {activo.codigo}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                href={`/activos/${activo.id}/editar`}
                className="btn btn-primary flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Información General
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Código
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{activo.codigo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Estado
                    </label>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                          activo.estado
                        )}`}
                      >
                        {activo.estado}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Categoría
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {activo.categoria?.nombre || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Sede
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {activo.sede?.nombre || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Área
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {activo.area?.nombre || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Responsable
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {activo.responsable?.nombreCompleto || 'N/A'}
                    </p>
                  </div>
                  {activo.descripcion && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        Descripción
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {activo.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Información Financiera
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Fecha de Compra
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {activo.fechaCompra
                        ? format(new Date(activo.fechaCompra), 'dd/MM/yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Valor de Compra
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatCurrency(activo.valorCompra)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Valor Actual
                        </label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatCurrency(activo.valorActual)}
                        </p>
                      </div>
                      {activo.valorCompra && activo.valorActual && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Depreciación
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatCurrency(activo.valorCompra - activo.valorActual)}
                          </p>
                        </div>
                      )}
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Código QR
              </h2>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <QRCodeSVG
                    value={qrUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Escanea el código para ver la información del activo
                  </p>
                  <a
                    href={qrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    Ver página pública
                  </a>
                </div>
                <button
                  onClick={handleRegenerateQR}
                  className="btn btn-secondary w-full flex items-center justify-center"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Regenerar QR
                </button>
              </div>
            </div>
          </div>

          {/* Historial y Mantenimientos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Asignaciones
                </h2>
                <Link
                  href={`/activos/${activo.id}/historial`}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Ver historial completo
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                Ver el historial completo de asignaciones de este activo
              </p>
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Mantenimientos
                </h2>
                <Link
                  href={`/activos/${activo.id}/mantenimientos`}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Ver historial completo
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                Ver el historial completo de mantenimientos de este activo
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

