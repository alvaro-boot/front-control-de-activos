'use client';

import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getBorderColor = () => {
    switch (type) {
      case 'danger':
        return 'border-red-500/50';
      case 'warning':
        return 'border-yellow-500/50';
      case 'info':
        return 'border-neon-cyan/50';
      default:
        return 'border-neon-cyan/50';
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/30';
      case 'warning':
        return 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-600/30 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/30';
      default:
        return 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/30 hover:border-neon-cyan hover:shadow-lg hover:shadow-neon-cyan/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className={`relative inline-block align-bottom bg-dark-bg-lighter/95 backdrop-blur-xl rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border-2 ${getBorderColor()}`}>
          {/* Glow effect */}
          <div className={`absolute -inset-1 bg-gradient-to-r ${type === 'danger' ? 'from-red-500 to-pink-400' : type === 'warning' ? 'from-yellow-500 to-orange-400' : 'from-neon-cyan to-neon-blue'} rounded-xl blur opacity-30 animate-glow-pulse`} />
          
          <div className="relative px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-semibold text-white">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-neon-cyan transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-300">{message}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-dark-bg/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-neon-blue/20">
            <button
              type="button"
              className={`btn ${getConfirmButtonClass()} w-full sm:ml-3 sm:w-auto`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="btn btn-secondary mt-3 w-full sm:mt-0 sm:w-auto"
              onClick={onClose}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
