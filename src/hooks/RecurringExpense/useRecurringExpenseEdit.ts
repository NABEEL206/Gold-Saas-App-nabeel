// src/hooks/RecurringExpense/useRecurringExpenseEdit.ts

import { useState, useEffect } from 'react';
import type{ RecurringExpense, RecurringExpenseFormData } from '../../types/RecurringExpense/RecurringExpenseType';

export const useRecurringExpenseEdit = (expense: RecurringExpense | null) => {
  const [formData, setFormData] = useState<RecurringExpenseFormData>({
    vendorId: '',
    vendorName: '',
    category: '',
    subCategory: '',
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    frequency: 'monthly',
    frequencyInterval: 1,
    frequencyUnit: 'months',
    paymentMethod: 'bank',
    paymentStatus: 'active',
    referenceNumber: '',
    notes: '',
    isVendorExpense: false,
    attachment: '',
    currency: 'INR',
    exchangeRate: 1,
    totalOccurrences: 12
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        vendorId: expense.vendorId || '',
        vendorName: expense.vendorName || '',
        category: expense.category || '',
        subCategory: expense.subCategory || '',
        amount: expense.amount || 0,
        taxAmount: expense.taxAmount || 0,
        totalAmount: expense.totalAmount || 0,
        startDate: expense.startDate || new Date().toISOString().split('T')[0],
        endDate: expense.endDate || '',
        description: expense.description || '',
        frequency: expense.frequency || 'monthly',
        frequencyInterval: expense.frequencyInterval || 1,
        frequencyUnit: expense.frequencyUnit || 'months',
        paymentMethod: expense.paymentMethod || 'bank',
        paymentStatus: expense.paymentStatus || 'active',
        referenceNumber: expense.referenceNumber || '',
        notes: expense.notes || '',
        isVendorExpense: expense.isVendorExpense || false,
        attachment: expense.attachment || '',
        currency: expense.currency || 'INR',
        exchangeRate: expense.exchangeRate || 1,
        totalOccurrences: expense.totalOccurrences || 12
      });
    }
  }, [expense]);

  const handleChange = (field: keyof RecurringExpenseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.frequency) {
      newErrors.frequency = 'Frequency is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    if (expense) {
      setFormData({
        vendorId: expense.vendorId || '',
        vendorName: expense.vendorName || '',
        category: expense.category || '',
        subCategory: expense.subCategory || '',
        amount: expense.amount || 0,
        taxAmount: expense.taxAmount || 0,
        totalAmount: expense.totalAmount || 0,
        startDate: expense.startDate || new Date().toISOString().split('T')[0],
        endDate: expense.endDate || '',
        description: expense.description || '',
        frequency: expense.frequency || 'monthly',
        frequencyInterval: expense.frequencyInterval || 1,
        frequencyUnit: expense.frequencyUnit || 'months',
        paymentMethod: expense.paymentMethod || 'bank',
        paymentStatus: expense.paymentStatus || 'active',
        referenceNumber: expense.referenceNumber || '',
        notes: expense.notes || '',
        isVendorExpense: expense.isVendorExpense || false,
        attachment: expense.attachment || '',
        currency: expense.currency || 'INR',
        exchangeRate: expense.exchangeRate || 1,
        totalOccurrences: expense.totalOccurrences || 12
      });
    }
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (id: string | number, data: RecurringExpenseFormData) => Promise<any>) => {
    if (!validateForm() || !expense) {
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
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors
  };
};