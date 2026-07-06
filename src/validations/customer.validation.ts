// src/validations/customer.validation.ts
import type { CustomerFormData } from '../types/customer/CustomerTypes';

export interface CustomerValidationErrors {
  lastName?: string;
  displayName?: string;
  mobileNumber?: string;
  email?: string;
  gstNumber?: string;
  panNumber?: string;
  [key: string]: string | undefined;
}

/**
 * Validate GST Number format
 */
export const validateGST = (gst: string): boolean => {
  if (!gst) return true; // Optional field
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
};

/**
 * Validate PAN Number format
 */
export const validatePAN = (pan: string): boolean => {
  if (!pan) return true; // Optional field
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
};

/**
 * Validate Email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Optional field
  return /\S+@\S+\.\S+/.test(email);
};

/**
 * Validate Mobile Number
 */
export const validateMobileNumber = (mobile: string): boolean => {
  return /^[0-9]{10}$/.test(mobile.replace(/\s/g, ''));
};

/**
 * Validate Customer Form
 */
export const validateCustomerForm = (formData: CustomerFormData): CustomerValidationErrors => {
  const errors: CustomerValidationErrors = {};

  // ─── Mandatory Fields ───
  
  // Last Name is required
  if (!formData.lastName || formData.lastName.trim() === '') {
    errors.lastName = 'Last Name is required';
  }

  // Display Name is required
  if (!formData.displayName || formData.displayName.trim() === '') {
    errors.displayName = 'Display Name is required';
  }

  // Mobile Number is required
  if (!formData.mobileNumber || formData.mobileNumber.trim() === '') {
    errors.mobileNumber = 'Mobile Number is required';
  } else if (!validateMobileNumber(formData.mobileNumber)) {
    errors.mobileNumber = 'Invalid mobile number (must be 10 digits)';
  }

  // ─── Optional Fields with Validation ───

  // Email validation (optional)
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }

  // GST Number validation (optional)
  if (formData.gstNumber && !validateGST(formData.gstNumber)) {
    errors.gstNumber = 'Invalid GST number format (e.g., 22AAAAA0000A1Z1)';
  }

  // PAN Number validation (optional)
  if (formData.panNumber && !validatePAN(formData.panNumber)) {
    errors.panNumber = 'Invalid PAN number format (e.g., ABCDE1234F)';
  }

  return errors;
};

/**
 * Check if validation has any errors
 */
export const hasValidationErrors = (errors: CustomerValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Get error count
 */
export const getErrorCount = (errors: CustomerValidationErrors): number => {
  return Object.keys(errors).filter(key => errors[key]).length;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: CustomerValidationErrors): Record<string, string> => {
  const formatted: Record<string, string> = {};
  Object.entries(errors).forEach(([key, value]) => {
    if (value) {
      formatted[key] = value;
    }
  });
  return formatted;
};