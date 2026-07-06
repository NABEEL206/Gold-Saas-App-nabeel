// src/utils/calculations/discountCalculations.ts
// Discount calculation utilities

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountCalculationResult {
  discountAmount: number;
  discountedAmount: number;
}

export const calculateDiscount = (
  amount: number,
  discount: number,
  discountType: DiscountType
): DiscountCalculationResult => {
  let discountAmount = 0;
  
  if (discountType === 'percentage') {
    discountAmount = (amount * discount) / 100;
  } else {
    discountAmount = discount;
  }

  return {
    discountAmount,
    discountedAmount: Math.max(amount - discountAmount, 0),
  };
};

export const DISCOUNT_TYPES = [
  { value: 'percentage', label: '%' },
  { value: 'fixed', label: '₹' },
];