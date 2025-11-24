import axios, { AxiosInstance, AxiosError } from 'axios';
import { LoginRequest, LoginResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://back-control-de-activos.onrender.com';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token a las peticiones
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para manejar errores y refrescar token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                refreshToken,
              });

              const { accessToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;

              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Si falla el refresh, redirigir al login
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  // Registro público deshabilitado - Los usuarios deben ser creados por administradores
  // async register(data: any): Promise<LoginResponse> {
  //   const response = await this.client.post<LoginResponse>('/auth/register', data);
  //   return response.data;
  // }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await this.client.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  }

  // Activos
  async getActivos(empresaId?: number) {
    const params = empresaId ? { empresaId } : {};
    const response = await this.client.get('/activos', { params });
    return response.data;
  }

  async getActivo(id: number) {
    const response = await this.client.get(`/activos/${id}`);
    return response.data;
  }

  async createActivo(data: any) {
    const response = await this.client.post('/activos', data);
    return response.data;
  }

  async updateActivo(id: number, data: any) {
    const response = await this.client.patch(`/activos/${id}`, data);
    return response.data;
  }

  async deleteActivo(id: number) {
    const response = await this.client.delete(`/activos/${id}`);
    return response.data;
  }

  async regenerateQR(id: number) {
    const response = await this.client.post(`/activos/${id}/regenerar-qr`);
    return response.data;
  }

  // Asignaciones
  async getAsignaciones(activoId?: number, empleadoId?: number) {
    const params: any = {};
    if (activoId) params.activoId = activoId;
    if (empleadoId) params.empleadoId = empleadoId;
    const response = await this.client.get('/asignaciones', { params });
    return response.data;
  }

  async getAsignacion(id: number) {
    const response = await this.client.get(`/asignaciones/${id}`);
    return response.data;
  }

  async createAsignacion(data: any) {
    const response = await this.client.post('/asignaciones', data);
    return response.data;
  }

  async devolverAsignacion(id: number, data: any) {
    const response = await this.client.patch(`/asignaciones/${id}/devolver`, data);
    return response.data;
  }

  async getHistorialAsignacionesActivo(activoId: number) {
    const response = await this.client.get(`/asignaciones/historial/activo/${activoId}`);
    return response.data;
  }

  async getHistorialAsignacionesEmpleado(empleadoId: number) {
    const response = await this.client.get(`/asignaciones/historial/empleado/${empleadoId}`);
    return response.data;
  }

  // Mantenimientos
  async getMantenimientos(activoId?: number, tecnicoId?: number) {
    const params: any = {};
    if (activoId) params.activoId = activoId;
    if (tecnicoId) params.tecnicoId = tecnicoId;
    const response = await this.client.get('/mantenimientos', { params });
    return response.data;
  }

  async getMantenimiento(id: number) {
    const response = await this.client.get(`/mantenimientos/${id}`);
    return response.data;
  }

  async createMantenimiento(data: any) {
    const response = await this.client.post('/mantenimientos', data);
    return response.data;
  }

  async updateMantenimiento(id: number, data: any) {
    const response = await this.client.patch(`/mantenimientos/${id}`, data);
    return response.data;
  }

  async getHistorialMantenimientosActivo(activoId: number) {
    const response = await this.client.get(`/mantenimientos/historial/activo/${activoId}`);
    return response.data;
  }

  // Mantenimientos Programados
  async getMantenimientosProgramados(activoId?: number, tecnicoId?: number) {
    const params: any = {};
    if (activoId) params.activoId = activoId;
    if (tecnicoId) params.tecnicoId = tecnicoId;
    const response = await this.client.get('/mantenimientos-programados', { params });
    return response.data;
  }

  async getMantenimientosProximos(dias: number = 7) {
    const response = await this.client.get('/mantenimientos-programados/proximos', {
      params: { dias },
    });
    return response.data;
  }

  async createMantenimientoProgramado(data: any) {
    const response = await this.client.post('/mantenimientos-programados', data);
    return response.data;
  }

  async createMantenimientoMasivo(data: any) {
    const response = await this.client.post('/mantenimientos-programados/masivo', data);
    return response.data;
  }

  async completarMantenimientoProgramado(id: number, data: any) {
    const response = await this.client.post(`/mantenimientos-programados/${id}/completar`, data);
    return response.data;
  }

  // Empleados
  async getEmpleados(empresaId?: number) {
    const params = empresaId ? { empresaId } : {};
    const response = await this.client.get('/empleados', { params });
    return response.data;
  }

  async getEmpleado(id: number) {
    const response = await this.client.get(`/empleados/${id}`);
    return response.data;
  }

  async createEmpleado(data: any) {
    const response = await this.client.post('/empleados', data);
    return response.data;
  }

  async updateEmpleado(id: number, data: any) {
    const response = await this.client.patch(`/empleados/${id}`, data);
    return response.data;
  }

  // Usuarios
  async getUsuarios() {
    const response = await this.client.get('/usuarios');
    return response.data;
  }

  async getUsuario(id: number) {
    const response = await this.client.get(`/usuarios/${id}`);
    return response.data;
  }

  async createUsuario(data: any) {
    const response = await this.client.post('/usuarios', data);
    return response.data;
  }

  async updateUsuario(id: number, data: any) {
    const response = await this.client.patch(`/usuarios/${id}`, data);
    return response.data;
  }

  async deleteUsuario(id: number) {
    const response = await this.client.delete(`/usuarios/${id}`);
    return response.data;
  }

  // Empresas
  async getEmpresas() {
    const response = await this.client.get('/empresas');
    return response.data;
  }

  async getEmpresa(id: number) {
    const response = await this.client.get(`/empresas/${id}`);
    return response.data;
  }

  async createEmpresa(data: any) {
    const response = await this.client.post('/empresas', data);
    return response.data;
  }

  async updateEmpresa(id: number, data: any) {
    const response = await this.client.patch(`/empresas/${id}`, data);
    return response.data;
  }

  async deleteEmpresa(id: number) {
    const response = await this.client.delete(`/empresas/${id}`);
    return response.data;
  }

  // Sedes
  async getSedes(empresaId?: number) {
    const params = empresaId ? { empresaId } : {};
    const response = await this.client.get('/sedes', { params });
    return response.data;
  }

  async getSede(id: number) {
    const response = await this.client.get(`/sedes/${id}`);
    return response.data;
  }

  async createSede(data: any) {
    const response = await this.client.post('/sedes', data);
    return response.data;
  }

  async updateSede(id: number, data: any) {
    const response = await this.client.patch(`/sedes/${id}`, data);
    return response.data;
  }

  async deleteSede(id: number) {
    const response = await this.client.delete(`/sedes/${id}`);
    return response.data;
  }

  // Áreas
  async getAreas(sedeId?: number, empresaId?: number) {
    const params: any = {};
    if (sedeId) params.sedeId = sedeId;
    if (empresaId) params.empresaId = empresaId;
    const response = await this.client.get('/areas', { params });
    return response.data;
  }

  async getArea(id: number) {
    const response = await this.client.get(`/areas/${id}`);
    return response.data;
  }

  async createArea(data: any) {
    const response = await this.client.post('/areas', data);
    return response.data;
  }

  async updateArea(id: number, data: any) {
    const response = await this.client.patch(`/areas/${id}`, data);
    return response.data;
  }

  async deleteArea(id: number) {
    const response = await this.client.delete(`/areas/${id}`);
    return response.data;
  }

  // Categorías
  async getCategorias(empresaId?: number) {
    const params = empresaId ? { empresaId } : {};
    const response = await this.client.get('/categorias', { params });
    return response.data;
  }

  async getCategoria(id: number) {
    const response = await this.client.get(`/categorias/${id}`);
    return response.data;
  }

  async createCategoria(data: any) {
    const response = await this.client.post('/categorias', data);
    return response.data;
  }

  async updateCategoria(id: number, data: any) {
    const response = await this.client.patch(`/categorias/${id}`, data);
    return response.data;
  }

  async deleteCategoria(id: number) {
    const response = await this.client.delete(`/categorias/${id}`);
    return response.data;
  }

  // Roles
  async getRoles() {
    const response = await this.client.get('/roles');
    return response.data;
  }

  // Proveedores
  async getProveedores(empresaId?: number) {
    const params = empresaId ? { empresaId } : {};
    const response = await this.client.get('/proveedores', { params });
    return response.data;
  }

  // Garantías
  async getGarantias() {
    const response = await this.client.get('/garantias');
    return response.data;
  }

  async getGarantiaByActivo(activoId: number) {
    const response = await this.client.get(`/garantias/activo/${activoId}`);
    return response.data;
  }

  // Admin Sistema - Dashboard Global
  async getDashboardStats() {
    const response = await this.client.get('/admin-sistema/dashboard');
    return response.data;
  }

  // Admin Sistema - Gestión de Empresas
  async getAllEmpresasAdmin() {
    const response = await this.client.get('/admin-sistema/empresas');
    return response.data;
  }

  async getEmpresaDetallada(id: number) {
    const response = await this.client.get(`/admin-sistema/empresas/${id}`);
    return response.data;
  }

  async createEmpresaAdmin(data: any) {
    const response = await this.client.post('/admin-sistema/empresas', data);
    return response.data;
  }

  async updateEmpresaAdmin(id: number, data: any) {
    const response = await this.client.patch(`/admin-sistema/empresas/${id}`, data);
    return response.data;
  }

  async toggleEmpresaActiva(id: number, activa: boolean) {
    const response = await this.client.patch(`/admin-sistema/empresas/${id}/toggle-activa`, { activa });
    return response.data;
  }

  async deleteEmpresaAdmin(id: number) {
    const response = await this.client.delete(`/admin-sistema/empresas/${id}`);
    return response.data;
  }

  // Admin Sistema - Gestión Global de Usuarios
  async getAllUsuariosAdmin(empresaId?: number) {
    const params = empresaId ? { empresaId } : {};
    const response = await this.client.get('/admin-sistema/usuarios', { params });
    return response.data;
  }

  async getUsuarioAdmin(id: number) {
    const response = await this.client.get(`/admin-sistema/usuarios/${id}`);
    return response.data;
  }

  async createUsuarioAdmin(data: any) {
    const response = await this.client.post('/admin-sistema/usuarios', data);
    return response.data;
  }

  async updateUsuarioAdmin(id: number, data: any) {
    const response = await this.client.patch(`/admin-sistema/usuarios/${id}`, data);
    return response.data;
  }

  async resetPasswordAdmin(id: number, password: string) {
    const response = await this.client.patch(`/admin-sistema/usuarios/${id}/reset-password`, { password });
    return response.data;
  }

  async forgotPassword(correo: string) {
    const response = await this.client.post('/auth/forgot-password', { correo }, {
      timeout: 30000, // 30 segundos de timeout
    });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string) {
    const response = await this.client.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  async toggleUsuarioActivo(id: number, activo: boolean) {
    const response = await this.client.patch(`/admin-sistema/usuarios/${id}/toggle-activo`, { activo });
    return response.data;
  }

  async cambiarEmpresaUsuario(id: number, empresaId: number) {
    const response = await this.client.patch(`/admin-sistema/usuarios/${id}/cambiar-empresa`, { empresaId });
    return response.data;
  }

  async cambiarRolUsuario(id: number, rolId: number) {
    const response = await this.client.patch(`/admin-sistema/usuarios/${id}/cambiar-rol`, { rolId });
    return response.data;
  }

  async deleteUsuarioAdmin(id: number) {
    const response = await this.client.delete(`/admin-sistema/usuarios/${id}`);
    return response.data;
  }

  // Solicitudes
  async createSolicitud(data: any) {
    const response = await this.client.post('/solicitudes', data);
    return response.data;
  }

  async getSolicitudes(estado?: string) {
    const params = estado ? { estado } : {};
    const response = await this.client.get('/solicitudes', { params });
    return response.data;
  }

  async getMisSolicitudes() {
    const response = await this.client.get('/solicitudes/mis-solicitudes');
    return response.data;
  }

  async getSolicitud(id: number) {
    const response = await this.client.get(`/solicitudes/${id}`);
    return response.data;
  }

  async aprobarSolicitud(id: number, observaciones?: string) {
    const response = await this.client.patch(`/solicitudes/${id}/aprobar`, { observaciones });
    return response.data;
  }

  async rechazarSolicitud(id: number, observaciones: string) {
    const response = await this.client.patch(`/solicitudes/${id}/rechazar`, { observaciones });
    return response.data;
  }

  async completarSolicitud(id: number) {
    const response = await this.client.patch(`/solicitudes/${id}/completar`);
    return response.data;
  }

  // Mantenimientos - Estados
  async iniciarMantenimiento(id: number) {
    const response = await this.client.patch(`/mantenimientos/${id}`, { estado: 'iniciado', fechaInicio: new Date().toISOString() });
    return response.data;
  }

  async pausarMantenimiento(id: number) {
    const response = await this.client.patch(`/mantenimientos/${id}`, { estado: 'pausado' });
    return response.data;
  }

  async finalizarMantenimiento(id: number, data: any) {
    const response = await this.client.patch(`/mantenimientos/${id}`, { 
      estado: 'finalizado', 
      fechaFinalizacion: new Date().toISOString(),
      ...data 
    });
    return response.data;
  }

  // Notificaciones
  async getNotificaciones(noLeidas?: boolean) {
    const params = noLeidas ? { noLeidas: 'true' } : {};
    const response = await this.client.get('/notificaciones', { params });
    return response.data;
  }

  async contarNotificacionesNoLeidas() {
    const response = await this.client.get('/notificaciones/contar-no-leidas');
    return response.data;
  }

  async marcarNotificacionLeida(id: number) {
    const response = await this.client.patch(`/notificaciones/${id}/leer`);
    return response.data;
  }

  async marcarTodasNotificacionesLeidas() {
    const response = await this.client.patch('/notificaciones/marcar-todas-leidas');
    return response.data;
  }

  async eliminarNotificacion(id: number) {
    const response = await this.client.delete(`/notificaciones/${id}`);
    return response.data;
  }

  // Inventario Físico
  async confirmarActivoInventario(data: { activoId: number; observaciones?: string; ubicacionVerificada?: string }) {
    const response = await this.client.post('/inventario-fisico/confirmar', data);
    return response.data;
  }

  async getInventarioFisico(fecha?: string) {
    const params = fecha ? { fecha } : {};
    const response = await this.client.get('/inventario-fisico', { params });
    return response.data;
  }

  async getResumenInventario(fecha?: string) {
    const params = fecha ? { fecha } : {};
    const response = await this.client.get('/inventario-fisico/resumen', { params });
    return response.data;
  }

  // Reportes
  async getDepreciacionMensual(mes?: number, anio?: number) {
    const params: any = {};
    if (mes) params.mes = mes;
    if (anio) params.anio = anio;
    const response = await this.client.get('/reportes/depreciacion-mensual', { params });
    return response.data;
  }

  async getComparativoContableFiscal() {
    const response = await this.client.get('/reportes/comparativo-contable-fiscal');
    return response.data;
  }

  async getActivosPorCentroCosto() {
    const response = await this.client.get('/reportes/activos-por-centro-costo');
    return response.data;
  }

  async getActivosPorResponsable() {
    const response = await this.client.get('/reportes/activos-por-responsable');
    return response.data;
  }

  async getActivosPorEstado() {
    const response = await this.client.get('/reportes/activos-por-estado');
    return response.data;
  }

  async getInventarioFisicoVsContable() {
    const response = await this.client.get('/reportes/inventario-fisico-vs-contable');
    return response.data;
  }
}

export const api = new ApiClient();

