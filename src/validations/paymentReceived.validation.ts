// src/validations/paymentReceived.validation.ts

export interface PaymentReceivedValidationErrors {
  customerId?: string;
  amount?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  chequeNumber?: string;
  chequeDate?: string;
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: PaymentReceivedValidationErrors;
}

/**
 * Validate Payment Received Form
 */
export const validatePaymentReceivedForm = (formData: any): ValidationResult => {
  const errors: PaymentReceivedValidationErrors = {};

  // ─── 1. Validate Customer ───
  if (!formData.customerId) {
    errors.customerId = 'Customer is required';
  }

  // ─── 2. Validate Amount ───
  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Valid amount is required';
  }

  // ─── 3. Validate Payment Method ───
  if (!formData.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  }

  // ─── 4. Validate based on Payment Method ───
  if (formData.paymentMethod === 'cheque') {
    if (!formData.chequeNumber || formData.chequeNumber.trim() === '') {
      errors.chequeNumber = 'Cheque number is required';
    }
    if (!formData.chequeDate) {
      errors.chequeDate = 'Cheque date is required';
    }
  }

  if (formData.paymentMethod === 'bank_transfer') {
    if (!formData.referenceNumber || formData.referenceNumber.trim() === '') {
      errors.referenceNumber = 'Reference number is required for bank transfer';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: PaymentReceivedValidationErrors): Record<string, string> => {
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
export const getErrorCount = (errors: PaymentReceivedValidationErrors): number => {
  return Object.keys(errors).filter(key => errors[key]).length;
};

/**
 * Check if validation has any errors
 */
export const hasValidationErrors = (errors: PaymentReceivedValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};