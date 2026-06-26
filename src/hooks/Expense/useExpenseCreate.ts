// src/hooks/Expense/useExpenseCreate.ts

import { useState } from 'react';
import type{ ExpenseFormData, EXPENSE_CATEGORIES } from '../../types/Expense/ExpenseType';

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
    exchangeRate: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ExpenseFormData, value: any) => {
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
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vendorId) {
      newErrors.vendorId = 'Vendor is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.paymentStatus) {
      newErrors.paymentStatus = 'Payment status is required';
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
      exchangeRate: 1
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: ExpenseFormData) => Promise<any>) => {
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
        submit: error instanceof Error ? error.message : 'Failed to create expense'
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