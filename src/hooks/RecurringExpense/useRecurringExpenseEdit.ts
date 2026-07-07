// src/hooks/RecurringExpense/useRecurringExpenseEdit.ts

import { useState, useEffect, useCallback } from 'react';
import type { RecurringExpense, RecurringExpenseFormData } from '../../types/RecurringExpense/RecurringExpenseType';
import { 
  validateRecurringExpense, 
  validateRecurringExpenseField,
  validateRecurringExpenseBusinessRules 
} from '../../validations/recurringExpenseValidation';

export const useRecurringExpenseEdit = (expense: RecurringExpense | null) => {
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

  useEffect(() => {
    if (expense) {
      setFormData({
        vendorId: expense.vendorId || undefined,
        vendorName: expense.vendorName || undefined,
        category: expense.category || '',
        subCategory: expense.subCategory || undefined,
        amount: expense.amount || 0,
        taxAmount: expense.taxAmount || 0,
        totalAmount: expense.totalAmount || 0,
        startDate: expense.startDate || new Date().toISOString().split('T')[0],
        endDate: expense.endDate || undefined,
        description: expense.description || undefined,
        frequency: expense.frequency || 'monthly',
        frequencyInterval: expense.frequencyInterval || 1,
        frequencyUnit: expense.frequencyUnit || 'months',
        paymentMethod: expense.paymentMethod || 'bank',
        paymentStatus: expense.paymentStatus || 'active',
        referenceNumber: expense.referenceNumber || undefined,
        notes: expense.notes || undefined,
        isVendorExpense: expense.isVendorExpense || false,
        attachment: expense.attachment || undefined,
        currency: expense.currency || 'INR',
        exchangeRate: expense.exchangeRate || 1,
        totalOccurrences: expense.totalOccurrences || 12
      });
    }
  }, [expense]);

  const handleChange = useCallback((field: keyof RecurringExpenseFormData, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };

      // Real-time field validation using the validation file
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
    // Use the validation file's main validation function
    const { isValid, errors: validationErrors } = validateRecurringExpense(formData, isVendorExpense);
    setErrors(validationErrors);
    
    // Check business rules for warnings
    if (isValid) {
      const businessWarnings = validateRecurringExpenseBusinessRules(formData);
      setWarnings(businessWarnings);
    } else {
      setWarnings([]);
    }
    
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    if (expense) {
      setFormData({
        vendorId: expense.vendorId || undefined,
        vendorName: expense.vendorName || undefined,
        category: expense.category || '',
        subCategory: expense.subCategory || undefined,
        amount: expense.amount || 0,
        taxAmount: expense.taxAmount || 0,
        totalAmount: expense.totalAmount || 0,
        startDate: expense.startDate || new Date().toISOString().split('T')[0],
        endDate: expense.endDate || undefined,
        description: expense.description || undefined,
        frequency: expense.frequency || 'monthly',
        frequencyInterval: expense.frequencyInterval || 1,
        frequencyUnit: expense.frequencyUnit || 'months',
        paymentMethod: expense.paymentMethod || 'bank',
        paymentStatus: expense.paymentStatus || 'active',
        referenceNumber: expense.referenceNumber || undefined,
        notes: expense.notes || undefined,
        isVendorExpense: expense.isVendorExpense || false,
        attachment: expense.attachment || undefined,
        currency: expense.currency || 'INR',
        exchangeRate: expense.exchangeRate || 1,
        totalOccurrences: expense.totalOccurrences || 12
      });
    }
    setErrors({});
    setWarnings([]);
    setIsSubmitting(false);
  }, [expense]);

  const handleSubmit = useCallback(async (
    submitFn: (id: string | number, data: RecurringExpenseFormData) => Promise<any>,
    isVendorExpense: boolean = false
  ) => {
    if (!validateForm(isVendorExpense) || !expense) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(expense.id, formData);
      return true;
    } catch (error) {
      console.error('Error updating recurring expense:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update recurring expense'
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, expense]);

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