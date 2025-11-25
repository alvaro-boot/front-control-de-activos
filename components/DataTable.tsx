'use client';

import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  render?: (value: any, row: T) => ReactNode;
  mobileLabel?: string; // Etiqueta para mostrar en móvil
  hideOnMobile?: boolean; // Ocultar en móvil
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T extends { id: number }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-cyan rounded-full blur-xl opacity-30 animate-glow-pulse" />
          <div className="relative animate-spin rounded-full h-12 w-12 border-2 border-neon-cyan border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  const getCellValue = (column: Column<T>, row: T) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  // Filtrar columnas visibles en móvil
  const mobileColumns = columns.filter(col => !col.hideOnMobile);

  return (
    <>
      {/* Vista de tabla para desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-white/40 transition-colors' : ''}
              >
                {columns.map((column, index) => {
                  const rawValue = getCellValue(column, row);
                  if (column.render) {
                    return (
                      <td key={index}>
                        {column.render(rawValue, row)}
                      </td>
                    );
                  }
                  // Si no hay render, convertir a ReactNode de forma segura
                  let displayValue: ReactNode = '';
                  if (rawValue === null || rawValue === undefined) {
                    displayValue = '';
                  } else if (typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
                    displayValue = rawValue;
                  } else if (typeof rawValue === 'object') {
                    displayValue = String(rawValue);
                  } else {
                    displayValue = String(rawValue);
                  }
                  return (
                    <td key={index}>
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de cards para móvil */}
      <div className="md:hidden space-y-4">
        {data.map((row) => (
          <div
            key={row.id}
            onClick={() => onRowClick?.(row)}
            className={`card card-glow ${onRowClick ? 'cursor-pointer hover:bg-white/70 transition-all duration-300' : ''}`}
          >
            <div className="space-y-3">
              {mobileColumns.map((column, index) => {
                const rawValue = getCellValue(column, row);
                const label = column.mobileLabel || column.header;
                
                let displayValue: ReactNode = '';
                if (column.render) {
                  displayValue = column.render(rawValue, row);
                } else if (rawValue === null || rawValue === undefined) {
                  displayValue = 'N/A';
                } else if (typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
                  displayValue = rawValue;
                } else if (typeof rawValue === 'object') {
                  displayValue = String(rawValue);
                } else {
                  displayValue = String(rawValue);
                }

                return (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide sm:w-1/3">
                      {label}:
                    </span>
                    <span className="text-sm text-gray-800 sm:w-2/3 sm:text-right">
                      {displayValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
