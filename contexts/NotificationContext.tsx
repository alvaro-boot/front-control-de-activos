'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import NotificationModal, { Notification, NotificationType } from '@/components/NotificationModal';
import { setNotificationContext } from '@/lib/notifications';

export interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback(
    (type: NotificationType, title: string, message: string, duration = 5000) => {
      const id = Math.random().toString(36).substring(7);
      setNotification({ id, type, title, message, duration });
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification('success', title, message, duration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification('error', title, message, duration || 6000);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification('info', title, message, duration);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification('warning', title, message, duration);
    },
    [showNotification]
  );

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  // Registrar el contexto globalmente para el helper de toast
  useEffect(() => {
    setNotificationContext(contextValue);
  }, [showNotification, showSuccess, showError, showInfo, showWarning]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationModal notification={notification} onClose={closeNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

