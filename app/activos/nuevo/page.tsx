'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Categoria, Sede, Area, User } from '@/types';
import toast from 'react-hot-toast';

interface ActivoForm {
  empresaId: number;
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

export default function NuevoActivoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ActivoForm>();

  const sedeId = watch('sedeId');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (sedeId) {
      loadAreas(Number(sedeId));
    }
  }, [sedeId]);

  const loadData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const empresaId = user?.empresaId || 1;

      const [cats, seds, usrs] = await Promise.all([
        api.getCategorias(empresaId),
        api.getSedes(empresaId),
        api.getUsuarios(),
      ]);

      setCategorias(Array.isArray(cats) ? cats : []);
      setSedes(Array.isArray(seds) ? seds : []);
      setUsuarios(Array.isArray(usrs) ? usrs : []);

      // Cargar áreas de la primera sede si existe
      if (seds.length > 0) {
        loadAreas(seds[0].id);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
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
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      await api.createActivo({
        ...data,
        empresaId: user?.empresaId || 1,
        estado: data.estado || 'activo',
      });

      toast.success('Activo creado exitosamente');
      router.push('/activos');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear activo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Activo</h1>
            <p className="mt-2 text-sm text-gray-600">
              Registra un nuevo activo en el sistema
            </p>
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
                  placeholder="ACT-001"
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
                  {usuarios.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nombreCompleto}
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
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

