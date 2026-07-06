// src/hooks/DeliveryChallan/useDeliveryChallan.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  DeliveryChallan, 
  DeliveryChallanFilters,
  DeliveryChallanStats 
} from '../../types/deliveryChallan/DeliveryChallanTypes';

// Mock data with rich demo data
const MOCK_CHALLANS: DeliveryChallan[] = [
  {
    id: '1',
    challanNumber: 'DC-2024-001',
    challanDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '1',
    customerName: 'Rajesh Jewelers',
    customerEmail: 'rajesh@jewelers.com',
    customerPhone: '+91-98765-43210',
    customerGst: '22AAAAA0000A1Z5',
    customerAddress: '123, Jewelry Market, Mumbai, Maharashtra',
    items: [
      {
        id: 'item1',
        deliveryChallanId: '1',
        productId: '1',
        productName: 'Gold Chain',
        description: '22K Gold Chain with pendant',
        quantity: 2,
        unit: 'Pcs',
        rate: 4500,
        discount: 0,
        taxRate: 18,
        taxAmount: 1620,
        total: 9000,
        purity: '22K',
        weight: 10.5,
        makingCharges: 500,
        stoneCharges: 0,
      },
      {
        id: 'item2',
        deliveryChallanId: '1',
        productId: '2',
        productName: 'Diamond Ring',
        description: '18K Diamond Ring with 0.5ct diamond',
        quantity: 1,
        unit: 'Pcs',
        rate: 8500,
        discount: 5,
        taxRate: 18,
        taxAmount: 1530,
        total: 8075,
        purity: '18K',
        weight: 3.2,
        makingCharges: 800,
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
    status: 'sent',
    deliveryAddress: '123, Jewelry Market, Mumbai, Maharashtra',
    transporterName: 'DTDC',
    vehicleNumber: 'MH-01-AB-1234',
    lrNumber: 'LR-2024-001',
    lrDate: new Date().toISOString().split('T')[0],
    paymentTerms: 'Net 15',
    notes: 'Please deliver before the end of the month',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable\n3. Payment terms: 15 days',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    challanNumber: 'DC-2024-002',
    challanDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '2',
    customerName: 'Priya Gold House',
    customerEmail: 'priya@goldhouse.com',
    customerPhone: '+91-98765-43211',
    customerGst: '22BBBBB0000B1Z5',
    customerAddress: '45, Gold Street, Chennai, Tamil Nadu',
    items: [
      {
        id: 'item3',
        deliveryChallanId: '2',
        productId: '3',
        productName: 'Gold Earrings',
        description: '22K Gold Earrings with pearl',
        quantity: 3,
        unit: 'Pcs',
        rate: 3200,
        discount: 0,
        taxRate: 18,
        taxAmount: 1728,
        total: 9600,
        purity: '22K',
        weight: 6.8,
        makingCharges: 400,
        stoneCharges: 500,
      },
      {
        id: 'item4',
        deliveryChallanId: '2',
        productId: '4',
        productName: 'Silver Necklace',
        description: '18K Silver Necklace with chain',
        quantity: 2,
        unit: 'Pcs',
        rate: 2800,
        discount: 0,
        taxRate: 18,
        taxAmount: 1008,
        total: 5600,
        purity: '18K',
        weight: 15.2,
        makingCharges: 600,
        stoneCharges: 0,
      },
    ],
    subtotal: 15200,
    taxRate: 18,
    taxAmount: 2736,
    discount: 0,
    discountType: 'fixed',
    shippingCharge: 150,
    otherCharges: 0,
    total: 18086,
    status: 'delivered',
    deliveryAddress: '45, Gold Street, Chennai, Tamil Nadu',
    transporterName: 'Blue Dart',
    vehicleNumber: 'TN-02-CD-5678',
    lrNumber: 'LR-2024-002',
    lrDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentTerms: 'Net 15',
    notes: 'Delivered successfully',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable',
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    challanNumber: 'DC-2024-003',
    challanDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '3',
    customerName: 'Suresh Gold Mart',
    customerEmail: 'suresh@goldmart.com',
    customerPhone: '+91-98765-43212',
    customerGst: '22CCCCC0000C1Z5',
    customerAddress: '78, Gold Plaza, Delhi',
    items: [
      {
        id: 'item5',
        deliveryChallanId: '3',
        productId: '5',
        productName: 'Gold Bracelet',
        description: '22K Gold Bracelet with diamonds',
        quantity: 1,
        unit: 'Pcs',
        rate: 3800,
        discount: 0,
        taxRate: 18,
        taxAmount: 684,
        total: 3800,
        purity: '22K',
        weight: 5.2,
        makingCharges: 700,
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
    status: 'draft',
    deliveryAddress: '78, Gold Plaza, Delhi',
    transporterName: '',
    vehicleNumber: '',
    lrNumber: '',
    lrDate: '',
    paymentTerms: 'Net 15',
    notes: 'Draft - pending approval',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable',
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    challanNumber: 'DC-2024-004',
    challanDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '4',
    customerName: 'Meera Jewel World',
    customerEmail: 'meera@jewelworld.com',
    customerPhone: '+91-98765-43213',
    customerGst: '22DDDDD0000D1Z5',
    customerAddress: '56, Diamond District, Surat, Gujarat',
    items: [
      {
        id: 'item6',
        deliveryChallanId: '4',
        productId: '1',
        productName: 'Gold Chain',
        description: '22K Gold Chain with pendant',
        quantity: 1,
        unit: 'Pcs',
        rate: 4500,
        discount: 0,
        taxRate: 18,
        taxAmount: 810,
        total: 4500,
        purity: '22K',
        weight: 5.5,
        makingCharges: 400,
        stoneCharges: 0,
      },
      {
        id: 'item7',
        deliveryChallanId: '4',
        productId: '3',
        productName: 'Gold Earrings',
        description: '22K Gold Earrings',
        quantity: 2,
        unit: 'Pcs',
        rate: 3200,
        discount: 0,
        taxRate: 18,
        taxAmount: 1152,
        total: 6400,
        purity: '22K',
        weight: 4.8,
        makingCharges: 300,
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
    status: 'draft',
    deliveryAddress: '56, Diamond District, Surat, Gujarat',
    transporterName: '',
    vehicleNumber: '',
    lrNumber: '',
    lrDate: '',
    paymentTerms: 'Net 15',
    notes: 'Draft - pending review',
    termsAndConditions: '1. All prices are in Indian Rupee (₹)\n2. Taxes as applicable',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let challanCounter = 5;

// Helper to get initial form data
const getInitialState = () => ({
  loading: true,
  challans: [] as DeliveryChallan[],
  filters: {
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    customerId: '',
  } as DeliveryChallanFilters,
  currentPage: 1,
  itemsPerPage: 5,
});

export const useDeliveryChallan = () => {
  const [loading, setLoading] = useState(true);
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [filters, setFilters] = useState<DeliveryChallanFilters>({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    customerId: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Load challans
  const loadChallans = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setChallans([...MOCK_CHALLANS]);
      setLoading(false);
    }, 500);
  }, []);

  // Initial load
  useEffect(() => {
    loadChallans();
  }, [loadChallans]);

  // Filter challans
  const filteredChallans = useMemo(() => {
    let filtered = [...challans];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (challan) =>
          challan.challanNumber.toLowerCase().includes(query) ||
          challan.customerName.toLowerCase().includes(query) ||
          challan.customerEmail.toLowerCase().includes(query)
      );
    }

    if (filters.status) {
      filtered = filtered.filter((challan) => challan.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (challan) => new Date(challan.challanDate) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (challan) => new Date(challan.challanDate) <= new Date(filters.dateTo)
      );
    }

    if (filters.customerId) {
      filtered = filtered.filter((challan) => challan.customerId === filters.customerId);
    }

    return filtered;
  }, [challans, filters]);

  const totalItems = filteredChallans.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);
  const currentItems = filteredChallans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Stats
  const stats = useMemo<DeliveryChallanStats>(() => {
    const totalAmount = challans.reduce((sum, ch) => sum + ch.total, 0);
    const deliveredCount = challans.filter((ch) => ch.status === 'delivered').length;
    const pendingCount = challans.filter((ch) => ch.status === 'sent' || ch.status === 'draft').length;
    const cancelledCount = challans.filter((ch) => ch.status === 'cancelled').length;

    return {
      totalChallans: challans.length,
      totalAmount,
      deliveredCount,
      pendingCount,
      cancelledCount,
    };
  }, [challans]);

  // CRUD operations
  const createChallan = useCallback(async (data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newChallan: DeliveryChallan = {
          id: String(challanCounter++),
          challanNumber: data.challanNumber || `DC-2024-${String(challanCounter - 1).padStart(3, '0')}`,
          challanDate: data.challanDate || new Date().toISOString().split('T')[0],
          deliveryDate: data.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          customerId: data.customerId,
          customerName: data.customerName || 'Customer Name',
          customerEmail: data.customerEmail || 'customer@email.com',
          customerPhone: data.customerPhone || '9876543210',
          customerGst: data.customerGst || '',
          customerAddress: data.customerAddress || '',
          items: data.items || [],
          subtotal: data.subtotal || 0,
          taxRate: data.taxRate || 18,
          taxAmount: data.taxAmount || 0,
          discount: data.discount || 0,
          discountType: data.discountType || 'fixed',
          shippingCharge: data.shippingCharge || 0,
          otherCharges: data.otherCharges || 0,
          total: data.total || 0,
          status: 'draft',
          deliveryAddress: data.deliveryAddress || data.customerAddress || '',
          transporterName: data.transporterName || '',
          vehicleNumber: data.vehicleNumber || '',
          lrNumber: data.lrNumber || '',
          lrDate: data.lrDate || '',
          paymentTerms: data.paymentTerms || 'Net 15',
          notes: data.notes || '',
          termsAndConditions: data.termsAndConditions || '',
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setChallans(prev => [newChallan, ...prev]);
        resolve(newChallan);
      }, 500);
    });
  }, []);

  const updateChallan = useCallback(async (id: string, data: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = challans.findIndex((ch) => ch.id === id);
        if (index !== -1) {
          const updated = { ...challans[index], ...data, updatedAt: new Date().toISOString() };
          const newChallans = [...challans];
          newChallans[index] = updated;
          setChallans(newChallans);
          resolve(updated);
        } else {
          reject(new Error('Delivery Challan not found'));
        }
      }, 500);
    });
  }, [challans]);

  const deleteChallan = useCallback(async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = challans.findIndex((ch) => ch.id === id);
        if (index !== -1) {
          const newChallans = challans.filter((ch) => ch.id !== id);
          setChallans(newChallans);
          resolve(true);
        } else {
          reject(new Error('Delivery Challan not found'));
        }
      }, 500);
    });
  }, [challans]);

  const getChallan = useCallback(async (id: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check state first
        const challan = challans.find((ch) => ch.id === id);
        if (challan) {
          resolve({ ...challan });
          return;
        }

        // Check mock data directly
        const mockChallan = MOCK_CHALLANS.find((ch) => ch.id === id);
        if (mockChallan) {
          setChallans(prev => {
            const exists = prev.some(ch => ch.id === id);
            if (!exists) {
              return [...prev, { ...mockChallan }];
            }
            return prev;
          });
          resolve({ ...mockChallan });
        } else {
          reject(new Error('Delivery Challan not found'));
        }
      }, 300);
    });
  }, [challans]);

  const updateStatus = useCallback(async (id: string, status: DeliveryChallan['status']) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = challans.findIndex((ch) => ch.id === id);
        if (index !== -1) {
          const updated = { ...challans[index], status, updatedAt: new Date().toISOString() };
          const newChallans = [...challans];
          newChallans[index] = updated;
          setChallans(newChallans);
          resolve(updated);
        } else {
          reject(new Error('Delivery Challan not found'));
        }
      }, 500);
    });
  }, [challans]);

  const handleRefresh = useCallback(() => {
    loadChallans();
  }, [loadChallans]);

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

  const handleSetFilters = useCallback((newFilters: DeliveryChallanFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  return {
    // State
    loading,
    challans,
    currentItems,
    stats,
    filters,
    currentPage,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    totalPages,
    
    // Actions
    setFilters: handleSetFilters,
    setCurrentPage: setPage,
    setItemsPerPage: handleSetItemsPerPage,
    createChallan,
    updateChallan,
    deleteChallan,
    getChallan,
    updateStatus,
    handleExport,
    handleImport,
    handleRefresh,
    loadChallans,
  };
};