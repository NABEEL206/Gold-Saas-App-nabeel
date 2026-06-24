import { useState, useEffect, useCallback } from 'react';
import type { 
  ProformaInvoice, 
  ProformaInvoiceFilters 
} from '../../types/proforma/ProformaInvoiceType';

// Mock data for demonstration
const mockInvoices: ProformaInvoice[] = [
  {
      id: '1',
      invoiceNumber: 'PI-2024-001',
      invoiceDate: '2024-01-15',
      validUntil: '2024-02-15',
      customerId: 'cust1',
      customerName: 'ABC Corporation',
      customerEmail: 'contact@abccorp.com',
      customerPhone: '+1-555-0100',
      customerAddress: '123 Business St, New York, NY 10001',
      items: [
          {
              id: 'item1',
              productId: 'prod1',
              productName: 'Product A',
              description: 'High-quality product A',
              quantity: 5,
              unitPrice: 100,
              discount: 10,
              taxRate: 10,
              total: 450,
          },
          {
              id: 'item2',
              productId: 'prod2',
              productName: 'Product B',
              description: 'Premium product B',
              quantity: 3,
              unitPrice: 200,
              discount: 5,
              taxRate: 15,
              total: 655.5,
          },
      ],
      subtotal: 1100,
      discountTotal: 95,
      taxTotal: 150.75,
      grandTotal: 1155.75,
      currency: 'USD',
      paymentTerms: 'Net 30',
      deliveryTerms: 'FOB Shipping Point',
      notes: 'Please deliver before the end of the month',
      termsAndConditions: 'Standard terms apply',
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
      customerName: 'XYZ Ltd',
      customerEmail: 'info@xyzltd.com',
      customerPhone: '+1-555-0200',
      customerAddress: '456 Commerce Ave, Los Angeles, CA 90001',
      items: [
          {
              id: 'item3',
              productId: 'prod3',
              productName: 'Product C',
              description: 'Standard product C',
              quantity: 10,
              unitPrice: 50,
              discount: 0,
              taxRate: 10,
              total: 550,
          },
      ],
      subtotal: 500,
      discountTotal: 0,
      taxTotal: 50,
      grandTotal: 550,
      currency: 'USD',
      paymentTerms: 'Net 15',
      deliveryTerms: 'CIF',
      notes: '',
      termsAndConditions: 'Standard terms apply',
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
      customerName: 'Tech Solutions Inc',
      customerEmail: 'sales@techsolutions.com',
      customerPhone: '+1-555-0300',
      customerAddress: '789 Innovation Drive, San Francisco, CA 94105',
      items: [
          {
              id: 'item4',
              productId: 'prod4',
              productName: 'Product D',
              description: 'Enterprise product D',
              quantity: 2,
              unitPrice: 500,
              discount: 10,
              taxRate: 15,
              total: 1035,
          },
      ],
      subtotal: 1000,
      discountTotal: 100,
      taxTotal: 135,
      grandTotal: 1035,
      currency: 'USD',
      paymentTerms: 'Net 45',
      deliveryTerms: 'DDP',
      notes: 'Urgent delivery required',
      termsAndConditions: 'Special terms apply',
      status: 'approved',
      createdBy: 'admin',
      createdAt: '2024-01-25T09:15:00Z',
      updatedAt: '2024-01-26T11:00:00Z',
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
      // Simulate API call
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
      
      // Paginate
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
      return mockInvoices.find(inv => inv.id === id);
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