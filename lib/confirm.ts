// Helper para usar confirmaciones modal en lugar de confirm() nativo
// Este archivo proporciona una función compatible con window.confirm
// pero que usa el sistema de modales personalizado

import { ConfirmContextType } from '@/contexts/ConfirmContext';

// Variable global para almacenar la función de confirmación
let confirmContext: ConfirmContextType | null = null;

export function setConfirmContext(context: ConfirmContextType) {
  confirmContext = context;
}

export async function confirm(message: string, options?: {
  title?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
}): Promise<boolean> {
  if (confirmContext) {
    return new Promise((resolve) => {
      confirmContext!.confirm({
        title: options?.title,
        message,
        type: options?.type || 'warning',
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  } else {
    // Fallback al confirm nativo si el contexto no está disponible
    console.warn('Confirm context not available, falling back to native confirm');
    return window.confirm(message);
  }
}

