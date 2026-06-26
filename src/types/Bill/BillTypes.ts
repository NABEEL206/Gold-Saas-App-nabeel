// src/types/Bill/BillTypes.ts

export interface BillItem {
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
  [key: string]: any;
}

export interface Bill {
  id: string | number;
  billNumber: string;
  billDate: string;
  dueDate?: string;
  vendorId?: string | number;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  vendorGST?: string;
  purchaseOrderNumber?: string;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  items: BillItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCharges?: number;
  handlingCharges?: number;
  otherCharges?: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  currency?: string;
  exchangeRate?: number;
  notes?: string;
  terms?: string;
  attachment?: string;
  paymentTerms?: string;
  paymentDate?: string;
  paymentMethod?: 'cash' | 'bank' | 'credit_card' | 'cheque' | 'auto_debit';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  paidBy?: string;
  paidAt?: string;
}

export interface BillFormData {
  billDate: string;
  dueDate?: string;
  vendorId?: string | number;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  vendorGST?: string;
  purchaseOrderNumber?: string;
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  items: BillItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCharges?: number;
  handlingCharges?: number;
  otherCharges?: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  currency?: string;
  exchangeRate?: number;
  notes?: string;
  terms?: string;
  attachment?: string;
  paymentTerms?: string;
  paymentDate?: string;
  paymentMethod?: 'cash' | 'bank' | 'credit_card' | 'cheque' | 'auto_debit';
}

export interface BillFilters {
  search?: string;
  status?: string;
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

export interface BillResponse {
  data: Bill[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BillStats {
  totalBills: number;
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  draftCount: number;
  cancelledCount: number;
  averageAmount: number;
}

export const BILL_STATUSES = [
  'draft',
  'pending',
  'approved',
  'paid',
  'partial',
  'overdue',
  'cancelled'
] as const;

export const BILL_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  partial: 'Partial',
  overdue: 'Overdue',
  cancelled: 'Cancelled'
};

export const BILL_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-purple-100 text-purple-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500'
};