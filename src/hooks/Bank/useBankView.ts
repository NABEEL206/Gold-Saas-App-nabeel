// src/hooks/Bank/useBankView.ts

import { useState } from 'react';
import{ 
  type Bank, 
  BANK_ACCOUNT_TYPE_LABELS, 
  BANK_STATUS_COLORS, 
  BANK_STATUS_LABELS} from '../../types/Bank/BankTypes';

export const useBankView = (bank: Bank | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDisplayName = (): string => {
    if (!bank) return 'N/A';
    return bank.bankName || 'Unnamed Bank';
  };

  const getAccountTypeLabel = (): string => {
    if (!bank) return 'N/A';
    return BANK_ACCOUNT_TYPE_LABELS[bank.accountType] || bank.accountType;
  };

  const getStatusLabel = (): string => {
    if (!bank) return 'Unknown';
    return BANK_STATUS_LABELS[bank.status] || bank.status;
  };

  const getStatusColor = (): string => {
    if (!bank) return 'bg-gray-100 text-gray-800';
    return BANK_STATUS_COLORS[bank.status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const getFullAddress = (): string => {
    if (!bank) return 'N/A';
    const parts = [
      bank.branchAddress,
      bank.city,
      bank.state,
      bank.pincode,
      bank.country
    ].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };

  const getSummary = () => {
    if (!bank) return null;
    return {
      bankName: bank.bankName,
      accountName: bank.accountName,
      accountNumber: bank.accountNumber,
      accountType: bank.accountType,
      ifscCode: bank.ifscCode,
      branchName: bank.branchName,
      openingBalance: bank.openingBalance,
      currentBalance: bank.currentBalance,
      status: bank.status
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getAccountTypeLabel,
    getStatusLabel,
    getStatusColor,
    formatCurrency,
    getFullAddress,
    getSummary,
    setIsLoading,
    setError
  };
};