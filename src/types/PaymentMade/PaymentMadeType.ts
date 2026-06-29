// src/types/paymentReceived/PaymentMadeTypes.ts

export interface PaymentMade {
  id: string | number;
  paymentNumber: string;
  paymentDate: string;
  billId?: string | number;
  billNumber?: string;
  vendorId?: string | number;
  vendorName?: string;
  vendorEmail?: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'credit_card' | 'cheque' | 'auto_debit';
  referenceNumber?: string;
  chequeNumber?: string;
  bankName?: string;
  bankAccount?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  attachment?: string;
  currency?: string;
  exchangeRate?: number;
}

export interface PaymentMadeFormData {
  paymentDate: string;
  billId?: string | number;
  billNumber?: string;
  vendorId?: string | number;
  vendorName?: string;
  vendorEmail?: string;
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'credit_card' | 'cheque' | 'auto_debit';
  referenceNumber?: string;
  chequeNumber?: string;
  bankName?: string;
  bankAccount?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  attachment?: string;
  currency?: string;
  exchangeRate?: number;
}

export interface PaymentMadeFilters {
  search?: string;
  status?: string;
  paymentMethod?: string;
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

export interface PaymentMadeResponse {
  data: PaymentMade[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaymentMadeStats {
  totalPayments: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  failedAmount: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  cancelledCount: number;
  averageAmount: number;
}

export const PAYMENT_MADE_STATUSES = [
  'pending',
  'completed',
  'failed',
  'cancelled'
] as const;

export const PAYMENT_MADE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled'
};

export const PAYMENT_MADE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500'
};

export const PAYMENT_METHODS = [
  'cash',
  'bank',
  'credit_card',
  'cheque',
  'auto_debit'
] as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank: 'Bank Transfer',
  credit_card: 'Credit Card',
  cheque: 'Cheque',
  auto_debit: 'Auto Debit'
};