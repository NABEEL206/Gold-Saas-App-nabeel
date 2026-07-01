// src/hooks/ChartOfAccounts/useChartOfAccountsView.ts

import { useState } from 'react';
import { 
  type ChartOfAccount, 
  ACCOUNT_TYPE_LABELS, 
  ACCOUNT_TYPE_COLORS,
  ACCOUNT_TYPE_BADGE_COLORS
} from '../../types/ChartOfAccounts/ChartOfAccountsType';

export const useChartOfAccountsView = (account: ChartOfAccount | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDisplayName = (): string => {
    if (!account) return 'N/A';
    return account.name || 'Unnamed Account';
  };

  const getTypeLabel = (): string => {
    if (!account) return 'N/A';
    return ACCOUNT_TYPE_LABELS[account.type] || account.type;
  };

  const getTypeColor = (): string => {
    if (!account) return 'text-gray-600';
    return ACCOUNT_TYPE_COLORS[account.type] || 'text-gray-600';
  };

  const getTypeBadgeColor = (): string => {
    if (!account) return 'bg-gray-100 text-gray-700';
    return ACCOUNT_TYPE_BADGE_COLORS[account.type] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const getStatusBadge = (): { label: string; color: string } => {
    if (!account) return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
    if (account.isActive) {
      return { label: 'Active', color: 'bg-green-100 text-green-700' };
    }
    return { label: 'Inactive', color: 'bg-red-100 text-red-700' };
  };

  const getSystemBadge = (): { label: string; color: string } => {
    if (!account) return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' };
    if (account.isSystemAccount) {
      return { label: 'System', color: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Custom', color: 'bg-purple-100 text-purple-700' };
  };

  const getSummary = () => {
    if (!account) return null;
    return {
      code: account.code,
      name: account.name,
      type: account.type,
      category: account.category,
      subCategory: account.subCategory,
      description: account.description,
      isActive: account.isActive,
      isSystemAccount: account.isSystemAccount,
      openingBalance: account.openingBalance,
      currentBalance: account.currentBalance
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getTypeLabel,
    getTypeColor,
    getTypeBadgeColor,
    formatCurrency,
    getStatusBadge,
    getSystemBadge,
    getSummary,
    setIsLoading,
    setError
  };
};