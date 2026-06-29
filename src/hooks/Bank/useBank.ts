// src/hooks/Bank/useBank.ts

import { useState, useEffect, useCallback } from 'react';
import type{
  Bank,
  BankFilters,
  BankResponse,
  BankStats,
  BANK_ACCOUNT_TYPES,
  BANK_STATUSES
} from '../../types/Bank/BankTypes';

// Dummy data
const DUMMY_BANKS: Bank[] = [
  {
    id: 1,
    bankName: 'HDFC Bank',
    accountName: 'Tech Solutions Pvt Ltd',
    accountNumber: '1234567890',
    accountType: 'current',
    ifscCode: 'HDFC0001234',
    branchName: 'Main Branch',
    branchAddress: '123 Business Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    contactPerson: 'John Doe',
    contactPhone: '+91 9876543210',
    contactEmail: 'john@techsolutions.com',
    openingBalance: 1000000,
    currentBalance: 1500000,
    currency: 'INR',
    status: 'active',
    notes: 'Primary business account',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    bankName: 'ICICI Bank',
    accountName: 'Global Supplies Ltd',
    accountNumber: '9876543210',
    accountType: 'savings',
    ifscCode: 'ICICI0005678',
    branchName: 'Corporate Branch',
    branchAddress: '456 Trade Center',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    pincode: '110001',
    contactPerson: 'Jane Smith',
    contactPhone: '+91 8765432109',
    contactEmail: 'jane@globalsupplies.com',
    openingBalance: 500000,
    currentBalance: 750000,
    currency: 'INR',
    status: 'active',
    notes: 'Vendor payment account',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 3,
    bankName: 'SBI Bank',
    accountName: 'Quality Products Co',
    accountNumber: '5678901234',
    accountType: 'savings',
    ifscCode: 'SBIN0009012',
    branchName: 'Industrial Area',
    branchAddress: '789 Factory Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pincode: '600001',
    contactPerson: 'Mike Johnson',
    contactPhone: '+91 7654321098',
    contactEmail: 'mike@qualityproducts.com',
    openingBalance: 250000,
    currentBalance: 180000,
    currency: 'INR',
    status: 'inactive',
    notes: 'Dormant account',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-15'
  },
  {
    id: 4,
    bankName: 'Axis Bank',
    accountName: 'Premier Logistics',
    accountNumber: '3456789012',
    accountType: 'current',
    ifscCode: 'AXIS0003456',
    branchName: 'Logistics Hub',
    branchAddress: '321 Transport Nagar',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    pincode: '560001',
    contactPerson: 'Sarah Wilson',
    contactPhone: '+91 6543210987',
    contactEmail: 'sarah@premierlogistics.com',
    openingBalance: 750000,
    currentBalance: 1200000,
    currency: 'INR',
    status: 'active',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  },
  {
    id: 5,
    bankName: 'Kotak Mahindra Bank',
    accountName: 'Industrial Parts Ltd',
    accountNumber: '7890123456',
    accountType: 'fixed_deposit',
    ifscCode: 'KKBK0007890',
    branchName: 'Industrial Finance',
    branchAddress: '654 Finance Street',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    pincode: '500001',
    contactPerson: 'Robert Brown',
    contactPhone: '+91 5432109876',
    contactEmail: 'robert@industrialltd.com',
    openingBalance: 2000000,
    currentBalance: 2000000,
    currency: 'INR',
    status: 'suspended',
    notes: 'FD account - temporarily suspended',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-15'
  }
];

export const useBank = (initialFilters?: BankFilters) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BankFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });
  const [stats, setStats] = useState<BankStats>({
    totalBanks: 0,
    activeCount: 0,
    inactiveCount: 0,
    suspendedCount: 0,
    totalBalance: 0,
    savingsCount: 0,
    currentCount: 0,
    fixedDepositCount: 0
  });

  // Calculate stats
  const calculateStats = useCallback((banksData: Bank[]) => {
    const total = banksData.length;
    const activeCount = banksData.filter(b => b.status === 'active').length;
    const inactiveCount = banksData.filter(b => b.status === 'inactive').length;
    const suspendedCount = banksData.filter(b => b.status === 'suspended').length;
    const totalBalance = banksData.reduce((sum, b) => sum + b.currentBalance, 0);
    const savingsCount = banksData.filter(b => b.accountType === 'savings').length;
    const currentCount = banksData.filter(b => b.accountType === 'current').length;
    const fixedDepositCount = banksData.filter(b => b.accountType === 'fixed_deposit').length;

    setStats({
      totalBanks: total,
      activeCount,
      inactiveCount,
      suspendedCount,
      totalBalance,
      savingsCount,
      currentCount,
      fixedDepositCount
    });
  }, []);

  // Fetch banks
  const fetchBanks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredBanks = [...DUMMY_BANKS];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredBanks = filteredBanks.filter(b =>
          b.bankName.toLowerCase().includes(searchLower) ||
          b.accountName.toLowerCase().includes(searchLower) ||
          b.accountNumber.includes(filters.search!) ||
          b.ifscCode.toLowerCase().includes(searchLower) ||
          b.branchName.toLowerCase().includes(searchLower) ||
          b.city?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status) {
        filteredBanks = filteredBanks.filter(b => b.status === filters.status);
      }

      if (filters?.accountType) {
        filteredBanks = filteredBanks.filter(b => b.accountType === filters.accountType);
      }

      if (filters?.bankName) {
        filteredBanks = filteredBanks.filter(b => 
          b.bankName.toLowerCase().includes(filters.bankName!.toLowerCase())
        );
      }

      if (filters?.city) {
        filteredBanks = filteredBanks.filter(b => 
          b.city?.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }

      calculateStats(filteredBanks);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredBanks.slice(startIndex, endIndex);

      setBanks(paginatedData);
      setPagination({
        page: page,
        total: filteredBanks.length,
        totalPages: Math.ceil(filteredBanks.length / limit),
        limit: limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch banks');
      setBanks([]);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  // Get bank by ID
  const getBankById = useCallback(async (id: string | number): Promise<Bank | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const bank = DUMMY_BANKS.find(b => String(b.id) === String(id));
    return bank || null;
  }, []);

  // Create new bank
  const createBank = useCallback(async (bankData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newBank: Bank = {
        ...bankData,
        id: DUMMY_BANKS.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_BANKS.push(newBank);
      setBanks(prev => [newBank, ...prev]);
      return newBank;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bank');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update bank
  const updateBank = useCallback(async (id: string | number, bankData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_BANKS.findIndex(b => String(b.id) === String(id));
      if (index === -1) {
        throw new Error('Bank not found');
      }
      
      const updatedBank: Bank = {
        ...DUMMY_BANKS[index],
        ...bankData,
        updatedAt: new Date().toISOString()
      };
      DUMMY_BANKS[index] = updatedBank;
      
      setBanks(prev => prev.map(b => String(b.id) === String(id) ? updatedBank : b));
      return updatedBank;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bank');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete bank
  const deleteBank = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_BANKS.findIndex(b => String(b.id) === String(id));
      if (index === -1) {
        throw new Error('Bank not found');
      }
      DUMMY_BANKS.splice(index, 1);
      setBanks(prev => prev.filter(b => String(b.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bank');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<BankFilters>) => {
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
    fetchBanks();
  }, [fetchBanks]);

  return {
    banks,
    loading,
    error,
    filters,
    pagination,
    stats,
    fetchBanks,
    getBankById,
    createBank,
    updateBank,
    deleteBank,
    updateFilters,
    changePage,
    resetFilters,
    setFilters
  };
};