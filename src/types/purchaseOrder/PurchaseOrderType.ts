// src/types/purchaseOrder/PurchaseOrderType.ts

export interface PurchaseOrderItem {
  id?: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discount: number;
  discountType?: 'percentage' | 'fixed';
  taxRate: number;
  taxAmount: number;
  total: number;
  purity?: string;
  grossWt?: number;
  stoneWt?: number;
  netWt?: number;
  makingCharges?: number;
  stoneCharges?: number;
  [key: string]: any;
}

export interface PurchaseOrder {
  id: string | number;
  poNumber: string;
  vendorId?: string | number;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  orderDate: string;
  deliveryDate?: string;
  expectedDeliveryDate?: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'partially_received' | 'cancelled' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  items: PurchaseOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCharges?: number;
  handlingCharges?: number;
  otherCharges?: number;
  totalAmount: number;
  currency?: string;
  exchangeRate?: number;
  notes?: string;
  terms?: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentTerms?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  attachment?: string;
}

export interface PurchaseOrderFormData {
  vendorId?: string | number;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  orderDate: string;
  deliveryDate?: string;
  expectedDeliveryDate?: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'partially_received' | 'cancelled' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  items: PurchaseOrderItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCharges?: number;
  handlingCharges?: number;
  otherCharges?: number;
  totalAmount: number;
  currency?: string;
  exchangeRate?: number;
  notes?: string;
  terms?: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentTerms?: string;
  attachment?: string;
}

export interface PurchaseOrderFilters {
  search?: string;
  status?: string;
  priority?: string;
  vendorId?: string | number;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PurchaseOrderResponse {
  data: PurchaseOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PurchaseOrderStats {
  totalOrders: number;
  totalAmount: number;
  pendingCount: number;
  approvedCount: number;
  orderedCount: number;
  receivedCount: number;
  cancelledCount: number;
  draftCount: number;
  averageAmount: number;
}

export const PURCHASE_ORDER_STATUSES = [
  'draft',
  'pending',
  'approved',
  'ordered',
  'received',
  'partially_received',
  'cancelled',
  'completed'
] as const;

export const PURCHASE_ORDER_PRIORITIES = [
  'low',
  'medium',
  'high',
  'urgent'
] as const;

export const PURCHASE_ORDER_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  ordered: 'Ordered',
  received: 'Received',
  partially_received: 'Partially Received',
  cancelled: 'Cancelled',
  completed: 'Completed'
};

export const PURCHASE_ORDER_PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};