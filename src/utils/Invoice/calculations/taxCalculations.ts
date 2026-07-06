// src/utils/calculations/taxCalculations.ts
// Tax calculation utilities

export const calculateTax = (amount: number, taxRate: number): number => {
  return (amount * taxRate) / 100;
};

export const calculateTotalTax = (items: Array<{ taxableAmount: number; taxRate: number }>): number => {
  return items.reduce((sum, item) => sum + calculateTax(item.taxableAmount, item.taxRate), 0);
};

export const getTaxRateLabel = (rate: number): string => {
  return `${rate}%`;
};

export const TAX_RATES = [
  { value: 0, label: '0%' },
  { value: 3, label: '3%' },
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18%' },
  { value: 28, label: '28%' },
];