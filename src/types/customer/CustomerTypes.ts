// src/types/customer/CustomerTypes.ts

export interface Customer {
  id: string;
  customerCode: string;
  salutation: 'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.' | 'Prof.' | '';
  firstName: string;
  lastName: string;
  displayName: string;
  customerType: 'individual' | 'business' | 'government' | 'non-profit';
  email: string;
  workPhone: string;
  mobileNumber: string;
  billingAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  openingBalance: number;
  creditLimit: number;
  gstNumber: string;
  panNumber: string;
  notes: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CustomerFormData {
  salutation: Customer['salutation'];
  firstName: string;
  lastName: string;
  displayName: string;
  customerType: Customer['customerType'];
  email: string;
  workPhone: string;
  mobileNumber: string;
  billingAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  openingBalance: number;
  creditLimit: number;
  gstNumber: string;
  panNumber: string;
  notes: string;
}

export interface CustomerFilters {
  searchQuery: string;
  customerType: 'all' | Customer['customerType'];
  status: 'all' | Customer['status'];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface CustomerStats {
  totalCustomers: number;
  active: number;
  inactive: number;
  totalOpeningBalance: number;
  totalCreditLimit: number;
}