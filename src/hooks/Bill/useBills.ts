// src/hooks/Bill/useBills.ts

import { useState, useEffect, useCallback } from 'react';
import type{
  Bill,
  BillFilters,
  BillResponse,
  BillStats,
  BILL_STATUSES
} from '../../types/Bill/BillTypes';

// Dummy data
const DUMMY_BILLS: Bill[] = [
  {
    id: 1,
    billNumber: 'BILL-2024-001',
    billDate: '2024-01-15',
    dueDate: '2024-02-14',
    vendorId: 1,
    vendorName: 'Tech Solutions Inc.',
    vendorEmail: 'info@techsolutions.com',
    vendorPhone: '+1 (555) 123-4567',
    vendorGST: 'GSTIN123456789',
    purchaseOrderNumber: 'PO-2024-001',
    status: 'paid',
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
    subtotal: 225000,
    discountTotal: 11250,
    taxTotal: 38475,
    totalAmount: 252225,
    paidAmount: 252225,
    balanceDue: 0,
    notes: 'Paid in full',
    paymentTerms: 'Net 30',
    paymentDate: '2024-02-10',
    paymentMethod: 'bank',
    createdAt: '2024-01-15',
    updatedAt: '2024-02-10'
  },
  {
    id: 2,
    billNumber: 'BILL-2024-002',
    billDate: '2024-01-20',
    dueDate: '2024-02-19',
    vendorId: 2,
    vendorName: 'Global Supplies Ltd',
    vendorEmail: 'contact@globalsupplies.com',
    vendorPhone: '+1 (555) 234-5678',
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
    subtotal: 170000,
    discountTotal: 17000,
    taxTotal: 27540,
    totalAmount: 180540,
    paidAmount: 0,
    balanceDue: 180540,
    notes: 'Awaiting approval',
    paymentTerms: 'Net 45',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    billNumber: 'BILL-2024-003',
    billDate: '2024-02-01',
    dueDate: '2024-03-02',
    vendorId: 3,
    vendorName: 'Quality Products Co',
    vendorEmail: 'sales@qualityproducts.com',
    vendorPhone: '+1 (555) 345-6789',
    status: 'overdue',
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
    subtotal: 25000,
    discountTotal: 0,
    taxTotal: 1250,
    totalAmount: 26250,
    paidAmount: 0,
    balanceDue: 26250,
    notes: 'Overdue - follow up required',
    paymentTerms: 'Net 30',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 4,
    billNumber: 'BILL-2024-004',
    billDate: '2024-02-05',
    dueDate: '2024-03-06',
    vendorId: 4,
    vendorName: 'Premier Logistics',
    vendorEmail: 'info@premierlogistics.com',
    vendorPhone: '+1 (555) 456-7890',
    status: 'partial',
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
    subtotal: 15000,
    discountTotal: 0,
    taxTotal: 750,
    totalAmount: 15750,
    paidAmount: 10000,
    balanceDue: 5750,
    notes: 'Partial payment received',
    paymentTerms: 'Net 30',
    paymentDate: '2024-02-20',
    paymentMethod: 'cheque',
    createdAt: '2024-02-05',
    updatedAt: '2024-02-20'
  },
  {
    id: 5,
    billNumber: 'BILL-2024-005',
    billDate: '2024-02-10',
    dueDate: '2024-03-11',
    vendorId: 5,
    vendorName: 'Industrial Parts Ltd',
    vendorEmail: 'parts@industrialltd.com',
    vendorPhone: '+1 (555) 567-8901',
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
    subtotal: 60000,
    discountTotal: 3000,
    taxTotal: 10260,
    totalAmount: 67260,
    paidAmount: 0,
    balanceDue: 0,
    notes: 'Cancelled - order voided',
    paymentTerms: 'Net 30',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-15'
  }
];

export const useBills = (initialFilters?: BillFilters) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BillFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });
  const [stats, setStats] = useState<BillStats>({
    totalBills: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalBalance: 0,
    paidCount: 0,
    pendingCount: 0,
    overdueCount: 0,
    draftCount: 0,
    cancelledCount: 0,
    averageAmount: 0
  });

  // Calculate stats
  const calculateStats = useCallback((billsData: Bill[]) => {
    const total = billsData.length;
    const totalAmount = billsData.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalPaid = billsData.reduce((sum, bill) => sum + bill.paidAmount, 0);
    const totalBalance = billsData.reduce((sum, bill) => sum + bill.balanceDue, 0);
    const paidCount = billsData.filter(b => b.status === 'paid').length;
    const pendingCount = billsData.filter(b => b.status === 'pending').length;
    const overdueCount = billsData.filter(b => b.status === 'overdue').length;
    const draftCount = billsData.filter(b => b.status === 'draft').length;
    const cancelledCount = billsData.filter(b => b.status === 'cancelled').length;

    setStats({
      totalBills: total,
      totalAmount,
      totalPaid,
      totalBalance,
      paidCount,
      pendingCount,
      overdueCount,
      draftCount,
      cancelledCount,
      averageAmount: total > 0 ? totalAmount / total : 0
    });
  }, []);

  // Fetch bills
  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredBills = [...DUMMY_BILLS];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredBills = filteredBills.filter(bill =>
          bill.billNumber.toLowerCase().includes(searchLower) ||
          bill.vendorName?.toLowerCase().includes(searchLower) ||
          bill.vendorEmail?.toLowerCase().includes(searchLower) ||
          bill.purchaseOrderNumber?.toLowerCase().includes(searchLower) ||
          bill.notes?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status) {
        filteredBills = filteredBills.filter(bill => bill.status === filters.status);
      }

      if (filters?.vendorId) {
        filteredBills = filteredBills.filter(bill => bill.vendorId === filters.vendorId);
      }

      if (filters?.dateFrom) {
        filteredBills = filteredBills.filter(bill => bill.billDate >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        filteredBills = filteredBills.filter(bill => bill.billDate <= filters.dateTo!);
      }

      if (filters?.minAmount) {
        filteredBills = filteredBills.filter(bill => bill.totalAmount >= filters.minAmount!);
      }
      if (filters?.maxAmount) {
        filteredBills = filteredBills.filter(bill => bill.totalAmount <= filters.maxAmount!);
      }

      calculateStats(filteredBills);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredBills.slice(startIndex, endIndex);

      setBills(paginatedData);
      setPagination({
        page: page,
        total: filteredBills.length,
        totalPages: Math.ceil(filteredBills.length / limit),
        limit: limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bills');
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  // Get bill by ID
  const getBillById = useCallback(async (id: string | number): Promise<Bill | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const bill = DUMMY_BILLS.find(b => String(b.id) === String(id));
    return bill || null;
  }, []);

  // Create new bill
  const createBill = useCallback(async (billData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newBill: Bill = {
        ...billData,
        id: DUMMY_BILLS.length + 1,
        billNumber: `BILL-2024-${String(DUMMY_BILLS.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_BILLS.push(newBill);
      setBills(prev => [newBill, ...prev]);
      return newBill;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bill');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update bill
  const updateBill = useCallback(async (id: string | number, billData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_BILLS.findIndex(b => String(b.id) === String(id));
      if (index === -1) {
        throw new Error('Bill not found');
      }
      
      const updatedBill: Bill = {
        ...DUMMY_BILLS[index],
        ...billData,
        updatedAt: new Date().toISOString()
      };
      DUMMY_BILLS[index] = updatedBill;
      
      setBills(prev => prev.map(b => String(b.id) === String(id) ? updatedBill : b));
      return updatedBill;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bill');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete bill
  const deleteBill = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_BILLS.findIndex(b => String(b.id) === String(id));
      if (index === -1) {
        throw new Error('Bill not found');
      }
      DUMMY_BILLS.splice(index, 1);
      setBills(prev => prev.filter(b => String(b.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bill');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<BillFilters>) => {
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
    fetchBills();
  }, [fetchBills]);

  return {
    bills,
    loading,
    error,
    filters,
    pagination,
    stats,
    fetchBills,
    getBillById,
    createBill,
    updateBill,
    deleteBill,
    updateFilters,
    changePage,
    resetFilters,
    setFilters
  };
};