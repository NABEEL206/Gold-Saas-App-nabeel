// src/hooks/Proforma/useProformaInvoice.ts
import { useState, useEffect, useCallback } from 'react';
import type { 
  ProformaInvoice, 
  ProformaInvoiceFilters 
} from '../../types/proforma/ProformaInvoiceType';

// Mock data with richer demo data
const mockInvoices: ProformaInvoice[] = [
  {
    id: '1',
    invoiceNumber: 'PI-2024-001',
    invoiceDate: '2024-01-15',
    validUntil: '2024-02-15',
    customerId: 'cust1',
    customerName: 'Rajesh Jewelers',
    customerEmail: 'rajesh@jewelers.com',
    customerPhone: '+91-98765-43210',
    customerAddress: '123, Jewelry Market, Mumbai, Maharashtra',
    items: [
      {
        id: 'item1',
        productId: 'prod1',
        productName: 'Gold Chain',
        description: '22K Gold Chain with pendant',
        quantity: 2,
        unitPrice: 4500,
        discount: 0,
        taxRate: 18,
        total: 9000,
      },
      {
        id: 'item2',
        productId: 'prod2',
        productName: 'Diamond Ring',
        description: '18K Diamond Ring with 0.5ct diamond',
        quantity: 1,
        unitPrice: 8500,
        discount: 5,
        taxRate: 18,
        total: 8075,
      },
    ],
    subtotal: 17075,
    discountTotal: 425,
    taxTotal: 2997,
    grandTotal: 19647,
    currency: 'INR',
    paymentTerms: 'Net 15',
    deliveryTerms: 'FOB Shipping Point',
    notes: 'Please deliver before the end of the month',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable\n3. Payment terms: 15 days',
    status: 'draft',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    discount: 0
  },
  {
    id: '2',
    invoiceNumber: 'PI-2024-002',
    invoiceDate: '2024-01-20',
    validUntil: '2024-02-20',
    customerId: 'cust2',
    customerName: 'Priya Gold House',
    customerEmail: 'priya@goldhouse.com',
    customerPhone: '+91-98765-43211',
    customerAddress: '45, Gold Street, Chennai, Tamil Nadu',
    items: [
      {
        id: 'item3',
        productId: 'prod3',
        productName: 'Gold Earrings',
        description: '22K Gold Earrings with pearl',
        quantity: 3,
        unitPrice: 3200,
        discount: 0,
        taxRate: 18,
        total: 9600,
      },
      {
        id: 'item4',
        productId: 'prod4',
        productName: 'Silver Necklace',
        description: '18K Silver Necklace with chain',
        quantity: 2,
        unitPrice: 2800,
        discount: 0,
        taxRate: 18,
        total: 5600,
      },
    ],
    subtotal: 15200,
    discountTotal: 0,
    taxTotal: 2736,
    grandTotal: 17936,
    currency: 'INR',
    paymentTerms: 'Net 15',
    deliveryTerms: 'CIF',
    notes: '',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable',
    status: 'sent',
    createdBy: 'admin',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    discount: 0
  },
  {
    id: '3',
    invoiceNumber: 'PI-2024-003',
    invoiceDate: '2024-01-25',
    validUntil: '2024-02-25',
    customerId: 'cust3',
    customerName: 'Suresh Gold Mart',
    customerEmail: 'suresh@goldmart.com',
    customerPhone: '+91-98765-43212',
    customerAddress: '78, Gold Plaza, Delhi',
    items: [
      {
        id: 'item5',
        productId: 'prod5',
        productName: 'Gold Bracelet',
        description: '22K Gold Bracelet with diamonds',
        quantity: 1,
        unitPrice: 3800,
        discount: 0,
        taxRate: 18,
        total: 3800,
      },
    ],
    subtotal: 3800,
    discountTotal: 0,
    taxTotal: 684,
    grandTotal: 4484,
    currency: 'INR',
    paymentTerms: 'Net 15',
    deliveryTerms: 'DDP',
    notes: 'Urgent delivery required',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable',
    status: 'approved',
    createdBy: 'admin',
    createdAt: '2024-01-25T09:15:00Z',
    updatedAt: '2024-01-26T11:00:00Z',
    discount: 0
  },
  {
    id: '4',
    invoiceNumber: 'PI-2024-004',
    invoiceDate: '2024-01-28',
    validUntil: '2024-02-28',
    customerId: 'cust4',
    customerName: 'Meera Jewel World',
    customerEmail: 'meera@jewelworld.com',
    customerPhone: '+91-98765-43213',
    customerAddress: '56, Diamond District, Surat, Gujarat',
    items: [
      {
        id: 'item6',
        productId: 'prod1',
        productName: 'Gold Chain',
        description: '22K Gold Chain with pendant',
        quantity: 1,
        unitPrice: 4500,
        discount: 0,
        taxRate: 18,
        total: 4500,
      },
      {
        id: 'item7',
        productId: 'prod3',
        productName: 'Gold Earrings',
        description: '22K Gold Earrings',
        quantity: 2,
        unitPrice: 3200,
        discount: 0,
        taxRate: 18,
        total: 6400,
      },
    ],
    subtotal: 10900,
    discountTotal: 0,
    taxTotal: 1962,
    grandTotal: 12862,
    currency: 'INR',
    paymentTerms: 'Net 15',
    deliveryTerms: 'FOB Shipping Point',
    notes: 'Draft proforma - pending review',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable',
    status: 'draft',
    createdBy: 'admin',
    createdAt: '2024-01-28T11:00:00Z',
    updatedAt: '2024-01-28T11:00:00Z',
    discount: 0
  },
];

interface UseProformaInvoiceReturn {
  invoices: ProformaInvoice[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  filters: ProformaInvoiceFilters;
  fetchInvoices: (page?: number, filters?: ProformaInvoiceFilters) => Promise<void>;
  getInvoice: (id: string) => Promise<ProformaInvoice | undefined>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: ProformaInvoice['status']) => Promise<void>;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setFilters: (filters: ProformaInvoiceFilters) => void;
}

export const useProformaInvoice = (): UseProformaInvoiceReturn => {
  const [invoices, setInvoices] = useState<ProformaInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<ProformaInvoiceFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    customerId: '',
  });

  const fetchInvoices = useCallback(async (page?: number, newFilters?: ProformaInvoiceFilters) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentFilters = newFilters || filters;
      const currentPageNum = page || currentPage;
      
      let filtered = [...mockInvoices];
      
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        filtered = filtered.filter(inv =>
          inv.invoiceNumber.toLowerCase().includes(searchLower) ||
          inv.customerName.toLowerCase().includes(searchLower) ||
          inv.customerEmail.toLowerCase().includes(searchLower)
        );
      }
      if (currentFilters.status) {
        filtered = filtered.filter(inv => inv.status === currentFilters.status);
      }
      if (currentFilters.dateFrom) {
        filtered = filtered.filter(inv => inv.invoiceDate >= currentFilters.dateFrom);
      }
      if (currentFilters.dateTo) {
        filtered = filtered.filter(inv => inv.invoiceDate <= currentFilters.dateTo);
      }
      if (currentFilters.customerId) {
        filtered = filtered.filter(inv => inv.customerId === currentFilters.customerId);
      }
      
      setTotalItems(filtered.length);
      
      const startIndex = (currentPageNum - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = filtered.slice(startIndex, endIndex);
      
      setInvoices(paginatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  const getInvoice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Check mock data directly
      const invoice = mockInvoices.find(inv => inv.id === id);
      if (invoice) {
        return { ...invoice };
      }
      return undefined;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockInvoices.findIndex(inv => inv.id === id);
      if (index !== -1) {
        mockInvoices.splice(index, 1);
      }
      await fetchInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchInvoices]);

  const updateInvoiceStatus = useCallback(async (id: string, status: ProformaInvoice['status']) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const invoice = mockInvoices.find(inv => inv.id === id);
      if (invoice) {
        invoice.status = status;
        invoice.updatedAt = new Date().toISOString();
      }
      await fetchInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchInvoices]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSetItemsPerPage = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const handleSetFilters = useCallback((newFilters: ProformaInvoiceFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    error,
    totalItems,
    currentPage,
    itemsPerPage,
    filters,
    fetchInvoices,
    getInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    setPage,
    setItemsPerPage: handleSetItemsPerPage,
    setFilters: handleSetFilters,
  };
};