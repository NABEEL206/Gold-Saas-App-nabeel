// src/hooks/purchaseOrder/usePurchaseOrder.ts

import { useState, useEffect, useCallback } from 'react';
import type {
  PurchaseOrder,
  PurchaseOrderFilters,
  PurchaseOrderStats,
} from '../../types/purchaseOrder/PurchaseOrderType';

// Dummy data
const DUMMY_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 1,
    poNumber: 'PO-2024-001',
    vendorId: 1,
    vendorName: 'Tech Solutions Inc.',
    vendorEmail: 'info@techsolutions.com',
    vendorPhone: '+1 (555) 123-4567',
    orderDate: '2024-01-15',
    expectedDeliveryDate: '2024-02-15',
    status: 'ordered',
    priority: 'high',
    items: [
      {
        productId: '1',
        productName: 'Laptop',
        quantity: 5,
        unit: 'Pcs',
        rate: 45000,
        discount: 5,
        discountType: 'percentage',
        taxRate: 18,
        taxAmount: 38475,
        total: 252225
      },
      {
        productId: '2',
        productName: 'Monitor',
        quantity: 10,
        unit: 'Pcs',
        rate: 15000,
        discount: 0,
        discountType: 'percentage',
        taxRate: 18,
        taxAmount: 27000,
        total: 177000
      }
    ],
    subtotal: 375000,
    discountTotal: 2250,
    taxTotal: 65475,
    totalAmount: 438225,
    notes: 'Urgent order for new office setup',
    terms: 'Net 30 days',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 2,
    poNumber: 'PO-2024-002',
    vendorId: 2,
    vendorName: 'Global Supplies Ltd',
    vendorEmail: 'contact@globalsupplies.com',
    vendorPhone: '+1 (555) 234-5678',
    orderDate: '2024-01-20',
    expectedDeliveryDate: '2024-02-20',
    status: 'pending',
    priority: 'medium',
    items: [
      {
        productId: '3',
        productName: 'Office Chairs',
        quantity: 20,
        unit: 'Pcs',
        rate: 8500,
        discount: 10,
        discountType: 'percentage',
        taxRate: 18,
        taxAmount: 27540,
        total: 180540
      }
    ],
    subtotal: 170000,
    discountTotal: 17000,
    taxTotal: 27540,
    totalAmount: 180540,
    notes: 'Office furniture order',
    terms: 'Net 45 days',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    poNumber: 'PO-2024-003',
    vendorId: 3,
    vendorName: 'Quality Products Co',
    vendorEmail: 'sales@qualityproducts.com',
    vendorPhone: '+1 (555) 345-6789',
    orderDate: '2024-02-01',
    expectedDeliveryDate: '2024-03-01',
    status: 'draft',
    priority: 'low',
    items: [
      {
        productId: '4',
        productName: 'Stationery Supplies',
        quantity: 50,
        unit: 'Set',
        rate: 500,
        discount: 0,
        discountType: 'percentage',
        taxRate: 5,
        taxAmount: 1250,
        total: 26250
      }
    ],
    subtotal: 25000,
    discountTotal: 0,
    taxTotal: 1250,
    totalAmount: 26250,
    notes: 'Draft order - pending review',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 4,
    poNumber: 'PO-2024-004',
    vendorId: 4,
    vendorName: 'Premier Logistics',
    vendorEmail: 'info@premierlogistics.com',
    vendorPhone: '+1 (555) 456-7890',
    orderDate: '2024-02-05',
    expectedDeliveryDate: '2024-03-05',
    status: 'received',
    priority: 'urgent',
    items: [
      {
        productId: '5',
        productName: 'Shipping Boxes',
        quantity: 100,
        unit: 'Pcs',
        rate: 150,
        discount: 0,
        discountType: 'percentage',
        taxRate: 5,
        taxAmount: 750,
        total: 15750
      }
    ],
    subtotal: 15000,
    discountTotal: 0,
    taxTotal: 750,
    totalAmount: 15750,
    notes: 'Received in good condition',
    createdAt: '2024-02-05',
    updatedAt: '2024-02-10'
  },
  {
    id: 5,
    poNumber: 'PO-2024-005',
    vendorId: 5,
    vendorName: 'Industrial Parts Ltd',
    vendorEmail: 'parts@industrialltd.com',
    vendorPhone: '+1 (555) 567-8901',
    orderDate: '2024-02-10',
    expectedDeliveryDate: '2024-03-10',
    status: 'cancelled',
    priority: 'high',
    items: [
      {
        productId: '6',
        productName: 'Machine Parts',
        quantity: 30,
        unit: 'Pcs',
        rate: 2000,
        discount: 5,
        discountType: 'percentage',
        taxRate: 18,
        taxAmount: 10260,
        total: 67260
      }
    ],
    subtotal: 60000,
    discountTotal: 3000,
    taxTotal: 10260,
    totalAmount: 67260,
    notes: 'Cancelled due to budget constraints',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-15'
  }
];

export const usePurchaseOrder = (initialFilters?: PurchaseOrderFilters) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PurchaseOrderFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });
  const [stats, setStats] = useState<PurchaseOrderStats>({
    totalOrders: 0,
    totalAmount: 0,
    pendingCount: 0,
    approvedCount: 0,
    orderedCount: 0,
    receivedCount: 0,
    cancelledCount: 0,
    draftCount: 0,
    averageAmount: 0
  });

  // Calculate stats
  const calculateStats = useCallback((ordersData: PurchaseOrder[]) => {
    const total = ordersData.length;
    const totalAmount = ordersData.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingCount = ordersData.filter(o => o.status === 'pending').length;
    const approvedCount = ordersData.filter(o => o.status === 'approved').length;
    const orderedCount = ordersData.filter(o => o.status === 'ordered').length;
    const receivedCount = ordersData.filter(o => o.status === 'received' || o.status === 'partially_received').length;
    const cancelledCount = ordersData.filter(o => o.status === 'cancelled').length;
    const draftCount = ordersData.filter(o => o.status === 'draft').length;

    setStats({
      totalOrders: total,
      totalAmount,
      pendingCount,
      approvedCount,
      orderedCount,
      receivedCount,
      cancelledCount,
      draftCount,
      averageAmount: total > 0 ? totalAmount / total : 0
    });
  }, []);

  // Fetch purchase orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredOrders = [...DUMMY_PURCHASE_ORDERS];

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredOrders = filteredOrders.filter(order =>
          order.poNumber.toLowerCase().includes(searchLower) ||
          order.vendorName?.toLowerCase().includes(searchLower) ||
          order.vendorEmail?.toLowerCase().includes(searchLower) ||
          order.notes?.toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter
      if (filters?.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }

      // Apply priority filter
      if (filters?.priority) {
        filteredOrders = filteredOrders.filter(order => order.priority === filters.priority);
      }

      // Apply vendor filter
      if (filters?.vendorId) {
        filteredOrders = filteredOrders.filter(order => order.vendorId === filters.vendorId);
      }

      // Apply date range filter
      if (filters?.dateFrom) {
        filteredOrders = filteredOrders.filter(order => order.orderDate >= filters.dateFrom!);
      }
      if (filters?.dateTo) {
        filteredOrders = filteredOrders.filter(order => order.orderDate <= filters.dateTo!);
      }

      // Apply amount range filter
      if (filters?.minAmount) {
        filteredOrders = filteredOrders.filter(order => order.totalAmount >= filters.minAmount!);
      }
      if (filters?.maxAmount) {
        filteredOrders = filteredOrders.filter(order => order.totalAmount <= filters.maxAmount!);
      }

      // Sort orders
      if (filters?.sortBy) {
        const sortOrder = filters.sortOrder || 'asc';
        filteredOrders.sort((a: any, b: any) => {
          const aVal = a[filters.sortBy!];
          const bVal = b[filters.sortBy!];
          if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
          }
          return aVal < bVal ? 1 : -1;
        });
      } else {
        // Default sort by order date descending
        filteredOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
      }

      // Calculate stats
      calculateStats(filteredOrders);

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredOrders.slice(startIndex, endIndex);

      setOrders(paginatedData);
      setPagination({
        page: page,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
        limit: limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters, calculateStats]);

  // Get order by ID
  const getOrderById = useCallback(async (id: string | number): Promise<PurchaseOrder | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const order = DUMMY_PURCHASE_ORDERS.find(o => String(o.id) === String(id));
    return order || null;
  }, []);

  // Create new purchase order
  const createOrder = useCallback(async (orderData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newOrder: PurchaseOrder = {
        ...orderData,
        id: DUMMY_PURCHASE_ORDERS.length + 1,
        poNumber: `PO-2024-${String(DUMMY_PURCHASE_ORDERS.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_PURCHASE_ORDERS.push(newOrder);
      setOrders(prev => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update purchase order
  const updateOrder = useCallback(async (id: string | number, orderData: any) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_PURCHASE_ORDERS.findIndex(o => String(o.id) === String(id));
      if (index === -1) {
        throw new Error('Purchase order not found');
      }
      
      const updatedOrder: PurchaseOrder = {
        ...DUMMY_PURCHASE_ORDERS[index],
        ...orderData,
        updatedAt: new Date().toISOString()
      };
      DUMMY_PURCHASE_ORDERS[index] = updatedOrder;
      
      setOrders(prev => prev.map(o => String(o.id) === String(id) ? updatedOrder : o));
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update purchase order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete purchase order
  const deleteOrder = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_PURCHASE_ORDERS.findIndex(o => String(o.id) === String(id));
      if (index === -1) {
        throw new Error('Purchase order not found');
      }
      DUMMY_PURCHASE_ORDERS.splice(index, 1);
      setOrders(prev => prev.filter(o => String(o.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete purchase order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<PurchaseOrderFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  // Change page
  const changePage = useCallback((page: number) => {
    setFilters(prev => ({
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
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    filters,
    pagination,
    stats,
    fetchOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    updateFilters,
    changePage,
    resetFilters,
    setFilters
  };
};