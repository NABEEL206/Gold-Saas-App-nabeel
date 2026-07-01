// src/hooks/ManualJournal/useManualJournal.ts

import { useState, useEffect, useCallback } from 'react';
import type{
  ManualJournal,
  ManualJournalFilters,
  ManualJournalResponse,
  ManualJournalStats,
  MANUAL_JOURNAL_STATUSES,
  CHART_OF_ACCOUNTS
} from '../../types/ManualJournal/ManualJournalType';

// Dummy data
const DUMMY_JOURNALS: ManualJournal[] = [
  {
    id: 1,
    journalNumber: 'MJ-2024-001',
    journalDate: '2024-01-15',
    description: 'Monthly rent adjustment entry',
    entries: [
      {
        accountId: '5010',
        accountName: 'Rent Expense',
        accountCode: '5010',
        debitAmount: 50000,
        creditAmount: 0,
        description: 'Office rent for January'
      },
      {
        accountId: '1000',
        accountName: 'Cash',
        accountCode: '1000',
        debitAmount: 0,
        creditAmount: 50000,
        description: 'Cash payment for rent'
      }
    ],
    totalDebit: 50000,
    totalCredit: 50000,
    status: 'posted',
    referenceNumber: 'REF-001',
    notes: 'Monthly rent paid',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    postedAt: '2024-01-15'
  },
  {
    id: 2,
    journalNumber: 'MJ-2024-002',
    journalDate: '2024-01-20',
    description: 'Salary accrual entry',
    entries: [
      {
        accountId: '5010',
        accountName: 'Salaries Expense',
        accountCode: '5010',
        debitAmount: 150000,
        creditAmount: 0,
        description: 'Monthly salaries'
      },
      {
        accountId: '2010',
        accountName: 'Accrued Expenses',
        accountCode: '2010',
        debitAmount: 0,
        creditAmount: 150000,
        description: 'Salary accrual'
      }
    ],
    totalDebit: 150000,
    totalCredit: 150000,
    status: 'pending',
    referenceNumber: 'REF-002',
    notes: 'Salary accrual for approval',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    journalNumber: 'MJ-2024-003',
    journalDate: '2024-02-01',
    description: 'Depreciation entry',
    entries: [
      {
        accountId: '5050',
        accountName: 'Depreciation Expense',
        accountCode: '5050',
        debitAmount: 25000,
        creditAmount: 0,
        description: 'Monthly depreciation'
      },
      {
        accountId: '1060',
        accountName: 'Accumulated Depreciation',
        accountCode: '1060',
        debitAmount: 0,
        creditAmount: 25000,
        description: 'Accumulated depreciation'
      }
    ],
    totalDebit: 25000,
    totalCredit: 25000,
    status: 'draft',
    referenceNumber: 'REF-003',
    notes: 'Draft depreciation entry',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 4,
    journalNumber: 'MJ-2024-004',
    journalDate: '2024-02-10',
    description: 'Bank loan payment entry',
    entries: [
      {
        accountId: '2030',
        accountName: 'Loans Payable',
        accountCode: '2030',
        debitAmount: 100000,
        creditAmount: 0,
        description: 'Loan installment'
      },
      {
        accountId: '1010',
        accountName: 'Bank',
        accountCode: '1010',
        debitAmount: 0,
        creditAmount: 100000,
        description: 'Bank payment'
      },
      {
        accountId: '5060',
        accountName: 'Interest Expense',
        accountCode: '5060',
        debitAmount: 5000,
        creditAmount: 0,
        description: 'Interest on loan'
      },
      {
        accountId: '1010',
        accountName: 'Bank',
        accountCode: '1010',
        debitAmount: 0,
        creditAmount: 5000,
        description: 'Bank payment for interest'
      }
    ],
    totalDebit: 105000,
    totalCredit: 105000,
    status: 'posted',
    referenceNumber: 'REF-004',
    notes: 'Loan payment processed',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
    postedAt: '2024-02-10'
  },
  {
    id: 5,
    journalNumber: 'MJ-2024-005',
    journalDate: '2024-02-15',
    description: 'Insurance prepayment entry',
    entries: [
      {
        accountId: '1040',
        accountName: 'Prepaid Expenses',
        accountCode: '1040',
        debitAmount: 60000,
        creditAmount: 0,
        description: 'Annual insurance premium'
      },
      {
        accountId: '1000',
        accountName: 'Cash',
        accountCode: '1000',
        debitAmount: 0,
        creditAmount: 60000,
        description: 'Cash payment for insurance'
      }
    ],
    totalDebit: 60000,
    totalCredit: 60000,
    status: 'cancelled',
    referenceNumber: 'REF-005',
    notes: 'Cancelled - duplicate entry',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-16'
  }
];

export const useManualJournal = (initialFilters?: ManualJournalFilters) => {
  const [journals, setJournals] = useState<ManualJournal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ManualJournalFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });
  const [stats, setStats] = useState<ManualJournalStats>({
    totalJournals: 0,
    totalDebit: 0,
    totalCredit: 0,
    draftCount: 0,
    postedCount: 0,
    pendingCount: 0,
    cancelledCount: 0
  });

  // Calculate stats
  const calculateStats = useCallback((journalsData: ManualJournal[]) => {
    const total = journalsData.length;
    const totalDebit = journalsData.reduce((sum, j) => sum + j.totalDebit, 0);
    const totalCredit = journalsData.reduce((sum, j) => sum + j.totalCredit, 0);
    const draftCount = journalsData.filter(j => j.status === 'draft').length;
    const postedCount = journalsData.filter(j => j.status === 'posted').length;
    const pendingCount = journalsData.filter(j => j.status === 'pending').length;
    const cancelledCount = journalsData.filter(j => j.status === 'cancelled').length;

    setStats({
      totalJournals: total,
      totalDebit,
      totalCredit,
      draftCount,
      postedCount,
      pendingCount,
      cancelledCount
    });
  }, []);

  // Fetch manual journals
  const fetchJournals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredJournals = [...DUMMY_JOURNALS];

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredJournals = filteredJournals.filter(j =>
          j.journalNumber.toLowerCase().includes(searchLower) ||
          j.description.toLowerCase().includes(searchLower) ||
          j.referenceNumber?.toLowerCase().includes(searchLower) ||
          j.notes?.toLowerCase().includes(searchLower) ||
          j.entries.some(e => 
            e.accountName.toLowerCase().includes(searchLower) ||
            e.accountCode?.toLowerCase().includes(searchLower)
          )
        );
      }

      // Apply status filter
      if (filters?.status) {
        filteredJournals = filteredJournals.filter(j => j.status === filters.status);
      }

      // Apply date range filter
      if (filters?.dateFrom) {
        filteredJournals = filteredJournals.filter(j => j.journalDate >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        filteredJournals = filteredJournals.filter(j => j.journalDate <= filters.dateTo!);
      }

      // Calculate stats
      calculateStats(filteredJournals);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredJournals.slice(startIndex, endIndex);

      setJournals(paginatedData);
      setPagination({
        page: page,
        total: filteredJournals.length,
        totalPages: Math.ceil(filteredJournals.length / limit),
        limit: limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch manual journals');
      setJournals([]);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  // Get journal by ID
  const getJournalById = useCallback(async (id: string | number): Promise<ManualJournal | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const journal = DUMMY_JOURNALS.find(j => String(j.id) === String(id));
    return journal || null;
  }, []);

  // Create new manual journal
  const createJournal = useCallback(async (journalData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newJournal: ManualJournal = {
        ...journalData,
        id: DUMMY_JOURNALS.length + 1,
        journalNumber: `MJ-2024-${String(DUMMY_JOURNALS.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_JOURNALS.push(newJournal);
      setJournals(prev => [newJournal, ...prev]);
      return newJournal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create manual journal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update manual journal
  const updateJournal = useCallback(async (id: string | number, journalData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_JOURNALS.findIndex(j => String(j.id) === String(id));
      if (index === -1) {
        throw new Error('Manual journal not found');
      }
      
      const updatedJournal: ManualJournal = {
        ...DUMMY_JOURNALS[index],
        ...journalData,
        updatedAt: new Date().toISOString()
      };
      DUMMY_JOURNALS[index] = updatedJournal;
      
      setJournals(prev => prev.map(j => String(j.id) === String(id) ? updatedJournal : j));
      return updatedJournal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update manual journal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete manual journal
  const deleteJournal = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_JOURNALS.findIndex(j => String(j.id) === String(id));
      if (index === -1) {
        throw new Error('Manual journal not found');
      }
      DUMMY_JOURNALS.splice(index, 1);
      setJournals(prev => prev.filter(j => String(j.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete manual journal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ManualJournalFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  }, []);

  // Change page
  const changePage = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters || { page: 1, limit: 10 });
  }, [initialFilters]);

  // Initial fetch
  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  return {
    journals,
    loading,
    error,
    filters,
    pagination,
    stats,
    fetchJournals,
    getJournalById,
    createJournal,
    updateJournal,
    deleteJournal,
    updateFilters,
    changePage,
    resetFilters,
    setFilters
  };
};