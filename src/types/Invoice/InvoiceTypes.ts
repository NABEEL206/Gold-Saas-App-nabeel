// src/types/Invoice/InvoiceTypes.ts
export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGst?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  shippingCharge: number;
  otherCharges: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  paymentTerms: string;
  notes: string;
  termsAndConditions: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  purity?: string;
  category?: string;
  weight?: number;
  makingCharges?: number;
  wastagePercentage?: number;
  stoneCharges?: number;
}

export interface InvoiceFormData {
  customerId: string;
  date: string;
  dueDate: string;
  items: InvoiceItemFormData[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  shippingCharge: number;
  otherCharges: number;
  notes: string;
  termsAndConditions: string;
  paymentTerms: string;
}

export interface InvoiceItemFormData {
  itemId: string;
  itemName: string;
  description: string;
  quantity: number;
  rate: number;
  discount: number;
  taxRate: number;
  purity?: string;
  category?: string;
  weight?: number;
  makingCharges?: number;
  wastagePercentage?: number;
  stoneCharges?: number;
}

export interface InvoiceFilters {
  searchQuery: string;
  status: Invoice['status'] | 'all';
  dateRange: {
    start: string;
    end: string;
  };
}

export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueCount: number;
}

export interface CustomerSuggestion {
  id: string;
  name: string;
  email: string;
  phone: string;
  gst?: string;
}

export interface ItemSuggestion {
  id: string;
  name: string;
  code: string;
  category: string;
  purity: string;
  price: number;
}