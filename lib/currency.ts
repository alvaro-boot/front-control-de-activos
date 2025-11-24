/**
 * Formatea un valor numérico como moneda en pesos colombianos (COP)
 * - No muestra ",00" si el valor es entero
 * - Usa punto (.) como separador de miles
 * - Usa coma (,) como separador decimal
 * - Incluye el símbolo de pesos ($)
 * 
 * @param value - Valor numérico a formatear
 * @returns String formateado como moneda colombiana
 * 
 * @example
 * formatCurrency(1000000) // "$1.000.000"
 * formatCurrency(1000000.50) // "$1.000.000,50"
 * formatCurrency(1000000.00) // "$1.000.000"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }

  // Convertir a número si es string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return 'N/A';
  }

  // Si el valor es 0, mostrar $0
  if (numValue === 0) {
    return '$0';
  }

  // Formatear con locale colombiano (punto para miles, coma para decimales)
  const formatted = numValue.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  // Remover ,00 al final si existe (en es-CO los decimales usan coma)
  const cleaned = formatted.replace(/,00$/, '');
  
  return `$${cleaned}`;
}

/**
 * Formatea un valor numérico como moneda sin el símbolo de pesos
 * Útil para casos donde se necesita solo el número formateado
 */
export function formatCurrencyNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return '0';
  }

  // Formatear con locale colombiano
  const formatted = numValue.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  // Remover ,00 al final si existe (en es-CO los decimales usan coma)
  return formatted.replace(/,00$/, '');
}
