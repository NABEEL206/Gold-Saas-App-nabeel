// src/hooks/RecurringExpense/useRecurringExpense.ts

import { useState, useEffect, useCallback } from 'react';
import type{
  RecurringExpense,
  RecurringExpenseFilters,
  RecurringExpenseResponse,
  RecurringExpenseStats,
  RECURRING_CATEGORIES,
  FREQUENCY_LABELS
} from '../../types/RecurringExpense/RecurringExpenseType';

// Dummy data
const DUMMY_RECURRING_EXPENSES: RecurringExpense[] = [
  {
    id: 1,
    recurringNumber: 'REC-2024-001',
    vendorId: 1,
    vendorName: 'Tech Solutions Inc.',
    category: 'Software Subscriptions',
    subCategory: 'Software License',
    amount: 499.99,
    taxAmount: 30.00,
    totalAmount: 529.99,
    startDate: '2024-01-15',
    endDate: '2024-12-15',
    description: 'Annual software license renewal - Monthly',
    frequency: 'monthly',
    paymentMethod: 'auto_debit',
    paymentStatus: 'active',
    referenceNumber: 'REF-001',
    notes: 'Auto-debit from company account',
    isVendorExpense: true,
    lastProcessed: '2024-02-15',
    nextProcessingDate: '2024-03-15',
    processedOccurrences: 2,
    totalOccurrences: 12,
    createdAt: '2024-01-15',
    updatedAt: '2024-02-15'
  },
  {
    id: 2,
    recurringNumber: 'REC-2024-002',
    category: 'Rent',
    subCategory: 'Office Rent',
    amount: 2500.00,
    taxAmount: 150.00,
    totalAmount: 2650.00,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    description: 'Monthly office rent',
    frequency: 'monthly',
    paymentMethod: 'bank',
    paymentStatus: 'active',
    referenceNumber: 'REF-002',
    notes: 'Office space rent',
    isVendorExpense: false,
    lastProcessed: '2024-02-01',
    nextProcessingDate: '2024-03-01',
    processedOccurrences: 2,
    totalOccurrences: 12,
    createdAt: '2024-01-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 3,
    recurringNumber: 'REC-2024-003',
    category: 'Insurance',
    subCategory: 'Business Insurance',
    amount: 1500.00,
    taxAmount: 90.00,
    totalAmount: 1590.00,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    description: 'Business insurance - Half yearly',
    frequency: 'half_yearly',
    paymentMethod: 'cheque',
    paymentStatus: 'paused',
    referenceNumber: 'REF-003',
    notes: 'Paused until further notice',
    isVendorExpense: false,
    lastProcessed: '2024-01-01',
    nextProcessingDate: '2024-07-01',
    processedOccurrences: 1,
    totalOccurrences: 2,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 4,
    recurringNumber: 'REC-2024-004',
    vendorId: 4,
    vendorName: 'Premier Logistics',
    category: 'Maintenance Contracts',
    subCategory: 'Equipment Maintenance',
    amount: 750.00,
    taxAmount: 45.00,
    totalAmount: 795.00,
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    description: 'Monthly equipment maintenance contract',
    frequency: 'monthly',
    paymentMethod: 'bank',
    paymentStatus: 'active',
    referenceNumber: 'REF-004',
    notes: 'Monthly maintenance service',
    isVendorExpense: true,
    lastProcessed: '2024-02-01',
    nextProcessingDate: '2024-03-01',
    processedOccurrences: 1,
    totalOccurrences: 12,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 5,
    recurringNumber: 'REC-2024-005',
    category: 'Utilities',
    subCategory: 'Electricity',
    amount: 350.00,
    taxAmount: 21.00,
    totalAmount: 371.00,
    startDate: '2024-01-01',
    description: 'Monthly electricity bill',
    frequency: 'monthly',
    paymentMethod: 'cash',
    paymentStatus: 'cancelled',
    referenceNumber: 'REF-005',
    notes: 'Cancelled - moved to new location',
    isVendorExpense: false,
    lastProcessed: '2024-01-01',
    nextProcessingDate: '2024-02-01',
    processedOccurrences: 1,
    totalOccurrences: 12,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-20'
  },
  {
    id: 6,
    recurringNumber: 'REC-2024-006',
    category: 'Software Subscriptions',
    subCategory: 'Cloud Services',
    amount: 200.00,
    taxAmount: 12.00,
    totalAmount: 212.00,
    startDate: '2024-03-01',
    description: 'Cloud storage subscription - Quarterly',
    frequency: 'quarterly',
    paymentMethod: 'credit_card',
    paymentStatus: 'active',
    referenceNumber: 'REF-006',
    notes: 'Quarterly cloud service payment',
    isVendorExpense: false,
    nextProcessingDate: '2024-03-01',
    processedOccurrences: 0,
    totalOccurrences: 4,
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15'
  }
];

export const useRecurringExpense = (initialFilters?: RecurringExpenseFilters) => {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RecurringExpenseFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });
  const [stats, setStats] = useState<RecurringExpenseStats>({
    totalRecurringExpenses: 0,
    totalMonthlyAmount: 0,
    totalYearlyAmount: 0,
    activeCount: 0,
    pausedCount: 0,
    cancelledCount: 0,
    completedCount: 0,
    vendorExpenses: 0,
    nonVendorExpenses: 0,
    totalAmount: 0
  });

  // Calculate stats
  const calculateStats = useCallback((expensesData: RecurringExpense[]) => {
    const total = expensesData.length;
    const totalAmount = expensesData.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const activeCount = expensesData.filter(exp => exp.paymentStatus === 'active').length;
    const pausedCount = expensesData.filter(exp => exp.paymentStatus === 'paused').length;
    const cancelledCount = expensesData.filter(exp => exp.paymentStatus === 'cancelled').length;
    const completedCount = expensesData.filter(exp => exp.paymentStatus === 'completed').length;
    const vendorExpenses = expensesData.filter(exp => exp.isVendorExpense).length;
    const nonVendorExpenses = expensesData.filter(exp => !exp.isVendorExpense).length;

    // Calculate monthly amount (approximate based on frequency)
    let totalMonthlyAmount = 0;
    expensesData.forEach(exp => {
      switch(exp.frequency) {
        case 'daily':
          totalMonthlyAmount += exp.totalAmount * 30;
          break;
        case 'weekly':
          totalMonthlyAmount += exp.totalAmount * 4;
          break;
        case 'monthly':
          totalMonthlyAmount += exp.totalAmount;
          break;
        case 'quarterly':
          totalMonthlyAmount += exp.totalAmount / 3;
          break;
        case 'half_yearly':
          totalMonthlyAmount += exp.totalAmount / 6;
          break;
        case 'yearly':
          totalMonthlyAmount += exp.totalAmount / 12;
          break;
        default:
          totalMonthlyAmount += exp.totalAmount;
      }
    });

    setStats({
      totalRecurringExpenses: total,
      totalMonthlyAmount,
      totalYearlyAmount: totalMonthlyAmount * 12,
      activeCount,
      pausedCount,
      cancelledCount,
      completedCount,
      vendorExpenses,
      nonVendorExpenses,
      totalAmount
    });
  }, []);

  // Fetch recurring expenses
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredExpenses = [...DUMMY_RECURRING_EXPENSES];

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredExpenses = filteredExpenses.filter(exp =>
          exp.recurringNumber.toLowerCase().includes(searchLower) ||
          exp.vendorName?.toLowerCase().includes(searchLower) ||
          exp.category.toLowerCase().includes(searchLower) ||
          exp.subCategory?.toLowerCase().includes(searchLower) ||
          exp.description?.toLowerCase().includes(searchLower) ||
          exp.referenceNumber?.toLowerCase().includes(searchLower)
        );
      }

      // Apply category filter
      if (filters?.category) {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === filters.category);
      }

      // Apply status filter
      if (filters?.paymentStatus) {
        filteredExpenses = filteredExpenses.filter(exp => exp.paymentStatus === filters.paymentStatus);
      }

      // Apply frequency filter
      if (filters?.frequency) {
        filteredExpenses = filteredExpenses.filter(exp => exp.frequency === filters.frequency);
      }

      // Apply vendor filter
      if (filters?.vendorId) {
        filteredExpenses = filteredExpenses.filter(exp => exp.vendorId === filters.vendorId);
      }

      // Apply expense type filter
      if (filters?.expenseType === 'vendor') {
        filteredExpenses = filteredExpenses.filter(exp => exp.isVendorExpense === true);
      } else if (filters?.expenseType === 'non-vendor') {
        filteredExpenses = filteredExpenses.filter(exp => exp.isVendorExpense === false);
      }

      // Apply date range filter
      if (filters?.dateFrom) {
        filteredExpenses = filteredExpenses.filter(exp => exp.startDate >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        filteredExpenses = filteredExpenses.filter(exp => exp.startDate <= filters.dateTo!);
      }

      // Apply amount range filter
      if (filters?.minAmount) {
        filteredExpenses = filteredExpenses.filter(exp => exp.totalAmount >= filters.minAmount!);
      }
      if (filters?.maxAmount) {
        filteredExpenses = filteredExpenses.filter(exp => exp.totalAmount <= filters.maxAmount!);
      }

      // Calculate stats
      calculateStats(filteredExpenses);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredExpenses.slice(startIndex, endIndex);

      setExpenses(paginatedData);
      setPagination({
        page: page,
        total: filteredExpenses.length,
        totalPages: Math.ceil(filteredExpenses.length / limit),
        limit: limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recurring expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  // Get expense by ID
  const getExpenseById = useCallback(async (id: string | number): Promise<RecurringExpense | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const expense = DUMMY_RECURRING_EXPENSES.find(exp => String(exp.id) === String(id));
    return expense || null;
  }, []);

  // Create new recurring expense
  const createExpense = useCallback(async (expenseData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newExpense: RecurringExpense = {
        ...expenseData,
        id: DUMMY_RECURRING_EXPENSES.length + 1,
        recurringNumber: `REC-2024-${String(DUMMY_RECURRING_EXPENSES.length + 1).padStart(3, '0')}`,
        isVendorExpense: !!expenseData.vendorId && !!expenseData.vendorName,
        processedOccurrences: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_RECURRING_EXPENSES.push(newExpense);
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recurring expense');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update recurring expense
  const updateExpense = useCallback(async (id: string | number, expenseData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_RECURRING_EXPENSES.findIndex(exp => String(exp.id) === String(id));
      if (index === -1) {
        throw new Error('Recurring expense not found');
      }
      
      const updatedExpense: RecurringExpense = {
        ...DUMMY_RECURRING_EXPENSES[index],
        ...expenseData,
        isVendorExpense: !!expenseData.vendorId && !!expenseData.vendorName,
        updatedAt: new Date().toISOString()
      };
      DUMMY_RECURRING_EXPENSES[index] = updatedExpense;
      
      setExpenses(prev => prev.map(exp => String(exp.id) === String(id) ? updatedExpense : exp));
      return updatedExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update recurring expense');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete recurring expense
  const deleteExpense = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_RECURRING_EXPENSES.findIndex(exp => String(exp.id) === String(id));
      if (index === -1) {
        throw new Error('Recurring expense not found');
      }
      DUMMY_RECURRING_EXPENSES.splice(index, 1);
      setExpenses(prev => prev.filter(exp => String(exp.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recurring expense');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<RecurringExpenseFilters>) => {
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
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    filters,
    pagination,
    stats,
    fetchExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    updateFilters,
    changePage,
    resetFilters,
    setFilters
  };
};