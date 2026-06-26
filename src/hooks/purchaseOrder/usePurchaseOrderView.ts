// src/hooks/purchaseOrder/usePurchaseOrderView.ts

import { useState } from 'react';
import{ 
    PURCHASE_ORDER_PRIORITY_LABELS,
  type PurchaseOrder, 
  PURCHASE_ORDER_STATUS_LABELS} from '../../types/purchaseOrder/PurchaseOrderType';

export const usePurchaseOrderView = (order: PurchaseOrder | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDisplayName = (): string => {
    if (!order) return 'N/A';
    return order.poNumber || 'Unnamed Purchase Order';
  };

  const getVendorName = (): string => {
    if (!order) return 'N/A';
    return order.vendorName || 'N/A';
  };

  const getStatusLabel = (): string => {
    if (!order) return 'Unknown';
    return PURCHASE_ORDER_STATUS_LABELS[order.status] || order.status;
  };

  const getStatusColor = (): string => {
    if (!order) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      ordered: 'bg-indigo-100 text-indigo-800',
      received: 'bg-green-100 text-green-800',
      partially_received: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-emerald-100 text-emerald-800'
    };
    return colors[order.status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (): string => {
    if (!order) return 'Unknown';
    return PURCHASE_ORDER_PRIORITY_LABELS[order.priority] || order.priority;
  };

  const getPriorityColor = (): string => {
    if (!order) return 'bg-gray-100 text-gray-800';
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-yellow-100 text-yellow-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[order.priority] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  const getItemCount = (): number => {
    if (!order) return 0;
    return order.items ? order.items.length : 0;
  };

  const getTotalItems = (): number => {
    if (!order) return 0;
    return order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  };

  const getSummary = () => {
    if (!order) return null;
    return {
      poNumber: order.poNumber,
      vendorName: order.vendorName,
      orderDate: order.orderDate,
      status: order.status,
      priority: order.priority,
      totalAmount: order.totalAmount,
      itemCount: getItemCount(),
      totalItems: getTotalItems()
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getVendorName,
    getStatusLabel,
    getStatusColor,
    getPriorityLabel,
    getPriorityColor,
    formatCurrency,
    getItemCount,
    getTotalItems,
    getSummary,
    setIsLoading,
    setError
  };
};