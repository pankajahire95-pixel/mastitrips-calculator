/**
 * Formats a number into Indian Rupee (INR) currency format: ₹1,23,456
 */
export function formatINR(value: number | undefined | null, options?: { showDecimals?: boolean; includeSymbol?: boolean }): string {
  if (value === undefined || value === null || isNaN(value)) {
    return options?.includeSymbol !== false ? '₹0' : '0';
  }

  const { showDecimals = false, includeSymbol = true } = options || {};

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);

  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Format percentage string: e.g. 15.2%
 */
export function formatPercentage(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${Number(value.toFixed(decimals))}%`;
}

/**
 * Unique ID generator for dynamic items.
 */
export function generateUniqueId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Helper to safely parse positive numbers from form inputs.
 */
export function parsePositiveNumber(value: string | number | undefined | null, fallback: number = 0): number {
  if (value === undefined || value === null || value === '') return fallback;
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num) || num < 0) return fallback;
  return num;
}
