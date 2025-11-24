'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/lib/api';
import { Activo, User, Sede, Categoria, Empresa } from '@/types';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/lib/notifications';
import { getStoredUser, isSystemAdmin } from '@/lib/auth';

interface MantenimientoProgramadoForm {
  modo: 'individual' | 'masivo';
  activoId?: number;
  empresaId?: number;
  sedeId?: number;
  categoriaId?: number;
  tecnicoId?: number;
  fechaProgramada: string;
  tipo?: string;
  descripcion?: string;
  tareas?: string[];
}

export default function NuevoMantenimientoProgramadoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activos, setActivos] = useState<Activo[]>([]);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tecnicos, setTecnicos] = useState<User[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [activosCount, setActivosCount] = useState(0);
  const [tareas, setTareas] = useState<string[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const user = getStoredUser();
  const isAdmin = isSystemAdmin();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MantenimientoProgramadoForm>({
    defaultValues: {
      modo: 'individual',
    },
  });

  const modo = watch('modo');
  const empresaId = watch('empresaId');
  const sedeId = watch('sedeId');
  const categoriaId = watch('categoriaId');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (empresaId) {
      loadSedes(Number(empresaId));
      loadCategorias(Number(empresaId));
    }
  }, [empresaId]);

  useEffect(() => {
    if (modo === 'masivo' && (empresaId || sedeId || categoriaId)) {
      countActivos();
    }
  }, [modo, empresaId, sedeId, categoriaId]);

  const loadData = async () => {
    try {
      const empresaIdUser = user?.empresaId || 1;

      // Cargar empresas solo si es admin del sistema
      if (isAdmin) {
        const empresasData = await api.getEmpresas();
        setEmpresas(Array.isArray(empresasData) ? empresasData : []);
      }

      const [activosData, usuariosData, sedesData, categoriasData] = await Promise.all([
        api.getActivos(isAdmin ? undefined : empresaIdUser),
        api.getUsuarios(),
        api.getSedes(isAdmin ? undefined : empresaIdUser),
        api.getCategorias(isAdmin ? undefined : empresaIdUser),
      ]);

      setActivos(Array.isArray(activosData) ? activosData : []);
      setSedes(Array.isArray(sedesData) ? sedesData : []);
      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);

      // Filtrar técnicos - verificar tanto 'role' como 'rol' (singular)
      const tecnicosData = (Array.isArray(usuariosData) ? usuariosData : []).filter(
        (u: User) => {
          const roleName = u.role?.nombre || u.rol?.nombre;
          return roleName === 'tecnico' || roleName === 'administrador' || roleName === 'administrador_sistema';
        }
      );
      setTecnicos(tecnicosData);

      // Setear empresaId por defecto solo si no es admin del sistema
      if (!isAdmin) {
        setValue('empresaId', empresaIdUser);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  const loadSedes = async (empresaId: number) => {
    try {
      const sedesData = await api.getSedes(empresaId);
      setSedes(Array.isArray(sedesData) ? sedesData : []);
    } catch (error) {
      setSedes([]);
    }
  };

  const loadCategorias = async (empresaId: number) => {
    try {
      const categoriasData = await api.getCategorias(empresaId);
      setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
    } catch (error) {
      setCategorias([]);
    }
  };

  const countActivos = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const empresaIdUser = empresaId || user?.empresaId || 1;

      // Cargar activos con los filtros aplicados
      const activosFiltrados = await api.getActivos(empresaIdUser);
      let activosArray = Array.isArray(activosFiltrados) ? activosFiltrados : [];

      // Aplicar filtros adicionales
      if (sedeId) {
        activosArray = activosArray.filter((a: Activo) => a.sedeId === Number(sedeId));
      }

      if (categoriaId) {
        activosArray = activosArray.filter(
          (a: Activo) => a.categoriaId === Number(categoriaId)
        );
      }

      setActivosCount(activosArray.length);
    } catch (error) {
      setActivosCount(0);
    }
  };

  const agregarTarea = () => {
    if (nuevaTarea.trim()) {
      setTareas([...tareas, nuevaTarea.trim()]);
      setNuevaTarea('');
    }
  };

  const eliminarTarea = (index: number) => {
    setTareas(tareas.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: MantenimientoProgramadoForm) => {
    setIsLoading(true);
    try {
      if (data.modo === 'masivo') {
        const result = await api.createMantenimientoMasivo({
          empresaId: data.empresaId,
          sedeId: data.sedeId,
          categoriaId: data.categoriaId,
          tecnicoId: data.tecnicoId,
          fechaProgramada: data.fechaProgramada,
          descripcion: data.descripcion,
          tareas: tareas.length > 0 ? tareas : undefined,
        });
        toast.success(
          `Se programaron ${result.creados} mantenimientos exitosamente`
        );
      } else {
        await api.createMantenimientoProgramado({
          activoId: data.activoId,
          tecnicoId: data.tecnicoId,
          fechaProgramada: data.fechaProgramada,
          descripcion: data.descripcion,
          tareas: tareas.length > 0 ? tareas : undefined,
        });
        toast.success('Mantenimiento programado exitosamente');
      }
      router.push('/mantenimientos-programados');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al programar mantenimiento'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/mantenimientos-programados"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Programar Mantenimiento
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Programar un mantenimiento futuro
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
            {/* Selector de modo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de Programación
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    {...register('modo')}
                    type="radio"
                    value="individual"
                    className="mr-2"
                  />
                  <span>Individual (un activo)</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('modo')}
                    type="radio"
                    value="masivo"
                    className="mr-2"
                  />
                  <span>Masivo (múltiples activos)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modo === 'individual' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activo *
                    </label>
                    <select
                      {...register('activoId', {
                        required: modo === 'individual' ? 'El activo es requerido' : false,
                        valueAsNumber: true,
                      })}
                      className="input"
                    >
                      <option value="">Seleccionar activo</option>
                      {activos.map((activo) => (
                        <option key={activo.id} value={activo.id}>
                          {activo.codigo} - {activo.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.activoId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.activoId.message}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <select
                        {...register('empresaId', { valueAsNumber: true })}
                        className="input"
                      >
                        <option value="">Todas las empresas</option>
                        {empresas.map((empresa) => (
                          <option key={empresa.id} value={empresa.id}>
                            {empresa.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sede
                    </label>
                    <select
                      {...register('sedeId', { valueAsNumber: true })}
                      className="input"
                    >
                      <option value="">Todas las sedes</option>
                      {sedes.map((sede) => (
                        <option key={sede.id} value={sede.id}>
                          {sede.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      {...register('categoriaId', { valueAsNumber: true })}
                      className="input"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activosCount > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Activos que se programarán
                      </label>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-semibold">
                          {activosCount} activo(s) serán programados
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Técnico (opcional)
                </label>
                <select
                  {...register('tecnicoId', { valueAsNumber: true })}
                  className="input"
                >
                  <option value="">Sin asignar</option>
                  {tecnicos.map((tecnico) => (
                    <option key={tecnico.id} value={tecnico.id}>
                      {tecnico.nombreCompleto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Programada *
                </label>
                <input
                  {...register('fechaProgramada', {
                    required: 'La fecha es requerida',
                  })}
                  type="date"
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.fechaProgramada && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fechaProgramada.message}
                  </p>
                )}
              </div>

              {modo === 'individual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select {...register('tipo')} className="input">
                    <option value="preventivo">Preventivo</option>
                    <option value="correctivo">Correctivo</option>
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  {...register('descripcion')}
                  rows={4}
                  className="input"
                  placeholder="Descripción del mantenimiento a realizar..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tareas del Mantenimiento
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={nuevaTarea}
                      onChange={(e) => setNuevaTarea(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          agregarTarea();
                        }
                      }}
                      className="input flex-1"
                      placeholder="Ej: Revisar sistema eléctrico, Limpiar filtros..."
                    />
                    <button
                      type="button"
                      onClick={agregarTarea}
                      className="btn btn-secondary flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </button>
                  </div>
                  
                  {tareas.length > 0 && (
                    <div className="space-y-2">
                      {tareas.map((tarea, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 flex-1">
                            {index + 1}. {tarea}
                          </span>
                          <button
                            type="button"
                            onClick={() => eliminarTarea(index)}
                            className="text-red-600 hover:text-red-800 ml-2"
                            title="Eliminar tarea"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {tareas.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No hay tareas agregadas. Agrega tareas específicas a realizar durante el mantenimiento.
                    </p>
                  )}
                </div>
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
                {isLoading
                  ? 'Guardando...'
                  : modo === 'masivo'
                  ? `Programar ${activosCount > 0 ? activosCount : ''} Mantenimiento(s)`
                  : 'Programar Mantenimiento'}
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
