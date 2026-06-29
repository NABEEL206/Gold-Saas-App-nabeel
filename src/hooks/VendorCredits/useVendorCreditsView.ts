// src/hooks/VendorCredits/useVendorCreditsView.ts

import { useState } from 'react';
import{ 
    VENDOR_CREDIT_REASON_LABELS,
    VENDOR_CREDIT_STATUS_COLORS,
  type VendorCredit, 
  VENDOR_CREDIT_STATUS_LABELS} from '../../types/VendorCredits/VendorCreditsType';

export const useVendorCreditsView = (credit: VendorCredit | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDisplayName = (): string => {
    if (!credit) return 'N/A';
    return credit.creditNumber || 'Unnamed Credit';
  };

  const getVendorName = (): string => {
    if (!credit) return 'N/A';
    return credit.vendorName || 'N/A';
  };

  const getStatusLabel = (): string => {
    if (!credit) return 'Unknown';
    return VENDOR_CREDIT_STATUS_LABELS[credit.status] || credit.status;
  };

  const getStatusColor = (): string => {
    if (!credit) return 'bg-gray-100 text-gray-800';
    return VENDOR_CREDIT_STATUS_COLORS[credit.status] || 'bg-gray-100 text-gray-800';
  };

  const getReasonLabel = (): string => {
    if (!credit) return 'Unknown';
    return VENDOR_CREDIT_REASON_LABELS[credit.reason] || credit.reason;
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const getItemCount = (): number => {
    if (!credit) return 0;
    return credit.items ? credit.items.length : 0;
  };

  const getTotalItems = (): number => {
    if (!credit) return 0;
    return credit.items ? credit.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  };

  const getUsageProgress = (): number => {
    if (!credit || credit.totalAmount === 0) return 0;
    return Math.round(((credit.usedAmount || 0) / credit.totalAmount) * 100);
  };

  const isExpired = (): boolean => {
    if (!credit) return false;
    if (!credit.expiryDate) return false;
    return new Date(credit.expiryDate) < new Date();
  };

  const getSummary = () => {
    if (!credit) return null;
    return {
      creditNumber: credit.creditNumber,
      vendorName: credit.vendorName,
      billNumber: credit.billNumber,
      totalAmount: credit.totalAmount,
      usedAmount: credit.usedAmount,
      balanceAmount: credit.balanceAmount,
      creditDate: credit.creditDate,
      reason: credit.reason,
      status: credit.status,
      expiryDate: credit.expiryDate
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getVendorName,
    getStatusLabel,
    getStatusColor,
    getReasonLabel,
    formatCurrency,
    getItemCount,
    getTotalItems,
    getUsageProgress,
    isExpired,
    getSummary,
    setIsLoading,
    setError
  };
};