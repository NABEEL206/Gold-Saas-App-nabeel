// src/utils/validation/vendorCreditsValidation.ts

import type { VendorCreditFormData, VendorCreditItem } from '../types/VendorCredits/VendorCreditsType';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a single vendor credit item
 */
export const validateVendorCreditItem = (
  item: VendorCreditItem,
  index: number
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const prefix = `items[${index}]`;

  if (!item.productId || item.productId.trim() === '') {
    errors[`${prefix}.productId`] = 'Product is required';
  }

  if (!item.productName || item.productName.trim() === '') {
    errors[`${prefix}.productName`] = 'Product name is required';
  }

  if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity)) {
    errors[`${prefix}.quantity`] = 'Quantity is required';
  } else if (item.quantity <= 0) {
    errors[`${prefix}.quantity`] = 'Quantity must be greater than 0';
  } else if (!Number.isInteger(item.quantity)) {
    errors[`${prefix}.quantity`] = 'Quantity must be a whole number';
  }

  if (item.rate === undefined || item.rate === null || isNaN(item.rate)) {
    errors[`${prefix}.rate`] = 'Rate is required';
  } else if (item.rate < 0) {
    errors[`${prefix}.rate`] = 'Rate cannot be negative';
  }

  if (item.discount !== undefined && item.discount !== null) {
    if (isNaN(item.discount)) {
      errors[`${prefix}.discount`] = 'Invalid discount';
    } else if (item.discount < 0) {
      errors[`${prefix}.discount`] = 'Discount cannot be negative';
    } else if (item.discountType === 'percentage' && item.discount > 100) {
      errors[`${prefix}.discount`] = 'Percentage discount cannot exceed 100%';
    }
  }

  if (item.taxRate !== undefined && item.taxRate !== null) {
    if (isNaN(item.taxRate)) {
      errors[`${prefix}.taxRate`] = 'Invalid tax rate';
    } else if (item.taxRate < 0) {
      errors[`${prefix}.taxRate`] = 'Tax rate cannot be negative';
    } else if (item.taxRate > 100) {
      errors[`${prefix}.taxRate`] = 'Tax rate cannot exceed 100%';
    }
  }

  if (item.total === undefined || item.total === null || isNaN(item.total)) {
    errors[`${prefix}.total`] = 'Total is required';
  } else if (item.total < 0) {
    errors[`${prefix}.total`] = 'Total cannot be negative';
  }

  return errors;
};

/**
 * Validates the complete vendor credit form data
 */
export const validateVendorCredit = (
  formData: VendorCreditFormData
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Vendor validation
  if (!formData.vendorId && !formData.vendorName) {
    errors.vendorId = 'Vendor is required';
  }

  // Vendor email validation
  if (formData.vendorEmail && formData.vendorEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.vendorEmail)) {
      errors.vendorEmail = 'Please enter a valid email address';
    }
  }

  // Vendor phone validation
  if (formData.vendorPhone && formData.vendorPhone.trim() !== '') {
    const phoneRegex = /^[\d\s\-+()]{7,15}$/;
    if (!phoneRegex.test(formData.vendorPhone)) {
      errors.vendorPhone = 'Please enter a valid phone number';
    }
  }

  // Vendor GST validation
  if (formData.vendorGST && formData.vendorGST.trim() !== '') {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(formData.vendorGST)) {
      errors.vendorGST = 'Please enter a valid GST number';
    }
  }

  // Credit date validation
  if (!formData.creditDate) {
    errors.creditDate = 'Credit date is required';
  } else {
    const creditDate = new Date(formData.creditDate);
    if (isNaN(creditDate.getTime())) {
      errors.creditDate = 'Please enter a valid credit date';
    }
  }

  // Expiry date validation
  if (formData.expiryDate) {
    const expiryDate = new Date(formData.expiryDate);
    const creditDate = new Date(formData.creditDate);
    
    if (isNaN(expiryDate.getTime())) {
      errors.expiryDate = 'Please enter a valid expiry date';
    } else if (!isNaN(creditDate.getTime()) && expiryDate <= creditDate) {
      errors.expiryDate = 'Expiry date must be after credit date';
    }
  }

  // Reason validation
  if (!formData.reason) {
    errors.reason = 'Reason is required';
  } else {
    const validReasons = ['return', 'discount', 'adjustment', 'damage', 'other'];
    if (!validReasons.includes(formData.reason)) {
      errors.reason = 'Please select a valid reason';
    }
  }

  // Status validation
  if (!formData.status) {
    errors.status = 'Status is required';
  } else {
    const validStatuses = ['draft', 'pending', 'approved', 'used', 'cancelled', 'expired'];
    if (!validStatuses.includes(formData.status)) {
      errors.status = 'Please select a valid status';
    }
  }

  // Items validation
  if (!formData.items || formData.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    formData.items.forEach((item, index) => {
      const itemErrors = validateVendorCreditItem(item, index);
      Object.assign(errors, itemErrors);
    });
  }

  // Amount validation
  if (formData.amount === undefined || formData.amount === null || isNaN(formData.amount)) {
    errors.amount = 'Amount is required';
  } else if (formData.amount < 0) {
    errors.amount = 'Amount cannot be negative';
  }

  // Total amount validation
  if (formData.totalAmount === undefined || formData.totalAmount === null || isNaN(formData.totalAmount)) {
    errors.totalAmount = 'Total amount is required';
  } else if (formData.totalAmount <= 0) {
    errors.totalAmount = 'Total amount must be greater than 0';
  }

  // Used amount validation
  if (formData.usedAmount !== undefined && formData.usedAmount !== null) {
    if (isNaN(formData.usedAmount)) {
      errors.usedAmount = 'Invalid used amount';
    } else if (formData.usedAmount < 0) {
      errors.usedAmount = 'Used amount cannot be negative';
    } else if (formData.usedAmount > formData.totalAmount) {
      errors.usedAmount = 'Used amount cannot exceed total amount';
    }
  }

  // Reference number validation
  if (formData.referenceNumber && formData.referenceNumber.length > 100) {
    errors.referenceNumber = 'Reference number must be less than 100 characters';
  }

  // Bill number validation
  if (formData.billNumber && formData.billNumber.length > 50) {
    errors.billNumber = 'Bill number must be less than 50 characters';
  }

  // Currency validation
  if (formData.currency && formData.currency.length !== 3) {
    errors.currency = 'Currency must be a 3-letter code';
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
 * Validates a specific field of vendor credit form
 */
export const validateVendorCreditField = (
  field: string,
  value: any,
  formData?: VendorCreditFormData
): string | null => {
  if (field.startsWith('items[')) {
    const match = field.match(/items\[(\d+)\]\.(.+)/);
    if (match && formData?.items) {
      const index = parseInt(match[1]);
      const itemField = match[2];
      const item = formData.items[index];
      if (item) {
        const updatedItem = { ...item, [itemField]: value };
        const errors = validateVendorCreditItem(updatedItem, index);
        return errors[field] || null;
      }
    }
    return null;
  }

  switch (field) {
    case 'vendorId':
      if (!value) return 'Vendor is required';
      break;
    case 'vendorEmail':
      if (value && value.trim() !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
      }
      break;
    case 'vendorPhone':
      if (value && value.trim() !== '') {
        if (!/^[\d\s\-+()]{7,15}$/.test(value)) return 'Please enter a valid phone number';
      }
      break;
    case 'vendorGST':
      if (value && value.trim() !== '') {
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) return 'Please enter a valid GST number';
      }
      break;
    case 'creditDate':
      if (!value) return 'Credit date is required';
      if (isNaN(new Date(value).getTime())) return 'Please enter a valid date';
      break;
    case 'expiryDate':
      if (value) {
        if (isNaN(new Date(value).getTime())) return 'Please enter a valid date';
        if (formData?.creditDate && new Date(value) <= new Date(formData.creditDate)) return 'Expiry date must be after credit date';
      }
      break;
    case 'reason':
      if (!value) return 'Reason is required';
      break;
    case 'status':
      if (!value) return 'Status is required';
      break;
    case 'amount':
      if (value === undefined || value === null || isNaN(value)) return 'Amount is required';
      if (value < 0) return 'Amount cannot be negative';
      break;
    case 'totalAmount':
      if (value === undefined || value === null || isNaN(value)) return 'Total amount is required';
      if (value <= 0) return 'Total amount must be greater than 0';
      break;
    case 'usedAmount':
      if (value !== undefined && value !== null) {
        if (isNaN(value)) return 'Invalid used amount';
        if (value < 0) return 'Used amount cannot be negative';
        if (formData && value > formData.totalAmount) return 'Used amount cannot exceed total amount';
      }
      break;
    case 'referenceNumber':
      if (value && value.length > 100) return 'Must be less than 100 characters';
      break;
    case 'billNumber':
      if (value && value.length > 50) return 'Must be less than 50 characters';
      break;
    case 'exchangeRate':
      if (value !== undefined && value !== null && value !== 1) {
        if (isNaN(value)) return 'Please enter a valid exchange rate';
        if (value <= 0) return 'Exchange rate must be greater than 0';
      }
      break;
    case 'notes':
      if (value && value.length > 2000) return 'Must be less than 2000 characters';
      break;
  }

  return null;
};

/**
 * Validate business logic rules for vendor credits
 */
export const validateVendorCreditBusinessRules = (
  formData: VendorCreditFormData
): string[] => {
  const warnings: string[] = [];

  if (formData.status === 'expired' && formData.expiryDate) {
    const expiryDate = new Date(formData.expiryDate);
    if (expiryDate > new Date()) {
      warnings.push('Credit is marked as expired but expiry date is in the future');
    }
  }

  if (formData.status === 'used' && formData.balanceAmount && formData.balanceAmount > 0) {
    warnings.push('Credit is marked as used but there is still a balance remaining');
  }

  if (formData.totalAmount > 10000000) {
    warnings.push('Credit amount exceeds 10,000,000 - please verify');
  }

  if (formData.usedAmount && formData.usedAmount === formData.totalAmount && formData.status !== 'used') {
    warnings.push('Used amount equals total amount but status is not set to "Used"');
  }

  return warnings;
};