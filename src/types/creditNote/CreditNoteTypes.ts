// src/types/sales/CreditNoteTypes.ts

export interface CreditNoteItem {
  id?: string;
  creditNoteId?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  purity?: string;
  weight?: number;
  makingCharges?: number;
}

export interface CreditNote {
  id?: string;
  creditNoteNumber: string;
  creditNoteDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGst?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  items: CreditNoteItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  reason: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditNoteFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  customerId: string;
}

export interface CreditNoteStats {
  totalCreditNotes: number;
  totalAmount: number;
  approvedCount: number;
  pendingCount: number;
}

export interface CreditNoteFormData {
  creditNoteNumber: string;
  creditNoteDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGst?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  items: CreditNoteItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  reason: string;
  notes?: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}