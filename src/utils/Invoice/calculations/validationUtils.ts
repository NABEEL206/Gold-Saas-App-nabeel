// src/utils/calculations/validationUtils.ts
// Validation utilities for invoice items

export const validateInvoiceItems = (items: any[]): {
  isValid: boolean;
  errors: Array<{ index: number; field: string; message: string }>;
} => {
  const errors: Array<{ index: number; field: string; message: string }> = [];

  items.forEach((item, index) => {
    if (!item.productName || item.productName.trim() === '') {
      errors.push({
        index,
        field: 'productName',
        message: 'Product name is required',
      });
    }

    if (Number(item.quantity) <= 0) {
      errors.push({
        index,
        field: 'quantity',
        message: 'Quantity must be greater than 0',
      });
    }

    if (Number(item.rate) < 0) {
      errors.push({
        index,
        field: 'rate',
        message: 'Rate cannot be negative',
      });
    }

    if (Number(item.discount) < 0) {
      errors.push({
        index,
        field: 'discount',
        message: 'Discount cannot be negative',
      });
    }

    if (Number(item.taxRate) < 0) {
      errors.push({
        index,
        field: 'taxRate',
        message: 'Tax rate cannot be negative',
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateOldGoldItems = (items: any[]): {
  isValid: boolean;
  errors: Array<{ index: number; field: string; message: string }>;
} => {
  const errors: Array<{ index: number; field: string; message: string }> = [];

  items.forEach((item, index) => {
    if (!item.description || item.description.trim() === '') {
      errors.push({
        index,
        field: 'description',
        message: 'Description is required',
      });
    }

    if (Number(item.grossWt) <= 0) {
      errors.push({
        index,
        field: 'grossWt',
        message: 'Gross weight must be greater than 0',
      });
    }

    if (Number(item.lessWastage) < 0) {
      errors.push({
        index,
        field: 'lessWastage',
        message: 'Less wastage cannot be negative',
      });
    }

    if (Number(item.rate) < 0) {
      errors.push({
        index,
        field: 'rate',
        message: 'Rate cannot be negative',
      });
    }

    if (Number(item.lessWastage) >= Number(item.grossWt)) {
      errors.push({
        index,
        field: 'lessWastage',
        message: 'Less wastage must be less than gross weight',
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};