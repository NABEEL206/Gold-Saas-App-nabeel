// src/types/VendorCredits/VendorCreditsType.ts

export interface VendorCreditItem {
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

export interface VendorCredit {
  id: string | number;
  creditNumber: string;
  creditDate: string;
  billId?: string | number;
  billNumber?: string;
  vendorId?: string | number;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorGST?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  reason: 'return' | 'discount' | 'adjustment' | 'damage' | 'other';
  status: 'draft' | 'pending' | 'approved' | 'used' | 'cancelled' | 'expired';
  items: VendorCreditItem[];
  notes?: string;
  referenceNumber?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  usedAmount?: number;
  balanceAmount?: number;
  expiryDate?: string;
  currency?: string;
  exchangeRate?: number;
  attachment?: string;
}

export interface VendorCreditFormData {
  creditDate: string;
  billId?: string | number;
  billNumber?: string;
  vendorId?: string | number;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorGST?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  reason: 'return' | 'discount' | 'adjustment' | 'damage' | 'other';
  status: 'draft' | 'pending' | 'approved' | 'used' | 'cancelled' | 'expired';
  items: VendorCreditItem[];
  notes?: string;
  referenceNumber?: string;
  usedAmount?: number;
  balanceAmount?: number;
  expiryDate?: string;
  currency?: string;
  exchangeRate?: number;
  attachment?: string;
}

export interface VendorCreditFilters {
  search?: string;
  status?: string;
  reason?: string;
  vendorId?: string | number;
  billId?: string | number;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface VendorCreditResponse {
  data: VendorCredit[];
  total: number;
  page: number;
  totalPages: number;
}

export interface VendorCreditStats {
  totalCredits: number;
  totalAmount: number;
  usedAmount: number;
  balanceAmount: number;
  draftCount: number;
  pendingCount: number;
  approvedCount: number;
  usedCount: number;
  cancelledCount: number;
  expiredCount: number;
  averageAmount: number;
}

export const VENDOR_CREDIT_STATUSES = [
  'draft',
  'pending',
  'approved',
  'used',
  'cancelled',
  'expired'
] as const;

export const VENDOR_CREDIT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  used: 'Used',
  cancelled: 'Cancelled',
  expired: 'Expired'
};

export const VENDOR_CREDIT_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  used: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-gray-100 text-gray-500'
};

export const VENDOR_CREDIT_REASONS = [
  'return',
  'discount',
  'adjustment',
  'damage',
  'other'
] as const;

export const VENDOR_CREDIT_REASON_LABELS: Record<string, string> = {
  return: 'Return',
  discount: 'Discount',
  adjustment: 'Adjustment',
  damage: 'Damage',
  other: 'Other'
};