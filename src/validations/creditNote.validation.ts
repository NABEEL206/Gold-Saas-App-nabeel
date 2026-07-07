// src/validations/creditNote.validation.ts
import type { ItemSelectionItem } from '../components/common/ItemSelectionTable';

export interface CreditNoteValidationErrors {
  customerId?: string;
  reason?: string;
  items?: string;
  creditNoteDate?: string;
  [key: string]: string | undefined;
}

export interface ItemValidationError {
  index: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: CreditNoteValidationErrors;
  itemErrors: ItemValidationError[];
}

/**
 * Validate a single credit note item
 */
export const validateCreditNoteItem = (item: ItemSelectionItem, index: number): ItemValidationError[] => {
  const errors: ItemValidationError[] = [];

  if (!item.productName || item.productName.trim() === '') {
    errors.push({
      index,
      field: 'productName',
      message: 'Item name is required',
    });
  }

  if (Number(item.quantity) <= 0) {
    errors.push({
      index,
      field: 'quantity',
      message: 'Quantity must be greater than 0',
    });
  }

  if (Number(item.rate) < 0) {
    errors.push({
      index,
      field: 'rate',
      message: 'Rate cannot be negative',
    });
  }

  if (Number(item.discount) < 0) {
    errors.push({
      index,
      field: 'discount',
      message: 'Discount cannot be negative',
    });
  }

  if (Number(item.taxRate) < 0) {
    errors.push({
      index,
      field: 'taxRate',
      message: 'Tax rate cannot be negative',
    });
  }

  return errors;
};

/**
 * Validate all credit note items
 */
export const validateCreditNoteItems = (items: ItemSelectionItem[]): ValidationResult => {
  const itemErrors: ItemValidationError[] = [];
  const errors: CreditNoteValidationErrors = {};

  if (items.length === 0) {
    errors.items = 'At least one item is required';
  }

  items.forEach((item, index) => {
    const itemValidationErrors = validateCreditNoteItem(item, index);
    itemErrors.push(...itemValidationErrors);
  });

  return {
    isValid: Object.keys(errors).length === 0 && itemErrors.length === 0,
    errors,
    itemErrors,
  };
};

/**
 * Validate credit note form
 */
export const validateCreditNoteForm = (
  formData: any,
  items: ItemSelectionItem[]
): ValidationResult => {
  const errors: CreditNoteValidationErrors = {};
  const itemErrors: ItemValidationError[] = [];

  // ─── 1. Validate Customer ───
  if (!formData.customerId) {
    errors.customerId = 'Customer is required';
  }

  // ─── 2. Validate Reason ───
  if (!formData.reason || formData.reason.trim() === '') {
    errors.reason = 'Reason is required';
  }

  // ─── 3. Validate Date ───
  if (!formData.creditNoteDate) {
    errors.creditNoteDate = 'Credit note date is required';
  }

  // ─── 4. Validate Items ───
  if (items.length === 0) {
    errors.items = 'At least one item is required';
  }

  items.forEach((item, index) => {
    const itemValidationErrors = validateCreditNoteItem(item, index);
    itemErrors.push(...itemValidationErrors);
  });

  return {
    isValid: Object.keys(errors).length === 0 && itemErrors.length === 0,
    errors,
    itemErrors,
  };
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (result: ValidationResult): Record<string, string> => {
  const formattedErrors: Record<string, string> = {};

  // Add form level errors
  Object.entries(result.errors).forEach(([key, value]) => {
    if (value) {
      formattedErrors[key] = value;
    }
  });

  // Add item errors
  result.itemErrors.forEach((err) => {
    formattedErrors[`item_${err.index}_${err.field}`] = err.message;
  });

  return formattedErrors;
};

/**
 * Get error count
 */
export const getErrorCount = (result: ValidationResult): number => {
  const formErrors = Object.keys(result.errors).filter(key => result.errors[key]).length;
  return formErrors + result.itemErrors.length;
};

/**
 * Check if validation has any errors
 */
export const hasValidationErrors = (result: ValidationResult): boolean => {
  return !result.isValid;
};

/**
 * Get validation summary
 */
export const getValidationSummary = (result: ValidationResult): string => {
  const count = getErrorCount(result);
  if (count === 0) return 'All fields are valid';
  return `Please fix ${count} error(s) before saving`;
};