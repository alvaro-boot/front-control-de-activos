'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo, Categoria, Sede, Area, Empleado } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';

interface ActivoForm {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaId?: number;
  sedeId?: number;
  areaId?: number;
  responsableId?: number;
  fechaCompra?: string;
  valorCompra?: number;
  valorActual?: number;
  estado?: 'activo' | 'mantenimiento' | 'retirado' | 'perdido';
}

export default function EditarActivoPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activo, setActivo] = useState<Activo | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ActivoForm>();

  const sedeId = watch('sedeId');

  useEffect(() => {
    if (params.id) {
      loadData(Number(params.id));
    }
  }, [params.id]);

  useEffect(() => {
    if (sedeId) {
      loadAreas(Number(sedeId));
    }
  }, [sedeId]);

  const loadData = async (id: number) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const empresaId = user?.empresaId || 1;

      const [activoData, cats, seds, emps] = await Promise.all([
        api.getActivo(id),
        api.getCategorias(empresaId),
        api.getSedes(empresaId),
        api.getEmpleados(empresaId),
      ]);

      setActivo(activoData);
      setCategorias(Array.isArray(cats) ? cats : []);
      setSedes(Array.isArray(seds) ? seds : []);
      setEmpleados(Array.isArray(emps) ? emps : []);

      // Cargar áreas de la sede del activo
      if (activoData.sedeId) {
        loadAreas(activoData.sedeId);
      }

      // Setear valores del formulario
      setValue('codigo', activoData.codigo);
      setValue('nombre', activoData.nombre);
      setValue('descripcion', activoData.descripcion || '');
      setValue('categoriaId', activoData.categoriaId || undefined);
      setValue('sedeId', activoData.sedeId || undefined);
      setValue('areaId', activoData.areaId || undefined);
      setValue('responsableId', activoData.responsableId || undefined);
      setValue(
        'fechaCompra',
        activoData.fechaCompra
          ? new Date(activoData.fechaCompra).toISOString().split('T')[0]
          : undefined
      );
      setValue('valorCompra', activoData.valorCompra || undefined);
      setValue('valorActual', activoData.valorActual || undefined);
      setValue('estado', activoData.estado);
    } catch (error: any) {
      toast.error('Error al cargar datos');
      router.push('/activos');
    }
  };

  const loadAreas = async (sedeId: number) => {
    try {
      const areasData = await api.getAreas(sedeId);
      setAreas(Array.isArray(areasData) ? areasData : []);
    } catch (error) {
      setAreas([]);
    }
  };

  const onSubmit = async (data: ActivoForm) => {
    if (!activo) return;

    setIsLoading(true);
    try {
      await api.updateActivo(activo.id, data);
      toast.success('Activo actualizado exitosamente');
      router.push(`/activos/${activo.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar activo');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activo) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href={`/activos/${activo.id}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editar Activo
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                {activo.codigo} - {activo.nombre}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código *
                </label>
                <input
                  {...register('codigo', { required: 'El código es requerido' })}
                  type="text"
                  className="input"
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.codigo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  type="text"
                  className="input"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  {...register('descripcion')}
                  rows={3}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select {...register('categoriaId', { valueAsNumber: true })} className="input">
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sede
                </label>
                <select
                  {...register('sedeId', { valueAsNumber: true })}
                  className="input"
                >
                  <option value="">Seleccionar sede</option>
                  {sedes.map((sede) => (
                    <option key={sede.id} value={sede.id}>
                      {sede.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área
                </label>
                <select {...register('areaId', { valueAsNumber: true })} className="input">
                  <option value="">Seleccionar área</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable
                </label>
                <select
                  {...register('responsableId', { valueAsNumber: true })}
                  className="input"
                >
                  <option value="">Seleccionar responsable</option>
                  {empleados.map((empleado) => (
                    <option key={empleado.id} value={empleado.id}>
                      {empleado.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Compra
                </label>
                <input
                  {...register('fechaCompra')}
                  type="date"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor de Compra
                </label>
                <input
                  {...register('valorCompra', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Actual
                </label>
                <input
                  {...register('valorActual', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select {...register('estado')} className="input">
                  <option value="activo">Activo</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="retirado">Retirado</option>
                  <option value="perdido">Perdido</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" disabled={isLoading} className="btn btn-primary">
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

