// src/types/deliveryChallan/DeliveryChallanTypes.ts

export interface DeliveryChallanItem {
  id?: string;
  deliveryChallanId?: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  // Jewelry specific fields
  purity?: string;
  weight?: number;
  grossWt?: number;
  stoneWt?: number;
  netWt?: number;
  makingCharges?: number;
  stoneCharges?: number;
}

export interface DeliveryChallan {
  id?: string;
  challanNumber: string;
  challanDate: string;
  deliveryDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGst?: string;
  customerAddress?: string;
  items: DeliveryChallanItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  shippingCharge: number;
  otherCharges: number;
  total: number;
  status: 'draft' | 'sent' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  transporterName?: string;
  vehicleNumber?: string;
  lrNumber?: string;
  lrDate?: string;
  paymentTerms: string;
  notes: string;
  termsAndConditions: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryChallanFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  customerId: string;
}

export interface DeliveryChallanFormData {
  challanNumber: string;
  challanDate: string;
  deliveryDate: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGst?: string;
  customerAddress?: string;
  items: DeliveryChallanItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  shippingCharge: number;
  otherCharges: number;
  deliveryAddress: string;
  transporterName?: string;
  vehicleNumber?: string;
  lrNumber?: string;
  lrDate?: string;
  paymentTerms: string;
  notes: string;
  termsAndConditions: string;
}

export interface DeliveryChallanStats {
  totalChallans: number;
  totalAmount: number;
  deliveredCount: number;
  pendingCount: number;
  cancelledCount: number;
}