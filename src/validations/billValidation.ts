// src/utils/validation/billValidation.ts

import type { BillFormData, BillItem } from '../types/Bill/BillTypes';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a single bill item
 */
export const validateBillItem = (
  item: BillItem,
  index: number
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const prefix = `items[${index}]`;

  // Product ID validation
  if (!item.productId || item.productId.trim() === '') {
    errors[`${prefix}.productId`] = 'Product is required';
  }

  // Product Name validation
  if (!item.productName || item.productName.trim() === '') {
    errors[`${prefix}.productName`] = 'Product name is required';
  }

  // Quantity validation
  if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity)) {
    errors[`${prefix}.quantity`] = 'Quantity is required';
  } else if (item.quantity <= 0) {
    errors[`${prefix}.quantity`] = 'Quantity must be greater than 0';
  } else if (!Number.isInteger(item.quantity)) {
    errors[`${prefix}.quantity`] = 'Quantity must be a whole number';
  }

  // Rate validation
  if (item.rate === undefined || item.rate === null || isNaN(item.rate)) {
    errors[`${prefix}.rate`] = 'Rate is required';
  } else if (item.rate < 0) {
    errors[`${prefix}.rate`] = 'Rate cannot be negative';
  }

  // Discount validation
  if (item.discount !== undefined && item.discount !== null) {
    if (isNaN(item.discount)) {
      errors[`${prefix}.discount`] = 'Invalid discount amount';
    } else if (item.discount < 0) {
      errors[`${prefix}.discount`] = 'Discount cannot be negative';
    } else if (item.discountType === 'percentage' && item.discount > 100) {
      errors[`${prefix}.discount`] = 'Percentage discount cannot exceed 100%';
    }
  }

  // Tax rate validation
  if (item.taxRate !== undefined && item.taxRate !== null) {
    if (isNaN(item.taxRate)) {
      errors[`${prefix}.taxRate`] = 'Invalid tax rate';
    } else if (item.taxRate < 0) {
      errors[`${prefix}.taxRate`] = 'Tax rate cannot be negative';
    } else if (item.taxRate > 100) {
      errors[`${prefix}.taxRate`] = 'Tax rate cannot exceed 100%';
    }
  }

  // Total validation
  if (item.total === undefined || item.total === null || isNaN(item.total)) {
    errors[`${prefix}.total`] = 'Total amount is required';
  } else if (item.total < 0) {
    errors[`${prefix}.total`] = 'Total amount cannot be negative';
  }

  return errors;
};

/**
 * Validates all bill items
 */
export const validateBillItems = (
  items: BillItem[]
): Record<string, string> => {
  let allErrors: Record<string, string> = {};

  if (!items || items.length === 0) {
    allErrors['items'] = 'At least one item is required';
    return allErrors;
  }

  items.forEach((item, index) => {
    const itemErrors = validateBillItem(item, index);
    allErrors = { ...allErrors, ...itemErrors };
  });

  return allErrors;
};

/**
 * Validates the complete bill form data
 */
export const validateBill = (
  formData: BillFormData
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Vendor validation
  if (!formData.vendorId && !formData.vendorName) {
    errors.vendorId = 'Vendor is required';
  }

  // Vendor email validation (if provided)
  if (formData.vendorEmail && formData.vendorEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.vendorEmail)) {
      errors.vendorEmail = 'Please enter a valid email address';
    }
  }

  // Vendor phone validation (if provided)
  if (formData.vendorPhone && formData.vendorPhone.trim() !== '') {
    const phoneRegex = /^[\d\s\-+()]{7,15}$/;
    if (!phoneRegex.test(formData.vendorPhone)) {
      errors.vendorPhone = 'Please enter a valid phone number';
    }
  }

  // Vendor GST validation (if provided)
  if (formData.vendorGST && formData.vendorGST.trim() !== '') {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.vendorGST.length > 0 && !gstRegex.test(formData.vendorGST)) {
      errors.vendorGST = 'Please enter a valid GST number';
    }
  }

  // Bill date validation
  if (!formData.billDate) {
    errors.billDate = 'Bill date is required';
  } else {
    const billDate = new Date(formData.billDate);
    if (isNaN(billDate.getTime())) {
      errors.billDate = 'Please enter a valid bill date';
    }
  }

  // Due date validation (if provided)
  if (formData.dueDate) {
    const dueDate = new Date(formData.dueDate);
    const billDate = new Date(formData.billDate);
    
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = 'Please enter a valid due date';
    } else if (!isNaN(billDate.getTime()) && dueDate < billDate) {
      errors.dueDate = 'Due date cannot be before bill date';
    }
  }

  // Status validation
  if (!formData.status) {
    errors.status = 'Status is required';
  } else {
    const validStatuses = ['draft', 'pending', 'approved', 'paid', 'partial', 'overdue', 'cancelled'];
    if (!validStatuses.includes(formData.status)) {
      errors.status = 'Please select a valid status';
    }
  }

  // Items validation
  if (!formData.items || formData.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    const itemErrors = validateBillItems(formData.items);
    Object.assign(errors, itemErrors);
  }

  // Subtotal validation
  if (formData.subtotal === undefined || formData.subtotal === null || isNaN(formData.subtotal)) {
    errors.subtotal = 'Subtotal is required';
  } else if (formData.subtotal < 0) {
    errors.subtotal = 'Subtotal cannot be negative';
  }

  // Total amount validation
  if (formData.totalAmount === undefined || formData.totalAmount === null || isNaN(formData.totalAmount)) {
    errors.totalAmount = 'Total amount is required';
  } else if (formData.totalAmount <= 0) {
    errors.totalAmount = 'Total amount must be greater than 0';
  }

  // Paid amount validation
  if (formData.paidAmount !== undefined && formData.paidAmount !== null) {
    if (isNaN(formData.paidAmount)) {
      errors.paidAmount = 'Invalid paid amount';
    } else if (formData.paidAmount < 0) {
      errors.paidAmount = 'Paid amount cannot be negative';
    } else if (formData.paidAmount > formData.totalAmount) {
      errors.paidAmount = 'Paid amount cannot exceed total amount';
    }
  }

  // Payment method validation (if paid amount > 0)
  if (formData.paidAmount > 0 && !formData.paymentMethod) {
    errors.paymentMethod = 'Payment method is required when paid amount > 0';
  } else if (formData.paymentMethod) {
    const validMethods = ['cash', 'bank', 'credit_card', 'cheque', 'auto_debit'];
    if (!validMethods.includes(formData.paymentMethod)) {
      errors.paymentMethod = 'Please select a valid payment method';
    }
  }

  // Payment date validation (if paid amount > 0)
  if (formData.paidAmount > 0 && formData.paymentDate) {
    const paymentDate = new Date(formData.paymentDate);
    if (isNaN(paymentDate.getTime())) {
      errors.paymentDate = 'Please enter a valid payment date';
    }
  }

  // Shipping charges validation
  if (formData.shippingCharges !== undefined && formData.shippingCharges !== null) {
    if (isNaN(formData.shippingCharges)) {
      errors.shippingCharges = 'Invalid shipping charges';
    } else if (formData.shippingCharges < 0) {
      errors.shippingCharges = 'Shipping charges cannot be negative';
    }
  }

  // Handling charges validation
  if (formData.handlingCharges !== undefined && formData.handlingCharges !== null) {
    if (isNaN(formData.handlingCharges)) {
      errors.handlingCharges = 'Invalid handling charges';
    } else if (formData.handlingCharges < 0) {
      errors.handlingCharges = 'Handling charges cannot be negative';
    }
  }

  // Other charges validation
  if (formData.otherCharges !== undefined && formData.otherCharges !== null) {
    if (isNaN(formData.otherCharges)) {
      errors.otherCharges = 'Invalid other charges';
    } else if (formData.otherCharges < 0) {
      errors.otherCharges = 'Other charges cannot be negative';
    }
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

  // Terms validation
  if (formData.terms && formData.terms.length > 5000) {
    errors.terms = 'Terms must be less than 5000 characters';
  }

  // Payment terms validation
  if (formData.paymentTerms && formData.paymentTerms.length > 500) {
    errors.paymentTerms = 'Payment terms must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a specific field of bill form
 */
export const validateBillField = (
  field: string,
  value: any,
  formData?: BillFormData
): string | null => {
  // Handle nested item fields
  if (field.startsWith('items[')) {
    const match = field.match(/items\[(\d+)\]\.(.+)/);
    if (match && formData?.items) {
      const index = parseInt(match[1]);
      const itemField = match[2];
      const item = formData.items[index];
      
      if (item) {
        const updatedItem = { ...item, [itemField]: value };
        const errors = validateBillItem(updatedItem, index);
        return errors[field] || null;
      }
    }
    return null;
  }

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

    case 'vendorPhone':
      if (value && value.trim() !== '') {
        const phoneRegex = /^[\d\s\-+()]{7,15}$/;
        if (!phoneRegex.test(value)) {
          return 'Please enter a valid phone number';
        }
      }
      break;

    case 'vendorGST':
      if (value && value.trim() !== '') {
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!gstRegex.test(value)) {
          return 'Please enter a valid GST number';
        }
      }
      break;

    case 'billDate':
      if (!value) {
        return 'Bill date is required';
      }
      if (isNaN(new Date(value).getTime())) {
        return 'Please enter a valid date';
      }
      break;

    case 'dueDate':
      if (value) {
        const dueDate = new Date(value);
        if (isNaN(dueDate.getTime())) {
          return 'Please enter a valid date';
        }
        if (formData?.billDate) {
          const billDate = new Date(formData.billDate);
          if (!isNaN(billDate.getTime()) && dueDate < billDate) {
            return 'Due date cannot be before bill date';
          }
        }
      }
      break;

    case 'status':
      if (!value) {
        return 'Status is required';
      }
      break;

    case 'totalAmount':
      if (value === undefined || value === null || isNaN(value)) {
        return 'Total amount is required';
      }
      if (value <= 0) {
        return 'Total amount must be greater than 0';
      }
      break;

    case 'paidAmount':
      if (value !== undefined && value !== null) {
        if (isNaN(value)) {
          return 'Invalid paid amount';
        }
        if (value < 0) {
          return 'Paid amount cannot be negative';
        }
        if (formData && value > formData.totalAmount) {
          return 'Paid amount cannot exceed total amount';
        }
      }
      break;

    case 'paymentMethod':
      if (formData?.paidAmount && formData.paidAmount > 0 && !value) {
        return 'Payment method is required when paid amount > 0';
      }
      break;

    case 'shippingCharges':
    case 'handlingCharges':
    case 'otherCharges':
      if (value !== undefined && value !== null) {
        if (isNaN(value)) {
          return 'Invalid amount';
        }
        if (value < 0) {
          return 'Amount cannot be negative';
        }
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

    case 'terms':
      if (value && value.length > 5000) {
        return 'Terms must be less than 5000 characters';
      }
      break;

    case 'paymentTerms':
      if (value && value.length > 500) {
        return 'Payment terms must be less than 500 characters';
      }
      break;
  }

  return null;
};

/**
 * Validate business logic rules for bills
 */
export const validateBillBusinessRules = (
  formData: BillFormData
): string[] => {
  const warnings: string[] = [];

  // Check if total matches calculated total
  if (formData.items && formData.items.length > 0 && formData.totalAmount > 0) {
    const calculatedTotal = formData.items.reduce((sum, item) => sum + (item.total || 0), 0)
      - (formData.discountTotal || 0)
      + (formData.taxTotal || 0)
      + (formData.shippingCharges || 0)
      + (formData.handlingCharges || 0)
      + (formData.otherCharges || 0);

    if (Math.abs(calculatedTotal - formData.totalAmount) > 0.01) {
      warnings.push('Total amount does not match the calculated total from items');
    }
  }

  // Warn for overdue status with future due date
  if (formData.status === 'overdue' && formData.dueDate) {
    const dueDate = new Date(formData.dueDate);
    if (dueDate > new Date()) {
      warnings.push('Bill is marked as overdue but due date is in the future');
    }
  }

  // Warn for paid status with balance due
  if (formData.status === 'paid' && formData.balanceDue > 0) {
    warnings.push('Bill is marked as paid but there is still a balance due');
  }

  // Warn for high-value bills
  if (formData.totalAmount > 10000000) {
    warnings.push('Bill value exceeds 10,000,000 - please verify this is correct');
  }

  // Warn if paid amount equals total but status is not paid
  if (formData.paidAmount >= formData.totalAmount && formData.totalAmount > 0 && formData.status !== 'paid') {
    warnings.push('Paid amount equals or exceeds total amount but status is not set to "Paid"');
  }

  return warnings;
};

/**
 * Utility function to check if a field has an error
 */
export const hasBillFieldError = (
  errors: Record<string, string>,
  field: string
): boolean => {
  return field in errors;
};

/**
 * Utility function to get error message for a field
 */
export const getBillFieldError = (
  errors: Record<string, string>,
  field: string
): string | undefined => {
  return errors[field];
};