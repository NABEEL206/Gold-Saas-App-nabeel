// src/hooks/Invoices/useInvoices.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Invoice, InvoiceFilters, InvoiceStats } from '../../types/Invoice/InvoiceTypes';

// Mock data
const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNo: 'INV-000001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '1',
    customerName: 'Rajesh Jewelers',
    customerEmail: 'rajesh@jewelers.com',
    customerPhone: '9876543210',
    customerGst: '22AAAAA0000A1Z5',
    items: [],
    subtotal: 25000,
    taxRate: 18,
    taxAmount: 4500,
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 0,
    otherCharges: 0,
    total: 29500,
    amountPaid: 0,
    balanceDue: 29500,
    status: 'sent',
    paymentTerms: 'Net 15',
    notes: 'Thank you for your business.',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable\n3. Payment terms: 15 days',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    invoiceNo: 'INV-000002',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '2',
    customerName: 'Priya Gold House',
    customerEmail: 'priya@goldhouse.com',
    customerPhone: '9876543211',
    items: [],
    subtotal: 45000,
    taxRate: 18,
    taxAmount: 8100,
    discount: 5,
    discountType: 'percentage',
    shippingCharge: 0,
    otherCharges: 0,
    total: 50445,
    amountPaid: 50445,
    balanceDue: 0,
    status: 'paid',
    paymentTerms: 'Net 15',
    notes: '',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    invoiceNo: 'INV-000003',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '3',
    customerName: 'Suresh Gold Mart',
    customerEmail: 'suresh@goldmart.com',
    customerPhone: '9876543212',
    items: [],
    subtotal: 32000,
    taxRate: 18,
    taxAmount: 5760,
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 0,
    otherCharges: 0,
    total: 37760,
    amountPaid: 10000,
    balanceDue: 27760,
    status: 'overdue',
    paymentTerms: 'Net 15',
    notes: 'Payment overdue',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    invoiceNo: 'INV-000004',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '4',
    customerName: 'Meera Jewel World',
    customerEmail: 'meera@jewelworld.com',
    customerPhone: '9876543213',
    items: [],
    subtotal: 18000,
    taxRate: 18,
    taxAmount: 3240,
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 0,
    otherCharges: 0,
    total: 21240,
    amountPaid: 0,
    balanceDue: 21240,
    status: 'draft',
    paymentTerms: 'Net 15',
    notes: '',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let invoiceCounter = 5;

export const useInvoices = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filters, setFilters] = useState<InvoiceFilters>({
    searchQuery: '',
    status: 'all',
    dateRange: {
      start: '',
      end: '',
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Load invoices
  const loadInvoices = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setInvoices([...MOCK_INVOICES]);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNo.toLowerCase().includes(query) ||
          invoice.customerName.toLowerCase().includes(query) ||
          invoice.customerEmail.toLowerCase().includes(query)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === filters.status);
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(
        (invoice) => new Date(invoice.date) >= new Date(filters.dateRange.start)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(
        (invoice) => new Date(invoice.date) <= new Date(filters.dateRange.end)
      );
    }

    return filtered;
  }, [invoices, filters]);

  const totalItems = filteredInvoices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredInvoices.slice(startIndex, endIndex);

  // Stats
  const stats = useMemo<InvoiceStats>(() => {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidAmount = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = invoices
      .filter((inv) => inv.status === 'sent' || inv.status === 'partial' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.balanceDue, 0);
    const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;

    return {
      totalInvoices: invoices.length,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueCount,
    };
  }, [invoices]);

  // CRUD operations
  const createInvoice = useCallback(async (data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInvoice: Invoice = {
          id: String(invoiceCounter++),
          invoiceNo: `INV-${String(invoiceCounter - 1).padStart(6, '0')}`,
          date: data.date,
          dueDate: data.dueDate,
          customerId: data.customerId,
          customerName: data.customerName || 'Customer Name',
          customerEmail: data.customerEmail || 'customer@email.com',
          customerPhone: data.customerPhone || '9876543210',
          items: [],
          subtotal: 0,
          taxRate: 18,
          taxAmount: 0,
          discount: data.discount || 0,
          discountType: data.discountType || 'fixed',
          shippingCharge: data.shippingCharge || 0,
          otherCharges: data.otherCharges || 0,
          total: 0,
          amountPaid: 0,
          balanceDue: 0,
          status: 'draft',
          paymentTerms: data.paymentTerms || 'Net 15',
          notes: data.notes || '',
          termsAndConditions: data.termsAndConditions || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setInvoices(prev => [newInvoice, ...prev]);
        resolve(newInvoice);
      }, 500);
    });
  }, []);

  const updateInvoice = useCallback(async (id: string, data: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = invoices.findIndex((inv) => inv.id === id);
        if (index !== -1) {
          const updated = { ...invoices[index], ...data, updatedAt: new Date().toISOString() };
          const newInvoices = [...invoices];
          newInvoices[index] = updated;
          setInvoices(newInvoices);
          resolve(updated);
        } else {
          reject(new Error('Invoice not found'));
        }
      }, 500);
    });
  }, [invoices]);

  const deleteInvoice = useCallback(async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = invoices.findIndex((inv) => inv.id === id);
        if (index !== -1) {
          const newInvoices = invoices.filter((inv) => inv.id !== id);
          setInvoices(newInvoices);
          resolve(true);
        } else {
          reject(new Error('Invoice not found'));
        }
      }, 500);
    });
  }, [invoices]);

  const getInvoice = useCallback(async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const invoice = invoices.find((inv) => inv.id === id);
        if (invoice) {
          resolve({ ...invoice });
        } else {
          reject(new Error('Invoice not found'));
        }
      }, 300);
    });
  }, [invoices]);

  const updateStatus = useCallback(async (id: string, status: Invoice['status']) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = invoices.findIndex((inv) => inv.id === id);
        if (index !== -1) {
          const updated = { ...invoices[index], status, updatedAt: new Date().toISOString() };
          const newInvoices = [...invoices];
          newInvoices[index] = updated;
          setInvoices(newInvoices);
          resolve(updated);
        } else {
          reject(new Error('Invoice not found'));
        }
      }, 500);
    });
  }, [invoices]);

  const handleRefresh = useCallback(() => {
    loadInvoices();
  }, [loadInvoices]);

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

  return {
    loading,
    invoices,
    currentItems,
    stats,
    filters,
    currentPage,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    totalPages,
    setFilters,
    setCurrentPage,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    updateStatus,
    handleExport,
    handleImport,
    handleRefresh,
  };
};