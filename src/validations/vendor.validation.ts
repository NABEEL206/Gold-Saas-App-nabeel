// src/validations/vendor.validation.ts
import type { VendorFormData } from '../types/Vendor/VendorType';

export interface VendorValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  errors: VendorValidationErrors;
}

/**
 * Validate Vendor Form
 */
export const validateVendorForm = (formData: VendorFormData): ValidationResult => {
  const errors: VendorValidationErrors = {};

  // ─── 1. Validate Name (Required) ───
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Vendor name is required';
  }

  // ─── 2. Validate Email (Optional, but must be valid if provided) ───
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // ─── 3. Validate Phone (Optional, but must be valid if provided) ───
  if (formData.phone && !/^[\d\s\-()+]+$/.test(formData.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // ─── 4. Validate Tax ID (Optional, but must be at least 5 characters if provided) ───
  if (formData.taxId && formData.taxId.trim().length < 5) {
    errors.taxId = 'Tax ID must be at least 5 characters';
  }

  // ─── 5. Validate Contact Email (Optional, but must be valid if provided) ───
  if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
    errors.contactEmail = 'Please enter a valid contact email address';
  }

  // ─── 6. Validate Contact Phone (Optional, but must be valid if provided) ───
  if (formData.contactPhone && !/^[\d\s\-()+]+$/.test(formData.contactPhone)) {
    errors.contactPhone = 'Please enter a valid contact phone number';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: VendorValidationErrors): Record<string, string> => {
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
export const getErrorCount = (errors: VendorValidationErrors): number => {
  return Object.keys(errors).filter(key => errors[key]).length;
};

/**
 * Check if validation has any errors
 */
export const hasValidationErrors = (errors: VendorValidationErrors): boolean => {
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