# 🚀 Guía de Instalación - Frontend

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Backend corriendo en `http://localhost:3000`

## Pasos de Instalación

### 1. Instalar Dependencias

```bash
cd front-end
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz de `front-end/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Si tu backend está en otro puerto o dominio, ajusta la URL.

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001`

### 4. Build de Producción

```bash
npm run build
npm start
```

## 🔐 Credenciales de Prueba

Si has ejecutado el script `seed.sql` del backend, puedes usar:

- **Admin:** `admin@techsolutions.com` / `admin123`
- **Técnico:** `tecnico@techsolutions.com` / `tecnico123`
- **Empleado:** `empleado@techsolutions.com` / `empleado123`

## 📱 Estructura de Páginas

- `/login` - Inicio de sesión
- `/register` - Registro de usuarios
- `/dashboard` - Dashboard principal
- `/activos` - Gestión de activos
- `/asignaciones` - Gestión de asignaciones
- `/mantenimientos` - Gestión de mantenimientos
- `/mantenimientos-programados` - Mantenimientos programados
- `/empleados` - Gestión de empleados
- `/usuarios` - Gestión de usuarios (solo admin)
- `/empresas` - Listado de empresas

## 🐛 Solución de Problemas

### Error: Cannot find module
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión con API
- Verifica que el backend esté corriendo
- Revisa la URL en `.env`
- Verifica CORS en el backend

### Puerto 3001 ocupado
El puerto se puede cambiar editando `package.json`:
```json
"dev": "next dev -p 3002"
```

## 📦 Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **React Hook Form** - Formularios
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos
- **date-fns** - Manejo de fechas

