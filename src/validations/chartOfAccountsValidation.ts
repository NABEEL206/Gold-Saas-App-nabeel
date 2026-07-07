// src/utils/validation/chartOfAccountsValidation.ts

import type { ChartOfAccountFormData } from '../types/ChartOfAccounts/ChartOfAccountsType';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates the complete chart of accounts form data
 */
export const validateChartOfAccount = (
  formData: ChartOfAccountFormData
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Account code validation
  if (!formData.code || formData.code.trim() === '') {
    errors.code = 'Account code is required';
  } else if (!/^[A-Za-z0-9]{2,10}$/.test(formData.code.trim())) {
    errors.code = 'Account code must be 2-10 alphanumeric characters';
  }

  // Account name validation
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Account name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Account name must be at least 2 characters';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Account name must be less than 100 characters';
  }

  // Account type validation
  if (!formData.type) {
    errors.type = 'Account type is required';
  } else {
    const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
    if (!validTypes.includes(formData.type)) {
      errors.type = 'Please select a valid account type';
    }
  }

  // Category validation
  if (!formData.category || formData.category.trim() === '') {
    errors.category = 'Category is required';
  } else if (formData.category.length > 50) {
    errors.category = 'Category must be less than 50 characters';
  }

  // Sub category validation (optional)
  if (formData.subCategory && formData.subCategory.length > 50) {
    errors.subCategory = 'Sub category must be less than 50 characters';
  }

  // Description validation (optional)
  if (formData.description && formData.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  // Parent account validation (optional)
  if (formData.parentAccountId && formData.parentAccountName) {
    if (formData.parentAccountName.length > 100) {
      errors.parentAccountId = 'Invalid parent account';
    }
  }

  // Opening balance validation
  if (formData.openingBalance !== undefined && formData.openingBalance !== null) {
    if (isNaN(formData.openingBalance)) {
      errors.openingBalance = 'Please enter a valid opening balance';
    } else if (formData.openingBalance > 999999999) {
      errors.openingBalance = 'Opening balance is too large';
    }
  }

  // Current balance validation
  if (formData.currentBalance !== undefined && formData.currentBalance !== null) {
    if (isNaN(formData.currentBalance)) {
      errors.currentBalance = 'Please enter a valid current balance';
    } else if (formData.currentBalance > 999999999) {
      errors.currentBalance = 'Current balance is too large';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a specific field of chart of accounts form
 */
export const validateChartOfAccountField = (
  field: string,
  value: any,
  formData?: ChartOfAccountFormData
): string | null => {
  switch (field) {
    case 'code':
      if (!value || value.trim() === '') return 'Account code is required';
      if (!/^[A-Za-z0-9]{2,10}$/.test(value.trim())) return 'Account code must be 2-10 alphanumeric characters';
      break;

    case 'name':
      if (!value || value.trim() === '') return 'Account name is required';
      if (value.trim().length < 2) return 'Account name must be at least 2 characters';
      if (value.trim().length > 100) return 'Account name must be less than 100 characters';
      break;

    case 'type':
      if (!value) return 'Account type is required';
      break;

    case 'category':
      if (!value || value.trim() === '') return 'Category is required';
      if (value.length > 50) return 'Category must be less than 50 characters';
      break;

    case 'subCategory':
      if (value && value.length > 50) return 'Sub category must be less than 50 characters';
      break;

    case 'description':
      if (value && value.length > 500) return 'Description must be less than 500 characters';
      break;

    case 'openingBalance':
      if (value !== undefined && value !== null) {
        if (isNaN(value)) return 'Please enter a valid opening balance';
        if (value > 999999999) return 'Opening balance is too large';
      }
      break;

    case 'currentBalance':
      if (value !== undefined && value !== null) {
        if (isNaN(value)) return 'Please enter a valid current balance';
        if (value > 999999999) return 'Current balance is too large';
      }
      break;

    case 'parentAccountId':
      // Validated in main form
      break;
  }

  return null;
};

/**
 * Validate business logic rules for chart of accounts
 */
export const validateChartOfAccountBusinessRules = (
  formData: ChartOfAccountFormData
): string[] => {
  const warnings: string[] = [];

  // Warn if system account
  if (formData.isSystemAccount) {
    warnings.push('This account is marked as a system account - changes may affect system operations');
  }

  // Warn if inactive
  if (!formData.isActive) {
    warnings.push('Account will be created as inactive');
  }

  // Warn for large balances
  if (formData.openingBalance && formData.openingBalance > 10000000) {
    warnings.push('Opening balance exceeds 10,000,000 - please verify');
  }

  // Warn if parent account has different type
  if (formData.parentAccountId && formData.parentAccountName) {
    warnings.push('Ensure the parent account type matches this account type');
  }

  return warnings;
};