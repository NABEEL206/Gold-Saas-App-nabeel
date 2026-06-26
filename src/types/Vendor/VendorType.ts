// src/types/Vendor/VendorType.ts

export interface Vendor {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt?: string;
  updatedAt?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface VendorFormData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  taxId?: string;
  website?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'suspended';
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface VendorFilters {
  search?: string;
  status?: string;
  company?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface VendorResponse {
  data: Vendor[];
  total: number;
  page: number;
  totalPages: number;
}

export interface VendorValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  [key: string]: string | undefined;
}