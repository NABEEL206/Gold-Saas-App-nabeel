// src/hooks/Expense/useExpenseView.ts

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Expense } from '../../types/Expense/ExpenseType';
import { 
  validateExpenseForm, 
  formatValidationErrors,
  hasValidationErrors,
  getErrorCount,
  getValidationSummary as getValidationSummaryUtil
} from '../../validations/expense.validation';

export const useExpenseView = (expense: Expense | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidated, setIsValidated] = useState(false);

  // Validate expense when it changes
  useEffect(() => {
    if (expense) {
      const validationResult = validateExpenseForm(expense as any);
      if (!validationResult.isValid) {
        const formattedErrors = formatValidationErrors(validationResult.errors);
        setValidationErrors(formattedErrors);
        setIsValidated(false);
      } else {
        setValidationErrors({});
        setIsValidated(true);
      }
    } else {
      setValidationErrors({});
      setIsValidated(false);
    }
  }, [expense]);

  // Get display name
  const getDisplayName = useCallback((): string => {
    if (!expense) return 'N/A';
    return expense.expenseNumber || 'Unnamed Expense';
  }, [expense]);

  // Get vendor name
  const getVendorName = useCallback((): string => {
    if (!expense) return 'N/A';
    return expense.vendorName || 'Unknown Vendor';
  }, [expense]);

  // Get category
  const getCategory = useCallback((): string => {
    if (!expense) return 'N/A';
    return expense.category || 'Uncategorized';
  }, [expense]);

  // Get expense account
  const getExpenseAccount = useCallback((): string => {
    if (!expense) return 'N/A';
    return expense.expenseAccount || 'Not Assigned';
  }, [expense]);

  // Get status badge color
  const getStatusColor = useCallback((): string => {
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
  }, [expense]);

  // Get status label
  const getStatusLabel = useCallback((): string => {
    if (!expense) return 'Unknown';
    return expense.paymentStatus ? expense.paymentStatus.charAt(0).toUpperCase() + expense.paymentStatus.slice(1) : 'Unknown';
  }, [expense]);

  // Get payment method label
  const getPaymentMethodLabel = useCallback((): string => {
    if (!expense) return 'Unknown';
    const methods: Record<string, string> = {
      cash: 'Cash',
      bank: 'Bank Transfer',
      credit_card: 'Credit Card',
      cheque: 'Cheque',
      online: 'Online'
    };
    return methods[expense.paymentMethod] || expense.paymentMethod || 'Unknown';
  }, [expense]);

  // Format currency
  const formatCurrency = useCallback((amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  }, []);

  // Check if expense is complete
  const isComplete = useMemo((): boolean => {
    if (!expense) return false;
    return !!(expense.category && expense.amount > 0 && expense.date && expense.paymentMethod && expense.paymentStatus);
  }, [expense]);

  // Check if expense data is valid
  const isValid = useMemo((): boolean => {
    return isValidated && Object.keys(validationErrors).length === 0;
  }, [isValidated, validationErrors]);

  // Get validation error count
  const getValidationErrorCount = useMemo((): number => {
    return Object.keys(validationErrors).length;
  }, [validationErrors]);

  // Get validation summary
  const getValidationSummary = useMemo((): string => {
    const count = getValidationErrorCount;
    if (count === 0) return 'Expense data is valid';
    return `Expense has ${count} validation issue${count > 1 ? 's' : ''}`;
  }, [getValidationErrorCount]);

  // Get summary
  const getSummary = useMemo(() => {
    if (!expense) return null;
    return {
      expenseNumber: expense.expenseNumber,
      vendorName: expense.vendorName,
      category: expense.category,
      expenseAccount: expense.expenseAccount,
      amount: expense.amount,
      totalAmount: expense.totalAmount,
      date: expense.date,
      paymentStatus: expense.paymentStatus,
      paymentMethod: expense.paymentMethod,
      description: expense.description,
      isValid: isValid,
      validationErrors: validationErrors,
      validationSummary: getValidationSummary
    };
  }, [expense, isValid, validationErrors, getValidationSummary]);

  // Clear validation errors
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
    setIsValidated(false);
  }, []);

  // Revalidate expense
  const revalidateExpense = useCallback((expenseData: Expense) => {
    const validationResult = validateExpenseForm(expenseData as any);
    if (!validationResult.isValid) {
      const formattedErrors = formatValidationErrors(validationResult.errors);
      setValidationErrors(formattedErrors);
      setIsValidated(false);
      return false;
    }

    setValidationErrors({});
    setIsValidated(true);
    return true;
  }, []);

  return {
    isLoading,
    error,
    validationErrors,
    isValid,
    isValidated,
    getValidationErrorCount,
    getValidationSummary,
    getDisplayName,
    getVendorName,
    getCategory,
    getExpenseAccount,
    getStatusColor,
    getStatusLabel,
    getPaymentMethodLabel,
    formatCurrency,
    isComplete,
    getSummary,
    setIsLoading,
    setError,
    clearValidationErrors,
    revalidateExpense
  };
};