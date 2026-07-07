// src/validations/expense.validation.ts

import type { ExpenseFormData } from '../types/Expense/ExpenseType';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../types/Expense/ExpenseType';

export interface ExpenseValidationErrors {
  vendorId?: string;
  vendorName?: string;
  category?: string;
  subCategory?: string;
  amount?: string;
  taxAmount?: string;
  totalAmount?: string;
  date?: string;
  dueDate?: string;
  description?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  referenceNumber?: string;
  attachment?: string;
  notes?: string;
  receiptNumber?: string;
  billNumber?: string;
  currency?: string;
  exchangeRate?: string;
  isVendorExpense?: string;
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ExpenseValidationErrors;
}

/**
 * Validate Expense Form
 */
export const validateExpenseForm = (formData: ExpenseFormData): ValidationResult => {
  const errors: ExpenseValidationErrors = {};

  // ─── 1. Validate Vendor ID (Required for vendor expenses) ───
  if (formData.isVendorExpense && (!formData.vendorId || formData.vendorId === '')) {
    errors.vendorId = 'Vendor is required for vendor expenses';
  }

  // ─── 2. Validate Vendor Name (Required for vendor expenses) ───
  if (formData.isVendorExpense && (!formData.vendorName || formData.vendorName.trim() === '')) {
    errors.vendorName = 'Vendor name is required for vendor expenses';
  }

  // ─── 3. Validate Category (Required) ───
  if (!formData.category || formData.category.trim() === '') {
    errors.category = 'Category is required';
  }

  // ─── 4. Validate Sub Category (Optional, but must be valid if provided) ───
  if (formData.subCategory && formData.subCategory.trim() && formData.subCategory.length > 100) {
    errors.subCategory = 'Sub category must not exceed 100 characters';
  }

  // ─── 5. Validate Amount (Required, must be > 0) ───
  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  } else if (formData.amount > 999999999.99) {
    errors.amount = 'Amount is too large (max: 999,999,999.99)';
  }

  // ─── 6. Validate Tax Amount (Optional, must be >= 0) ───
  if (formData.taxAmount !== undefined && formData.taxAmount < 0) {
    errors.taxAmount = 'Tax amount cannot be negative';
  } else if (formData.taxAmount !== undefined && formData.taxAmount > 999999999.99) {
    errors.taxAmount = 'Tax amount is too large (max: 999,999,999.99)';
  }

  // ─── 7. Validate Total Amount (Optional, must be >= 0) ───
  if (formData.totalAmount !== undefined && formData.totalAmount < 0) {
    errors.totalAmount = 'Total amount cannot be negative';
  } else if (formData.totalAmount !== undefined && formData.totalAmount > 999999999.99) {
    errors.totalAmount = 'Total amount is too large (max: 999,999,999.99)';
  }

  // ─── 8. Validate Date (Required, must be valid) ───
  if (!formData.date) {
    errors.date = 'Date is required';
  } else {
    const dateObj = new Date(formData.date);
    if (isNaN(dateObj.getTime())) {
      errors.date = 'Please enter a valid date';
    } else if (dateObj > new Date()) {
      // Allow future dates, but warn (optional check)
      // Don't block, just let user know
    }
  }

  // ─── 9. Validate Due Date (Optional, must be >= expense date) ───
  if (formData.dueDate) {
    const dueDateObj = new Date(formData.dueDate);
    if (isNaN(dueDateObj.getTime())) {
      errors.dueDate = 'Please enter a valid due date';
    } else if (formData.date) {
      const expenseDateObj = new Date(formData.date);
      if (dueDateObj < expenseDateObj) {
        errors.dueDate = 'Due date cannot be before expense date';
      }
    }
  }

  // ─── 10. Validate Description (Optional, max length) ───
  if (formData.description && formData.description.length > 500) {
    errors.description = 'Description must not exceed 500 characters';
  }

  // ─── 11. Validate Payment Method (Required) ───
  if (!formData.paymentMethod || formData.paymentMethod.trim() === '') {
    errors.paymentMethod = 'Payment method is required';
  } else if (!PAYMENT_METHODS.includes(formData.paymentMethod as any)) {
    errors.paymentMethod = 'Please select a valid payment method';
  }

  // ─── 12. Validate Payment Status (Required) ───
  if (!formData.paymentStatus || formData.paymentStatus.trim() === '') {
    errors.paymentStatus = 'Payment status is required';
  } else if (!PAYMENT_STATUSES.includes(formData.paymentStatus as any)) {
    errors.paymentStatus = 'Please select a valid payment status';
  }

  // ─── 13. Validate Reference Number (Optional, max length) ───
  if (formData.referenceNumber && formData.referenceNumber.length > 50) {
    errors.referenceNumber = 'Reference number must not exceed 50 characters';
  }

  // ─── 14. Validate Receipt Number (Optional, max length) ───
  if (formData.receiptNumber && formData.receiptNumber.length > 50) {
    errors.receiptNumber = 'Receipt number must not exceed 50 characters';
  }

  // ─── 15. Validate Bill Number (Optional, max length) ───
  if (formData.billNumber && formData.billNumber.length > 50) {
    errors.billNumber = 'Bill number must not exceed 50 characters';
  }

  // ─── 16. Validate Currency (Optional, must be valid) ───
  if (formData.currency && formData.currency.length !== 3) {
    errors.currency = 'Currency must be a 3-letter code (e.g., USD)';
  }

  // ─── 17. Validate Exchange Rate (Optional, must be > 0) ───
  if (formData.exchangeRate !== undefined && formData.exchangeRate <= 0) {
    errors.exchangeRate = 'Exchange rate must be greater than 0';
  } else if (formData.exchangeRate !== undefined && formData.exchangeRate > 1000000) {
    errors.exchangeRate = 'Exchange rate is too large (max: 1,000,000)';
  }

  // ─── 18. Validate Notes (Optional, max length) ───
  if (formData.notes && formData.notes.length > 1000) {
    errors.notes = 'Notes must not exceed 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate specific field
 */
export const validateExpenseField = (
  field: keyof ExpenseFormData,
  value: any,
  formData: Partial<ExpenseFormData>
): string | undefined => {
  const fullFormData = {
    vendorId: '',
    vendorName: '',
    category: '',
    subCategory: '',
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
    paymentMethod: 'bank',
    paymentStatus: 'unpaid',
    referenceNumber: '',
    attachment: '',
    notes: '',
    receiptNumber: '',
    billNumber: '',
    currency: 'USD',
    exchangeRate: 1,
    isVendorExpense: false,
    ...formData,
    [field]: value
  };

  const result = validateExpenseForm(fullFormData as ExpenseFormData);
  return result.errors[field];
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: ExpenseValidationErrors): Record<string, string> => {
  const formatted: Record<string, string> = {};
  Object.entries(errors).forEach(([key, value]) => {
    if (value) {
      formatted[key] = value;
    }
  });
  return formatted;
};

/**
 * Get error count
 */
export const getErrorCount = (errors: ExpenseValidationErrors): number => {
  return Object.keys(errors).filter(key => errors[key]).length;
};

/**
 * Check if validation has any errors
 */
export const hasValidationErrors = (errors: ExpenseValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Get validation summary
 */
export const getValidationSummary = (result: ValidationResult): string => {
  const count = getErrorCount(result.errors);
  if (count === 0) return 'All fields are valid';
  return `Please fix ${count} error(s) before saving`;
};

/**
 * Get first error message
 */
export const getFirstError = (errors: ExpenseValidationErrors): string | null => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0] as keyof ExpenseValidationErrors] || null : null;
};

/**
 * Check if expense can be submitted
 */
export const canSubmitExpense = (formData: ExpenseFormData): { 
  canSubmit: boolean; 
  errors: ExpenseValidationErrors 
} => {
  const result = validateExpenseForm(formData);
  return {
    canSubmit: result.isValid,
    errors: result.errors
  };
};