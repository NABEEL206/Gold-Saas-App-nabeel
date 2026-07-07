// src/hooks/Expense/useExpense.ts

import { useState, useEffect, useCallback } from 'react';
import type{ 
  Expense, 
  ExpenseFilters, 
  ExpenseStats
} from '../../types/Expense/ExpenseType';
import { validateExpenseForm, formatValidationErrors } from '../../validations/expense.validation';

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
    description: 'Annual software license renewal for accounting software',
    paymentMethod: 'bank',
    paymentStatus: 'paid',
    referenceNumber: 'REF-001-2024',
    receiptNumber: 'RCP-001-2024',
    billNumber: 'BILL-001-2024',
    notes: 'Paid via bank transfer. Approved by finance team.',
    isVendorExpense: true,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
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
    description: 'Office stationery and supplies for Q1',
    paymentMethod: 'credit_card',
    paymentStatus: 'unpaid',
    referenceNumber: 'REF-002-2024',
    receiptNumber: 'RCP-002-2024',
    billNumber: 'BILL-002-2024',
    notes: 'Waiting for approval from department head',
    isVendorExpense: true,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: '2024-01-20T14:15:00Z'
  },
  {
    id: 3,
    expenseNumber: 'EXP-2024-003',
    vendorId: undefined,
    vendorName: undefined,
    category: 'Utilities',
    subCategory: 'Electricity',
    amount: 350.00,
    taxAmount: 21.00,
    totalAmount: 371.00,
    date: '2024-02-01',
    dueDate: '2024-03-01',
    description: 'Monthly electricity bill for office premises',
    paymentMethod: 'cash',
    paymentStatus: 'overdue',
    referenceNumber: 'REF-003-2024',
    receiptNumber: 'RCP-003-2024',
    billNumber: 'BILL-003-2024',
    notes: 'Payment overdue. Please process urgently.',
    isVendorExpense: false,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z'
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
    description: 'Shipping charges for Q1 inventory delivery',
    paymentMethod: 'cheque',
    paymentStatus: 'paid',
    referenceNumber: 'REF-004-2024',
    receiptNumber: 'RCP-004-2024',
    billNumber: 'BILL-004-2024',
    notes: 'Cheque issued to Premier Logistics',
    isVendorExpense: true,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-02-05T11:45:00Z',
    updatedAt: '2024-02-05T11:45:00Z'
  },
  {
    id: 5,
    expenseNumber: 'EXP-2024-005',
    vendorId: undefined,
    vendorName: undefined,
    category: 'Staff Welfare',
    subCategory: 'Team Lunch',
    amount: 120.00,
    taxAmount: 0,
    totalAmount: 120.00,
    date: '2024-02-10',
    dueDate: undefined,
    description: 'Team lunch for project completion celebration',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    referenceNumber: 'REF-005-2024',
    receiptNumber: 'RCP-005-2024',
    billNumber: undefined,
    notes: 'Team celebration - 15 members participated',
    isVendorExpense: false,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-02-10T12:30:00Z',
    updatedAt: '2024-02-10T12:30:00Z'
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
    description: 'Machine repair and maintenance for production line',
    paymentMethod: 'bank',
    paymentStatus: 'partial',
    referenceNumber: 'REF-006-2024',
    receiptNumber: 'RCP-006-2024',
    billNumber: 'BILL-006-2024',
    notes: 'Partial payment made. Balance pending.',
    isVendorExpense: true,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-02-10T16:20:00Z',
    updatedAt: '2024-02-10T16:20:00Z'
  },
  {
    id: 7,
    expenseNumber: 'EXP-2024-007',
    vendorId: undefined,
    vendorName: undefined,
    category: 'Travel & Entertainment',
    subCategory: 'Business Travel',
    amount: 450.00,
    taxAmount: 27.00,
    totalAmount: 477.00,
    date: '2024-02-15',
    dueDate: '2024-03-15',
    description: 'Flight tickets for client meeting in Mumbai',
    paymentMethod: 'credit_card',
    paymentStatus: 'unpaid',
    referenceNumber: 'REF-007-2024',
    receiptNumber: 'RCP-007-2024',
    billNumber: 'BILL-007-2024',
    notes: 'Client visit for project review',
    isVendorExpense: false,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-02-15T08:00:00Z'
  },
  {
    id: 8,
    expenseNumber: 'EXP-2024-008',
    vendorId: undefined,
    vendorName: undefined,
    category: 'Communication',
    subCategory: 'Internet',
    amount: 80.00,
    taxAmount: 4.80,
    totalAmount: 84.80,
    date: '2024-02-20',
    dueDate: '2024-03-20',
    description: 'Monthly internet bill for office',
    paymentMethod: 'bank',
    paymentStatus: 'paid',
    referenceNumber: 'REF-008-2024',
    receiptNumber: 'RCP-008-2024',
    billNumber: undefined,
    notes: 'Auto-debit from bank account',
    isVendorExpense: false,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z'
  },
  {
    id: 9,
    expenseNumber: 'EXP-2024-009',
    vendorId: 3,
    vendorName: 'Quality Products Co',
    category: 'Office Supplies',
    subCategory: 'Furniture',
    amount: 1200.00,
    taxAmount: 72.00,
    totalAmount: 1272.00,
    date: '2024-02-25',
    dueDate: '2024-03-25',
    description: 'New office chairs for employee workstations',
    paymentMethod: 'bank',
    paymentStatus: 'paid',
    referenceNumber: 'REF-009-2024',
    receiptNumber: 'RCP-009-2024',
    billNumber: 'BILL-009-2024',
    notes: 'Approved by facilities management',
    isVendorExpense: true,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-02-25T15:30:00Z',
    updatedAt: '2024-02-25T15:30:00Z'
  },
  {
    id: 10,
    expenseNumber: 'EXP-2024-010',
    vendorId: undefined,
    vendorName: undefined,
    category: 'Training & Development',
    subCategory: 'Workshop',
    amount: 500.00,
    taxAmount: 30.00,
    totalAmount: 530.00,
    date: '2024-03-01',
    dueDate: '2024-04-01',
    description: 'Leadership workshop for team leads',
    paymentMethod: 'credit_card',
    paymentStatus: 'unpaid',
    referenceNumber: 'REF-010-2024',
    receiptNumber: 'RCP-010-2024',
    billNumber: 'BILL-010-2024',
    notes: 'Workshop for 5 team leads',
    isVendorExpense: false,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-03-01T09:30:00Z',
    updatedAt: '2024-03-01T09:30:00Z'
  },
  {
    id: 11,
    expenseNumber: 'EXP-2024-011',
    vendorId: 1,
    vendorName: 'Tech Solutions Inc.',
    category: 'Technology & Software',
    subCategory: 'Hardware',
    amount: 1800.00,
    taxAmount: 108.00,
    totalAmount: 1908.00,
    date: '2024-03-05',
    dueDate: '2024-04-05',
    description: 'New laptops for development team',
    paymentMethod: 'bank',
    paymentStatus: 'paid',
    referenceNumber: 'REF-011-2024',
    receiptNumber: 'RCP-011-2024',
    billNumber: 'BILL-011-2024',
    notes: '3 laptops for new developers',
    isVendorExpense: true,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-03-05T14:00:00Z',
    updatedAt: '2024-03-05T14:00:00Z'
  },
  {
    id: 12,
    expenseNumber: 'EXP-2024-012',
    vendorId: undefined,
    vendorName: undefined,
    category: 'Marketing',
    subCategory: 'Advertising',
    amount: 2500.00,
    taxAmount: 150.00,
    totalAmount: 2650.00,
    date: '2024-03-10',
    dueDate: '2024-04-10',
    description: 'Digital marketing campaign for Q2',
    paymentMethod: 'credit_card',
    paymentStatus: 'overdue',
    referenceNumber: 'REF-012-2024',
    receiptNumber: 'RCP-012-2024',
    billNumber: 'BILL-012-2024',
    notes: 'Facebook and Google ads campaign',
    isVendorExpense: false,
    currency: 'INR',
    exchangeRate: 1,
    createdAt: '2024-03-10T11:00:00Z',
    updatedAt: '2024-03-10T11:00:00Z'
  }
];

export const useExpense = (initialFilters?: ExpenseFilters) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
    setValidationErrors({});
    
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
    
    if (!expense) {
      setError(`Expense with ID ${id} not found`);
    }
    
    return expense || null;
  }, []);

  // Create new expense with validation
  const createExpense = useCallback(async (expenseData: any) => {
    const validationResult = validateExpenseForm(expenseData);

    if (!validationResult.isValid) {
      const formattedErrors = formatValidationErrors(validationResult.errors);
      setValidationErrors(formattedErrors);
      throw new Error('Validation failed. Please check the form for errors.');
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update expense with validation
  const updateExpense = useCallback(async (id: string | number, expenseData: any) => {
    const validationResult = validateExpenseForm(expenseData);

    if (!validationResult.isValid) {
      const formattedErrors = formatValidationErrors(validationResult.errors);
      setValidationErrors(formattedErrors);
      throw new Error('Validation failed. Please check the form for errors.');
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete expense
  const deleteExpense = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense';
      setError(errorMessage);
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
    setError(null);
    setValidationErrors({});
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
    setError(null);
    setValidationErrors({});
  }, [initialFilters]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    validationErrors,
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
    setFilters,
    clearErrors
  };
};