'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo } from '@/types';
import { ArrowLeft, Edit, Wrench, CheckCircle, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { format } from 'date-fns';
import { getStoredUser } from '@/lib/auth';
import { formatCurrency } from '@/lib/currency';

export default function ActivoQRPage() {
  const params = useParams();
  const router = useRouter();
  const [activo, setActivo] = useState<Activo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mantenimientosPendientes, setMantenimientosPendientes] = useState<any[]>([]);
  const [showMantenimientoForm, setShowMantenimientoForm] = useState(false);
  const [showCompletarMantenimientoForm, setShowCompletarMantenimientoForm] = useState(false);
  const [mantenimientoProgramadoSeleccionado, setMantenimientoProgramadoSeleccionado] = useState<any>(null);
  const [mantenimientoForm, setMantenimientoForm] = useState({
    tipo: 'correctivo' as 'preventivo' | 'correctivo',
    notas: '',
    repuestosUtilizados: '',
    tiempoIntervencion: '',
  });
  const [completarMantenimientoForm, setCompletarMantenimientoForm] = useState({
    notas: '',
    repuestosUtilizados: '',
    tiempoIntervencion: '',
    informeTecnico: '',
  });
  const [isSavingMantenimiento, setIsSavingMantenimiento] = useState(false);
  const [isCompletandoMantenimiento, setIsCompletandoMantenimiento] = useState(false);
  const user = getStoredUser();
  const userRole = typeof user?.role === 'string' 
    ? user.role 
    : (user?.role?.nombre || user?.rol?.nombre);
  const isTecnico = userRole === 'tecnico';

  useEffect(() => {
    if (params.id) {
      loadActivo(Number(params.id));
    }
  }, [params.id]);

  const loadActivo = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await api.getActivo(id);
      // Cargar mantenimientos del activo
      try {
        const mantenimientos = await api.getHistorialMantenimientosActivo(id);
        setActivo({ ...data, mantenimientos });
      } catch {
        setActivo(data);
      }
      
      // Cargar mantenimientos programados pendientes
      try {
        const mantenimientosProgramados = await api.getMantenimientosProgramados(id);
        const pendientes = mantenimientosProgramados.filter(
          (mp: any) => mp.estado === 'pendiente'
        );
        setMantenimientosPendientes(pendientes);
      } catch (error) {
        console.error('Error al cargar mantenimientos programados:', error);
        setMantenimientosPendientes([]);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // No autenticado o sin permisos - ProtectedRoute ya maneja esto
        return;
      }
      toast.error('Error al cargar activo');
      if (error.response?.status === 404) {
        router.push('/activos');
      }
    } finally {
      setIsLoading(false);
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

  const handleRegistrarMantenimiento = async () => {
    if (!activo || !mantenimientoForm.notas.trim()) {
      toast.error('Debes ingresar las observaciones del mantenimiento');
      return;
    }

    try {
      setIsSavingMantenimiento(true);
      await api.createMantenimiento({
        activoId: activo.id,
        tipo: mantenimientoForm.tipo,
        notas: mantenimientoForm.notas,
        fechaMantenimiento: new Date().toISOString().split('T')[0],
        repuestosUtilizados: mantenimientoForm.repuestosUtilizados.trim() || undefined,
        tiempoIntervencion: mantenimientoForm.tiempoIntervencion ? parseInt(mantenimientoForm.tiempoIntervencion) : undefined,
      });
      toast.success('Mantenimiento registrado exitosamente');
      setShowMantenimientoForm(false);
      setMantenimientoForm({
        tipo: 'correctivo',
        notas: '',
        repuestosUtilizados: '',
        tiempoIntervencion: '',
      });
      // Recargar activo para ver actualizaciones
      await loadActivo(activo.id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar mantenimiento');
    } finally {
      setIsSavingMantenimiento(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!activo) return;

    try {
      await api.updateActivo(activo.id, { estado: nuevoEstado });
      toast.success('Estado del activo actualizado');
      loadActivo(activo.id);
    } catch (error: any) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleCompletarMantenimientoProgramado = async () => {
    if (!mantenimientoProgramadoSeleccionado) return;

    try {
      setIsCompletandoMantenimiento(true);
      await api.completarMantenimientoProgramado(mantenimientoProgramadoSeleccionado.id, {
        notas: completarMantenimientoForm.notas,
        repuestosUtilizados: completarMantenimientoForm.repuestosUtilizados || undefined,
        tiempoIntervencion: completarMantenimientoForm.tiempoIntervencion ? parseInt(completarMantenimientoForm.tiempoIntervencion) : undefined,
        informeTecnico: completarMantenimientoForm.informeTecnico || undefined,
      });
      toast.success('Mantenimiento programado completado exitosamente');
      setShowCompletarMantenimientoForm(false);
      setMantenimientoProgramadoSeleccionado(null);
      setCompletarMantenimientoForm({
        notas: '',
        repuestosUtilizados: '',
        tiempoIntervencion: '',
        informeTecnico: '',
      });
      // Recargar activo para actualizar la lista
      await loadActivo(activo!.id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al completar mantenimiento');
    } finally {
      setIsCompletandoMantenimiento(false);
    }
  };

  const abrirFormularioCompletar = (mantenimientoProgramado: any) => {
    setMantenimientoProgramadoSeleccionado(mantenimientoProgramado);
    setCompletarMantenimientoForm({
      notas: mantenimientoProgramado.descripcion || '',
      repuestosUtilizados: '',
      tiempoIntervencion: '',
      informeTecnico: '',
    });
    setShowCompletarMantenimientoForm(true);
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
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-12">
            <p className="text-gray-600">Activo no encontrado</p>
            <Link href="/activos" className="text-primary-600 hover:text-primary-800 mt-4 inline-block">
              Volver a activos
            </Link>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Banner informativo para técnicos */}
          {isTecnico && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="flex items-center">
                <Wrench className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Modo Técnico - Puedes registrar mantenimientos y cambiar el estado del activo
                  </p>
                </div>
              </div>
            </div>
          )}

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
              {isTecnico && (
                <button
                  onClick={() => setShowMantenimientoForm(!showMantenimientoForm)}
                  className="btn btn-primary flex items-center"
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  {showMantenimientoForm ? 'Cancelar' : 'Registrar Mantenimiento'}
                </button>
              )}
              <Link
                href={`/activos/${activo.id}`}
                className="btn btn-secondary flex items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Ver detalles completos
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Principal */}
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
                    {activo.responsable?.nombre || 'N/A'}
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

            {/* Información Financiera - Solo para admin */}
            {userRole === 'administrador' && (
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
                  {activo.empresa && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Empresa
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {activo.empresa.nombre}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acciones Rápidas para Técnicos */}
            {isTecnico && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Acciones Rápidas
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleCambiarEstado('activo')}
                    className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 border-2 border-green-200"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Marcar como Activo</span>
                  </button>
                  <button
                    onClick={() => handleCambiarEstado('mantenimiento')}
                    className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 border-2 border-yellow-200"
                  >
                    <Wrench className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-800">En Mantenimiento</span>
                  </button>
                  <button
                    onClick={() => handleCambiarEstado('retirado')}
                    className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 border-2 border-gray-200"
                  >
                    <X className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-800">Retirado</span>
                  </button>
                  <button
                    onClick={() => setShowMantenimientoForm(true)}
                    className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 border-2 border-blue-200"
                  >
                    <Wrench className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Registrar Revisión</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Formulario de Mantenimiento para Técnicos */}
          {isTecnico && showMantenimientoForm && (
            <div className="card border-2 border-primary-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Registrar Mantenimiento / Revisión
                </h2>
                <button
                  onClick={() => setShowMantenimientoForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Mantenimiento *
                  </label>
                  <select
                    value={mantenimientoForm.tipo}
                    onChange={(e) => setMantenimientoForm({ ...mantenimientoForm, tipo: e.target.value as 'preventivo' | 'correctivo' })}
                    className="input"
                  >
                    <option value="correctivo">Correctivo</option>
                    <option value="preventivo">Preventivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones / Trabajo Realizado *
                  </label>
                  <textarea
                    value={mantenimientoForm.notas}
                    onChange={(e) => setMantenimientoForm({ ...mantenimientoForm, notas: e.target.value })}
                    className="input"
                    rows={4}
                    placeholder="Describe el trabajo realizado, problemas encontrados, soluciones aplicadas..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repuestos Utilizados (opcional)
                    </label>
                    <input
                      type="text"
                      value={mantenimientoForm.repuestosUtilizados}
                      onChange={(e) => setMantenimientoForm({ ...mantenimientoForm, repuestosUtilizados: e.target.value })}
                      className="input"
                      placeholder="Ej: Disco duro 500GB, Memoria RAM 8GB"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo de Intervención (minutos)
                    </label>
                    <input
                      type="number"
                      value={mantenimientoForm.tiempoIntervencion}
                      onChange={(e) => setMantenimientoForm({ ...mantenimientoForm, tiempoIntervencion: e.target.value })}
                      className="input"
                      placeholder="Ej: 30"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowMantenimientoForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRegistrarMantenimiento}
                    disabled={isSavingMantenimiento || !mantenimientoForm.notas}
                    className="btn btn-primary"
                  >
                    {isSavingMantenimiento ? 'Guardando...' : 'Registrar Mantenimiento'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mantenimientos Programados Pendientes */}
          {mantenimientosPendientes.length > 0 && (
            <div className="card border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mantenimientos Programados Pendientes
                  </h2>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                  {mantenimientosPendientes.length}
                </span>
              </div>
              <div className="space-y-3">
                {mantenimientosPendientes.map((mantenimientoProgramado: any) => (
                  <div
                    key={mantenimientoProgramado.id}
                    className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Programado
                          </span>
                          <span className="text-sm text-gray-600">
                            {format(new Date(mantenimientoProgramado.fechaProgramada), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        {mantenimientoProgramado.descripcion && (
                          <p className="text-sm text-gray-900 font-medium mb-2">
                            {mantenimientoProgramado.descripcion}
                          </p>
                        )}
                        {mantenimientoProgramado.tareas && mantenimientoProgramado.tareas.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Tareas:</p>
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                              {mantenimientoProgramado.tareas.map((tarea: string, index: number) => (
                                <li key={index}>{tarea}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {mantenimientoProgramado.tecnico && (
                          <p className="text-xs text-gray-500 mt-2">
                            Asignado a: {mantenimientoProgramado.tecnico.nombreCompleto}
                          </p>
                        )}
                      </div>
                      {isTecnico && (
                        <button
                          onClick={() => abrirFormularioCompletar(mantenimientoProgramado)}
                          className="ml-4 btn btn-primary text-sm"
                        >
                          Completar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulario para Completar Mantenimiento Programado */}
          {isTecnico && showCompletarMantenimientoForm && mantenimientoProgramadoSeleccionado && (
            <div className="card border-2 border-primary-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Completar Mantenimiento Programado
                </h2>
                <button
                  onClick={() => {
                    setShowCompletarMantenimientoForm(false);
                    setMantenimientoProgramadoSeleccionado(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Fecha programada:</span>{' '}
                  {format(new Date(mantenimientoProgramadoSeleccionado.fechaProgramada), 'dd/MM/yyyy')}
                </p>
                {mantenimientoProgramadoSeleccionado.descripcion && (
                  <p className="text-sm text-blue-800 mt-1">
                    <span className="font-medium">Descripción:</span>{' '}
                    {mantenimientoProgramadoSeleccionado.descripcion}
                  </p>
                )}
                {mantenimientoProgramadoSeleccionado.tareas && mantenimientoProgramadoSeleccionado.tareas.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-blue-800 mb-1">Tareas a realizar:</p>
                    <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                      {mantenimientoProgramadoSeleccionado.tareas.map((tarea: string, index: number) => (
                        <li key={index}>{tarea}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones / Trabajo Realizado *
                  </label>
                  <textarea
                    value={completarMantenimientoForm.notas}
                    onChange={(e) => setCompletarMantenimientoForm({ ...completarMantenimientoForm, notas: e.target.value })}
                    className="input"
                    rows={4}
                    placeholder="Describe el trabajo realizado, problemas encontrados, soluciones aplicadas..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repuestos Utilizados (opcional)
                    </label>
                    <input
                      type="text"
                      value={completarMantenimientoForm.repuestosUtilizados}
                      onChange={(e) => setCompletarMantenimientoForm({ ...completarMantenimientoForm, repuestosUtilizados: e.target.value })}
                      className="input"
                      placeholder="Ej: Disco duro 500GB, Memoria RAM 8GB"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiempo de Intervención (minutos)
                    </label>
                    <input
                      type="number"
                      value={completarMantenimientoForm.tiempoIntervencion}
                      onChange={(e) => setCompletarMantenimientoForm({ ...completarMantenimientoForm, tiempoIntervencion: e.target.value })}
                      className="input"
                      placeholder="Ej: 30"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Informe Técnico (opcional)
                  </label>
                  <textarea
                    value={completarMantenimientoForm.informeTecnico}
                    onChange={(e) => setCompletarMantenimientoForm({ ...completarMantenimientoForm, informeTecnico: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Informe técnico detallado, recomendaciones, etc."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowCompletarMantenimientoForm(false);
                      setMantenimientoProgramadoSeleccionado(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCompletarMantenimientoProgramado}
                    disabled={isCompletandoMantenimiento || !completarMantenimientoForm.notas.trim()}
                    className="btn btn-primary"
                  >
                    {isCompletandoMantenimiento ? 'Completando...' : 'Completar Mantenimiento'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Historial de Mantenimientos Recientes */}
          {activo.mantenimientos && activo.mantenimientos.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Mantenimientos Recientes
              </h2>
              <div className="space-y-3">
                {activo.mantenimientos.slice(0, 5).map((mantenimiento: any) => (
                  <div
                    key={mantenimiento.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            mantenimiento.tipo === 'preventivo' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {mantenimiento.tipo === 'preventivo' ? 'Preventivo' : 'Correctivo'}
                          </span>
                          {mantenimiento.estado && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              mantenimiento.estado === 'finalizado'
                                ? 'bg-green-100 text-green-800'
                                : mantenimiento.estado === 'iniciado'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {mantenimiento.estado}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 font-medium mb-1">
                          {mantenimiento.notas || 'Sin observaciones'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                          <span>
                            {format(new Date(mantenimiento.fechaMantenimiento), 'dd/MM/yyyy')}
                          </span>
                          {mantenimiento.tecnico && (
                            <span>• {mantenimiento.tecnico.nombreCompleto}</span>
                          )}
                          {mantenimiento.tiempoIntervencion && (
                            <span>• {mantenimiento.tiempoIntervencion} min</span>
                          )}
                        </div>
                        {mantenimiento.repuestosUtilizados && (
                          <p className="text-xs text-gray-600 mt-2">
                            <span className="font-medium">Repuestos:</span> {mantenimiento.repuestosUtilizados}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

