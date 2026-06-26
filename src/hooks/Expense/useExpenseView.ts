// src/hooks/Expense/useExpenseView.ts

import { useState } from 'react';
import type{ Expense } from '../../types/Expense/ExpenseType';

export const useExpenseView = (expense: Expense | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get display name
  const getDisplayName = (): string => {
    if (!expense) return 'N/A';
    return expense.expenseNumber || 'Unnamed Expense';
  };

  // Get vendor name
  const getVendorName = (): string => {
    if (!expense) return 'N/A';
    return expense.vendorName || 'Unknown Vendor';
  };

  // Get category
  const getCategory = (): string => {
    if (!expense) return 'N/A';
    return expense.category || 'Uncategorized';
  };

  // Get status badge color
  const getStatusColor = (): string => {
    if (!expense) return 'bg-gray-100 text-gray-800';
    switch (expense.paymentStatus) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (): string => {
    if (!expense) return 'Unknown';
    return expense.paymentStatus ? expense.paymentStatus.charAt(0).toUpperCase() + expense.paymentStatus.slice(1) : 'Unknown';
  };

  // Get payment method label
  const getPaymentMethodLabel = (): string => {
    if (!expense) return 'Unknown';
    const methods: Record<string, string> = {
      cash: 'Cash',
      bank: 'Bank Transfer',
      credit_card: 'Credit Card',
      cheque: 'Cheque'
    };
    return methods[expense.paymentMethod] || expense.paymentMethod || 'Unknown';
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  // Get summary
  const getSummary = () => {
    if (!expense) return null;
    return {
      expenseNumber: expense.expenseNumber,
      vendorName: expense.vendorName,
      category: expense.category,
      amount: expense.amount,
      totalAmount: expense.totalAmount,
      date: expense.date,
      paymentStatus: expense.paymentStatus,
      paymentMethod: expense.paymentMethod,
      description: expense.description
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getVendorName,
    getCategory,
    getStatusColor,
    getStatusLabel,
    getPaymentMethodLabel,
    formatCurrency,
    getSummary,
    setIsLoading,
    setError
  };
};