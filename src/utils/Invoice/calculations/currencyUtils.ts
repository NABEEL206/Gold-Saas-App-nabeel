// src/utils/calculations/currencyUtils.ts
// Currency formatting utilities

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[₹,]/g, '')) || 0;
};

export const roundToTwoDecimals = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};