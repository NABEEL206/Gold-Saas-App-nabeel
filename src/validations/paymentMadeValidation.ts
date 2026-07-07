// src/utils/validation/paymentMadeValidation.ts

import type { PaymentMadeFormData } from '../types/PaymentMade/PaymentMadeType';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates the complete payment form data
 */
export const validatePaymentMade = (
  formData: PaymentMadeFormData
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Vendor validation
  if (!formData.vendorId && !formData.vendorName) {
    errors.vendorId = 'Vendor is required';
  }

  // Vendor name validation (if provided)
  if (formData.vendorName && formData.vendorName.length > 200) {
    errors.vendorName = 'Vendor name must be less than 200 characters';
  }

  // Vendor email validation (if provided)
  if (formData.vendorEmail && formData.vendorEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.vendorEmail)) {
      errors.vendorEmail = 'Please enter a valid email address';
    }
  }

  // Payment date validation
  if (!formData.paymentDate) {
    errors.paymentDate = 'Payment date is required';
  } else {
    const paymentDate = new Date(formData.paymentDate);
    if (isNaN(paymentDate.getTime())) {
      errors.paymentDate = 'Please enter a valid payment date';
    } else if (paymentDate > new Date()) {
      // Future date warning - not an error, handled in business rules
    }
  }

  // Amount validation
  if (formData.amount === undefined || formData.amount === null || isNaN(formData.amount)) {
    errors.amount = 'Amount is required';
  } else if (formData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  } else if (formData.amount > 999999999) {
    errors.amount = 'Amount is too large';
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

  // Bank-specific validations (when payment method is bank or auto_debit)
  if (formData.paymentMethod === 'bank' || formData.paymentMethod === 'auto_debit') {
    if (!formData.bankName || formData.bankName.trim() === '') {
      errors.bankName = 'Bank name is required for bank transfers';
    }
    if (!formData.bankAccount || formData.bankAccount.trim() === '') {
      errors.bankAccount = 'Bank account is required for bank transfers';
    } else if (formData.bankAccount.length < 5) {
      errors.bankAccount = 'Please enter a valid bank account number';
    }
  }

  // Cheque-specific validations (when payment method is cheque)
  if (formData.paymentMethod === 'cheque') {
    if (!formData.chequeNumber || formData.chequeNumber.trim() === '') {
      errors.chequeNumber = 'Cheque number is required for cheque payments';
    } else if (formData.chequeNumber.length < 6) {
      errors.chequeNumber = 'Please enter a valid cheque number';
    }
  }

  // Status validation
  if (!formData.status) {
    errors.status = 'Status is required';
  } else {
    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(formData.status)) {
      errors.status = 'Please select a valid status';
    }
  }

  // Reference number validation (optional but limit length)
  if (formData.referenceNumber && formData.referenceNumber.length > 100) {
    errors.referenceNumber = 'Reference number must be less than 100 characters';
  }

  // Bill ID validation (if provided)
  if (formData.billId && formData.billId.toString().length > 50) {
    errors.billId = 'Bill ID is too long';
  }

  // Bill number validation (if provided)
  if (formData.billNumber && formData.billNumber.length > 50) {
    errors.billNumber = 'Bill number must be less than 50 characters';
  }

  // Currency validation
  if (formData.currency && formData.currency.length !== 3) {
    errors.currency = 'Currency must be a 3-letter code (e.g., INR, USD)';
  }

  // Exchange rate validation
  if (formData.exchangeRate !== undefined && formData.exchangeRate !== null && formData.exchangeRate !== 1) {
    if (isNaN(formData.exchangeRate)) {
      errors.exchangeRate = 'Please enter a valid exchange rate';
    } else if (formData.exchangeRate <= 0) {
      errors.exchangeRate = 'Exchange rate must be greater than 0';
    }
  }

  // Notes validation
  if (formData.notes && formData.notes.length > 2000) {
    errors.notes = 'Notes must be less than 2000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a specific field of payment form
 */
export const validatePaymentMadeField = (
  field: string,
  value: any,
  formData?: PaymentMadeFormData
): string | null => {
  switch (field) {
    case 'vendorId':
      if (!value) {
        return 'Vendor is required';
      }
      break;

    case 'vendorEmail':
      if (value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
      }
      break;

    case 'paymentDate':
      if (!value) {
        return 'Payment date is required';
      }
      if (isNaN(new Date(value).getTime())) {
        return 'Please enter a valid date';
      }
      break;

    case 'amount':
      if (value === undefined || value === null || isNaN(value)) {
        return 'Amount is required';
      }
      if (value <= 0) {
        return 'Amount must be greater than 0';
      }
      if (value > 999999999) {
        return 'Amount is too large';
      }
      break;

    case 'paymentMethod':
      if (!value) {
        return 'Payment method is required';
      }
      break;

    case 'bankName':
      if (formData?.paymentMethod === 'bank' || formData?.paymentMethod === 'auto_debit') {
        if (!value || value.trim() === '') {
          return 'Bank name is required for bank transfers';
        }
      }
      break;

    case 'bankAccount':
      if (formData?.paymentMethod === 'bank' || formData?.paymentMethod === 'auto_debit') {
        if (!value || value.trim() === '') {
          return 'Bank account is required for bank transfers';
        }
        if (value.length < 5) {
          return 'Please enter a valid bank account number';
        }
      }
      break;

    case 'chequeNumber':
      if (formData?.paymentMethod === 'cheque') {
        if (!value || value.trim() === '') {
          return 'Cheque number is required for cheque payments';
        }
        if (value.length < 6) {
          return 'Please enter a valid cheque number';
        }
      }
      break;

    case 'status':
      if (!value) {
        return 'Status is required';
      }
      break;

    case 'referenceNumber':
      if (value && value.length > 100) {
        return 'Reference number must be less than 100 characters';
      }
      break;

    case 'billId':
      if (value && value.toString().length > 50) {
        return 'Bill ID is too long';
      }
      break;

    case 'billNumber':
      if (value && value.length > 50) {
        return 'Bill number must be less than 50 characters';
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

    case 'notes':
      if (value && value.length > 2000) {
        return 'Notes must be less than 2000 characters';
      }
      break;
  }

  return null;
};

/**
 * Validate business logic rules for payments
 */
export const validatePaymentMadeBusinessRules = (
  formData: PaymentMadeFormData
): string[] => {
  const warnings: string[] = [];

  // Warn for future payment date
  if (formData.paymentDate) {
    const paymentDate = new Date(formData.paymentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (paymentDate > today) {
      warnings.push('Payment date is in the future');
    }
  }

  // Warn for high-value payments
  if (formData.amount > 10000000) {
    warnings.push('Payment amount exceeds 10,000,000 - please verify this is correct');
  }

  // Warn if completed status but no reference number
  if (formData.status === 'completed' && !formData.referenceNumber) {
    warnings.push('Payment is marked as completed but no reference number is provided');
  }

  // Warn if failed status without notes
  if (formData.status === 'failed' && !formData.notes) {
    warnings.push('Payment is marked as failed - consider adding notes with the reason');
  }

  // Warn if cancelled status without notes
  if (formData.status === 'cancelled' && !formData.notes) {
    warnings.push('Payment is cancelled - consider adding notes with the reason');
  }

  // Warn for cash payments with large amounts
  if (formData.paymentMethod === 'cash' && formData.amount > 200000) {
    warnings.push('Large cash payment - ensure compliance with tax regulations');
  }

  return warnings;
};

/**
 * Utility function to check if a field has an error
 */
export const hasPaymentMadeFieldError = (
  errors: Record<string, string>,
  field: string
): boolean => {
  return field in errors;
};

/**
 * Utility function to get error message for a field
 */
export const getPaymentMadeFieldError = (
  errors: Record<string, string>,
  field: string
): string | undefined => {
  return errors[field];
};