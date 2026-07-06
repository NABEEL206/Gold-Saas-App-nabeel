// src/validations/proforma.validation.ts
import type { ProformaInvoiceFormData } from '../types/proforma/ProformaInvoiceType';
import type { ItemSelectionItem } from '../components/common/ItemSelectionTable';

export interface ProformaValidationErrors {
  customerId?: string;
  invoiceDate?: string;
  validUntil?: string;
  items?: string;
  [key: string]: string | undefined;
}

export interface ItemValidationError {
  index: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ProformaValidationErrors;
  itemErrors: ItemValidationError[];
}

/**
 * Validate a single proforma item
 */
export const validateProformaItem = (item: ItemSelectionItem, index: number): ItemValidationError[] => {
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
 * Validate proforma form
 */
export const validateProformaForm = (
  formData: any,
  items: ItemSelectionItem[]
): ValidationResult => {
  const errors: ProformaValidationErrors = {};
  const itemErrors: ItemValidationError[] = [];

  // Validate customer
  if (!formData.customerId) {
    errors.customerId = 'Please select a customer';
  }

  // Validate invoice date
  if (!formData.invoiceDate) {
    errors.invoiceDate = 'Invoice date is required';
  }

  // Validate valid until date
  if (!formData.validUntil) {
    errors.validUntil = 'Valid until date is required';
  }

  // Validate date range
  if (formData.invoiceDate && formData.validUntil && formData.validUntil < formData.invoiceDate) {
    errors.validUntil = 'Valid until date must be after invoice date';
  }

  // Validate items
  if (items.length === 0) {
    errors.items = 'At least one item is required';
  }

  items.forEach((item, index) => {
    const itemValidationErrors = validateProformaItem(item, index);
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