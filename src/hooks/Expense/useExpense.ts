// src/hooks/Expense/useExpense.ts

import { useState, useEffect, useCallback } from 'react';
import type{ 
  Expense, 
  ExpenseFilters, 
  ExpenseResponse, 
  ExpenseStats,
  EXPENSE_CATEGORIES 
} from '../../types/Expense/ExpenseType';

// Dummy data with both vendor and non-vendor expenses
const DUMMY_EXPENSES: Expense[] = [
  {
    id: 1,
    expenseNumber: 'EXP-2024-001',
    vendorId: 1,
    vendorName: 'Tech Solutions Inc.',
    category: 'Technology & Software',
    subCategory: 'Software License',
    amount: 499.99,
    taxAmount: 30.00,
    totalAmount: 529.99,
    date: '2024-01-15',
    dueDate: '2024-02-15',
    description: 'Annual software license renewal',
    paymentMethod: 'bank',
    paymentStatus: 'paid',
    referenceNumber: 'REF-001',
    receiptNumber: 'RCP-001',
    notes: 'Paid via bank transfer',
    isVendorExpense: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 2,
    expenseNumber: 'EXP-2024-002',
    vendorId: 2,
    vendorName: 'Global Supplies Ltd',
    category: 'Office Supplies',
    subCategory: 'Stationery',
    amount: 250.50,
    taxAmount: 15.03,
    totalAmount: 265.53,
    date: '2024-01-20',
    dueDate: '2024-02-20',
    description: 'Office stationery and supplies',
    paymentMethod: 'credit_card',
    paymentStatus: 'unpaid',
    referenceNumber: 'REF-002',
    receiptNumber: 'RCP-002',
    notes: 'Waiting for approval',
    isVendorExpense: true,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    expenseNumber: 'EXP-2024-003',
    category: 'Utilities',
    subCategory: 'Electricity',
    amount: 350.00,
    taxAmount: 21.00,
    totalAmount: 371.00,
    date: '2024-02-01',
    dueDate: '2024-03-01',
    description: 'Monthly electricity bill',
    paymentMethod: 'cash',
    paymentStatus: 'overdue',
    referenceNumber: 'REF-003',
    receiptNumber: 'RCP-003',
    notes: 'Payment overdue',
    isVendorExpense: false,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 4,
    expenseNumber: 'EXP-2024-004',
    vendorId: 4,
    vendorName: 'Premier Logistics',
    category: 'Transportation',
    subCategory: 'Shipping',
    amount: 150.00,
    taxAmount: 9.00,
    totalAmount: 159.00,
    date: '2024-02-05',
    dueDate: '2024-03-05',
    description: 'Shipping charges for Q1',
    paymentMethod: 'cheque',
    paymentStatus: 'paid',
    referenceNumber: 'REF-004',
    receiptNumber: 'RCP-004',
    notes: 'Cheque issued',
    isVendorExpense: true,
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05'
  },
  {
    id: 5,
    expenseNumber: 'EXP-2024-005',
    category: 'Staff Welfare',
    subCategory: 'Team Lunch',
    amount: 120.00,
    taxAmount: 0,
    totalAmount: 120.00,
    date: '2024-02-10',
    description: 'Team lunch for project completion',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    referenceNumber: 'REF-005',
    receiptNumber: 'RCP-005',
    notes: 'Team celebration',
    isVendorExpense: false,
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  },
  {
    id: 6,
    expenseNumber: 'EXP-2024-006',
    vendorId: 5,
    vendorName: 'Industrial Parts Ltd',
    category: 'Maintenance & Repairs',
    subCategory: 'Equipment Repair',
    amount: 750.00,
    taxAmount: 45.00,
    totalAmount: 795.00,
    date: '2024-02-10',
    dueDate: '2024-03-10',
    description: 'Machine repair and maintenance',
    paymentMethod: 'bank',
    paymentStatus: 'partial',
    referenceNumber: 'REF-006',
    receiptNumber: 'RCP-006',
    notes: 'Partial payment made',
    isVendorExpense: true,
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  },
  {
    id: 7,
    expenseNumber: 'EXP-2024-007',
    category: 'Travel & Entertainment',
    subCategory: 'Business Travel',
    amount: 450.00,
    taxAmount: 27.00,
    totalAmount: 477.00,
    date: '2024-02-15',
    dueDate: '2024-03-15',
    description: 'Flight tickets for client meeting',
    paymentMethod: 'credit_card',
    paymentStatus: 'unpaid',
    referenceNumber: 'REF-007',
    receiptNumber: 'RCP-007',
    notes: 'Client visit',
    isVendorExpense: false,
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15'
  },
  {
    id: 8,
    expenseNumber: 'EXP-2024-008',
    category: 'Communication',
    subCategory: 'Internet',
    amount: 80.00,
    taxAmount: 4.80,
    totalAmount: 84.80,
    date: '2024-02-20',
    dueDate: '2024-03-20',
    description: 'Monthly internet bill',
    paymentMethod: 'bank',
    paymentStatus: 'paid',
    referenceNumber: 'REF-008',
    receiptNumber: 'RCP-008',
    notes: 'Auto-debit',
    isVendorExpense: false,
    createdAt: '2024-02-20',
    updatedAt: '2024-02-20'
  }
];

export const useExpense = (initialFilters?: ExpenseFilters) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });
  const [stats, setStats] = useState<ExpenseStats>({
    totalExpenses: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    overdueAmount: 0,
    expenseCount: 0,
    averageAmount: 0,
    vendorExpenses: 0,
    nonVendorExpenses: 0
  });

  // Calculate stats
  const calculateStats = useCallback((expensesData: Expense[]) => {
    const total = expensesData.length;
    const totalAmount = expensesData.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const paidAmount = expensesData
      .filter(exp => exp.paymentStatus === 'paid')
      .reduce((sum, exp) => sum + exp.totalAmount, 0);
    const unpaidAmount = expensesData
      .filter(exp => exp.paymentStatus === 'unpaid')
      .reduce((sum, exp) => sum + exp.totalAmount, 0);
    const overdueAmount = expensesData
      .filter(exp => exp.paymentStatus === 'overdue')
      .reduce((sum, exp) => sum + exp.totalAmount, 0);
    const vendorExpenses = expensesData.filter(exp => exp.isVendorExpense).length;
    const nonVendorExpenses = expensesData.filter(exp => !exp.isVendorExpense).length;

    setStats({
      totalExpenses: total,
      totalAmount,
      paidAmount,
      unpaidAmount,
      overdueAmount,
      expenseCount: total,
      averageAmount: total > 0 ? totalAmount / total : 0,
      vendorExpenses,
      nonVendorExpenses
    });
  }, []);

  // Fetch expenses with filters
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredExpenses = [...DUMMY_EXPENSES];

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredExpenses = filteredExpenses.filter(exp =>
          exp.expenseNumber.toLowerCase().includes(searchLower) ||
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

      // Apply payment status filter
      if (filters?.paymentStatus) {
        filteredExpenses = filteredExpenses.filter(exp => exp.paymentStatus === filters.paymentStatus);
      }

      // Apply payment method filter
      if (filters?.paymentMethod) {
        filteredExpenses = filteredExpenses.filter(exp => exp.paymentMethod === filters.paymentMethod);
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
        filteredExpenses = filteredExpenses.filter(exp => exp.date >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        filteredExpenses = filteredExpenses.filter(exp => exp.date <= filters.dateTo!);
      }

      // Apply amount range filter
      if (filters?.minAmount) {
        filteredExpenses = filteredExpenses.filter(exp => exp.totalAmount >= filters.minAmount!);
      }
      if (filters?.maxAmount) {
        filteredExpenses = filteredExpenses.filter(exp => exp.totalAmount <= filters.maxAmount!);
      }

      // Sorting
      if (filters?.sortBy) {
        filteredExpenses.sort((a: any, b: any) => {
          const aVal = a[filters.sortBy!] || '';
          const bVal = b[filters.sortBy!] || '';
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return filters.sortOrder === 'desc' ? -comparison : comparison;
        });
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
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  // Get expense by ID
  const getExpenseById = useCallback(async (id: string | number): Promise<Expense | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const expense = DUMMY_EXPENSES.find(exp => String(exp.id) === String(id));
    return expense || null;
  }, []);

  // Create new expense
  const createExpense = useCallback(async (expenseData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newExpense: Expense = {
        ...expenseData,
        id: DUMMY_EXPENSES.length + 1,
        expenseNumber: `EXP-2024-${String(DUMMY_EXPENSES.length + 1).padStart(3, '0')}`,
        isVendorExpense: !!expenseData.vendorId && !!expenseData.vendorName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_EXPENSES.push(newExpense);
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update expense
  const updateExpense = useCallback(async (id: string | number, expenseData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_EXPENSES.findIndex(exp => String(exp.id) === String(id));
      if (index === -1) {
        throw new Error('Expense not found');
      }
      
      const updatedExpense: Expense = {
        ...DUMMY_EXPENSES[index],
        ...expenseData,
        isVendorExpense: !!expenseData.vendorId && !!expenseData.vendorName,
        updatedAt: new Date().toISOString()
      };
      DUMMY_EXPENSES[index] = updatedExpense;
      
      setExpenses(prev => prev.map(exp => String(exp.id) === String(id) ? updatedExpense : exp));
      return updatedExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete expense
  const deleteExpense = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_EXPENSES.findIndex(exp => String(exp.id) === String(id));
      if (index === -1) {
        throw new Error('Expense not found');
      }
      DUMMY_EXPENSES.splice(index, 1);
      setExpenses(prev => prev.filter(exp => String(exp.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ExpenseFilters>) => {
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