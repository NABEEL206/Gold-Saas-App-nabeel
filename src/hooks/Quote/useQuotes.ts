// src/hooks/Quote/useQuotes.ts
import { useState, useEffect, useCallback } from 'react';
import type { Quote, QuoteFilters, QuoteStats } from '../../types/Quote/QuoteTypes';

// Mock data - Replace with actual API calls
const MOCK_QUOTES: Quote[] = [
  {
    id: '1',
    quoteNo: 'Q-2024-001',
    date: '2024-01-15T10:30:00Z',
    validUntil: '2024-02-15T10:30:00Z',
    customerId: 'CUST-001',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@email.com',
    customerPhone: '9876543210',
    customerAddress: '123, Andheri East, Mumbai',
    customerGst: '27AABCU1234D1Z1',
    items: [
      {
        id: '1',
        itemId: 'GOLD-RING-001',
        itemName: 'Gold Diamond Ring',
        category: 'Rings',
        purity: '22K',
        weight: 12.5,
        quantity: 2,
        unitPrice: 45000,
        makingCharges: 1500,
        wastagePercentage: 3,
        stoneCharges: 2000,
        total: 93500,
      },
      {
        id: '2',
        itemId: 'DIAM-EARR-003',
        itemName: 'Diamond Stud Earrings',
        category: 'Earrings',
        purity: '18K',
        weight: 3.8,
        quantity: 1,
        unitPrice: 280000,
        makingCharges: 5000,
        wastagePercentage: 2,
        stoneCharges: 8000,
        total: 293000,
      },
    ],
    subtotal: 386500,
    tax: 69570,
    discount: 10000,
    discountType: 'fixed',
    shippingCharge: 500,
    otherCharges: 0,
    roundOff: 430,
    total: 447000,
    amountInWords: 'Four Lakh Forty Seven Thousand Only',
    notes: 'Please provide the best quality stones',
    termsAndConditions: 'Payment within 15 days of invoice',
    status: 'draft',
    createdBy: 'Admin User',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    quoteNo: 'Q-2024-002',
    date: '2024-02-20T14:20:00Z',
    validUntil: '2024-03-20T14:20:00Z',
    customerId: 'CUST-002',
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@company.com',
    customerPhone: '9876543211',
    customerAddress: '456, BKC, Bandra East, Mumbai',
    customerGst: '27BBBCU5678D1Z1',
    items: [
      {
        id: '1',
        itemId: 'SILV-NECK-002',
        itemName: 'Silver Chain Necklace',
        category: 'Necklaces',
        purity: '925',
        weight: 25.0,
        quantity: 3,
        unitPrice: 8500,
        makingCharges: 500,
        wastagePercentage: 5,
        stoneCharges: 0,
        total: 27000,
      },
    ],
    subtotal: 27000,
    tax: 3240,
    discount: 0,
    discountType: 'percentage',
    shippingCharge: 200,
    otherCharges: 0,
    roundOff: -40,
    total: 30400,
    amountInWords: 'Thirty Thousand Four Hundred Only',
    notes: 'Bulk order for corporate gifting',
    termsAndConditions: 'Standard terms apply',
    status: 'sent',
    createdBy: 'Admin User',
    createdAt: '2024-02-20T14:20:00Z',
    updatedAt: '2024-02-21T09:00:00Z',
  },
  {
    id: '3',
    quoteNo: 'Q-2024-003',
    date: '2024-03-10T09:15:00Z',
    validUntil: '2024-04-10T09:15:00Z',
    customerId: 'CUST-003',
    customerName: 'Dr. Amit Kumar',
    customerEmail: 'amit.kumar@clinic.com',
    customerPhone: '9876543212',
    customerAddress: '789, Defence Colony, Delhi',
    customerGst: '',
    items: [
      {
        id: '1',
        itemId: 'PLAT-BANG-004',
        itemName: 'Platinum Bangle Set',
        category: 'Bangles',
        purity: '950',
        weight: 45.0,
        quantity: 1,
        unitPrice: 450000,
        makingCharges: 8000,
        wastagePercentage: 2,
        stoneCharges: 12000,
        total: 470000,
      },
    ],
    subtotal: 470000,
    tax: 84600,
    discount: 20000,
    discountType: 'fixed',
    shippingCharge: 1000,
    otherCharges: 0,
    roundOff: 400,
    total: 536000,
    amountInWords: 'Five Lakh Thirty Six Thousand Only',
    notes: 'Special order for wedding gift',
    termsAndConditions: '50% advance payment required',
    status: 'accepted',
    createdBy: 'Admin User',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-03-12T11:30:00Z',
  },
  {
    id: '4',
    quoteNo: 'Q-2024-004',
    date: '2024-04-05T11:00:00Z',
    validUntil: '2024-05-05T11:00:00Z',
    customerId: 'CUST-001',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@email.com',
    customerPhone: '9876543210',
    customerAddress: '123, Andheri East, Mumbai',
    customerGst: '27AABCU1234D1Z1',
    items: [
      {
        id: '1',
        itemId: 'GOLD-PEND-005',
        itemName: 'Gold Pendant with Chain',
        category: 'Pendants',
        purity: '22K',
        weight: 18.5,
        quantity: 1,
        unitPrice: 185000,
        makingCharges: 1500,
        wastagePercentage: 3,
        stoneCharges: 3000,
        total: 189500,
      },
    ],
    subtotal: 189500,
    tax: 34110,
    discount: 5000,
    discountType: 'percentage',
    shippingCharge: 300,
    otherCharges: 0,
    roundOff: 10,
    total: 218920,
    amountInWords: 'Two Lakh Eighteen Thousand Nine Hundred Twenty Only',
    notes: 'Customer wants custom engraving',
    termsAndConditions: 'Standard terms apply',
    status: 'rejected',
    createdBy: 'Admin User',
    createdAt: '2024-04-05T11:00:00Z',
    updatedAt: '2024-04-07T15:00:00Z',
  },
  {
    id: '5',
    quoteNo: 'Q-2024-005',
    date: '2024-05-01T13:00:00Z',
    validUntil: '2024-06-01T13:00:00Z',
    customerId: 'CUST-002',
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@company.com',
    customerPhone: '9876543211',
    customerAddress: '456, BKC, Bandra East, Mumbai',
    customerGst: '27BBBCU5678D1Z1',
    items: [
      {
        id: '1',
        itemId: 'GOLD-BRAC-007',
        itemName: 'Gold Chain Bracelet',
        category: 'Bracelets',
        purity: '18K',
        weight: 15.0,
        quantity: 2,
        unitPrice: 75000,
        makingCharges: 1000,
        wastagePercentage: 2,
        stoneCharges: 0,
        total: 152000,
      },
    ],
    subtotal: 152000,
    tax: 27360,
    discount: 0,
    discountType: 'percentage',
    shippingCharge: 0,
    otherCharges: 0,
    roundOff: 40,
    total: 179400,
    amountInWords: 'One Lakh Seventy Nine Thousand Four Hundred Only',
    notes: 'Bulk discount applied',
    termsAndConditions: 'Payment within 30 days',
    status: 'expired',
    createdBy: 'Admin User',
    createdAt: '2024-05-01T13:00:00Z',
    updatedAt: '2024-05-01T13:00:00Z',
  },
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
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const [stats, setStats] = useState<QuoteStats>({
    totalQuotes: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
    totalValue: 0,
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get quote by ID - improved to handle loading state
  const getQuote = useCallback((id: string): Quote | null => {
    if (!id) return null;
    // Search in quotes state
    const found = quotes.find(q => q.id === id);
    if (found) return found;
    
    // If not found in state, search in mock data directly
    const mockFound = MOCK_QUOTES.find(q => q.id === id);
    if (mockFound) {
      // If found in mock but not in state, add it to state
      setQuotes(prev => {
        if (!prev.find(q => q.id === id)) {
          return [...prev, mockFound];
        }
        return prev;
      });
      return mockFound;
    }
    
    return null;
  }, [quotes]);

  // Fetch quotes
  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuotes(MOCK_QUOTES);
      calculateStats(MOCK_QUOTES);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate stats
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

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...quotes];

    // Search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(q =>
        q.quoteNo.toLowerCase().includes(query) ||
        q.customerName.toLowerCase().includes(query) ||
        q.customerEmail.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(q => q.status === filters.status);
    }

    // Date range
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

  // Create quote
  const createQuote = useCallback(async (data: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newQuote: Quote = {
        ...data,
        id: String(Date.now()),
        quoteNo: `Q-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin User',
      };
      setQuotes(prev => [...prev, newQuote]);
      return { success: true, data: newQuote };
    } catch (error) {
      console.error('Error creating quote:', error);
      return { success: false, error: 'Failed to create quote' };
    }
  }, [quotes]);

  // Update quote
  const updateQuote = useCallback(async (id: string, data: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuotes(prev => prev.map(q =>
        q.id === id
          ? { ...q, ...data, updatedAt: new Date().toISOString() }
          : q
      ));
      return { success: true };
    } catch (error) {
      console.error('Error updating quote:', error);
      return { success: false, error: 'Failed to update quote' };
    }
  }, []);

  // Delete quote
  const deleteQuote = useCallback(async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuotes(prev => prev.filter(q => q.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting quote:', error);
      return { success: false, error: 'Failed to delete quote' };
    }
  }, []);

  // Update status
  const handleStatusUpdate = useCallback(async (id: string, status: Quote['status']) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setQuotes(prev => prev.map(q =>
        q.id === id
          ? { ...q, status, updatedAt: new Date().toISOString() }
          : q
      ));
      return { success: true };
    } catch (error) {
      console.error('Error updating status:', error);
      return { success: false, error: 'Failed to update status' };
    }
  }, []);

  // Export
  const handleExport = useCallback(async (format: 'excel' | 'pdf') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Exporting quotes as ${format.toUpperCase()}`);
      alert(`Quotes exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Export failed');
    }
  }, []);

  // Import
  const handleImport = useCallback(async (files: FileList) => {
    setImportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Importing ${files.length} file(s)`);
      alert(`Imported ${files.length} file(s) successfully!`);
      return { success: true, count: files.length };
    } catch (error) {
      console.error('Error importing:', error);
      alert('Import failed');
      throw error;
    } finally {
      setImportLoading(false);
    }
  }, []);

  // Refresh
  const handleRefresh = useCallback(async () => {
    await fetchQuotes();
  }, [fetchQuotes]);

  // Change items per page
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    // State
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
    importLoading,

    // Setters
    setFilters,
    setCurrentPage,
    setItemsPerPage: handleItemsPerPageChange,

    // Actions
    getQuote,
    createQuote,
    updateQuote,
    deleteQuote,
    handleStatusUpdate,
    handleExport,
    handleImport,
    handleRefresh,
    fetchQuotes,
  };
};