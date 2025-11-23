# 🎨 Frontend - Sistema de Control de Activos

Frontend desarrollado con Next.js 14, TypeScript y Tailwind CSS para el Sistema de Control de Activos con QR Dinámico.

## 🚀 Características

- ✅ Autenticación con JWT (Login y Registro)
- ✅ Dashboard con estadísticas
- ✅ Gestión completa de Activos (CRUD)
- ✅ Gestión de Asignaciones
- ✅ Gestión de Mantenimientos
- ✅ Interfaz responsive y moderna
- ✅ Integración completa con la API del backend
- ✅ Manejo de tokens y refresh automático
- ✅ Componentes reutilizables

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend corriendo en `http://localhost:3000` (o configurar la URL en `.env`)

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
cd front-end
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Editar `.env` y configurar:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

3. **Ejecutar en desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

## 📁 Estructura del Proyecto

```
front-end/
├── app/                    # Páginas y rutas (App Router de Next.js)
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── dashboard/         # Dashboard principal
│   ├── activos/           # Gestión de activos
│   ├── asignaciones/      # Gestión de asignaciones
│   ├── mantenimientos/    # Gestión de mantenimientos
│   └── ...
├── components/            # Componentes reutilizables
│   ├── Layout.tsx        # Layout principal con sidebar
│   └── ProtectedRoute.tsx # Componente para rutas protegidas
├── lib/                   # Utilidades y servicios
│   ├── api.ts            # Cliente API con axios
│   └── auth.ts           # Funciones de autenticación
├── types/                 # Tipos TypeScript
│   └── index.ts          # Definiciones de tipos
└── ...
```

## 🔐 Autenticación

El sistema maneja la autenticación mediante JWT:

- **Login:** `/login`
- **Registro:** `/register`
- Los tokens se almacenan en `localStorage`
- Refresh automático de tokens cuando expiran
- Redirección automática si no está autenticado

## 📱 Páginas Principales

### Dashboard (`/dashboard`)
- ✅ Estadísticas generales del sistema (6 métricas)
- ✅ Activos recientes
- ✅ Resumen de asignaciones y mantenimientos
- ✅ Valor total de activos

### Activos (`/activos`)
- ✅ Listado de todos los activos con búsqueda
- ✅ Crear nuevo activo (`/activos/nuevo`)
- ✅ Ver detalle de activo con QR (`/activos/[id]`)
- ✅ Editar activo (`/activos/[id]/editar`)
- ✅ Eliminar activo
- ✅ Regenerar códigos QR
- ✅ Historial de asignaciones (`/activos/[id]/historial`)
- ✅ Historial de mantenimientos (`/activos/[id]/mantenimientos`)

### Asignaciones (`/asignaciones`)
- ✅ Listado de asignaciones con búsqueda
- ✅ Crear nueva asignación (`/asignaciones/nueva`)
- ✅ Ver detalle de asignación (`/asignaciones/[id]`)
- ✅ Devolver activos asignados
- ✅ Historial por activo
- ✅ Historial por empleado (`/asignaciones/empleado/[id]`)

### Mantenimientos (`/mantenimientos`)
- ✅ Listado de mantenimientos con búsqueda
- ✅ Crear nuevo mantenimiento (`/mantenimientos/nuevo`)
- ✅ Ver detalle de mantenimiento (`/mantenimientos/[id]`)
- ✅ Historial por activo
- ✅ Filtrado por activo y técnico

### Mantenimientos Programados (`/mantenimientos-programados`)
- ✅ Listado de mantenimientos programados
- ✅ Programar nuevo mantenimiento (`/mantenimientos-programados/nuevo`)
- ✅ Ver mantenimientos próximos (`/mantenimientos-programados/proximos`)
- ✅ Filtrado por días (7, 15, 30 días)

### Empleados (`/empleados`)
- ✅ Listado de empleados con búsqueda
- ✅ Crear nuevo empleado (`/empleados/nuevo`) - Solo admin
- ✅ Ver detalle de empleado (`/empleados/[id]`)
- ✅ Historial de asignaciones por empleado

### Usuarios (`/usuarios`)
- ✅ Listado de usuarios con búsqueda - Solo admin
- ✅ Crear nuevo usuario (`/usuarios/nuevo`) - Solo admin
- ✅ Ver detalle de usuario (`/usuarios/[id]`) - Solo admin
- ✅ Editar usuario (`/usuarios/[id]/editar`) - Solo admin

### Empresas (`/empresas`)
- ✅ Listado de empresas con búsqueda
- ✅ Ver detalle de empresa (`/empresas/[id]`)

## 🎨 Componentes

### Layout
Componente principal que incluye:
- Sidebar de navegación
- Header responsive
- Información del usuario
- Botón de logout

### ProtectedRoute
Componente que protege rutas:
- Verifica autenticación
- Verifica roles (opcional)
- Redirige al login si no está autenticado

## 🔌 API Client

El cliente API (`lib/api.ts`) incluye:
- Interceptores para agregar tokens automáticamente
- Refresh automático de tokens
- Manejo de errores
- Métodos para todos los endpoints del backend

## ✨ Funcionalidades Completadas

### ✅ Completamente Implementado
- ✅ Autenticación completa (Login, Register, Refresh Token)
- ✅ Dashboard con estadísticas en tiempo real
- ✅ CRUD completo de Activos
- ✅ CRUD completo de Asignaciones
- ✅ CRUD completo de Mantenimientos
- ✅ Gestión de Mantenimientos Programados
- ✅ CRUD completo de Empleados
- ✅ CRUD completo de Usuarios
- ✅ Visualización de Empresas
- ✅ Visualización de códigos QR
- ✅ Historiales completos
- ✅ Búsqueda en todos los listados
- ✅ Navegación intuitiva
- ✅ Diseño responsive
- ✅ Manejo de errores
- ✅ Notificaciones toast
- ✅ Protección de rutas por roles

## 🎯 Próximas Mejoras Sugeridas

- [ ] Gráficos y reportes visuales
- [ ] Exportación de datos (PDF, Excel)
- [ ] Notificaciones en tiempo real
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] Filtros avanzados
- [ ] Paginación en tablas grandes
- [ ] Búsqueda global
- [ ] Favoritos/marcadores

## 🐛 Solución de Problemas

### Error de conexión con la API
- Verifica que el backend esté corriendo
- Revisa la URL en `.env`
- Verifica CORS en el backend

### Error 401 (Unauthorized)
- El token puede haber expirado
- Intenta hacer login nuevamente
- Verifica que el token se esté guardando correctamente

### Error al cargar datos
- Verifica la consola del navegador
- Revisa la respuesta de la API en Network
- Verifica que los endpoints del backend estén funcionando

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Iniciar en producción
npm run lint     # Linter
```

## 🔗 Integración con Backend

El frontend está completamente integrado con el backend:
- Usa los mismos tipos de datos
- Respeta los roles y permisos
- Maneja los errores del backend
- Sigue las convenciones de la API

## 📄 Licencia

Este proyecto es parte del Sistema de Control de Activos.

