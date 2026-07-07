// src/utils/validation/purchaseOrderValidation.ts

import type { PurchaseOrderFormData, PurchaseOrderItem } from '../types/purchaseOrder/PurchaseOrderType';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a single purchase order item
 */
export const validatePurchaseOrderItem = (
  item: PurchaseOrderItem,
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
  } else if (item.quantity > 999999) {
    errors[`${prefix}.quantity`] = 'Quantity is too large';
  }

  // Rate validation
  if (item.rate === undefined || item.rate === null || isNaN(item.rate)) {
    errors[`${prefix}.rate`] = 'Rate is required';
  } else if (item.rate < 0) {
    errors[`${prefix}.rate`] = 'Rate cannot be negative';
  } else if (item.rate > 999999999) {
    errors[`${prefix}.rate`] = 'Rate is too large';
  }

  // Discount validation
  if (item.discount !== undefined && item.discount !== null) {
    if (isNaN(item.discount)) {
      errors[`${prefix}.discount`] = 'Invalid discount amount';
    } else if (item.discount < 0) {
      errors[`${prefix}.discount`] = 'Discount cannot be negative';
    } else if (item.discountType === 'percentage' && item.discount > 100) {
      errors[`${prefix}.discount`] = 'Percentage discount cannot exceed 100%';
    } else if (item.discountType === 'fixed' && item.discount > item.rate * item.quantity) {
      errors[`${prefix}.discount`] = 'Discount cannot exceed total amount';
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

  // Optional field validations
  if (item.purity !== undefined && item.purity !== null && item.purity !== '') {
    const purity = parseFloat(item.purity);
    if (isNaN(purity) || purity < 0 || purity > 100) {
      errors[`${prefix}.purity`] = 'Purity must be between 0 and 100';
    }
  }

  if (item.grossWt !== undefined && item.grossWt !== null) {
    if (isNaN(item.grossWt) || item.grossWt < 0) {
      errors[`${prefix}.grossWt`] = 'Invalid gross weight';
    }
  }

  if (item.stoneWt !== undefined && item.stoneWt !== null) {
    if (isNaN(item.stoneWt) || item.stoneWt < 0) {
      errors[`${prefix}.stoneWt`] = 'Invalid stone weight';
    }
  }

  if (item.netWt !== undefined && item.netWt !== null) {
    if (isNaN(item.netWt) || item.netWt < 0) {
      errors[`${prefix}.netWt`] = 'Invalid net weight';
    }
  }

  if (item.makingCharges !== undefined && item.makingCharges !== null) {
    if (isNaN(item.makingCharges) || item.makingCharges < 0) {
      errors[`${prefix}.makingCharges`] = 'Invalid making charges';
    }
  }

  if (item.stoneCharges !== undefined && item.stoneCharges !== null) {
    if (isNaN(item.stoneCharges) || item.stoneCharges < 0) {
      errors[`${prefix}.stoneCharges`] = 'Invalid stone charges';
    }
  }

  return errors;
};

/**
 * Validates all purchase order items
 */
export const validatePurchaseOrderItems = (
  items: PurchaseOrderItem[]
): Record<string, string> => {
  let allErrors: Record<string, string> = {};

  if (!items || items.length === 0) {
    allErrors['items'] = 'At least one item is required';
    return allErrors;
  }

  items.forEach((item, index) => {
    const itemErrors = validatePurchaseOrderItem(item, index);
    allErrors = { ...allErrors, ...itemErrors };
  });

  return allErrors;
};

/**
 * Validates the complete purchase order form data
 */
export const validatePurchaseOrder = (
  formData: PurchaseOrderFormData,
  isVendorRequired: boolean = true
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Vendor validation
  if (isVendorRequired && !formData.vendorId) {
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

  // Vendor phone validation (if provided)
  if (formData.vendorPhone && formData.vendorPhone.trim() !== '') {
    const phoneRegex = /^[\d\s\-+()]{7,15}$/;
    if (!phoneRegex.test(formData.vendorPhone)) {
      errors.vendorPhone = 'Please enter a valid phone number';
    }
  }

  // Order date validation
  if (!formData.orderDate) {
    errors.orderDate = 'Order date is required';
  } else {
    const orderDate = new Date(formData.orderDate);
    if (isNaN(orderDate.getTime())) {
      errors.orderDate = 'Please enter a valid order date';
    }
  }

  // Delivery date validation (if provided)
  if (formData.deliveryDate) {
    const deliveryDate = new Date(formData.deliveryDate);
    const orderDate = new Date(formData.orderDate);
    
    if (isNaN(deliveryDate.getTime())) {
      errors.deliveryDate = 'Please enter a valid delivery date';
    } else if (!isNaN(orderDate.getTime()) && deliveryDate < orderDate) {
      errors.deliveryDate = 'Delivery date cannot be before order date';
    }
  }

  // Expected delivery date validation (if provided)
  if (formData.expectedDeliveryDate) {
    const expectedDate = new Date(formData.expectedDeliveryDate);
    
    if (isNaN(expectedDate.getTime())) {
      errors.expectedDeliveryDate = 'Please enter a valid expected delivery date';
    }
  }

  // Status validation
  if (!formData.status) {
    errors.status = 'Status is required';
  } else {
    const validStatuses = ['draft', 'pending', 'approved', 'ordered', 'received', 'partially_received', 'cancelled', 'completed'];
    if (!validStatuses.includes(formData.status)) {
      errors.status = 'Please select a valid status';
    }
  }

  // Priority validation
  if (!formData.priority) {
    errors.priority = 'Priority is required';
  } else {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(formData.priority)) {
      errors.priority = 'Please select a valid priority';
    }
  }

  // Items validation
  if (!formData.items || formData.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    const itemErrors = validatePurchaseOrderItems(formData.items);
    Object.assign(errors, itemErrors);
  }

  // Subtotal validation
  if (formData.subtotal === undefined || formData.subtotal === null || isNaN(formData.subtotal)) {
    errors.subtotal = 'Subtotal is required';
  } else if (formData.subtotal < 0) {
    errors.subtotal = 'Subtotal cannot be negative';
  }

  // Discount total validation
  if (formData.discountTotal !== undefined && formData.discountTotal !== null) {
    if (isNaN(formData.discountTotal)) {
      errors.discountTotal = 'Invalid discount total';
    } else if (formData.discountTotal < 0) {
      errors.discountTotal = 'Discount total cannot be negative';
    } else if (formData.discountTotal > formData.subtotal) {
      errors.discountTotal = 'Discount total cannot exceed subtotal';
    }
  }

  // Tax total validation
  if (formData.taxTotal !== undefined && formData.taxTotal !== null) {
    if (isNaN(formData.taxTotal)) {
      errors.taxTotal = 'Invalid tax total';
    } else if (formData.taxTotal < 0) {
      errors.taxTotal = 'Tax total cannot be negative';
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

  // Total amount validation
  if (formData.totalAmount === undefined || formData.totalAmount === null || isNaN(formData.totalAmount)) {
    errors.totalAmount = 'Total amount is required';
  } else if (formData.totalAmount <= 0) {
    errors.totalAmount = 'Total amount must be greater than 0';
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

  // Notes validation (optional but limit length)
  if (formData.notes && formData.notes.length > 2000) {
    errors.notes = 'Notes must be less than 2000 characters';
  }

  // Terms validation (optional but limit length)
  if (formData.terms && formData.terms.length > 5000) {
    errors.terms = 'Terms must be less than 5000 characters';
  }

  // Payment terms validation (optional but limit length)
  if (formData.paymentTerms && formData.paymentTerms.length > 500) {
    errors.paymentTerms = 'Payment terms must be less than 500 characters';
  }

  // Shipping address validation (optional but limit length)
  if (formData.shippingAddress && formData.shippingAddress.length > 500) {
    errors.shippingAddress = 'Shipping address must be less than 500 characters';
  }

  // Billing address validation (optional but limit length)
  if (formData.billingAddress && formData.billingAddress.length > 500) {
    errors.billingAddress = 'Billing address must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a specific field of purchase order form
 * Useful for real-time validation
 */
export const validatePurchaseOrderField = (
  field: string,
  value: any,
  formData?: PurchaseOrderFormData
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
        const errors = validatePurchaseOrderItem(updatedItem, index);
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

    case 'orderDate':
      if (!value) {
        return 'Order date is required';
      }
      if (isNaN(new Date(value).getTime())) {
        return 'Please enter a valid date';
      }
      break;

    case 'deliveryDate':
      if (value) {
        const deliveryDate = new Date(value);
        if (isNaN(deliveryDate.getTime())) {
          return 'Please enter a valid date';
        }
        if (formData?.orderDate) {
          const orderDate = new Date(formData.orderDate);
          if (!isNaN(orderDate.getTime()) && deliveryDate < orderDate) {
            return 'Delivery date cannot be before order date';
          }
        }
      }
      break;

    case 'status':
      if (!value) {
        return 'Status is required';
      }
      break;

    case 'priority':
      if (!value) {
        return 'Priority is required';
      }
      break;

    case 'subtotal':
      if (value === undefined || value === null || isNaN(value)) {
        return 'Subtotal is required';
      }
      if (value < 0) {
        return 'Subtotal cannot be negative';
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

    case 'discountTotal':
      if (value !== undefined && value !== null) {
        if (isNaN(value)) {
          return 'Invalid discount total';
        }
        if (value < 0) {
          return 'Discount total cannot be negative';
        }
        if (formData && value > formData.subtotal) {
          return 'Discount total cannot exceed subtotal';
        }
      }
      break;

    case 'taxTotal':
      if (value !== undefined && value !== null) {
        if (isNaN(value)) {
          return 'Invalid tax total';
        }
        if (value < 0) {
          return 'Tax total cannot be negative';
        }
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

    case 'shippingAddress':
    case 'billingAddress':
      if (value && value.length > 500) {
        return 'Address must be less than 500 characters';
      }
      break;
  }

  return null;
};

/**
 * Validate business logic rules for purchase orders
 */
export const validatePurchaseOrderBusinessRules = (
  formData: PurchaseOrderFormData
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

  // Warn for high-value orders
  if (formData.totalAmount > 10000000) {
    warnings.push('Order value exceeds 10,000,000 - please verify this is correct');
  }

  // Warn for urgent priority
  if (formData.priority === 'urgent') {
    warnings.push('This order is marked as urgent - please ensure priority is correct');
  }

  // Warn if delivery date is too close to order date
  if (formData.orderDate && formData.deliveryDate) {
    const orderDate = new Date(formData.orderDate);
    const deliveryDate = new Date(formData.deliveryDate);
    const diffDays = Math.ceil((deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      warnings.push('Delivery date is within 1 day of order date');
    }
  }

  // Warn for large number of items
  if (formData.items && formData.items.length > 50) {
    warnings.push('This order contains more than 50 items');
  }

  // Warn for cancelled status with items
  if (formData.status === 'cancelled' && formData.items && formData.items.length > 0) {
    warnings.push('Order is cancelled but still has items listed');
  }

  return warnings;
};

/**
 * Utility function to check if a field has an error
 */
export const hasPurchaseOrderFieldError = (
  errors: Record<string, string>,
  field: string
): boolean => {
  return field in errors;
};

/**
 * Utility function to get error message for a field
 */
export const getPurchaseOrderFieldError = (
  errors: Record<string, string>,
  field: string
): string | undefined => {
  return errors[field];
};