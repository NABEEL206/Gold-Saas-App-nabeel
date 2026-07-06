// src/types/Quote/QuoteTypes.ts

// Quote Item Interface
export interface QuoteItem {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  purity: string;
  weight: number;
  quantity: number;
  unitPrice: number;
  makingCharges: number;
  wastagePercentage: number;
  stoneCharges: number;
  total: number;
}

// Quote Status Types
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

// Quote Discount Types
export type DiscountType = 'percentage' | 'fixed';

// Quote Main Interface
export interface Quote {
  id: string;
  quoteNo: string;
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerGst?: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountType: DiscountType;
  shippingCharge: number;
  otherCharges: number;
  roundOff: number;
  total: number;
  amountInWords?: string;
  notes?: string;
  termsAndConditions?: string;
  status: QuoteStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Quote Filters Interface
export interface QuoteFilters {
  searchQuery: string;
  status: QuoteStatus | 'all';
  dateRange: {
    start: string;
    end: string;
  };
}

// Quote Stats Interface
export interface QuoteStats {
  totalAmount(totalAmount: any): import("react").ReactNode;
  acceptedCount: ReactNode;
  sentCount: ReactNode;
  expiredCount: ReactNode;
  totalQuotes: number;
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  totalValue: number;
}

// Quote Form Data Interface (for Create/Edit)
export interface QuoteFormData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  customerGst?: string;
  date: string;
  validUntil: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  discountType: DiscountType;
  shippingCharge: number;
  otherCharges: number;
  roundOff: number;
  total: number;
  amountInWords?: string;
  notes?: string;
  termsAndConditions?: string;
  status: QuoteStatus;
}

// Quote Response Interface (for API responses)
export interface QuoteResponse {
  success: boolean;
  data?: Quote;
  message?: string;
  errors?: string[];
}

// Quote List Response Interface
export interface QuoteListResponse {
  success: boolean;
  data?: Quote[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}