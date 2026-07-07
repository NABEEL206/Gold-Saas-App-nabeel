// src/hooks/RecurringExpense/useRecurringExpenseCreate.ts

import { useState, useCallback } from 'react';
import type { RecurringExpenseFormData } from '../../types/RecurringExpense/RecurringExpenseType';
import { 
  validateRecurringExpense, 
  validateRecurringExpenseField,
  validateRecurringExpenseBusinessRules 
} from '../../validations/recurringExpenseValidation';

export const useRecurringExpenseCreate = () => {
  const [formData, setFormData] = useState<RecurringExpenseFormData>({
    vendorId: undefined,
    vendorName: undefined,
    category: '',
    subCategory: undefined,
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
    description: undefined,
    frequency: 'monthly',
    frequencyInterval: 1,
    frequencyUnit: 'months',
    paymentMethod: 'bank',
    paymentStatus: 'active',
    referenceNumber: undefined,
    notes: undefined,
    isVendorExpense: false,
    attachment: undefined,
    currency: 'INR',
    exchangeRate: 1,
    totalOccurrences: 12
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof RecurringExpenseFormData, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };

      // Real-time field validation
      const fieldError = validateRecurringExpenseField(field, value, newFormData);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (fieldError) {
          newErrors[field] = fieldError;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });

      return newFormData;
    });
  }, []);

  const validateForm = useCallback((isVendorExpense: boolean = false): boolean => {
    const { isValid, errors: validationErrors } = validateRecurringExpense(formData, isVendorExpense);
    setErrors(validationErrors);
    
    // Check business rules
    if (isValid) {
      const businessWarnings = validateRecurringExpenseBusinessRules(formData);
      setWarnings(businessWarnings);
    } else {
      setWarnings([]);
    }
    
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      vendorId: undefined,
      vendorName: undefined,
      category: '',
      subCategory: undefined,
      amount: 0,
      taxAmount: 0,
      totalAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: undefined,
      description: undefined,
      frequency: 'monthly',
      frequencyInterval: 1,
      frequencyUnit: 'months',
      paymentMethod: 'bank',
      paymentStatus: 'active',
      referenceNumber: undefined,
      notes: undefined,
      isVendorExpense: false,
      attachment: undefined,
      currency: 'INR',
      exchangeRate: 1,
      totalOccurrences: 12
    });
    setErrors({});
    setWarnings([]);
    setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (
    submitFn: (data: RecurringExpenseFormData) => Promise<any>,
    isVendorExpense: boolean = false
  ) => {
    if (!validateForm(isVendorExpense)) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(formData);
      resetForm();
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to create recurring expense'
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, resetForm]);

  return {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleSubmit,
    validateForm,
    resetForm,
    setFormData,
    setErrors,
    setWarnings
  };
};