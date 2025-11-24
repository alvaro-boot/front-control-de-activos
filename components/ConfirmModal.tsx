'use client';

import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

export type ConfirmType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmOptions {
  title?: string;
  message: string;
  type?: ConfirmType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  options: ConfirmOptions | null;
  onClose: () => void;
}

export default function ConfirmModal({ isOpen, options, onClose }: ConfirmModalProps) {
  if (!isOpen || !options) return null;

  const handleConfirm = () => {
    onClose();
    setTimeout(() => {
      options.onConfirm();
    }, 0);
  };

  const handleCancel = () => {
    onClose();
    if (options.onCancel) {
      setTimeout(() => {
        options.onCancel!();
      }, 0);
    }
  };

  const getIcon = () => {
    switch (options.type || 'warning') {
      case 'danger':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'info':
        return <Info className="h-8 w-8 text-neon-cyan" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getBorderColor = () => {
    switch (options.type || 'warning') {
      case 'danger':
        return 'border-red-400/50';
      case 'warning':
        return 'border-yellow-400/50';
      case 'info':
        return 'border-neon-cyan/50';
      case 'success':
        return 'border-green-400/50';
      default:
        return 'border-yellow-400/50';
    }
  };

  const getTitleColor = () => {
    switch (options.type || 'warning') {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-neon-cyan';
      case 'success':
        return 'text-green-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal Card */}
      <div
        className={`relative glass-light rounded-xl shadow-2xl border-2 ${getBorderColor()} max-w-md w-full transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${options.type === 'danger' ? 'from-red-400 to-pink-300' : options.type === 'warning' ? 'from-yellow-400 to-orange-300' : options.type === 'info' ? 'from-neon-cyan to-neon-blue' : 'from-green-400 to-emerald-300'} rounded-xl blur opacity-20 animate-glow-pulse`} />

        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="relative p-6">
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 bg-current opacity-10 blur-lg rounded-full" />
              {getIcon()}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              {options.title && (
                <h3 className={`text-lg font-semibold ${getTitleColor()} mb-2`}>
                  {options.title}
                </h3>
              )}
              <p className="text-sm text-gray-700">{options.message}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white/60 backdrop-blur-sm border border-gray-300/50 rounded-lg hover:bg-white/80 transition-all duration-300"
            >
              {options.cancelText || 'Cancelar'}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none transition-all duration-300 backdrop-blur-sm ${
                options.type === 'danger'
                  ? 'bg-white/60 border border-red-400/50 text-red-600 hover:bg-white/80 hover:border-red-500 hover:shadow-lg hover:shadow-red-400/30'
                  : options.type === 'warning'
                  ? 'bg-white/60 border border-yellow-400/50 text-yellow-600 hover:bg-white/80 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-400/30'
                  : options.type === 'info'
                  ? 'bg-white/60 border border-neon-cyan/50 text-neon-cyan hover:bg-white/80 hover:border-neon-cyan hover:shadow-lg hover:shadow-neon-cyan/30'
                  : 'bg-white/60 border border-green-400/50 text-green-600 hover:bg-white/80 hover:border-green-500 hover:shadow-lg hover:shadow-green-400/30'
              }`}
            >
              {options.confirmText || 'Aceptar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
