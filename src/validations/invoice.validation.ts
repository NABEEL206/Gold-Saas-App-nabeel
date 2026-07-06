// src/validations/invoice.validation.ts
import type { ItemSelectionItem } from '../components/common/ItemSelectionTable';
import type { OldGoldItem } from '../components/common/OldGoldTable';

export interface InvoiceValidationErrors {
  customerId?: string;
  customerName?: string;
  date?: string;
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
  errors: InvoiceValidationErrors;
  itemErrors: ItemValidationError[];
  oldGoldErrors: ItemValidationError[];
}

// ─── Mandatory Field Validation ─────────────────────────────────────────────

/**
 * Validate mandatory customer fields
 */
export const validateCustomer = (formData: any): InvoiceValidationErrors => {
  const errors: InvoiceValidationErrors = {};

  // MANDATORY: Customer must be selected
  if (!formData.customerId || formData.customerId.trim() === '') {
    errors.customerId = 'Customer is required';
  }

  // MANDATORY: Customer name must be present
  if (!formData.customerName || formData.customerName.trim() === '') {
    errors.customerName = 'Customer name is required';
  }

  return errors;
};

/**
 * Validate mandatory invoice date
 */
export const validateInvoiceDate = (formData: any): InvoiceValidationErrors => {
  const errors: InvoiceValidationErrors = {};

  // MANDATORY: Invoice date must be set
  if (!formData.date || formData.date.trim() === '') {
    errors.date = 'Invoice date is required';
  }

  return errors;
};

/**
 * Validate mandatory invoice items
 */
export const validateInvoiceItems = (items: ItemSelectionItem[]): ValidationResult => {
  const itemErrors: ItemValidationError[] = [];
  const errors: InvoiceValidationErrors = {};

  // MANDATORY: At least one item
  if (items.length === 0) {
    errors.items = 'At least one item is required';
  }

  items.forEach((item, index) => {
    // MANDATORY: Item name
    if (!item.productName || item.productName.trim() === '') {
      itemErrors.push({
        index,
        field: 'productName',
        message: 'Item name is required',
      });
    }

    // MANDATORY: Quantity must be greater than 0
    if (Number(item.quantity) <= 0) {
      itemErrors.push({
        index,
        field: 'quantity',
        message: 'Quantity must be greater than 0',
      });
    }

    // MANDATORY: Rate must be valid (not negative)
    if (Number(item.rate) < 0) {
      itemErrors.push({
        index,
        field: 'rate',
        message: 'Rate cannot be negative',
      });
    }

    // Optional but should be validated if present
    if (Number(item.discount) < 0) {
      itemErrors.push({
        index,
        field: 'discount',
        message: 'Discount cannot be negative',
      });
    }

    if (Number(item.taxRate) < 0) {
      itemErrors.push({
        index,
        field: 'taxRate',
        message: 'Tax rate cannot be negative',
      });
    }
  });

  return {
    isValid: Object.keys(errors).length === 0 && itemErrors.length === 0,
    errors,
    itemErrors,
    oldGoldErrors: [],
  };
};

/**
 * Validate mandatory old gold items
 */
export const validateOldGoldItems = (items: OldGoldItem[]): ValidationResult => {
  const oldGoldErrors: ItemValidationError[] = [];
  const errors: InvoiceValidationErrors = {};

  items.forEach((item, index) => {
    // MANDATORY: Description
    if (!item.description || item.description.trim() === '') {
      oldGoldErrors.push({
        index,
        field: 'description',
        message: 'Old gold description is required',
      });
    }

    // MANDATORY: Gross weight must be greater than 0
    if (Number(item.grossWt) <= 0) {
      oldGoldErrors.push({
        index,
        field: 'grossWt',
        message: 'Gross weight must be greater than 0',
      });
    }

    // MANDATORY: Less wastage must be valid
    if (Number(item.lessWastage) < 0) {
      oldGoldErrors.push({
        index,
        field: 'lessWastage',
        message: 'Less wastage cannot be negative',
      });
    }

    // Validation: Less wastage must be less than gross weight
    if (Number(item.lessWastage) >= Number(item.grossWt) && Number(item.grossWt) > 0) {
      oldGoldErrors.push({
        index,
        field: 'lessWastage',
        message: 'Less wastage must be less than gross weight',
      });
    }

    // MANDATORY: Rate must be valid
    if (Number(item.rate) < 0) {
      oldGoldErrors.push({
        index,
        field: 'rate',
        message: 'Rate cannot be negative',
      });
    }
  });

  return {
    isValid: oldGoldErrors.length === 0,
    errors,
    itemErrors: [],
    oldGoldErrors,
  };
};

/**
 * Complete invoice form validation - All mandatory fields
 */
export const validateInvoiceForm = (
  formData: any,
  items: ItemSelectionItem[],
  oldGoldItems: OldGoldItem[]
): ValidationResult => {
  const errors: InvoiceValidationErrors = {};
  const itemErrors: ItemValidationError[] = [];
  const oldGoldErrors: ItemValidationError[] = [];

  // ─── 1. Validate Customer (Mandatory) ───
  const customerErrors = validateCustomer(formData);
  Object.assign(errors, customerErrors);

  // ─── 2. Validate Date (Mandatory) ───
  const dateErrors = validateInvoiceDate(formData);
  Object.assign(errors, dateErrors);

  // ─── 3. Validate Items (Mandatory) ───
  const itemValidation = validateInvoiceItems(items);
  Object.assign(errors, itemValidation.errors);
  itemErrors.push(...itemValidation.itemErrors);

  // ─── 4. Validate Old Gold Items (If present) ───
  if (oldGoldItems && oldGoldItems.length > 0) {
    const oldGoldValidation = validateOldGoldItems(oldGoldItems);
    oldGoldErrors.push(...oldGoldValidation.oldGoldErrors);
  }

  return {
    isValid: Object.keys(errors).length === 0 && itemErrors.length === 0 && oldGoldErrors.length === 0,
    errors,
    itemErrors,
    oldGoldErrors,
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

  // Add old gold errors
  result.oldGoldErrors.forEach((err) => {
    formattedErrors[`oldGold_${err.index}_${err.field}`] = err.message;
  });

  return formattedErrors;
};

/**
 * Check if validation has any errors
 */
export const hasValidationErrors = (result: ValidationResult): boolean => {
  return !result.isValid;
};

/**
 * Get error count
 */
export const getErrorCount = (result: ValidationResult): number => {
  const formErrors = Object.keys(result.errors).filter(key => result.errors[key]).length;
  const itemErrors = result.itemErrors.length;
  const oldGoldErrors = result.oldGoldErrors.length;
  return formErrors + itemErrors + oldGoldErrors;
};

/**
 * Get user-friendly error message summary
 */
export const getValidationSummary = (result: ValidationResult): string => {
  const count = getErrorCount(result);
  if (count === 0) return 'All fields are valid';
  return `Please fix ${count} error(s) before saving`;
};