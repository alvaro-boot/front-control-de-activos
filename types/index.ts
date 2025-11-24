// Tipos principales de la aplicación

export interface User {
  id: number;
  nombreCompleto: string;
  correo: string;
  telefono?: string;
  activo: number;
  empresaId: number;
  rolId: number;
  areaId?: number;
  role?: {
    id: number;
    nombre: string;
  };
  empresa?: Empresa;
  area?: Area;
}

export interface Empresa {
  id: number;
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  creadoEn: string;
}

export interface Sede {
  id: number;
  empresaId: number;
  nombre: string;
  direccion?: string;
  creadoEn: string;
  empresa?: Empresa;
  areas?: Area[];
}

export interface Area {
  id: number;
  sedeId: number;
  nombre: string;
  creadoEn: string;
  sede?: Sede;
}

export interface Categoria {
  id: number;
  empresaId: number;
  nombre: string;
  descripcion?: string;
  empresa?: Empresa;
  activos?: Activo[];
}

export interface Empleado {
  id: number;
  empresaId: number;
  areaId: number;
  nombre: string;
  cargo?: string;
  correo?: string;
  telefono?: string;
  empresa?: Empresa;
  area?: Area;
}

export interface Activo {
  id: number;
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
  estado: 'activo' | 'mantenimiento' | 'retirado' | 'perdido';
  creadoEn: string;
  empresa?: Empresa;
  categoria?: Categoria;
  sede?: Sede;
  area?: Area;
  responsable?: Empleado;
  qr?: {
    id: number;
    contenidoQr: string;
    urlImagenQr?: string;
  };
  mantenimientos?: Mantenimiento[];
}

export interface Asignacion {
  id: number;
  activoId: number;
  empleadoId: number;
  entregadoPorId: number;
  recibidoPorId?: number;
  fechaAsignacion: string;
  fechaDevolucion?: string;
  activo?: Activo;
  empleado?: Empleado;
  entregadoPor?: User;
  recibidoPor?: User;
}

export interface Mantenimiento {
  id: number;
  activoId: number;
  tecnicoId: number;
  tipo: 'preventivo' | 'correctivo';
  notas?: string;
  fechaMantenimiento: string;
  costo?: number;
  creadoEn: string;
  activo?: Activo;
  tecnico?: User;
}

export interface MantenimientoProgramado {
  id: number;
  activoId: number;
  tecnicoId?: number;
  fechaProgramada: string;
  estado: 'pendiente' | 'realizado' | 'cancelado';
  descripcion?: string;
  tareas?: string[];
  creadoEn: string;
  activo?: Activo;
  tecnico?: User;
}

export interface Proveedor {
  id: number;
  empresaId: number;
  nombre: string;
  correo?: string;
  telefono?: string;
  direccion?: string;
}

export interface Garantia {
  id: number;
  activoId: number;
  proveedor?: string;
  fechaInicio?: string;
  fechaFin?: string;
  numeroContrato?: string;
  correoContacto?: string;
  telefonoContacto?: string;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  empresaId: number;
  rolId: number;
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  telefono?: string;
  areaId?: number;
}

