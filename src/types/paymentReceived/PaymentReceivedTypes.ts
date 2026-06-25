// src/types/sales/PaymentReceivedTypes.ts

export interface PaymentReceived {
  id?: string;
  paymentNumber: string;
  paymentDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'upi' | 'other';
  referenceNumber?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentReceivedFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  paymentMethod: string;
  customerId: string;
}

export interface PaymentReceivedStats {
  totalPayments: number;
  totalAmount: number;
  completedCount: number;
  pendingCount: number;
}

export interface PaymentReceivedFormData {
  paymentNumber: string;
  paymentDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'upi' | 'other';
  referenceNumber?: string;
  bankName?: string;
  chequeNumber?: string;
  chequeDate?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}