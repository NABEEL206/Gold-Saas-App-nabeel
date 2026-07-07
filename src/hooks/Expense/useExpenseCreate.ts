// src/hooks/Expense/useExpenseCreate.ts

import { useState, useCallback } from 'react';
import type { ExpenseFormData } from '../../types/Expense/ExpenseType';
import { 
  validateExpenseForm, 
  formatValidationErrors, 
  hasValidationErrors,
  getErrorCount,
  getFirstError
} from '../../validations/expense.validation';

export const useExpenseCreate = () => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    vendorId: '',
    vendorName: '',
    category: '',
    subCategory: '',
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    description: '',
    paymentMethod: 'bank',
    paymentStatus: 'unpaid',
    referenceNumber: '',
    attachment: '',
    notes: '',
    receiptNumber: '',
    billNumber: '',
    currency: 'USD',
    exchangeRate: 1,
    isVendorExpense: false,
    expenseAccount: '' // Add new field
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle field change with real-time validation
  const handleChange = useCallback((field: keyof ExpenseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate field if it's touched
    if (touched[field]) {
      const validationResult = validateExpenseForm({
        ...formData,
        [field]: value
      } as ExpenseFormData);
      
      const fieldError = validationResult.errors[field];
      if (fieldError) {
        setErrors(prev => ({
          ...prev,
          [field]: fieldError
        }));
      }
    }
  }, [formData, errors, touched]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const validationResult = validateExpenseForm(formData);
    const newErrors = formatValidationErrors(validationResult.errors);
    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    return validationResult.isValid;
  }, [formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      vendorId: '',
      vendorName: '',
      category: '',
      subCategory: '',
      amount: 0,
      taxAmount: 0,
      totalAmount: 0,
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      description: '',
      paymentMethod: 'bank',
      paymentStatus: 'unpaid',
      referenceNumber: '',
      attachment: '',
      notes: '',
      receiptNumber: '',
      billNumber: '',
      currency: 'USD',
      exchangeRate: 1,
      isVendorExpense: false,
      expenseAccount: ''
    });
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (
    submitFn: (data: ExpenseFormData) => Promise<any>
  ): Promise<boolean> => {
    if (!validateForm()) {
      // Error will be shown by parent component
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
        submit: error instanceof Error ? error.message : 'Failed to create expense'
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, resetForm]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Clear specific field error
  const clearFieldError = useCallback((field: keyof ExpenseFormData) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // Get validation status
  const getValidationStatus = useCallback(() => {
    const result = validateExpenseForm(formData);
    return {
      isValid: result.isValid,
      errorCount: getErrorCount(result.errors),
      hasErrors: hasValidationErrors(result.errors),
      errors: result.errors
    };
  }, [formData]);

  return {
    formData,
    errors,
    isSubmitting,
    touched,
    handleChange,
    handleSubmit,
    resetForm,
    validateForm,
    clearErrors,
    clearFieldError,
    setFormData,
    setErrors,
    getValidationStatus
  };
};