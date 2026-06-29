// src/hooks/PaymentMade/usePaymentMade.ts

import { useState, useEffect, useCallback } from 'react';
import type{
  PaymentMade,
  PaymentMadeFilters,
  PaymentMadeResponse,
  PaymentMadeStats,
  PAYMENT_MADE_STATUSES,
  PAYMENT_METHODS
} from '../../types/PaymentMade/PaymentMadeType'

// Dummy data
const DUMMY_PAYMENTS: PaymentMade[] = [
  {
    id: 1,
    paymentNumber: 'PAY-2024-001',
    paymentDate: '2024-01-15',
    billId: 1,
    billNumber: 'BILL-2024-001',
    vendorId: 1,
    vendorName: 'Tech Solutions Inc.',
    vendorEmail: 'info@techsolutions.com',
    amount: 252225,
    paymentMethod: 'bank',
    referenceNumber: 'REF-001',
    bankName: 'HDFC Bank',
    bankAccount: 'XXXX1234',
    notes: 'Payment for software licenses',
    status: 'completed',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 2,
    paymentNumber: 'PAY-2024-002',
    paymentDate: '2024-01-20',
    billId: 2,
    billNumber: 'BILL-2024-002',
    vendorId: 2,
    vendorName: 'Global Supplies Ltd',
    vendorEmail: 'contact@globalsupplies.com',
    amount: 180540,
    paymentMethod: 'cheque',
    referenceNumber: 'REF-002',
    chequeNumber: 'CHQ-001',
    bankName: 'ICICI Bank',
    notes: 'Payment for office chairs',
    status: 'pending',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    paymentNumber: 'PAY-2024-003',
    paymentDate: '2024-02-01',
    billId: 3,
    billNumber: 'BILL-2024-003',
    vendorId: 3,
    vendorName: 'Quality Products Co',
    vendorEmail: 'sales@qualityproducts.com',
    amount: 26250,
    paymentMethod: 'cash',
    notes: 'Payment for stationery supplies',
    status: 'completed',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 4,
    paymentNumber: 'PAY-2024-004',
    paymentDate: '2024-02-10',
    billId: 4,
    billNumber: 'BILL-2024-004',
    vendorId: 4,
    vendorName: 'Premier Logistics',
    vendorEmail: 'info@premierlogistics.com',
    amount: 10000,
    paymentMethod: 'bank',
    referenceNumber: 'REF-004',
    bankName: 'SBI Bank',
    bankAccount: 'XXXX5678',
    notes: 'Partial payment for shipping',
    status: 'completed',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10'
  },
  {
    id: 5,
    paymentNumber: 'PAY-2024-005',
    paymentDate: '2024-02-15',
    billId: 5,
    billNumber: 'BILL-2024-005',
    vendorId: 5,
    vendorName: 'Industrial Parts Ltd',
    vendorEmail: 'parts@industrialltd.com',
    amount: 67260,
    paymentMethod: 'credit_card',
    referenceNumber: 'REF-005',
    notes: 'Payment for machine parts',
    status: 'failed',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15'
  }
];

export const usePaymentMade = (initialFilters?: PaymentMadeFilters) => {
  const [payments, setPayments] = useState<PaymentMade[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentMadeFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });
  const [stats, setStats] = useState<PaymentMadeStats>({
    totalPayments: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0,
    failedAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    averageAmount: 0
  });

  // Calculate stats
  const calculateStats = useCallback((paymentsData: PaymentMade[]) => {
    const total = paymentsData.length;
    const totalAmount = paymentsData.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = paymentsData
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = paymentsData
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    const failedAmount = paymentsData
      .filter(p => p.status === 'failed')
      .reduce((sum, p) => sum + p.amount, 0);
    const completedCount = paymentsData.filter(p => p.status === 'completed').length;
    const pendingCount = paymentsData.filter(p => p.status === 'pending').length;
    const failedCount = paymentsData.filter(p => p.status === 'failed').length;
    const cancelledCount = paymentsData.filter(p => p.status === 'cancelled').length;

    setStats({
      totalPayments: total,
      totalAmount,
      completedAmount,
      pendingAmount,
      failedAmount,
      completedCount,
      pendingCount,
      failedCount,
      cancelledCount,
      averageAmount: total > 0 ? totalAmount / total : 0
    });
  }, []);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredPayments = [...DUMMY_PAYMENTS];

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPayments = filteredPayments.filter(p =>
          p.paymentNumber.toLowerCase().includes(searchLower) ||
          p.vendorName?.toLowerCase().includes(searchLower) ||
          p.billNumber?.toLowerCase().includes(searchLower) ||
          p.referenceNumber?.toLowerCase().includes(searchLower) ||
          p.notes?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.status) {
        filteredPayments = filteredPayments.filter(p => p.status === filters.status);
      }

      if (filters?.paymentMethod) {
        filteredPayments = filteredPayments.filter(p => p.paymentMethod === filters.paymentMethod);
      }

      if (filters?.vendorId) {
        filteredPayments = filteredPayments.filter(p => p.vendorId === filters.vendorId);
      }

      if (filters?.billId) {
        filteredPayments = filteredPayments.filter(p => p.billId === filters.billId);
      }

      if (filters?.dateFrom) {
        filteredPayments = filteredPayments.filter(p => p.paymentDate >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        filteredPayments = filteredPayments.filter(p => p.paymentDate <= filters.dateTo!);
      }

      if (filters?.minAmount) {
        filteredPayments = filteredPayments.filter(p => p.amount >= filters.minAmount!);
      }
      if (filters?.maxAmount) {
        filteredPayments = filteredPayments.filter(p => p.amount <= filters.maxAmount!);
      }

      calculateStats(filteredPayments);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredPayments.slice(startIndex, endIndex);

      setPayments(paginatedData);
      setPagination({
        page: page,
        total: filteredPayments.length,
        totalPages: Math.ceil(filteredPayments.length / limit),
        limit: limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  // Get payment by ID
  const getPaymentById = useCallback(async (id: string | number): Promise<PaymentMade | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const payment = DUMMY_PAYMENTS.find(p => String(p.id) === String(id));
    return payment || null;
  }, []);

  // Create new payment
  const createPayment = useCallback(async (paymentData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newPayment: PaymentMade = {
        ...paymentData,
        id: DUMMY_PAYMENTS.length + 1,
        paymentNumber: `PAY-2024-${String(DUMMY_PAYMENTS.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_PAYMENTS.push(newPayment);
      setPayments(prev => [newPayment, ...prev]);
      return newPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update payment
  const updatePayment = useCallback(async (id: string | number, paymentData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_PAYMENTS.findIndex(p => String(p.id) === String(id));
      if (index === -1) {
        throw new Error('Payment not found');
      }
      
      const updatedPayment: PaymentMade = {
        ...DUMMY_PAYMENTS[index],
        ...paymentData,
        updatedAt: new Date().toISOString()
      };
      DUMMY_PAYMENTS[index] = updatedPayment;
      
      setPayments(prev => prev.map(p => String(p.id) === String(id) ? updatedPayment : p));
      return updatedPayment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete payment
  const deletePayment = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_PAYMENTS.findIndex(p => String(p.id) === String(id));
      if (index === -1) {
        throw new Error('Payment not found');
      }
      DUMMY_PAYMENTS.splice(index, 1);
      setPayments(prev => prev.filter(p => String(p.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<PaymentMadeFilters>) => {
    setFilters((prev: any) => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  }, []);

  // Change page
  const changePage = useCallback((page: number) => {
    setFilters((prev: any) => ({
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
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    filters,
    pagination,
    stats,
    fetchPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    updateFilters,
    changePage,
    resetFilters,
    setFilters
  };
};