'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { FileText, TrendingUp, DollarSign, Package, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/notifications';
import { formatCurrency, formatCurrencyNumber } from '@/lib/currency';

export default function ReportesPage() {
  const [reporteActivo, setReporteActivo] = useState<string | null>(null);
  const [datos, setDatos] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [anio, setAnio] = useState(new Date().getFullYear());

  const cargarReporte = async (tipo: string) => {
    try {
      setIsLoading(true);
      setReporteActivo(tipo);
      let data;

      switch (tipo) {
        case 'depreciacion-mensual':
          data = await api.getDepreciacionMensual(mes, anio);
          break;
        case 'comparativo':
          data = await api.getComparativoContableFiscal();
          break;
        case 'centro-costo':
          data = await api.getActivosPorCentroCosto();
          break;
        case 'responsable':
          data = await api.getActivosPorResponsable();
          break;
        case 'estado':
          data = await api.getActivosPorEstado();
          break;
        case 'inventario-vs-contable':
          data = await api.getInventarioFisicoVsContable();
          break;
        default:
          return;
      }

      setDatos(data);
    } catch (error: any) {
      toast.error('Error al cargar reporte');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const reportes = [
    {
      id: 'depreciacion-mensual',
      nombre: 'Depreciación Mensual',
      descripcion: 'Depreciación contable y fiscal del mes',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      id: 'comparativo',
      nombre: 'Comparativo Contable vs Fiscal',
      descripcion: 'Diferencias entre depreciación contable y fiscal',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      id: 'centro-costo',
      nombre: 'Activos por Centro de Costo',
      descripcion: 'Distribución de activos por área',
      icon: Package,
      color: 'bg-green-500',
    },
    {
      id: 'responsable',
      nombre: 'Activos por Responsable',
      descripcion: 'Activos asignados a cada responsable',
      icon: UserCheck,
      color: 'bg-yellow-500',
    },
    {
      id: 'estado',
      nombre: 'Activos por Estado',
      descripcion: 'Distribución de activos según su estado',
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      id: 'inventario-vs-contable',
      nombre: 'Inventario Físico vs Contable',
      descripcion: 'Conciliación entre inventario físico y contable',
      icon: FileText,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
            <p className="mt-2 text-sm text-gray-600">
              Reportes financieros y de gestión de activos
            </p>
          </div>

          {/* Selector de Reportes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportes.map((reporte) => {
              const Icon = reporte.icon;
              return (
                <button
                  key={reporte.id}
                  onClick={() => cargarReporte(reporte.id)}
                  className={`card text-left hover:shadow-lg transition-shadow ${
                    reporteActivo === reporte.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${reporte.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{reporte.nombre}</h3>
                      <p className="text-sm text-gray-500 mt-1">{reporte.descripcion}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filtros para Depreciación Mensual */}
          {reporteActivo === 'depreciacion-mensual' && (
            <div className="card">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Mes:</label>
                <select
                  value={mes}
                  onChange={(e) => {
                    setMes(Number(e.target.value));
                    cargarReporte('depreciacion-mensual');
                  }}
                  className="input"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('es', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <label className="text-sm font-medium text-gray-700">Año:</label>
                <select
                  value={anio}
                  onChange={(e) => {
                    setAnio(Number(e.target.value));
                    cargarReporte('depreciacion-mensual');
                  }}
                  className="input"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Resultados del Reporte */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          )}

          {!isLoading && datos && reporteActivo && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {reportes.find(r => r.id === reporteActivo)?.nombre}
              </h2>
              <div className="overflow-x-auto">
                {reporteActivo === 'depreciacion-mensual' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Depreciación Mensual</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(datos.totalDepreciacion || 0)}
                      </p>
                    </div>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Nombre</th>
                          <th>Valor Compra</th>
                          <th>Valor Actual</th>
                          <th>Depreciación Mensual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datos.activos?.map((activo: any) => (
                          <tr key={activo.id}>
                            <td>{activo.codigo}</td>
                            <td>{activo.nombre}</td>
                            <td>{formatCurrency(activo.valorCompra)}</td>
                            <td>{formatCurrency(activo.valorActual)}</td>
                            <td>{formatCurrency(activo.depreciacionMensual)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {reporteActivo === 'comparativo' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Depreciación Contable</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(datos.totalDepreciacionContable || 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Depreciación Fiscal</p>
                        <p className="text-xl font-bold text-purple-600">
                          {formatCurrency(datos.totalDepreciacionFiscal || 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Activos</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {datos.totalActivos || 0}
                        </p>
                      </div>
                    </div>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Nombre</th>
                          <th>Dep. Contable</th>
                          <th>Dep. Fiscal</th>
                          <th>Diferencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datos.activos?.map((activo: any) => (
                          <tr key={activo.id}>
                            <td>{activo.codigo}</td>
                            <td>{activo.nombre}</td>
                            <td>{formatCurrency(activo.depreciacionContable)}</td>
                            <td>{formatCurrency(activo.depreciacionFiscal)}</td>
                            <td>{formatCurrency(activo.diferencia)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {['centro-costo', 'responsable', 'estado'].includes(reporteActivo) && (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>{reporteActivo === 'centro-costo' ? 'Área' : reporteActivo === 'responsable' ? 'Responsable' : 'Estado'}</th>
                        <th>Total Activos</th>
                        <th>Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datos.map((item: any) => (
                        <tr key={item.areaId || item.responsableId || item.estado}>
                          <td>{item.areaNombre || item.responsableNombre || item.estado}</td>
                          <td>{item.totalActivos || item.total}</td>
                          <td>{formatCurrency(item.valorTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {reporteActivo === 'inventario-vs-contable' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Activos</p>
                        <p className="text-2xl font-bold text-blue-600">{datos.totalActivos || 0}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Asignados</p>
                        <p className="text-2xl font-bold text-green-600">{datos.activosAsignados || 0}</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-gray-600">Sin Asignar</p>
                        <p className="text-2xl font-bold text-yellow-600">{datos.activosSinAsignar || 0}</p>
                      </div>
                    </div>
                    {datos.activosSinAsignarLista && datos.activosSinAsignarLista.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Activos Sin Asignar</h3>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Código</th>
                              <th>Nombre</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {datos.activosSinAsignarLista.map((activo: any) => (
                              <tr key={activo.id}>
                                <td>{activo.codigo}</td>
                                <td>{activo.nombre}</td>
                                <td>{activo.estado}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

