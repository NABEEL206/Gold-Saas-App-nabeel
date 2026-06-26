// src/hooks/RecurringExpense/useRecurringExpenseView.ts

import { useState } from 'react';
import{ type RecurringExpense, FREQUENCY_LABELS } from '../../types/RecurringExpense/RecurringExpenseType';

export const useRecurringExpenseView = (expense: RecurringExpense | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDisplayName = (): string => {
    if (!expense) return 'N/A';
    return expense.recurringNumber || 'Unnamed Recurring Expense';
  };

  const getVendorName = (): string => {
    if (!expense) return 'N/A';
    return expense.vendorName || 'N/A';
  };

  const getCategory = (): string => {
    if (!expense) return 'N/A';
    return expense.category || 'Uncategorized';
  };

  const getFrequencyLabel = (): string => {
    if (!expense) return 'N/A';
    return FREQUENCY_LABELS[expense.frequency] || expense.frequency;
  };

  const getStatusColor = (): string => {
    if (!expense) return 'bg-gray-100 text-gray-800';
    switch (expense.paymentStatus) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (): string => {
    if (!expense) return 'Unknown';
    return expense.paymentStatus.charAt(0).toUpperCase() + expense.paymentStatus.slice(1);
  };

  const getPaymentMethodLabel = (): string => {
    if (!expense) return 'Unknown';
    const methods: Record<string, string> = {
      cash: 'Cash',
      bank: 'Bank Transfer',
      credit_card: 'Credit Card',
      cheque: 'Cheque',
      auto_debit: 'Auto Debit'
    };
    return methods[expense.paymentMethod] || expense.paymentMethod || 'Unknown';
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const getNextProcessingDate = (): string => {
    if (!expense) return 'N/A';
    if (expense.nextProcessingDate) {
      return new Date(expense.nextProcessingDate).toLocaleDateString();
    }
    return 'Not scheduled';
  };

  const getProgress = (): number => {
    if (!expense || !expense.totalOccurrences) return 0;
    return Math.round(((expense.processedOccurrences || 0) / expense.totalOccurrences) * 100);
  };

  const getSummary = () => {
    if (!expense) return null;
    return {
      recurringNumber: expense.recurringNumber,
      vendorName: expense.vendorName,
      category: expense.category,
      amount: expense.amount,
      totalAmount: expense.totalAmount,
      frequency: expense.frequency,
      startDate: expense.startDate,
      endDate: expense.endDate,
      paymentStatus: expense.paymentStatus,
      paymentMethod: expense.paymentMethod,
      description: expense.description,
      nextProcessingDate: expense.nextProcessingDate,
      processedOccurrences: expense.processedOccurrences,
      totalOccurrences: expense.totalOccurrences
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getVendorName,
    getCategory,
    getFrequencyLabel,
    getStatusColor,
    getStatusLabel,
    getPaymentMethodLabel,
    formatCurrency,
    getNextProcessingDate,
    getProgress,
    getSummary,
    setIsLoading,
    setError
  };
};