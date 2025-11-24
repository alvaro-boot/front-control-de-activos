'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import ConfirmModal, { ConfirmOptions } from '@/components/ConfirmModal';
import { setConfirmContext } from '@/lib/confirm';

export interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((confirmOptions: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(confirmOptions);
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (options) {
      options.onConfirm();
    }
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  }, [options, resolvePromise]);

  const handleCancel = useCallback(() => {
    if (options?.onCancel) {
      options.onCancel();
    }
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setOptions(null);
    setResolvePromise(null);
  }, [options, resolvePromise]);

  const contextValue: ConfirmContextType = {
    confirm,
  };

  // Registrar el contexto globalmente para el helper de confirm
  useEffect(() => {
    setConfirmContext(contextValue);
  }, [confirm]);

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <ConfirmModal isOpen={isOpen} options={options} onClose={handleCancel} />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context;
}

