// src/hooks/Expense/useExpenseEdit.ts

import { useState, useEffect } from 'react';
import type{ Expense, ExpenseFormData } from '../../types/Expense/ExpenseType';

export const useExpenseEdit = (expense: Expense | null) => {
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

  // Load expense data when expense prop changes
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
        currency: expense.currency || 'USD',
        exchangeRate: expense.exchangeRate || 1
      });
    }
  }, [expense]);

  const handleChange = (field: keyof ExpenseFormData, value: any) => {
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
    if (expense) {
      setFormData({
        vendorId: expense.vendorId || '',
        vendorName: expense.vendorName || '',
        category: expense.category || '',
        subCategory: expense.subCategory || '',
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
        currency: expense.currency || 'USD',
        exchangeRate: expense.exchangeRate || 1
      });
    }
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (id: string | number, data: ExpenseFormData) => Promise<any>) => {
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