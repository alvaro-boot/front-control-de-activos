'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  if (variant === 'primary') {
    return (
      <button
        className={`w-full relative overflow-hidden group ${sizeClasses[size]} ${className} ${
          (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={disabled || isLoading}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-magenta to-neon-cyan opacity-60 group-hover:opacity-80 transition-opacity duration-300 rounded-lg" />
        <div className="relative px-6 py-3 bg-white/70 backdrop-blur-md border border-neon-cyan/50 rounded-lg font-semibold text-gray-800 group-hover:border-neon-cyan group-hover:bg-white/90 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-neon-cyan/30">
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Cargando...
            </span>
          ) : (
            children
          )}
        </div>
      </button>
    );
  }

  const variantClasses = {
    secondary: 'bg-white/40 backdrop-blur-md border border-neon-blue/40 text-neon-blue hover:border-neon-blue hover:shadow-lg hover:shadow-neon-blue/30 hover:bg-white/60',
    danger: 'bg-white/40 backdrop-blur-md border border-red-400/50 text-red-600 hover:bg-white/60 hover:border-red-500 hover:shadow-lg hover:shadow-red-400/30',
    success: 'bg-white/40 backdrop-blur-md border border-green-400/50 text-green-600 hover:bg-white/60 hover:border-green-500 hover:shadow-lg hover:shadow-green-400/30',
  };

  return (
    <button
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
