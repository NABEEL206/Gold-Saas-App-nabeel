// src/hooks/sales/useQuotes.ts
import { useState, useEffect, useCallback } from 'react';
import type { 
  Quote, 
  QuoteFilters, 
  QuoteStats, 
  QuoteFormData,
  CustomerSuggestion,
  ItemSuggestion 
} from '../../../types/Quote/QuoteTypes';

// Mock data - Replace with actual API calls
const MOCK_QUOTES: Quote[] = [
  {
    id: '1',
    quoteNo: 'QT-2024-001',
    date: '2024-01-15',
    customerId: '1',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul@email.com',
    customerPhone: '9876543210',
    customerGst: '27AABCU1234D1Z1',
    customerAddress: '123, Andheri East, Mumbai',
    items: [
      {
        id: '1',
        itemId: '1',
        itemCode: 'GOLD-001',
        itemName: '22K Gold Chain',
        category: 'Chain',
        purity: '22K',
        weight: 50,
        makingCharges: 2500,
        wastagePercentage: 5,
        stoneCharges: 0,
        description: '22K Gold Chain 50g',
        quantity: 2,
        unitPrice: 45000,
        taxRate: 3,
        taxAmount: 2700,
        discount: 0,
        total: 92700,
      }
    ],
    subtotal: 90000,
    discount: 0,
    discountType: 'fixed',
    discountValue: 0,
    tax: 2700,
    taxRate: 3,
    shippingCharge: 0,
    otherCharges: 0,
    roundOff: 0,
    total: 92700,
    amountInWords: 'Ninety Two Thousand Seven Hundred Only',
    notes: 'Quote for gold chain',
    termsAndConditions: 'Standard terms apply',
    status: 'draft',
    validUntil: '2024-02-15',
    createdBy: 'Admin',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  }
];

// Mock customers for suggestions
const MOCK_CUSTOMERS: CustomerSuggestion[] = [
  { id: '1', name: 'Rahul Sharma', email: 'rahul@email.com', phone: '9876543210', gst: '27AABCU1234D1Z1', address: '123, Andheri East, Mumbai' },
  { id: '2', name: 'Priya Patel', email: 'priya@company.com', phone: '9876543211', gst: '27BBBCU5678D1Z1', address: '456, BKC, Bandra East, Mumbai' },
];

// Mock items for suggestions
const MOCK_ITEMS: ItemSuggestion[] = [
  { id: '1', code: 'GOLD-001', name: '22K Gold Chain', category: 'Chain', purity: '22K', price: 45000 },
  { id: '2', code: 'GOLD-002', name: '24K Gold Bracelet', category: 'Bracelet', purity: '24K', price: 52000 },
  { id: '3', code: 'DIA-001', name: 'Diamond Ring', category: 'Ring', purity: '18K', price: 125000 },
];

export const useQuotes = () => {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentItems, setCurrentItems] = useState<Quote[]>([]);
  const [filters, setFilters] = useState<QuoteFilters>({
    searchQuery: '',
    status: 'all',
    dateRange: { start: '', end: '' },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<QuoteStats>({
    totalQuotes: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
    totalValue: 0,
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuotes(MOCK_QUOTES);
      calculateStats(MOCK_QUOTES);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (data: Quote[]) => {
    setStats({
      totalQuotes: data.length,
      draft: data.filter(q => q.status === 'draft').length,
      sent: data.filter(q => q.status === 'sent').length,
      accepted: data.filter(q => q.status === 'accepted').length,
      rejected: data.filter(q => q.status === 'rejected').length,
      expired: data.filter(q => q.status === 'expired').length,
      totalValue: data.reduce((sum, q) => sum + q.total, 0),
    });
  };

  const applyFilters = useCallback(() => {
    let filtered = [...quotes];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(q =>
        q.quoteNo.toLowerCase().includes(query) ||
        q.customerName.toLowerCase().includes(query) ||
        q.customerEmail.toLowerCase().includes(query)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(q => q.status === filters.status);
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(q => q.date >= filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(q => q.date <= filters.dateRange.end);
    }

    setTotalItems(filtered.length);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setCurrentItems(filtered.slice(start, end));
  }, [quotes, filters, currentPage, itemsPerPage]);

  const createQuote = useCallback(async (data: QuoteFormData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const formattedItems = data.items.map((item, index) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const itemTaxAmount = itemSubtotal * item.taxRate / 100;
        return {
          id: `${Date.now()}-${index}`,
          itemId: item.itemId,
          itemCode: item.itemId,
          itemName: item.itemName,
          category: item.category,
          purity: item.purity,
          weight: item.weight,
          makingCharges: item.makingCharges,
          wastagePercentage: item.wastagePercentage,
          stoneCharges: item.stoneCharges,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taxAmount: itemTaxAmount,
          discount: item.discount,
          total: itemSubtotal + itemTaxAmount - item.discount,
        };
      });

      const subtotal = formattedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const tax = formattedItems.reduce((sum, item) => sum + item.taxAmount, 0);
      const total = subtotal + tax + data.shippingCharge + data.otherCharges - (data.discount || 0);

      const newQuote: Quote = {
          id: Date.now().toString(),
          quoteNo: `QT-2024-${String(quotes.length + 1).padStart(3, '0')}`,
          ...data,
          items: formattedItems,
          customerName: 'Customer Name',
          customerEmail: 'customer@email.com',
          customerPhone: '9876543210',
          customerGst: '',
          customerAddress: '',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Admin',
          subtotal,
          tax,
          discountValue: data.discount || 0,
          roundOff: 0,
          total,
          amountInWords: '',
          taxRate: formattedItems.length ? formattedItems[0].taxRate : 0,
      };
      setQuotes(prev => [...prev, newQuote]);
      return { success: true, data: newQuote };
    } catch (error) {
      return { success: false, error: 'Failed to create quote' };
    }
  }, [quotes]);

  const updateQuote = useCallback(async (id: string, data: Partial<QuoteFormData>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setQuotes(prev => prev.map(q =>
        q.id === id ? { ...q, ...data, updatedAt: new Date().toISOString() } as Quote : q
      ));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update quote' };
    }
  }, []);

  const deleteQuote = useCallback(async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setQuotes(prev => prev.filter(q => q.id !== id));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete quote' };
    }
  }, []);

  const getQuote = useCallback((id: string) => {
    return quotes.find(q => q.id === id) || null;
  }, [quotes]);

  const getCustomers = useCallback(async (search: string): Promise<CustomerSuggestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CUSTOMERS.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, []);

  const getItems = useCallback(async (search: string): Promise<ItemSuggestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_ITEMS.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchQuotes();
  }, [fetchQuotes]);

  const handleExport = useCallback(async (format: 'excel' | 'pdf') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Quotes exported as ${format.toUpperCase()}`);
    } catch (error) {
      alert('Export failed');
    }
  }, []);

  const handleImport = useCallback(async (files: FileList) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Imported ${files.length} file(s) successfully`);
    } catch (error) {
      alert('Import failed');
    }
  }, []);

  const handleStatusUpdate = useCallback(async (id: string, status: Quote['status']) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuotes(prev => prev.map(q =>
        q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q
      ));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update status' };
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    loading,
    quotes,
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
    createQuote,
    updateQuote,
    deleteQuote,
    getQuote,
    getCustomers,
    getItems,
    handleRefresh,
    handleExport,
    handleImport,
    handleStatusUpdate,
  };
};