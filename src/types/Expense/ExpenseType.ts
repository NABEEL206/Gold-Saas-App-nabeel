// src/types/Expense/ExpenseType.ts

export interface Expense {
  id: string | number;
  expenseNumber: string;
  vendorId?: string | number;
  vendorName?: string;
  category: string;
  subCategory?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  date: string;
  dueDate?: string;
  description?: string;
  paymentMethod: 'cash' | 'bank' | 'credit_card' | 'cheque';
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'overdue';
  referenceNumber?: string;
  attachment?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  receiptNumber?: string;
  billNumber?: string;
  currency?: string;
  exchangeRate?: number;
  isVendorExpense?: boolean; // Flag to indicate if expense is linked to a vendor
}

export interface ExpenseFormData {
  vendorId?: string | number;
  vendorName?: string;
  category: string;
  subCategory?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  date: string;
  dueDate?: string;
  description?: string;
  paymentMethod: 'cash' | 'bank' | 'credit_card' | 'cheque';
  paymentStatus: 'paid' | 'unpaid' | 'partial' | 'overdue';
  referenceNumber?: string;
  attachment?: string;
  notes?: string;
  receiptNumber?: string;
  billNumber?: string;
  currency?: string;
  exchangeRate?: number;
  isVendorExpense?: boolean;
}

export interface ExpenseFilters {
  search?: string;
  category?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  vendorId?: string | number;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  expenseType?: 'all' | 'vendor' | 'non-vendor';
}

export interface ExpenseResponse {
  data: Expense[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ExpenseStats {
  totalExpenses: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  overdueAmount: number;
  expenseCount: number;
  averageAmount: number;
  vendorExpenses: number;
  nonVendorExpenses: number;
}

export interface ExpenseValidationErrors {
  vendorId?: string;
  category?: string;
  amount?: string;
  date?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  [key: string]: string | undefined;
}

export const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Utilities',
  'Rent',
  'Salaries & Wages',
  'Travel & Entertainment',
  'Marketing & Advertising',
  'Professional Services',
  'Insurance',
  'Maintenance & Repairs',
  'Technology & Software',
  'Transportation',
  'Inventory',
  'Taxes',
  'Legal Fees',
  'Bank Fees',
  'Miscellaneous',
  'Petty Cash',
  'Staff Welfare',
  'Training & Development',
  'Communication',
  'Printing & Stationery',
  'Vehicle Expenses',
  'Medical Expenses',
  'Charity & Donations'
];

export const PAYMENT_METHODS = [
  'cash',
  'bank',
  'credit_card',
  'cheque'
] as const;

export const PAYMENT_STATUSES = [
  'paid',
  'unpaid',
  'partial',
  'overdue'
] as const;