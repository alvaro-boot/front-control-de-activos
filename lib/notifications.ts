// Helper para usar notificaciones modal en lugar de toasts
// Este archivo proporciona funciones compatibles con react-hot-toast
// pero que usan el sistema de notificaciones modal

import { NotificationContextType } from '@/contexts/NotificationContext';

// Variable global para almacenar las funciones de notificación
let notificationContext: NotificationContextType | null = null;

export function setNotificationContext(context: NotificationContextType) {
  notificationContext = context;
}

export const toast = {
  success: (message: string, options?: { duration?: number }) => {
    if (notificationContext) {
      notificationContext.showSuccess('Éxito', message, options?.duration);
    } else {
      console.warn('Notification context not available, falling back to console');
      console.log('✅', message);
    }
  },
  error: (message: string, options?: { duration?: number }) => {
    if (notificationContext) {
      notificationContext.showError('Error', message, options?.duration);
    } else {
      console.warn('Notification context not available, falling back to console');
      console.error('❌', message);
    }
  },
  info: (message: string, options?: { duration?: number }) => {
    if (notificationContext) {
      notificationContext.showInfo('Información', message, options?.duration);
    } else {
      console.warn('Notification context not available, falling back to console');
      console.info('ℹ️', message);
    }
  },
  warning: (message: string, options?: { duration?: number }) => {
    if (notificationContext) {
      notificationContext.showWarning('Advertencia', message, options?.duration);
    } else {
      console.warn('Notification context not available, falling back to console');
      console.warn('⚠️', message);
    }
  },
};

