// src/types/sales/QuoteTypes.ts

export interface Quote {
  id: string;
  quoteNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGst: string;
  customerAddress: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  tax: number;
  taxRate: number;
  shippingCharge: number;
  otherCharges: number;
  roundOff: number;
  total: number;
  amountInWords: string;
  notes: string;
  termsAndConditions: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  validUntil: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  purity: string; // e.g., "22K", "24K", "18K"
  weight: number; // in grams
  makingCharges: number;
  wastagePercentage: number;
  stoneCharges: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
}

export interface QuoteFormData {
  customerId: string;
  date: string;
  validUntil: string;
  items: QuoteItemFormData[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  shippingCharge: number;
  otherCharges: number;
  notes: string;
  termsAndConditions: string;
}

export interface QuoteItemFormData {
  itemId: string;
  itemName: string;
  category: string;
  purity: string;
  weight: number;
  makingCharges: number;
  wastagePercentage: number;
  stoneCharges: number;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  description: string;
}

export interface QuoteFilters {
  searchQuery: string;
  status: 'all' | Quote['status'];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface QuoteStats {
  totalQuotes: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  totalValue: number;
}

export interface CustomerSuggestion {
  id: string;
  name: string;
  email: string;
  phone: string;
  gst: string;
  address: string;
}

export interface ItemSuggestion {
  id: string;
  code: string;
  name: string;
  category: string;
  purity: string;
  price: number;
}