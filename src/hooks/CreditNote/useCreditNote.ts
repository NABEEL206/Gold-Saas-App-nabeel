// src/hooks/sales/useCreditNote.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  CreditNote, 
  CreditNoteFilters,
  CreditNoteStats,
  CreditNoteItem 
} from '../../types/creditNote/CreditNoteTypes';
// Mock data
const MOCK_CREDIT_NOTES: CreditNote[] = [
  {
    id: '1',
    creditNoteNumber: 'CN-2024-001',
    creditNoteDate: new Date().toISOString().split('T')[0],
    customerId: '1',
    customerName: 'Rajesh Jewelers',
    customerEmail: 'rajesh@jewelers.com',
    customerPhone: '+91-98765-43210',
    customerGst: '22AAAAA0000A1Z5',
    invoiceId: '1',
    invoiceNumber: 'INV-000001',
    items: [
      {
        id: 'item1',
        creditNoteId: '1',
        itemName: 'Gold Chain',
        description: '22K Gold Chain with pendant',
        quantity: 1,
        unit: 'Pcs',
        rate: 4500,
        discount: 0,
        taxRate: 18,
        taxAmount: 810,
        total: 5310,
        purity: '22K',
        weight: 5.5,
        makingCharges: 400,
      },
    ],
    subtotal: 4500,
    taxRate: 18,
    taxAmount: 810,
    discount: 0,
    discountType: 'percentage',
    total: 5310,
    reason: 'Product damaged during shipping',
    status: 'approved',
    notes: 'Customer returned damaged item',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    creditNoteNumber: 'CN-2024-002',
    creditNoteDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '2',
    customerName: 'Priya Gold House',
    customerEmail: 'priya@goldhouse.com',
    customerPhone: '+91-98765-43211',
    customerGst: '22BBBBB0000B1Z5',
    invoiceId: '2',
    invoiceNumber: 'INV-000002',
    items: [
      {
        id: 'item2',
        creditNoteId: '2',
        itemName: 'Gold Earrings',
        description: '22K Gold Earrings with pearl',
        quantity: 2,
        unit: 'Pcs',
        rate: 3200,
        discount: 0,
        taxRate: 18,
        taxAmount: 1152,
        total: 7552,
        purity: '22K',
        weight: 6.8,
        makingCharges: 400,
      },
    ],
    subtotal: 6400,
    taxRate: 18,
    taxAmount: 1152,
    discount: 0,
    discountType: 'percentage',
    total: 7552,
    reason: 'Quality issue - incorrect purity',
    status: 'sent',
    notes: 'Customer complained about purity mismatch',
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    creditNoteNumber: 'CN-2024-003',
    creditNoteDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '3',
    customerName: 'Suresh Gold Mart',
    customerEmail: 'suresh@goldmart.com',
    customerPhone: '+91-98765-43212',
    customerGst: '22CCCCC0000C1Z5',
    invoiceId: '3',
    invoiceNumber: 'INV-000003',
    items: [
      {
        id: 'item3',
        creditNoteId: '3',
        itemName: 'Gold Bracelet',
        description: '22K Gold Bracelet with diamonds',
        quantity: 1,
        unit: 'Pcs',
        rate: 3800,
        discount: 0,
        taxRate: 18,
        taxAmount: 684,
        total: 4484,
        purity: '22K',
        weight: 5.2,
        makingCharges: 700,
      },
    ],
    subtotal: 3800,
    taxRate: 18,
    taxAmount: 684,
    discount: 0,
    discountType: 'percentage',
    total: 4484,
    reason: 'Customer requested cancellation',
    status: 'draft',
    notes: 'Pending approval from management',
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    creditNoteNumber: 'CN-2024-004',
    creditNoteDate: new Date().toISOString().split('T')[0],
    customerId: '4',
    customerName: 'Meera Jewel World',
    customerEmail: 'meera@jewelworld.com',
    customerPhone: '+91-98765-43213',
    customerGst: '22DDDDD0000D1Z5',
    invoiceId: '4',
    invoiceNumber: 'INV-000004',
    items: [
      {
        id: 'item4',
        creditNoteId: '4',
        itemName: 'Diamond Ring',
        description: '18K Diamond Ring with 0.5ct diamond',
        quantity: 1,
        unit: 'Pcs',
        rate: 8500,
        discount: 0,
        taxRate: 18,
        taxAmount: 1530,
        total: 10030,
        purity: '18K',
        weight: 3.2,
        makingCharges: 800,
      },
    ],
    subtotal: 8500,
    taxRate: 18,
    taxAmount: 1530,
    discount: 0,
    discountType: 'percentage',
    total: 10030,
    reason: 'Wrong item delivered',
    status: 'approved',
    notes: 'Replacement sent to customer',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let creditNoteCounter = 5;

export const useCreditNote = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [filters, setFilters] = useState<CreditNoteFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    customerId: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Load credit notes
  const loadCreditNotes = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setCreditNotes([...MOCK_CREDIT_NOTES]);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    loadCreditNotes();
  }, [loadCreditNotes]);

  // Filter credit notes
  const filteredCreditNotes = useMemo(() => {
    let filtered = [...creditNotes];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (cn) =>
          cn.creditNoteNumber.toLowerCase().includes(query) ||
          cn.customerName.toLowerCase().includes(query) ||
          cn.customerEmail.toLowerCase().includes(query) ||
          cn.invoiceNumber?.toLowerCase().includes(query)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((cn) => cn.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (cn) => new Date(cn.creditNoteDate) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (cn) => new Date(cn.creditNoteDate) <= new Date(filters.dateTo)
      );
    }

    return filtered;
  }, [creditNotes, filters]);

  const totalItems = filteredCreditNotes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredCreditNotes.slice(startIndex, endIndex);

  // Stats
  const stats = useMemo<CreditNoteStats>(() => {
    const totalAmount = creditNotes.reduce((sum, cn) => sum + cn.total, 0);
    const approvedCount = creditNotes.filter((cn) => cn.status === 'approved').length;
    const pendingCount = creditNotes.filter((cn) => cn.status === 'sent' || cn.status === 'draft').length;

    return {
      totalCreditNotes: creditNotes.length,
      totalAmount,
      approvedCount,
      pendingCount,
    };
  }, [creditNotes]);

  // CRUD operations
  const createCreditNote = useCallback(async (data: any) => {
    setSaving(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCreditNote: CreditNote = {
          id: String(creditNoteCounter++),
          creditNoteNumber: `CN-2024-${String(creditNoteCounter - 1).padStart(3, '0')}`,
          creditNoteDate: data.creditNoteDate || new Date().toISOString().split('T')[0],
          customerId: data.customerId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerGst: data.customerGst || '',
          invoiceId: data.invoiceId,
          invoiceNumber: data.invoiceNumber,
          items: data.items || [],
          subtotal: data.subtotal || 0,
          taxRate: data.taxRate || 18,
          taxAmount: data.taxAmount || 0,
          discount: data.discount || 0,
          discountType: data.discountType || 'percentage',
          total: data.total || 0,
          reason: data.reason || '',
          status: data.status || 'draft',
          notes: data.notes || '',
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setCreditNotes(prev => [newCreditNote, ...prev]);
        setSaving(false);
        resolve(newCreditNote);
      }, 500);
    });
  }, []);

  const updateCreditNote = useCallback(async (id: string, data: any) => {
    setSaving(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = creditNotes.findIndex((cn) => cn.id === id);
        if (index !== -1) {
          const updated = { 
            ...creditNotes[index], 
            ...data, 
            updatedAt: new Date().toISOString() 
          };
          const newCreditNotes = [...creditNotes];
          newCreditNotes[index] = updated;
          setCreditNotes(newCreditNotes);
          setSaving(false);
          resolve(updated);
        } else {
          setSaving(false);
          reject(new Error('Credit note not found'));
        }
      }, 500);
    });
  }, [creditNotes]);

  const deleteCreditNote = useCallback(async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = creditNotes.findIndex((cn) => cn.id === id);
        if (index !== -1) {
          const newCreditNotes = creditNotes.filter((cn) => cn.id !== id);
          setCreditNotes(newCreditNotes);
          resolve(true);
        } else {
          reject(new Error('Credit note not found'));
        }
      }, 500);
    });
  }, [creditNotes]);

  const getCreditNote = useCallback(async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const creditNote = creditNotes.find((cn) => cn.id === id);
        if (creditNote) {
          resolve({ ...creditNote });
        } else {
          reject(new Error('Credit note not found'));
        }
      }, 300);
    });
  }, [creditNotes]);

  const updateStatus = useCallback(async (id: string, status: CreditNote['status']) => {
    setSaving(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = creditNotes.findIndex((cn) => cn.id === id);
        if (index !== -1) {
          const updated = { ...creditNotes[index], status, updatedAt: new Date().toISOString() };
          const newCreditNotes = [...creditNotes];
          newCreditNotes[index] = updated;
          setCreditNotes(newCreditNotes);
          setSaving(false);
          resolve(updated);
        } else {
          setSaving(false);
          reject(new Error('Credit note not found'));
        }
      }, 500);
    });
  }, [creditNotes]);

  const handleRefresh = useCallback(() => {
    loadCreditNotes();
  }, [loadCreditNotes]);

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
    saving,
    creditNotes,
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
    createCreditNote,
    updateCreditNote,
    deleteCreditNote,
    getCreditNote,
    updateStatus,
    handleExport,
    handleImport,
    handleRefresh,
  };
};