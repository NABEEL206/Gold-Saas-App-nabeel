// src/utils/validation/bankValidation.ts

import type { BankFormData } from '../types/Bank/BankTypes';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates the complete bank form data
 */
export const validateBank = (
  formData: BankFormData
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Bank name validation
  if (!formData.bankName || formData.bankName.trim() === '') {
    errors.bankName = 'Bank name is required';
  } else if (formData.bankName.length < 3) {
    errors.bankName = 'Bank name must be at least 3 characters';
  } else if (formData.bankName.length > 100) {
    errors.bankName = 'Bank name must be less than 100 characters';
  }

  // Account name validation
  if (!formData.accountName || formData.accountName.trim() === '') {
    errors.accountName = 'Account name is required';
  } else if (formData.accountName.length < 2) {
    errors.accountName = 'Account name must be at least 2 characters';
  } else if (formData.accountName.length > 100) {
    errors.accountName = 'Account name must be less than 100 characters';
  }

  // Account number validation
  if (!formData.accountNumber || formData.accountNumber.trim() === '') {
    errors.accountNumber = 'Account number is required';
  } else if (!/^[\d]{5,20}$/.test(formData.accountNumber.replace(/\s/g, ''))) {
    errors.accountNumber = 'Please enter a valid account number (5-20 digits)';
  }

  // Account type validation
  if (!formData.accountType) {
    errors.accountType = 'Account type is required';
  } else {
    const validTypes = ['savings', 'current', 'fixed_deposit', 'recurring_deposit', 'salary'];
    if (!validTypes.includes(formData.accountType)) {
      errors.accountType = 'Please select a valid account type';
    }
  }

  // IFSC code validation
  if (!formData.ifscCode || formData.ifscCode.trim() === '') {
    errors.ifscCode = 'IFSC code is required';
  } else {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifscCode.toUpperCase().trim())) {
      errors.ifscCode = 'Please enter a valid IFSC code (e.g., SBIN0001234)';
    }
  }

  // Branch name validation
  if (!formData.branchName || formData.branchName.trim() === '') {
    errors.branchName = 'Branch name is required';
  } else if (formData.branchName.length > 100) {
    errors.branchName = 'Branch name must be less than 100 characters';
  }

  // Branch address validation (optional)
  if (formData.branchAddress && formData.branchAddress.length > 200) {
    errors.branchAddress = 'Branch address must be less than 200 characters';
  }

  // City validation (optional)
  if (formData.city && formData.city.length > 50) {
    errors.city = 'City must be less than 50 characters';
  }

  // State validation (optional)
  if (formData.state && formData.state.length > 50) {
    errors.state = 'State must be less than 50 characters';
  }

  // Country validation
  if (formData.country && formData.country.length > 50) {
    errors.country = 'Country must be less than 50 characters';
  }

  // Pincode validation (optional)
  if (formData.pincode && formData.pincode.trim() !== '') {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
    }
  }

  // Contact person validation (optional)
  if (formData.contactPerson && formData.contactPerson.length > 50) {
    errors.contactPerson = 'Contact person name must be less than 50 characters';
  }

  // Contact phone validation (optional)
  if (formData.contactPhone && formData.contactPhone.trim() !== '') {
    const phoneRegex = /^[\d\s\-+()]{7,15}$/;
    if (!phoneRegex.test(formData.contactPhone)) {
      errors.contactPhone = 'Please enter a valid phone number';
    }
  }

  // Contact email validation (optional)
  if (formData.contactEmail && formData.contactEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }
  }

  // Opening balance validation
  if (formData.openingBalance === undefined || formData.openingBalance === null || isNaN(formData.openingBalance)) {
    errors.openingBalance = 'Opening balance is required';
  } else if (formData.openingBalance < 0) {
    errors.openingBalance = 'Opening balance cannot be negative';
  }

  // Current balance validation
  if (formData.currentBalance === undefined || formData.currentBalance === null || isNaN(formData.currentBalance)) {
    errors.currentBalance = 'Current balance is required';
  } else if (formData.currentBalance < 0) {
    errors.currentBalance = 'Current balance cannot be negative';
  }

  // Currency validation
  if (!formData.currency || formData.currency.trim() === '') {
    errors.currency = 'Currency is required';
  } else if (formData.currency.length !== 3) {
    errors.currency = 'Currency must be a 3-letter code (e.g., INR)';
  }

  // Status validation
  if (!formData.status) {
    errors.status = 'Status is required';
  } else {
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(formData.status)) {
      errors.status = 'Please select a valid status';
    }
  }

  // Notes validation (optional)
  if (formData.notes && formData.notes.length > 500) {
    errors.notes = 'Notes must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a specific field of bank form
 */
export const validateBankField = (
  field: string,
  value: any,
  formData?: BankFormData
): string | null => {
  switch (field) {
    case 'bankName':
      if (!value || value.trim() === '') return 'Bank name is required';
      if (value.length < 3) return 'Bank name must be at least 3 characters';
      if (value.length > 100) return 'Bank name must be less than 100 characters';
      break;

    case 'accountName':
      if (!value || value.trim() === '') return 'Account name is required';
      if (value.length < 2) return 'Account name must be at least 2 characters';
      if (value.length > 100) return 'Account name must be less than 100 characters';
      break;

    case 'accountNumber':
      if (!value || value.trim() === '') return 'Account number is required';
      if (!/^[\d]{5,20}$/.test(value.replace(/\s/g, ''))) return 'Please enter a valid account number (5-20 digits)';
      break;

    case 'accountType':
      if (!value) return 'Account type is required';
      break;

    case 'ifscCode':
      if (!value || value.trim() === '') return 'IFSC code is required';
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase().trim())) return 'Please enter a valid IFSC code (e.g., SBIN0001234)';
      break;

    case 'branchName':
      if (!value || value.trim() === '') return 'Branch name is required';
      if (value.length > 100) return 'Branch name must be less than 100 characters';
      break;

    case 'branchAddress':
      if (value && value.length > 200) return 'Branch address must be less than 200 characters';
      break;

    case 'city':
    case 'state':
    case 'country':
      if (value && value.length > 50) return 'Must be less than 50 characters';
      break;

    case 'pincode':
      if (value && value.trim() !== '') {
        if (!/^[1-9][0-9]{5}$/.test(value)) return 'Please enter a valid 6-digit pincode';
      }
      break;

    case 'contactPerson':
      if (value && value.length > 50) return 'Must be less than 50 characters';
      break;

    case 'contactPhone':
      if (value && value.trim() !== '') {
        if (!/^[\d\s\-+()]{7,15}$/.test(value)) return 'Please enter a valid phone number';
      }
      break;

    case 'contactEmail':
      if (value && value.trim() !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
      }
      break;

    case 'openingBalance':
      if (value === undefined || value === null || isNaN(value)) return 'Opening balance is required';
      if (value < 0) return 'Opening balance cannot be negative';
      break;

    case 'currentBalance':
      if (value === undefined || value === null || isNaN(value)) return 'Current balance is required';
      if (value < 0) return 'Current balance cannot be negative';
      break;

    case 'currency':
      if (!value || value.trim() === '') return 'Currency is required';
      if (value.length !== 3) return 'Currency must be a 3-letter code';
      break;

    case 'status':
      if (!value) return 'Status is required';
      break;

    case 'notes':
      if (value && value.length > 500) return 'Notes must be less than 500 characters';
      break;
  }

  return null;
};

/**
 * Validate business logic rules for banks
 */
export const validateBankBusinessRules = (
  formData: BankFormData
): string[] => {
  const warnings: string[] = [];

  // Warn if current balance is different from opening balance
  if (formData.openingBalance !== formData.currentBalance) {
    warnings.push('Current balance differs from opening balance - transactions may need to be recorded');
  }

  // Warn for inactive/suspended status
  if (formData.status === 'inactive') {
    warnings.push('Bank account is marked as inactive');
  }
  if (formData.status === 'suspended') {
    warnings.push('Bank account is marked as suspended');
  }

  // Warn for large balances
  if (formData.openingBalance > 100000000) {
    warnings.push('Opening balance exceeds 10,00,00,000 - please verify');
  }

  return warnings;
};