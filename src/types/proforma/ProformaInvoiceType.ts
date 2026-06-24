export interface ProformaInvoiceItem {
  id?: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export interface ProformaInvoice {
  discount: number;
  id?: string;
  invoiceNumber: string;
  invoiceDate: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: ProformaInvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  notes: string;
  termsAndConditions: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProformaInvoiceFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  customerId: string;
}

export interface ProformaInvoiceFormData {
  discount: number;
  invoiceNumber: string;
  invoiceDate: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: ProformaInvoiceItem[];
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  notes: string;
  termsAndConditions: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
}

// Re-export all types
export type { 
  ProformaInvoiceItem as ProformaInvoiceItemType,
  ProformaInvoice as ProformaInvoiceType,
  ProformaInvoiceFilters as ProformaInvoiceFiltersType,
  ProformaInvoiceFormData as ProformaInvoiceFormDataType
};