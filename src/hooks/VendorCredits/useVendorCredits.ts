// src/hooks/VendorCredits/useVendorCredits.ts

import { useState, useEffect, useCallback } from 'react';
import type{
  VendorCredit,
  VendorCreditFilters,
  VendorCreditResponse,
  VendorCreditStats,
  VENDOR_CREDIT_STATUSES,
  VENDOR_CREDIT_REASONS
} from '../../types/VendorCredits/VendorCreditsType';

// Dummy data
const DUMMY_VENDOR_CREDITS: VendorCredit[] = [
  {
    id: 1,
    creditNumber: 'VC-2024-001',
    creditDate: '2024-01-15',
    billId: 1,
    billNumber: 'BILL-2024-001',
    vendorId: 1,
    vendorName: 'Tech Solutions Inc.',
    vendorEmail: 'info@techsolutions.com',
    vendorGST: 'GSTIN123456789',
    amount: 252225,
    taxAmount: 38475,
    totalAmount: 290700,
    reason: 'return',
    status: 'used',
    items: [
      {
        productId: '1',
        productName: 'Laptop',
        quantity: 5,
        unit: 'Pcs',
        rate: 45000,
        discount: 5,
        discountType: 'percentage',
        taxRate: 18,
        taxAmount: 38475,
        total: 252225
      }
    ],
    notes: 'Credit for returned laptops',
    referenceNumber: 'REF-001',
    usedAmount: 290700,
    balanceAmount: 0,
    createdAt: '2024-01-15',
    updatedAt: '2024-02-10'
  },
  {
    id: 2,
    creditNumber: 'VC-2024-002',
    creditDate: '2024-01-20',
    billId: 2,
    billNumber: 'BILL-2024-002',
    vendorId: 2,
    vendorName: 'Global Supplies Ltd',
    vendorEmail: 'contact@globalsupplies.com',
    amount: 180540,
    taxAmount: 27540,
    totalAmount: 208080,
    reason: 'discount',
    status: 'pending',
    items: [
      {
        productId: '3',
        productName: 'Office Chairs',
        quantity: 20,
        unit: 'Pcs',
        rate: 8500,
        discount: 10,
        discountType: 'percentage',
        taxRate: 18,
        taxAmount: 27540,
        total: 180540
      }
    ],
    notes: 'Volume discount credit',
    referenceNumber: 'REF-002',
    usedAmount: 0,
    balanceAmount: 208080,
    expiryDate: '2024-03-20',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    creditNumber: 'VC-2024-003',
    creditDate: '2024-02-01',
    billId: 3,
    billNumber: 'BILL-2024-003',
    vendorId: 3,
    vendorName: 'Quality Products Co',
    vendorEmail: 'sales@qualityproducts.com',
    amount: 26250,
    taxAmount: 1250,
    totalAmount: 27500,
    reason: 'damage',
    status: 'approved',
    items: [
      {
        productId: '4',
        productName: 'Stationery Supplies',
        quantity: 50,
        unit: 'Set',
        rate: 500,
        discount: 0,
        discountType: 'percentage',
        taxRate: 5,
        taxAmount: 1250,
        total: 26250
      }
    ],
    notes: 'Credit for damaged stationery items',
    referenceNumber: 'REF-003',
    usedAmount: 0,
    balanceAmount: 27500,
    expiryDate: '2024-04-01',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-05'
  },
  {
    id: 4,
    creditNumber: 'VC-2024-004',
    creditDate: '2024-02-10',
    billId: 4,
    billNumber: 'BILL-2024-004',
    vendorId: 4,
    vendorName: 'Premier Logistics',
    vendorEmail: 'info@premierlogistics.com',
    amount: 10000,
    taxAmount: 600,
    totalAmount: 10600,
    reason: 'adjustment',
    status: 'draft',
    items: [
      {
        productId: '5',
        productName: 'Shipping Boxes',
        quantity: 100,
        unit: 'Pcs',
        rate: 150,
        discount: 0,
        discountType: 'percentage',
        taxRate: 5,
        taxAmount: 750,
        total: 15750
      }
    ],
    notes: 'Price adjustment credit',
    referenceNumber: 'REF-004',
    usedAmount: 0,
    balanceAmount: 10600,
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  },
  {
    id: 5,
    creditNumber: 'VC-2024-005',
    creditDate: '2024-02-15',
    billId: 5,
    billNumber: 'BILL-2024-005',
    vendorId: 5,
    vendorName: 'Industrial Parts Ltd',
    vendorEmail: 'parts@industrialltd.com',
    amount: 67260,
    taxAmount: 10260,
    totalAmount: 77520,
    reason: 'other',
    status: 'cancelled',
    items: [
      {
        productId: '6',
        productName: 'Machine Parts',
        quantity: 30,
        unit: 'Pcs',
        rate: 2000,
        discount: 5,
        discountType: 'percentage',
        taxRate: 18,
        taxAmount: 10260,
        total: 67260
      }
    ],
    notes: 'Credit cancelled due to resolution',
    referenceNumber: 'REF-005',
    usedAmount: 0,
    balanceAmount: 0,
    createdAt: '2024-02-15',
    updatedAt: '2024-02-20'
  }
];

export const useVendorCredits = (initialFilters?: VendorCreditFilters) => {
  const [credits, setCredits] = useState<VendorCredit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VendorCreditFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });
  const [stats, setStats] = useState<VendorCreditStats>({
    totalCredits: 0,
    totalAmount: 0,
    usedAmount: 0,
    balanceAmount: 0,
    draftCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    usedCount: 0,
    cancelledCount: 0,
    expiredCount: 0,
    averageAmount: 0
  });

  // Calculate stats
  const calculateStats = useCallback((creditsData: VendorCredit[]) => {
    const total = creditsData.length;
    const totalAmount = creditsData.reduce((sum, c) => sum + c.totalAmount, 0);
    const usedAmount = creditsData.reduce((sum, c) => sum + (c.usedAmount || 0), 0);
    const balanceAmount = creditsData.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);
    const draftCount = creditsData.filter(c => c.status === 'draft').length;
    const pendingCount = creditsData.filter(c => c.status === 'pending').length;
    const approvedCount = creditsData.filter(c => c.status === 'approved').length;
    const usedCount = creditsData.filter(c => c.status === 'used').length;
    const cancelledCount = creditsData.filter(c => c.status === 'cancelled').length;
    const expiredCount = creditsData.filter(c => c.status === 'expired').length;

    setStats({
      totalCredits: total,
      totalAmount,
      usedAmount,
      balanceAmount,
      draftCount,
      pendingCount,
      approvedCount,
      usedCount,
      cancelledCount,
      expiredCount,
      averageAmount: total > 0 ? totalAmount / total : 0
    });
  }, []);

  // Fetch vendor credits
  const fetchCredits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredCredits = [...DUMMY_VENDOR_CREDITS];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredCredits = filteredCredits.filter(c =>
          c.creditNumber.toLowerCase().includes(searchLower) ||
          c.vendorName?.toLowerCase().includes(searchLower) ||
          c.billNumber?.toLowerCase().includes(searchLower) ||
          c.referenceNumber?.toLowerCase().includes(searchLower) ||
          c.notes?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status) {
        filteredCredits = filteredCredits.filter(c => c.status === filters.status);
      }

      if (filters?.reason) {
        filteredCredits = filteredCredits.filter(c => c.reason === filters.reason);
      }

      if (filters?.vendorId) {
        filteredCredits = filteredCredits.filter(c => c.vendorId === filters.vendorId);
      }

      if (filters?.billId) {
        filteredCredits = filteredCredits.filter(c => c.billId === filters.billId);
      }

      if (filters?.dateFrom) {
        filteredCredits = filteredCredits.filter(c => c.creditDate >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        filteredCredits = filteredCredits.filter(c => c.creditDate <= filters.dateTo!);
      }

      if (filters?.minAmount) {
        filteredCredits = filteredCredits.filter(c => c.totalAmount >= filters.minAmount!);
      }
      if (filters?.maxAmount) {
        filteredCredits = filteredCredits.filter(c => c.totalAmount <= filters.maxAmount!);
      }

      calculateStats(filteredCredits);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredCredits.slice(startIndex, endIndex);

      setCredits(paginatedData);
      setPagination({
        page: page,
        total: filteredCredits.length,
        totalPages: Math.ceil(filteredCredits.length / limit),
        limit: limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendor credits');
      setCredits([]);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  // Get credit by ID
  const getCreditById = useCallback(async (id: string | number): Promise<VendorCredit | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const credit = DUMMY_VENDOR_CREDITS.find(c => String(c.id) === String(id));
    return credit || null;
  }, []);

  // Create new vendor credit
  const createCredit = useCallback(async (creditData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newCredit: VendorCredit = {
        ...creditData,
        id: DUMMY_VENDOR_CREDITS.length + 1,
        creditNumber: `VC-2024-${String(DUMMY_VENDOR_CREDITS.length + 1).padStart(3, '0')}`,
        usedAmount: 0,
        balanceAmount: creditData.totalAmount || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_VENDOR_CREDITS.push(newCredit);
      setCredits(prev => [newCredit, ...prev]);
      return newCredit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor credit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update vendor credit
  const updateCredit = useCallback(async (id: string | number, creditData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_VENDOR_CREDITS.findIndex(c => String(c.id) === String(id));
      if (index === -1) {
        throw new Error('Vendor credit not found');
      }
      
      const updatedCredit: VendorCredit = {
        ...DUMMY_VENDOR_CREDITS[index],
        ...creditData,
        updatedAt: new Date().toISOString()
      };
      DUMMY_VENDOR_CREDITS[index] = updatedCredit;
      
      setCredits(prev => prev.map(c => String(c.id) === String(id) ? updatedCredit : c));
      return updatedCredit;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor credit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete vendor credit
  const deleteCredit = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_VENDOR_CREDITS.findIndex(c => String(c.id) === String(id));
      if (index === -1) {
        throw new Error('Vendor credit not found');
      }
      DUMMY_VENDOR_CREDITS.splice(index, 1);
      setCredits(prev => prev.filter(c => String(c.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vendor credit');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<VendorCreditFilters>) => {
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
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    error,
    filters,
    pagination,
    stats,
    fetchCredits,
    getCreditById,
    createCredit,
    updateCredit,
    deleteCredit,
    updateFilters,
    changePage,
    resetFilters,
    setFilters
  };
};