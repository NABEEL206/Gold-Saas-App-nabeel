// src/hooks/ChartOfAccounts/useChartOfAccounts.ts

import { useState, useEffect, useCallback } from 'react';
import type{
  ChartOfAccount,
  ChartOfAccountFilters,
  ChartOfAccountResponse,
  ChartOfAccountStats,
  ACCOUNT_TYPES,
  ACCOUNT_CATEGORIES,
  SYSTEM_ACCOUNTS
} from '../../types/ChartOfAccounts/ChartOfAccountsType';

// Dummy data
const DUMMY_ACCOUNTS: ChartOfAccount[] = [
  {
    id: 1,
    code: '1000',
    name: 'Cash',
    type: 'asset',
    category: 'Cash & Cash Equivalents',
    subCategory: 'Current Assets',
    description: 'Petty cash and cash on hand',
    isActive: true,
    isSystemAccount: true,
    balance: 15000,
    openingBalance: 10000,
    currentBalance: 15000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    code: '1010',
    name: 'Bank Account',
    type: 'asset',
    category: 'Cash & Cash Equivalents',
    subCategory: 'Current Assets',
    description: 'Main business bank account',
    isActive: true,
    isSystemAccount: true,
    balance: 50000,
    openingBalance: 25000,
    currentBalance: 50000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 3,
    code: '1020',
    name: 'Accounts Receivable',
    type: 'asset',
    category: 'Accounts Receivable',
    subCategory: 'Current Assets',
    description: 'Customer receivables',
    isActive: true,
    isSystemAccount: true,
    balance: 75000,
    openingBalance: 50000,
    currentBalance: 75000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 4,
    code: '2000',
    name: 'Accounts Payable',
    type: 'liability',
    category: 'Accounts Payable',
    subCategory: 'Current Liabilities',
    description: 'Vendor payables',
    isActive: true,
    isSystemAccount: true,
    balance: 45000,
    openingBalance: 30000,
    currentBalance: 45000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 5,
    code: '3000',
    name: 'Owner\'s Equity',
    type: 'equity',
    category: 'Owner\'s Equity',
    subCategory: 'Equity',
    description: 'Owner capital contribution',
    isActive: true,
    isSystemAccount: true,
    balance: 100000,
    openingBalance: 100000,
    currentBalance: 100000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 6,
    code: '4000',
    name: 'Sales Revenue',
    type: 'revenue',
    category: 'Sales Revenue',
    subCategory: 'Revenue',
    description: 'Product sales revenue',
    isActive: true,
    isSystemAccount: true,
    balance: 150000,
    openingBalance: 0,
    currentBalance: 150000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 7,
    code: '5000',
    name: 'Cost of Goods Sold',
    type: 'expense',
    category: 'Cost of Goods Sold',
    subCategory: 'Expenses',
    description: 'Direct cost of goods sold',
    isActive: true,
    isSystemAccount: true,
    balance: 80000,
    openingBalance: 0,
    currentBalance: 80000,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 8,
    code: '5010',
    name: 'Salaries Expense',
    type: 'expense',
    category: 'Salaries & Wages',
    subCategory: 'Expenses',
    description: 'Employee salaries',
    isActive: true,
    isSystemAccount: false,
    balance: 25000,
    openingBalance: 0,
    currentBalance: 25000,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  }
];

export const useChartOfAccounts = (initialFilters?: ChartOfAccountFilters) => {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ChartOfAccountFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });
  const [stats, setStats] = useState<ChartOfAccountStats>({
    totalAccounts: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    activeCount: 0,
    systemAccounts: 0
  });

  // Calculate stats
  const calculateStats = useCallback((accountsData: ChartOfAccount[]) => {
    const total = accountsData.length;
    const totalAssets = accountsData.filter(a => a.type === 'asset').length;
    const totalLiabilities = accountsData.filter(a => a.type === 'liability').length;
    const totalEquity = accountsData.filter(a => a.type === 'equity').length;
    const totalRevenue = accountsData.filter(a => a.type === 'revenue').length;
    const totalExpenses = accountsData.filter(a => a.type === 'expense').length;
    const activeCount = accountsData.filter(a => a.isActive).length;
    const systemAccounts = accountsData.filter(a => a.isSystemAccount).length;

    setStats({
      totalAccounts: total,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      activeCount,
      systemAccounts
    });
  }, []);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredAccounts = [...DUMMY_ACCOUNTS];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAccounts = filteredAccounts.filter(a =>
          a.code.toLowerCase().includes(searchLower) ||
          a.name.toLowerCase().includes(searchLower) ||
          a.category.toLowerCase().includes(searchLower) ||
          a.subCategory?.toLowerCase().includes(searchLower) ||
          a.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.type) {
        filteredAccounts = filteredAccounts.filter(a => a.type === filters.type);
      }

      if (filters?.category) {
        filteredAccounts = filteredAccounts.filter(a => a.category === filters.category);
      }

      if (filters?.isActive !== undefined) {
        filteredAccounts = filteredAccounts.filter(a => a.isActive === filters.isActive);
      }

      if (filters?.isSystemAccount !== undefined) {
        filteredAccounts = filteredAccounts.filter(a => a.isSystemAccount === filters.isSystemAccount);
      }

      calculateStats(filteredAccounts);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredAccounts.slice(startIndex, endIndex);

      setAccounts(paginatedData);
      setPagination({
        page: page,
        total: filteredAccounts.length,
        totalPages: Math.ceil(filteredAccounts.length / limit),
        limit: limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart of accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  // Get account by ID
  const getAccountById = useCallback(async (id: string | number): Promise<ChartOfAccount | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const account = DUMMY_ACCOUNTS.find(a => String(a.id) === String(id));
    return account || null;
  }, []);

  // Create new account
  const createAccount = useCallback(async (accountData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newAccount: ChartOfAccount = {
        ...accountData,
        id: DUMMY_ACCOUNTS.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_ACCOUNTS.push(newAccount);
      setAccounts(prev => [newAccount, ...prev]);
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update account
  const updateAccount = useCallback(async (id: string | number, accountData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_ACCOUNTS.findIndex(a => String(a.id) === String(id));
      if (index === -1) {
        throw new Error('Account not found');
      }
      
      const updatedAccount: ChartOfAccount = {
        ...DUMMY_ACCOUNTS[index],
        ...accountData,
        updatedAt: new Date().toISOString()
      };
      DUMMY_ACCOUNTS[index] = updatedAccount;
      
      setAccounts(prev => prev.map(a => String(a.id) === String(id) ? updatedAccount : a));
      return updatedAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete account
  const deleteAccount = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_ACCOUNTS.findIndex(a => String(a.id) === String(id));
      if (index === -1) {
        throw new Error('Account not found');
      }
      DUMMY_ACCOUNTS.splice(index, 1);
      setAccounts(prev => prev.filter(a => String(a.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ChartOfAccountFilters>) => {
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
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    filters,
    pagination,
    stats,
    fetchAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    updateFilters,
    changePage,
    resetFilters,
    setFilters
  };
};