// src/validations/quote.validation.ts
import type { ItemSelectionItem } from '../components/common/ItemSelectionTable';

export interface QuoteValidationErrors {
  customerId?: string;
  customerPhone?: string;
  items?: string;
  date?: string;
  [key: string]: string | undefined;
}

export interface ItemValidationError {
  index: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: QuoteValidationErrors;
  itemErrors: ItemValidationError[];
}

/**
 * Validate a single quote item
 */
export const validateQuoteItem = (item: ItemSelectionItem, index: number): ItemValidationError[] => {
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
 * Validate all quote items
 */
export const validateQuoteItems = (items: ItemSelectionItem[]): ValidationResult => {
  const itemErrors: ItemValidationError[] = [];
  const errors: QuoteValidationErrors = {};

  if (items.length === 0) {
    errors.items = 'At least one item is required';
  }

  items.forEach((item, index) => {
    const itemValidationErrors = validateQuoteItem(item, index);
    itemErrors.push(...itemValidationErrors);
  });

  return {
    isValid: Object.keys(errors).length === 0 && itemErrors.length === 0,
    errors,
    itemErrors,
  };
};

/**
 * Validate quote form
 */
export const validateQuoteForm = (
  formData: any,
  items: ItemSelectionItem[]
): ValidationResult => {
  const errors: QuoteValidationErrors = {};
  const itemErrors: ItemValidationError[] = [];

  // Validate customer
  if (!formData.customerId) {
    errors.customerId = 'Please select a customer';
  }

  // Validate phone
  if (!formData.customerPhone || formData.customerPhone.trim() === '') {
    errors.customerPhone = 'Phone number is required';
  }

  // Validate date
  if (!formData.date) {
    errors.date = 'Date is required';
  }

  // Validate items
  if (items.length === 0) {
    errors.items = 'Please add at least one item';
  }

  items.forEach((item, index) => {
    const itemValidationErrors = validateQuoteItem(item, index);
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