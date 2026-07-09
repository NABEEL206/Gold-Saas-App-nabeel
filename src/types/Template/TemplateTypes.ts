// src/types/Template/TemplateTypes.ts

export type DocumentType = 
  | 'quote' 
  | 'invoice' 
  | 'purchase_order' 
  | 'bill' 
  | 'payment_receipt' 
  | 'credit_note'
  | 'proforma_invoice'
  | 'payment_received'
  | 'delivery_challan'
  | 'vendor_credit'
  | 'payment_made';

export type TemplateLayout = 'modern' | 'classic' | 'compact' | 'minimal';

export type PaperSize = 'a4' | 'letter' | 'legal';

export type Orientation = 'portrait' | 'landscape';

export interface TemplateConfig {
  id: string;
  name: string;
  layout: TemplateLayout;
  documentType: DocumentType;
  isDefault: boolean;
  colors: TemplateColors;
  fonts: TemplateFonts;
  showCompanyLogo: boolean;
  showSignature: boolean;
  showTerms: boolean;
  paperSize: PaperSize;
  orientation: Orientation;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headerStyle: 'bordered' | 'filled' | 'minimal';
  tableStyle: 'bordered' | 'striped' | 'minimal';
}

export interface TemplateColors {
  primary: string;
  secondary: string;
  text: string;
  lightText: string;
  background: string;
  tableHeader: string;
  tableBorder: string;
  totalHighlight: string;
}

export interface TemplateFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  gst?: string;
  pan?: string;
  logo?: string;
}

export interface CustomerInfo {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  gst?: string;
}

export interface VendorInfo {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  gst?: string;
}

export interface DocumentItem {
  id?: string;
  name: string;
  description?: string;
  hsn?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  taxRate?: number;
  taxAmount?: number;
  total: number;
}

// Old Gold Exchange Item
export interface OldGoldItem {
  id?: string;
  description: string;
  hsn?: string;
  grossWt: number;
  lessWastage?: number;
  netWt: number;
  purity: string;
  rate: number;
  amount: number;
}

export interface DocumentData {
  documentNumber: string;
  documentDate: string;
  dueDate?: string;
  referenceNumber?: string;
  company: CompanyInfo;
  customer?: CustomerInfo;
  vendor?: VendorInfo;
  items: DocumentItem[];
  // Old Gold Exchange
  oldGoldItems?: OldGoldItem[];
  oldGoldTotal?: number;
  // Financial
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  shippingCharges?: number;
  handlingCharges?: number;
  otherCharges?: number;
  totalAmount: number;
  paidAmount?: number;
  balanceDue?: number;
  // Additional
  notes?: string;
  terms?: string;
  signature?: string;
  additionalFields?: Record<string, string>;
}

export interface TemplateProps {
  data: DocumentData;
  config: TemplateConfig;
  className?: string;
  showPreview?: boolean;
}