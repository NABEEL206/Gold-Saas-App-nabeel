// src/utils/validation/recurringExpenseValidation.ts

import type { RecurringExpenseFormData } from "../types/RecurringExpense/RecurringExpenseType";

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof RecurringExpenseFormData, string>>;
}

/**
 * Validates recurring expense form data
 * Returns validation result with errors object
 */
export const validateRecurringExpense = (
  formData: RecurringExpenseFormData,
  isVendorExpense: boolean = false
): ValidationResult => {
  const errors: Partial<Record<keyof RecurringExpenseFormData, string>> = {};

  // Vendor validation (only when vendor expense is selected)
  if (isVendorExpense && !formData.vendorId) {
    errors.vendorId = 'Vendor is required for vendor expenses';
  }

  // Category validation
  if (!formData.category || formData.category.trim() === '') {
    errors.category = 'Category is required';
  }

  // Amount validation
  if (formData.amount === undefined || formData.amount === null || isNaN(formData.amount)) {
    errors.amount = 'Please enter a valid amount';
  } else if (formData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  // Tax amount validation (optional but must be valid if provided)
  if (formData.taxAmount !== undefined && formData.taxAmount !== null && formData.taxAmount !== 0) {
    if (isNaN(formData.taxAmount)) {
      errors.taxAmount = 'Please enter a valid tax amount';
    } else if (formData.taxAmount < 0) {
      errors.taxAmount = 'Tax amount cannot be negative';
    }
  }

  // Total amount validation (optional but must be valid if provided)
  if (formData.totalAmount !== undefined && formData.totalAmount !== null && formData.totalAmount !== 0) {
    if (isNaN(formData.totalAmount)) {
      errors.totalAmount = 'Please enter a valid total amount';
    } else if (formData.totalAmount < 0) {
      errors.totalAmount = 'Total amount cannot be negative';
    }
  }

  // Start date validation
  if (!formData.startDate) {
    errors.startDate = 'Start date is required';
  } else {
    const startDate = new Date(formData.startDate);
    if (isNaN(startDate.getTime())) {
      errors.startDate = 'Please enter a valid start date';
    }
  }

  // End date validation (if provided)
  if (formData.endDate) {
    const endDate = new Date(formData.endDate);
    const startDate = formData.startDate ? new Date(formData.startDate) : null;
    
    if (isNaN(endDate.getTime())) {
      errors.endDate = 'Please enter a valid end date';
    } else if (startDate && !isNaN(startDate.getTime()) && endDate <= startDate) {
      errors.endDate = 'End date must be after start date';
    }
  }

  // Frequency validation
  if (!formData.frequency) {
    errors.frequency = 'Frequency is required';
  } else {
    const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'half_yearly', 'yearly', 'custom'];
    if (!validFrequencies.includes(formData.frequency)) {
      errors.frequency = 'Please select a valid frequency';
    }
    
    // For custom frequency, additional validations
    if (formData.frequency === 'custom') {
      if (!formData.frequencyInterval || formData.frequencyInterval < 1) {
        errors.frequencyInterval = 'Interval must be at least 1';
      } else if (!Number.isInteger(formData.frequencyInterval)) {
        errors.frequencyInterval = 'Interval must be a whole number';
      }
      
      if (!formData.frequencyUnit) {
        errors.frequencyUnit = 'Frequency unit is required for custom frequency';
      } else {
        const validUnits = ['days', 'weeks', 'months', 'years'];
        if (!validUnits.includes(formData.frequencyUnit)) {
          errors.frequencyUnit = 'Please select a valid frequency unit';
        }
      }
    }
  }

  // Total occurrences validation (if provided)
  if (formData.totalOccurrences !== undefined && formData.totalOccurrences !== null && formData.totalOccurrences !== 0) {
    if (isNaN(formData.totalOccurrences)) {
      errors.totalOccurrences = 'Total occurrences must be a valid number';
    } else if (formData.totalOccurrences < 1) {
      errors.totalOccurrences = 'Total occurrences must be at least 1';
    } else if (!Number.isInteger(formData.totalOccurrences)) {
      errors.totalOccurrences = 'Total occurrences must be a whole number';
    } else if (formData.totalOccurrences > 999) {
      errors.totalOccurrences = 'Total occurrences cannot exceed 999';
    }
  }

  // Payment method validation
  if (!formData.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  } else {
    const validMethods = ['cash', 'bank', 'credit_card', 'cheque', 'auto_debit'];
    if (!validMethods.includes(formData.paymentMethod)) {
      errors.paymentMethod = 'Please select a valid payment method';
    }
  }

  // Payment status validation (if provided)
  if (formData.paymentStatus) {
    const validStatuses = ['active', 'paused', 'cancelled', 'completed'];
    if (!validStatuses.includes(formData.paymentStatus)) {
      errors.paymentStatus = 'Please select a valid status';
    }
  }

  // Description validation (optional but limit length)
  if (formData.description && formData.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  // Notes validation (optional but limit length)
  if (formData.notes && formData.notes.length > 2000) {
    errors.notes = 'Notes must be less than 2000 characters';
  }

  // Reference number validation (optional but limit length)
  if (formData.referenceNumber && formData.referenceNumber.length > 100) {
    errors.referenceNumber = 'Reference number must be less than 100 characters';
  }

  // Currency validation (if provided)
  if (formData.currency && formData.currency.length !== 3) {
    errors.currency = 'Currency must be a 3-letter code (e.g., INR, USD)';
  }

  // Exchange rate validation (if provided)
  if (formData.exchangeRate !== undefined && formData.exchangeRate !== null && formData.exchangeRate !== 1) {
    if (isNaN(formData.exchangeRate)) {
      errors.exchangeRate = 'Please enter a valid exchange rate';
    } else if (formData.exchangeRate <= 0) {
      errors.exchangeRate = 'Exchange rate must be greater than 0';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a specific field
 * Useful for real-time validation
 */
export const validateRecurringExpenseField = (
  field: keyof RecurringExpenseFormData,
  value: any,
  formData?: RecurringExpenseFormData
): string | null => {
  switch (field) {
    case 'category':
      if (!value || value.trim() === '') {
        return 'Category is required';
      }
      break;

    case 'amount':
      if (value === undefined || value === null || isNaN(value)) {
        return 'Please enter a valid amount';
      }
      if (value <= 0) {
        return 'Amount must be greater than 0';
      }
      break;

    case 'startDate':
      if (!value) {
        return 'Start date is required';
      }
      if (isNaN(new Date(value).getTime())) {
        return 'Please enter a valid date';
      }
      break;

    case 'endDate':
      if (value) {
        const endDate = new Date(value);
        if (isNaN(endDate.getTime())) {
          return 'Please enter a valid date';
        }
        if (formData?.startDate) {
          const startDate = new Date(formData.startDate);
          if (!isNaN(startDate.getTime()) && endDate <= startDate) {
            return 'End date must be after start date';
          }
        }
      }
      break;

    case 'frequency':
      if (!value) {
        return 'Frequency is required';
      }
      const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'half_yearly', 'yearly', 'custom'];
      if (!validFrequencies.includes(value)) {
        return 'Invalid frequency';
      }
      break;

    case 'frequencyInterval':
      if (formData?.frequency === 'custom') {
        if (!value || value < 1) {
          return 'Interval must be at least 1';
        }
        if (!Number.isInteger(value)) {
          return 'Interval must be a whole number';
        }
      }
      break;

    case 'frequencyUnit':
      if (formData?.frequency === 'custom' && !value) {
        return 'Frequency unit is required for custom frequency';
      }
      break;

    case 'paymentMethod':
      if (!value) {
        return 'Payment method is required';
      }
      const validMethods = ['cash', 'bank', 'credit_card', 'cheque', 'auto_debit'];
      if (!validMethods.includes(value)) {
        return 'Invalid payment method';
      }
      break;

    case 'paymentStatus':
      if (value) {
        const validStatuses = ['active', 'paused', 'cancelled', 'completed'];
        if (!validStatuses.includes(value)) {
          return 'Invalid status';
        }
      }
      break;

    case 'taxAmount':
      if (value !== undefined && value !== null && value !== 0) {
        if (isNaN(value)) {
          return 'Please enter a valid amount';
        }
        if (value < 0) {
          return 'Amount cannot be negative';
        }
      }
      break;

    case 'totalAmount':
      if (value !== undefined && value !== null && value !== 0) {
        if (isNaN(value)) {
          return 'Please enter a valid amount';
        }
        if (value < 0) {
          return 'Amount cannot be negative';
        }
      }
      break;

    case 'totalOccurrences':
      if (value !== undefined && value !== null && value !== 0 && value !== '') {
        if (isNaN(value)) {
          return 'Must be a valid number';
        }
        if (value < 1) {
          return 'Must be at least 1';
        }
        if (!Number.isInteger(Number(value))) {
          return 'Must be a whole number';
        }
        if (value > 999) {
          return 'Cannot exceed 999';
        }
      }
      break;

    case 'referenceNumber':
      if (value && value.length > 100) {
        return 'Must be less than 100 characters';
      }
      break;

    case 'description':
      if (value && value.length > 1000) {
        return 'Must be less than 1000 characters';
      }
      break;

    case 'notes':
      if (value && value.length > 2000) {
        return 'Must be less than 2000 characters';
      }
      break;

    case 'exchangeRate':
      if (value !== undefined && value !== null && value !== 1) {
        if (isNaN(value)) {
          return 'Please enter a valid exchange rate';
        }
        if (value <= 0) {
          return 'Exchange rate must be greater than 0';
        }
      }
      break;

    case 'vendorId':
      // This will be validated in the main form validation
      break;
  }

  return null;
};

/**
 * Utility function to check if a field has an error
 */
export const hasFieldError = (
  errors: Partial<Record<keyof RecurringExpenseFormData, string>>,
  field: keyof RecurringExpenseFormData
): boolean => {
  return field in errors;
};

/**
 * Utility function to get error message for a field
 */
export const getFieldError = (
  errors: Partial<Record<keyof RecurringExpenseFormData, string>>,
  field: keyof RecurringExpenseFormData
): string | undefined => {
  return errors[field];
};

/**
 * Validate business logic rules for recurring expenses
 */
export const validateRecurringExpenseBusinessRules = (
  formData: RecurringExpenseFormData
): string[] => {
  const warnings: string[] = [];

  // Warn if total amount doesn't match amount + tax
  if (formData.amount > 0 && formData.totalAmount > 0 && formData.taxAmount !== undefined) {
    const expectedTotal = formData.amount + (formData.taxAmount || 0);
    if (Math.abs(expectedTotal - formData.totalAmount) > 0.01) {
      warnings.push('Total amount does not match the sum of amount and tax');
    }
  }

  // Warn for very high amounts
  if (formData.amount > 1000000) {
    warnings.push('Amount exceeds 1,000,000 - please verify this is correct');
  }

  // Warn for long durations with no end date
  if (formData.totalOccurrences && formData.totalOccurrences > 365 && formData.frequency === 'daily') {
    warnings.push('This recurring expense will continue for more than a year');
  }

  // Warn if end date is too far in the future
  if (formData.endDate) {
    const endDate = new Date(formData.endDate);
    const fiveYearsFromNow = new Date();
    fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
    
    if (endDate > fiveYearsFromNow) {
      warnings.push('End date is more than 5 years in the future');
    }
  }

  return warnings;
};