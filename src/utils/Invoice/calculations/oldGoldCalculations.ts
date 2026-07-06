// src/utils/calculations/oldGoldCalculations.ts
// Old Gold specific calculations

export interface OldGoldCalculationInput {
  grossWt: number;
  lessWastage: number;
  rate: number;
}

export interface OldGoldCalculationResult {
  netWt: number;
  amount: number;
}

export const calculateOldGold = (input: OldGoldCalculationInput): OldGoldCalculationResult => {
  const { grossWt, lessWastage, rate } = input;
  const netWt = Math.max(grossWt - lessWastage, 0);
  const amount = netWt * rate;
  
  return { netWt, amount };
};

export const calculateTotalOldGold = (items: Array<{ amount: number }>): number => {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0);
};

export const PURITY_OPTIONS = [
  { value: '91.6', label: '22K (91.6%)' },
  { value: '91.8', label: '22K (91.8%)' },
  { value: '99.9', label: '24K (99.9%)' },
  { value: '99.5', label: '24K (99.5%)' },
  { value: '75', label: '18K (75%)' },
  { value: '58.5', label: '14K (58.5%)' },
  { value: '41.7', label: '10K (41.7%)' },
];