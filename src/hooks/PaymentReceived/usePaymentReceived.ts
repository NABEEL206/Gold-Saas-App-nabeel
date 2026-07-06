// src/hooks/PaymentReceived/usePaymentReceived.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  PaymentReceived, 
  PaymentReceivedFilters,
  PaymentReceivedStats 
} from '../../types/paymentReceived/PaymentReceivedTypes';
import {
  validatePaymentReceivedForm,
  formatValidationErrors,
  type PaymentReceivedValidationErrors,
  type ValidationResult,
} from '../../validations/paymentReceived.validation';

// Mock data
const MOCK_PAYMENTS: PaymentReceived[] = [
  {
    id: '1',
    paymentNumber: 'PAY-2024-001',
    paymentDate: new Date().toISOString().split('T')[0],
    customerId: '1',
    customerName: 'Rajesh Jewelers',
    customerEmail: 'rajesh@jewelers.com',
    customerPhone: '+91-98765-43210',
    invoiceId: '1',
    invoiceNumber: 'INV-000001',
    amount: 29500,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'BT-2024-001',
    bankName: 'HDFC Bank',
    notes: 'Payment received for invoice INV-000001',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    paymentNumber: 'PAY-2024-002',
    paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '2',
    customerName: 'Priya Gold House',
    customerEmail: 'priya@goldhouse.com',
    customerPhone: '+91-98765-43211',
    invoiceId: '2',
    invoiceNumber: 'INV-000002',
    amount: 50445,
    paymentMethod: 'upi',
    referenceNumber: 'UPI-2024-002',
    notes: 'Payment via UPI',
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    paymentNumber: 'PAY-2024-003',
    paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '3',
    customerName: 'Suresh Gold Mart',
    customerEmail: 'suresh@goldmart.com',
    customerPhone: '+91-98765-43212',
    invoiceId: '3',
    invoiceNumber: 'INV-000003',
    amount: 37760,
    paymentMethod: 'cheque',
    referenceNumber: 'CHQ-2024-003',
    bankName: 'SBI Bank',
    chequeNumber: '123456',
    chequeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Cheque payment',
    status: 'pending',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    paymentNumber: 'PAY-2024-004',
    paymentDate: new Date().toISOString().split('T')[0],
    customerId: '4',
    customerName: 'Meera Jewel World',
    customerEmail: 'meera@jewelworld.com',
    customerPhone: '+91-98765-43213',
    invoiceId: '4',
    invoiceNumber: 'INV-000004',
    amount: 12862,
    paymentMethod: 'cash',
    notes: 'Cash payment received',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let paymentCounter = 5;

export const usePaymentReceived = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentReceived[]>([]);
  const [filters, setFilters] = useState<PaymentReceivedFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    paymentMethod: '',
    customerId: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
  });

  // Load payments
  const loadPayments = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setPayments([...MOCK_PAYMENTS]);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.paymentNumber.toLowerCase().includes(query) ||
          payment.customerName.toLowerCase().includes(query) ||
          payment.customerEmail.toLowerCase().includes(query) ||
          payment.invoiceNumber?.toLowerCase().includes(query)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((payment) => payment.status === filters.status);
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter((payment) => payment.paymentMethod === filters.paymentMethod);
    }

    if (filters.customerId) {
      filtered = filtered.filter((payment) => payment.customerId === filters.customerId);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (payment) => new Date(payment.paymentDate) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (payment) => new Date(payment.paymentDate) <= new Date(filters.dateTo)
      );
    }

    return filtered;
  }, [payments, filters]);

  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);
  const currentItems = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats
  const stats = useMemo<PaymentReceivedStats>(() => {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedCount = payments.filter((p) => p.status === 'completed').length;
    const pendingCount = payments.filter((p) => p.status === 'pending').length;
    const failedCount = payments.filter((p) => p.status === 'failed').length;
    const refundedCount = payments.filter((p) => p.status === 'refunded').length;

    return {
      totalPayments: payments.length,
      totalAmount,
      completedCount,
      pendingCount,
      failedCount,
      refundedCount,
    };
  }, [payments]);

  // ─── Validation ───

  /**
   * Validate payment form data
   */
  const validatePayment = useCallback((formData: any): boolean => {
    const result = validatePaymentReceivedForm(formData);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result.errors);
    setErrors(formattedErrors);
    
    return result.isValid;
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setValidationResult({
      isValid: true,
      errors: {},
    });
  }, []);

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // ─── CRUD Operations ───

  const createPayment = useCallback(async (data: any) => {
    // Validate before creating
    if (!validatePayment(data)) {
      throw new Error('Validation failed');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const newPayment: PaymentReceived = {
          id: String(paymentCounter++),
          paymentNumber: `PAY-2024-${String(paymentCounter - 1).padStart(3, '0')}`,
          paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
          customerId: data.customerId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          invoiceId: data.invoiceId || '',
          invoiceNumber: data.invoiceNumber || '',
          amount: data.amount,
          paymentMethod: data.paymentMethod || 'cash',
          referenceNumber: data.referenceNumber || '',
          bankName: data.bankName || '',
          chequeNumber: data.chequeNumber || '',
          chequeDate: data.chequeDate || '',
          notes: data.notes || '',
          status: data.status || 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPayments(prev => [newPayment, ...prev]);
        clearErrors();
        resolve(newPayment);
      }, 500);
    });
  }, [validatePayment, clearErrors]);

  const updatePayment = useCallback(async (id: string, data: any) => {
    // Validate before updating
    if (!validatePayment(data)) {
      throw new Error('Validation failed');
    }

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = payments.findIndex((p) => p.id === id);
        if (index !== -1) {
          const updated = { ...payments[index], ...data, updatedAt: new Date().toISOString() };
          const newPayments = [...payments];
          newPayments[index] = updated;
          setPayments(newPayments);
          clearErrors();
          resolve(updated);
        } else {
          reject(new Error('Payment not found'));
        }
      }, 500);
    });
  }, [payments, validatePayment, clearErrors]);

  const deletePayment = useCallback(async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = payments.findIndex((p) => p.id === id);
        if (index !== -1) {
          const newPayments = payments.filter((p) => p.id !== id);
          setPayments(newPayments);
          resolve(true);
        } else {
          reject(new Error('Payment not found'));
        }
      }, 500);
    });
  }, [payments]);

  const getPayment = useCallback(async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check state first
        const payment = payments.find((p) => p.id === id);
        if (payment) {
          resolve({ ...payment });
          return;
        }

        // Check mock data directly
        const mockPayment = MOCK_PAYMENTS.find((p) => p.id === id);
        if (mockPayment) {
          setPayments(prev => {
            const exists = prev.some(p => p.id === id);
            if (!exists) {
              return [...prev, { ...mockPayment }];
            }
            return prev;
          });
          resolve({ ...mockPayment });
        } else {
          reject(new Error('Payment not found'));
        }
      }, 300);
    });
  }, [payments]);

  const updateStatus = useCallback(async (id: string, status: PaymentReceived['status']) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = payments.findIndex((p) => p.id === id);
        if (index !== -1) {
          const updated = { ...payments[index], status, updatedAt: new Date().toISOString() };
          const newPayments = [...payments];
          newPayments[index] = updated;
          setPayments(newPayments);
          resolve(updated);
        } else {
          reject(new Error('Payment not found'));
        }
      }, 500);
    });
  }, [payments]);

  const handleRefresh = useCallback(() => {
    loadPayments();
  }, [loadPayments]);

  const handleExport = useCallback(async (format: 'pdf' | 'excel') => {
    console.log(`Exporting as ${format}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }, []);

  const handleImport = useCallback(async (files: FileList) => {
    console.log('Importing files:', files);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }, []);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSetItemsPerPage = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const handleSetFilters = useCallback((newFilters: PaymentReceivedFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return {
    // State
    loading,
    payments,
    currentItems,
    stats,
    filters,
    currentPage,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    totalPages,
    errors,
    validationResult,
    
    // Actions
    setFilters: handleSetFilters,
    setCurrentPage: setPage,
    setItemsPerPage: handleSetItemsPerPage,
    createPayment,
    updatePayment,
    deletePayment,
    getPayment,
    updateStatus,
    handleExport,
    handleImport,
    handleRefresh,
    loadPayments,
    validatePayment,
    clearErrors,
    clearFieldError,
  };
};