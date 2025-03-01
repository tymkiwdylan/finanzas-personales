import { Currency } from '@/types';

// We'll use a free API to get the exchange rate
// For free market exchange rate in Argentina
export async function getExchangeRate(): Promise<number> {
  try {
    // Using DolarApi which provides free market rates in Argentina
    const response = await fetch('https://dolarapi.com/v1/dolares/blue');
    const data = await response.json();
    
    // Return the sell price (venta) for USD to ARS conversion
    return data.venta || 1000; // Default fallback value
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 1000; // Default fallback value if API fails
  }
}

// Convert amount from one currency to another
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (fromCurrency === 'USD' && toCurrency === 'ARS') {
    return amount * exchangeRate;
  } else {
    // ARS to USD
    return amount / exchangeRate;
  }
}

// Format currency for display
export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency === 'ARS' ? 'ARS' : 'USD',
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

// Format percentage for display
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}
