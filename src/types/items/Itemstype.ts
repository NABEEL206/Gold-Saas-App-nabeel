// src/types/items/Itemstype.ts

export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  itemType: string;
  category: string;
  brand: string;
  designCode: string;
  
  // Metal Information
  metalType: string;
  purity: string;
  
  // Weight Information
  grossWeight: number;
  stoneWeight: number;
  netWeight: number;
  unit: string;
  
  // Diamond Information
  diamondPieces: number;
  caratWeight: number;
  
  // Making Charge & Pricing
  mcType: 'fixed' | 'percentage';
  mcValue: number;
  goldRate: number;
  sellingPrice: number;
  mrp: number;
  currency: string;
  
  // Inventory & Tax
  openingStock: number;
  reorderLevel: number;
  hsnCode: string;
  gstPercentage: number;
  
  // Sales Information
  salesAccount?: string;
  salesDescription?: string;
  
  // Purchase Information
  purchasePrice?: number;
  purchaseDescription?: string;
  purchaseAccount?: string;
  preferredVendor?: string;
  
  // Tracking
  tagNumber?: string;
  barcode?: string;
  
  // Status & Timestamps
  status: 'active' | 'inactive' | 'out_of_stock' | 'low_stock';
  description: string;
  images: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemFormData {
  // Basic Information
  itemCode: string;
  itemName: string;
  itemType: string;
  category: string;
  brand: string;
  designCode: string;
  
  // Metal Information
  metalType: string;
  purity: string;
  
  // Weight Information
  grossWeight: string;
  stoneWeight: string;
  netWeight: string;
  unit: string;
  
  // Diamond Information
  diamondPieces: string;
  caratWeight: string;
  
  // Making Charge & Pricing
  mcType: string;
  mcValue: string;
  goldRate: string;
  sellingPrice: string;
  
  // Sales Information
  salesAccount?: string;
  salesDescription?: string;
  
  // Purchase Information
  purchasePrice?: string;
  purchaseDescription?: string;
  purchaseAccount?: string;
  preferredVendor?: string;
  
  // Inventory & Tax
  openingStock: string;
  reorderLevel: string;
  hsnCode: string;
  gstPercentage: string;
  
  currency?: string;
  mrp?: string;
  description?: string;
  tagNumber?: string;
  barcode?: string;
}

export interface ItemFilters {
  searchQuery: string;
  status: string;
  category?: string;
  metalType?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export interface StatusBadgeProps {
  status: Item['status'];
}