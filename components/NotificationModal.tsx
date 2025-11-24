'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface NotificationModalProps {
  notification: Notification | null;
  onClose: () => void;
}

export default function NotificationModal({ notification, onClose }: NotificationModalProps) {
  useEffect(() => {
    if (notification) {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'info':
        return <Info className="h-6 w-6 text-neon-cyan" />;
      default:
        return <Info className="h-6 w-6 text-gray-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-400/50';
      case 'error':
        return 'border-red-400/50';
      case 'warning':
        return 'border-yellow-400/50';
      case 'info':
        return 'border-neon-cyan/50';
      default:
        return 'border-gray-400/50';
    }
  };

  const getTitleColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-neon-cyan';
      default:
        return 'text-gray-700';
    }
  };

  const getProgressColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-neon-cyan';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={`relative glass-light rounded-xl shadow-2xl border-2 ${getBorderColor()} max-w-md w-full transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${notification.type === 'success' ? 'from-green-400 to-emerald-300' : notification.type === 'error' ? 'from-red-400 to-pink-300' : notification.type === 'warning' ? 'from-yellow-400 to-orange-300' : 'from-neon-cyan to-neon-blue'} rounded-xl blur opacity-20 animate-glow-pulse`} />

        {/* Close Button */}
        <button
          onClick={onClose}
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
              <h3 className={`text-lg font-semibold ${getTitleColor()} mb-2`}>
                {notification.title}
              </h3>
              <p className="text-sm text-gray-700">{notification.message}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {notification.duration && notification.duration > 0 && (
          <div className="h-1 bg-white/30 rounded-b-xl overflow-hidden">
            <div
              className={`h-full ${getProgressColor()} transition-all`}
              style={{
                width: '100%',
                animation: `shrink ${notification.duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
