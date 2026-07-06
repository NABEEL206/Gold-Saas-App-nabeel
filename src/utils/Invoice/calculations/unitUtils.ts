// src/utils/calculations/unitUtils.ts
// Unit conversion and options

export const UNIT_OPTIONS = [
  { value: 'Pcs', label: 'Pcs' },
  { value: 'Gm', label: 'Gm' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Tola', label: 'Tola' },
  { value: 'Gram', label: 'Gram' },
  { value: 'Mg', label: 'Mg' },
  { value: 'Carat', label: 'Carat' },
  { value: 'Set', label: 'Set' },
  { value: 'Pair', label: 'Pair' },
];

export const convertWeight = (value: number, fromUnit: string, toUnit: string): number => {
  // Conversion logic here if needed
  return value;
};