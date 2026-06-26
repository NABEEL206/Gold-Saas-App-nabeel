// src/hooks/Bill/useBillView.ts

import { useState } from 'react';
import{ BILL_STATUS_COLORS, type Bill, BILL_STATUS_LABELS } from '../../types/Bill/BillTypes';

export const useBillView = (bill: Bill | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDisplayName = (): string => {
    if (!bill) return 'N/A';
    return bill.billNumber || 'Unnamed Bill';
  };

  const getVendorName = (): string => {
    if (!bill) return 'N/A';
    return bill.vendorName || 'N/A';
  };

  const getStatusLabel = (): string => {
    if (!bill) return 'Unknown';
    return BILL_STATUS_LABELS[bill.status] || bill.status;
  };

  const getStatusColor = (): string => {
    if (!bill) return 'bg-gray-100 text-gray-800';
    return BILL_STATUS_COLORS[bill.status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const getItemCount = (): number => {
    if (!bill) return 0;
    return bill.items ? bill.items.length : 0;
  };

  const getTotalItems = (): number => {
    if (!bill) return 0;
    return bill.items ? bill.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  };

  const isOverdue = (): boolean => {
    if (!bill) return false;
    if (bill.status === 'paid' || bill.status === 'cancelled') return false;
    if (!bill.dueDate) return false;
    return new Date(bill.dueDate) < new Date();
  };

  const getDaysOverdue = (): number => {
    if (!bill || !isOverdue()) return 0;
    const dueDate = new Date(bill.dueDate!);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPaymentProgress = (): number => {
    if (!bill || bill.totalAmount === 0) return 0;
    return Math.round((bill.paidAmount / bill.totalAmount) * 100);
  };

  const getSummary = () => {
    if (!bill) return null;
    return {
      billNumber: bill.billNumber,
      vendorName: bill.vendorName,
      billDate: bill.billDate,
      dueDate: bill.dueDate,
      status: bill.status,
      totalAmount: bill.totalAmount,
      paidAmount: bill.paidAmount,
      balanceDue: bill.balanceDue,
      itemCount: getItemCount(),
      totalItems: getTotalItems()
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getVendorName,
    getStatusLabel,
    getStatusColor,
    formatCurrency,
    getItemCount,
    getTotalItems,
    isOverdue,
    getDaysOverdue,
    getPaymentProgress,
    getSummary,
    setIsLoading,
    setError
  };
};