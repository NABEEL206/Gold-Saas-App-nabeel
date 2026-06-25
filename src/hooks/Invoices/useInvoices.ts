// src/hooks/Invoices/useInvoices.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Invoice, InvoiceFilters, InvoiceStats } from '../../types/Invoice/InvoiceTypes';

// Mock data with proper items for each invoice
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
    customerAddress: '123, Jewelry Market, Mumbai, Maharashtra',
    items: [
      {
        id: 'item1',
        invoiceId: '1',
        itemId: '1',
        itemName: 'Gold Chain',
        description: '22K Gold Chain with pendant',
        quantity: 2,
        rate: 4500,
        discount: 0,
        taxRate: 18,
        taxAmount: 1620,
        total: 9000,
        purity: '22K',
        category: 'Chain',
        weight: 10.5,
        makingCharges: 500,
        wastagePercentage: 3,
        stoneCharges: 0,
      },
      {
        id: 'item2',
        invoiceId: '1',
        itemId: '2',
        itemName: 'Diamond Ring',
        description: '18K Diamond Ring with 0.5ct diamond',
        quantity: 1,
        rate: 8500,
        discount: 5,
        taxRate: 18,
        taxAmount: 1530,
        total: 8075,
        purity: '18K',
        category: 'Ring',
        weight: 3.2,
        makingCharges: 800,
        wastagePercentage: 2,
        stoneCharges: 2000,
      },
    ],
    subtotal: 17075,
    taxRate: 18,
    taxAmount: 3150,
    discount: 5,
    discountType: 'percentage',
    shippingCharge: 200,
    otherCharges: 0,
    total: 20225,
    amountPaid: 0,
    balanceDue: 20225,
    status: 'sent',
    paymentTerms: 'Net 15',
    notes: 'Thank you for your business. We appreciate your trust in us.',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable\n3. Payment terms: 15 days\n4. Goods once sold cannot be returned',
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
    customerGst: '22BBBBB0000B1Z5',
    customerAddress: '45, Gold Street, Chennai, Tamil Nadu',
    items: [
      {
        id: 'item3',
        invoiceId: '2',
        itemId: '3',
        itemName: 'Gold Earrings',
        description: '22K Gold Earrings with pearl',
        quantity: 3,
        rate: 3200,
        discount: 0,
        taxRate: 18,
        taxAmount: 1728,
        total: 9600,
        purity: '22K',
        category: 'Earring',
        weight: 6.8,
        makingCharges: 400,
        wastagePercentage: 2,
        stoneCharges: 500,
      },
      {
        id: 'item4',
        invoiceId: '2',
        itemId: '4',
        itemName: 'Silver Necklace',
        description: '18K Silver Necklace with chain',
        quantity: 2,
        rate: 2800,
        discount: 0,
        taxRate: 18,
        taxAmount: 1008,
        total: 5600,
        purity: '18K',
        category: 'Necklace',
        weight: 15.2,
        makingCharges: 600,
        wastagePercentage: 3,
        stoneCharges: 0,
      },
    ],
    subtotal: 15200,
    taxRate: 18,
    taxAmount: 2736,
    discount: 0,
    discountType: 'percentage',
    shippingCharge: 150,
    otherCharges: 0,
    total: 18086,
    amountPaid: 18086,
    balanceDue: 0,
    status: 'paid',
    paymentTerms: 'Net 15',
    notes: 'Thank you for your payment.',
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
    customerGst: '22CCCCC0000C1Z5',
    customerAddress: '78, Gold Plaza, Delhi',
    items: [
      {
        id: 'item5',
        invoiceId: '3',
        itemId: '5',
        itemName: 'Gold Bracelet',
        description: '22K Gold Bracelet with diamonds',
        quantity: 1,
        rate: 3800,
        discount: 0,
        taxRate: 18,
        taxAmount: 684,
        total: 3800,
        purity: '22K',
        category: 'Bracelet',
        weight: 5.2,
        makingCharges: 700,
        wastagePercentage: 2,
        stoneCharges: 1500,
      },
    ],
    subtotal: 3800,
    taxRate: 18,
    taxAmount: 684,
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 100,
    otherCharges: 0,
    total: 4584,
    amountPaid: 1000,
    balanceDue: 3584,
    status: 'overdue',
    paymentTerms: 'Net 15',
    notes: 'Payment overdue. Please make payment at the earliest.',
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
    customerGst: '22DDDDD0000D1Z5',
    customerAddress: '56, Diamond District, Surat, Gujarat',
    items: [
      {
        id: 'item6',
        invoiceId: '4',
        itemId: '1',
        itemName: 'Gold Chain',
        description: '22K Gold Chain with pendant',
        quantity: 1,
        rate: 4500,
        discount: 0,
        taxRate: 18,
        taxAmount: 810,
        total: 4500,
        purity: '22K',
        category: 'Chain',
        weight: 5.5,
        makingCharges: 400,
        wastagePercentage: 2,
        stoneCharges: 0,
      },
      {
        id: 'item7',
        invoiceId: '4',
        itemId: '3',
        itemName: 'Gold Earrings',
        description: '22K Gold Earrings',
        quantity: 2,
        rate: 3200,
        discount: 0,
        taxRate: 18,
        taxAmount: 1152,
        total: 6400,
        purity: '22K',
        category: 'Earring',
        weight: 4.8,
        makingCharges: 300,
        wastagePercentage: 2,
        stoneCharges: 0,
      },
    ],
    subtotal: 10900,
    taxRate: 18,
    taxAmount: 1962,
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 0,
    otherCharges: 0,
    total: 12862,
    amountPaid: 0,
    balanceDue: 12862,
    status: 'draft',
    paymentTerms: 'Net 15',
    notes: 'Draft invoice - pending review',
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

  // Load invoices - immediately set with mock data
  const loadInvoices = useCallback(() => {
    setLoading(true);
    // Use setTimeout to simulate API call
    setTimeout(() => {
      setInvoices([...MOCK_INVOICES]);
      setLoading(false);
    }, 100); // Reduced timeout for faster loading
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
          customerAddress: data.customerAddress || '',
          customerGst: data.customerGst || '',
          items: data.items || [],
          subtotal: data.subtotal || 0,
          taxRate: data.taxRate || 18,
          taxAmount: data.taxAmount || 0,
          discount: data.discount || 0,
          discountType: data.discountType || 'fixed',
          shippingCharge: data.shippingCharge || 0,
          otherCharges: data.otherCharges || 0,
          total: data.total || 0,
          amountPaid: 0,
          balanceDue: data.total || 0,
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
      // First check if we have the invoice in state
      const existingInvoice = invoices.find((inv) => inv.id === id);
      
      if (existingInvoice) {
        resolve({ ...existingInvoice });
        return;
      }

      // If not found in state, check mock data directly
      const mockInvoice = MOCK_INVOICES.find((inv) => inv.id === id);
      if (mockInvoice) {
        // Add it to state for future use
        setInvoices(prev => {
          // Check if it's already in state (avoid duplicates)
          const exists = prev.some(inv => inv.id === id);
          if (!exists) {
            return [...prev, { ...mockInvoice }];
          }
          return prev;
        });
        resolve({ ...mockInvoice });
        return;
      }

      // If still not found, reject with error
      reject(new Error('Invoice not found'));
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