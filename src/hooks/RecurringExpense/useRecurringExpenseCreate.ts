// src/hooks/RecurringExpense/useRecurringExpenseCreate.ts

import { useState } from 'react';
import type{ RecurringExpenseFormData } from '../../types/RecurringExpense/RecurringExpenseType';

export const useRecurringExpenseCreate = () => {
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
    setFormData({
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
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: RecurringExpenseFormData) => Promise<any>) => {
    if (!validateForm()) {
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