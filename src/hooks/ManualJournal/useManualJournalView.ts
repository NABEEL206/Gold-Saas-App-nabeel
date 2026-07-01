// src/hooks/ManualJournal/useManualJournalView.ts

import { useState } from 'react';
import{ 
    MANUAL_JOURNAL_STATUS_COLORS,
  type ManualJournal, 
  MANUAL_JOURNAL_STATUS_LABELS} from '../../types/ManualJournal/ManualJournalType';

export const useManualJournalView = (journal: ManualJournal | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDisplayName = (): string => {
    if (!journal) return 'N/A';
    return journal.journalNumber || 'Unnamed Journal';
  };

  const getStatusLabel = (): string => {
    if (!journal) return 'Unknown';
    return MANUAL_JOURNAL_STATUS_LABELS[journal.status] || journal.status;
  };

  const getStatusColor = (): string => {
    if (!journal) return 'bg-gray-100 text-gray-800';
    return MANUAL_JOURNAL_STATUS_COLORS[journal.status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const getEntryCount = (): number => {
    if (!journal) return 0;
    return journal.entries ? journal.entries.length : 0;
  };

  const isBalanced = (): boolean => {
    if (!journal) return false;
    return journal.totalDebit === journal.totalCredit;
  };

  const getSummary = () => {
    if (!journal) return null;
    return {
      journalNumber: journal.journalNumber,
      journalDate: journal.journalDate,
      description: journal.description,
      status: journal.status,
      totalDebit: journal.totalDebit,
      totalCredit: journal.totalCredit,
      entryCount: getEntryCount(),
      isBalanced: isBalanced(),
      referenceNumber: journal.referenceNumber
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getStatusLabel,
    getStatusColor,
    formatCurrency,
    getEntryCount,
    isBalanced,
    getSummary,
    setIsLoading,
    setError
  };
};