// src/types/Bank/BankTypes.ts

export interface Bank {
  id: string | number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: 'savings' | 'current' | 'fixed_deposit' | 'recurring_deposit' | 'salary';
  ifscCode: string;
  branchName: string;
  branchAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface BankFormData {
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: 'savings' | 'current' | 'fixed_deposit' | 'recurring_deposit' | 'salary';
  ifscCode: string;
  branchName: string;
  branchAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export interface BankFilters {
  search?: string;
  status?: string;
  accountType?: string;
  bankName?: string;
  city?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BankResponse {
  data: Bank[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BankStats {
  totalBanks: number;
  activeCount: number;
  inactiveCount: number;
  suspendedCount: number;
  totalBalance: number;
  savingsCount: number;
  currentCount: number;
  fixedDepositCount: number;
}

export const BANK_ACCOUNT_TYPES = [
  'savings',
  'current',
  'fixed_deposit',
  'recurring_deposit',
  'salary'
] as const;

export const BANK_ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: 'Savings',
  current: 'Current',
  fixed_deposit: 'Fixed Deposit',
  recurring_deposit: 'Recurring Deposit',
  salary: 'Salary'
};

export const BANK_STATUSES = [
  'active',
  'inactive',
  'suspended'
] as const;

export const BANK_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended'
};

export const BANK_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  suspended: 'bg-yellow-100 text-yellow-700'
};