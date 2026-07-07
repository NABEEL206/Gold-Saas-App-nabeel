// src/hooks/Expense/useExpenseEdit.ts

import { useState, useEffect, useCallback } from 'react';
import type { Expense, ExpenseFormData } from '../../types/Expense/ExpenseType';
import { 
  validateExpenseForm, 
  formatValidationErrors,
  hasValidationErrors,
  getErrorCount,
  getFirstError
} from '../../validations/expense.validation';

export const useExpenseEdit = (expense: Expense | null) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    vendorId: '',
    vendorName: '',
    category: '',
    subCategory: '',
    expenseAccount: '',
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
    currency: 'INR',
    exchangeRate: 1,
    isVendorExpense: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load expense data when expense prop changes
  useEffect(() => {
    if (expense) {
      setFormData({
        vendorId: expense.vendorId || '',
        vendorName: expense.vendorName || '',
        category: expense.category || '',
        subCategory: expense.subCategory || '',
        expenseAccount: expense.expenseAccount || '',
        amount: expense.amount || 0,
        taxAmount: expense.taxAmount || 0,
        totalAmount: expense.totalAmount || 0,
        date: expense.date || new Date().toISOString().split('T')[0],
        dueDate: expense.dueDate || '',
        description: expense.description || '',
        paymentMethod: expense.paymentMethod || 'bank',
        paymentStatus: expense.paymentStatus || 'unpaid',
        referenceNumber: expense.referenceNumber || '',
        attachment: expense.attachment || '',
        notes: expense.notes || '',
        receiptNumber: expense.receiptNumber || '',
        billNumber: expense.billNumber || '',
        currency: expense.currency || 'INR',
        exchangeRate: expense.exchangeRate || 1,
        isVendorExpense: !!expense.vendorId || !!expense.vendorName
      });
    }
  }, [expense]);

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
    if (expense) {
      setFormData({
        vendorId: expense.vendorId || '',
        vendorName: expense.vendorName || '',
        category: expense.category || '',
        subCategory: expense.subCategory || '',
        expenseAccount: expense.expenseAccount || '',
        amount: expense.amount || 0,
        taxAmount: expense.taxAmount || 0,
        totalAmount: expense.totalAmount || 0,
        date: expense.date || new Date().toISOString().split('T')[0],
        dueDate: expense.dueDate || '',
        description: expense.description || '',
        paymentMethod: expense.paymentMethod || 'bank',
        paymentStatus: expense.paymentStatus || 'unpaid',
        referenceNumber: expense.referenceNumber || '',
        attachment: expense.attachment || '',
        notes: expense.notes || '',
        receiptNumber: expense.receiptNumber || '',
        billNumber: expense.billNumber || '',
        currency: expense.currency || 'INR',
        exchangeRate: expense.exchangeRate || 1,
        isVendorExpense: !!expense.vendorId || !!expense.vendorName
      });
    }
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [expense]);

  // Handle form submission
  const handleSubmit = useCallback(async (
    submitFn: (id: string | number, data: ExpenseFormData) => Promise<any>
  ): Promise<boolean> => {
    if (!validateForm() || !expense) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(expense.id, formData);
      return true;
    } catch (error) {
      console.error('Error updating expense:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update expense'
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, expense]);

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