// src/types/RecurringExpense/RecurringExpenseType.ts

export interface RecurringExpense {
  id: string | number;
  recurringNumber: string;
  vendorId?: string | number;
  vendorName?: string;
  category: string;
  subCategory?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  startDate: string;
  endDate?: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'custom';
  frequencyInterval?: number; // For custom frequency (e.g., every 2 months)
  frequencyUnit?: 'days' | 'weeks' | 'months' | 'years';
  paymentMethod: 'cash' | 'bank' | 'credit_card' | 'cheque' | 'auto_debit';
  paymentStatus: 'active' | 'paused' | 'cancelled' | 'completed';
  referenceNumber?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lastProcessed?: string;
  nextProcessingDate?: string;
  totalOccurrences?: number;
  processedOccurrences?: number;
  isVendorExpense?: boolean;
  attachment?: string;
  currency?: string;
  exchangeRate?: number;
}

export interface RecurringExpenseFormData {
  vendorId?: string | number;
  vendorName?: string;
  category: string;
  subCategory?: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  startDate: string;
  endDate?: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'custom';
  frequencyInterval?: number;
  frequencyUnit?: 'days' | 'weeks' | 'months' | 'years';
  paymentMethod: 'cash' | 'bank' | 'credit_card' | 'cheque' | 'auto_debit';
  paymentStatus: 'active' | 'paused' | 'cancelled' | 'completed';
  referenceNumber?: string;
  notes?: string;
  isVendorExpense?: boolean;
  attachment?: string;
  currency?: string;
  exchangeRate?: number;
  totalOccurrences?: number;
}

export interface RecurringExpenseFilters {
  search?: string;
  category?: string;
  paymentStatus?: string;
  frequency?: string;
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

export interface RecurringExpenseResponse {
  data: RecurringExpense[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RecurringExpenseStats {
  totalRecurringExpenses: number;
  totalMonthlyAmount: number;
  totalYearlyAmount: number;
  activeCount: number;
  pausedCount: number;
  cancelledCount: number;
  completedCount: number;
  vendorExpenses: number;
  nonVendorExpenses: number;
  totalAmount: number;
}

export const RECURRING_FREQUENCIES = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'half_yearly',
  'yearly',
  'custom'
] as const;

export const RECURRING_STATUSES = [
  'active',
  'paused',
  'cancelled',
  'completed'
] as const;

export const RECURRING_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries & Wages',
  'Insurance',
  'Software Subscriptions',
  'Membership Fees',
  'Loan Payments',
  'Maintenance Contracts',
  'Internet & Phone',
  'Cleaning Services',
  'Security Services',
  'Marketing Subscriptions',
  'Office Supplies',
  'Travel & Entertainment',
  'Professional Services',
  'Taxes',
  'Bank Fees',
  'Vehicle Expenses',
  'Charity & Donations'
];

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  half_yearly: 'Half Yearly',
  yearly: 'Yearly',
  custom: 'Custom'
};