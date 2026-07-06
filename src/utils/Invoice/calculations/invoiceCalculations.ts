// src/utils/calculations/invoiceCalculations.ts
// Main invoice calculation logic

import { calculateDiscount, type DiscountType } from './discountCalculations';
import { calculateTax } from './taxCalculations';
import { calculateTotalOldGold } from './oldGoldCalculations';
import { roundToTwoDecimals } from './currencyUtils';

export interface InvoiceItemInput {
  quantity: number;
  rate: number;
  makingCharges?: number;
  stoneCharges?: number;
  discount: number;
  discountType: DiscountType;
  taxRate: number;
}

export interface InvoiceItemResult {
  baseAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  oldGoldTotal: number;
  grandTotal: number;
  netTotal: number;
  itemCount: number;
}

export const calculateItemTotals = (item: any): InvoiceItemResult => {
  const quantity = Number(item.quantity) || 1;
  const rate = Number(item.rate) || 0;
  const makingCharges = Number(item.makingCharges) || 0;
  const stoneCharges = Number(item.stoneCharges) || 0;
  const discount = Number(item.discount) || 0;
  const discountType = item.discountType || 'percentage';
  const taxRate = Number(item.taxRate) || 0;
  
  // Calculate base amount
  const baseAmount = (quantity * rate) + makingCharges + stoneCharges;
  
  // Calculate discount
  const { discountAmount, discountedAmount } = calculateDiscount(baseAmount, discount, discountType);
  
  // Calculate tax
  const taxAmount = calculateTax(discountedAmount, taxRate);
  
  // Calculate total
  const totalAmount = discountedAmount + taxAmount;
  
  return {
    baseAmount,
    discountAmount,
    taxableAmount: discountedAmount,
    taxAmount,
    totalAmount: roundToTwoDecimals(totalAmount),
  };
};

export const calculateInvoiceTotals = (
  items: any[],
  oldGoldItems: any[] = [],
  additionalCharges: Array<{ label: string; value: number }> = [],
  headerDiscount: number = 0,
  headerDiscountType: DiscountType = 'percentage'
): InvoiceTotals => {
  // Calculate individual item totals
  const itemResults = items.map(calculateItemTotals);
  
  // Sum up totals
  const subtotal = itemResults.reduce((sum, item) => sum + item.baseAmount, 0);
  const totalDiscount = itemResults.reduce((sum, item) => sum + item.discountAmount, 0);
  const taxAmount = itemResults.reduce((sum, item) => sum + item.taxAmount, 0);
  
  // Calculate old gold total
  const oldGoldTotal = calculateTotalOldGold(oldGoldItems);
  
  // Calculate additional charges
  const additionalChargesTotal = additionalCharges.reduce(
    (sum, charge) => sum + (charge.value || 0),
    0
  );
  
  // Calculate grand total before header discount and old gold
  let grandTotal = subtotal - totalDiscount + taxAmount + additionalChargesTotal;
  
  // Apply header discount
  const { discountAmount: headerDiscountAmount } = calculateDiscount(grandTotal, headerDiscount, headerDiscountType);
  grandTotal = grandTotal - headerDiscountAmount;
  
  // Apply old gold (subtract from total)
  const netTotal = Math.max(grandTotal - oldGoldTotal, 0);
  
  return {
    subtotal,
    totalDiscount: totalDiscount + headerDiscountAmount,
    taxAmount,
    oldGoldTotal,
    grandTotal,
    netTotal,
    itemCount: items.length,
  };
};