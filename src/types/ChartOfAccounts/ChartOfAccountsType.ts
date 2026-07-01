// src/types/ChartOfAccounts/ChartOfAccountsType.ts

export interface ChartOfAccount {
  id: string | number;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  subCategory?: string;
  description?: string;
  parentAccountId?: string | number;
  parentAccountName?: string;
  isActive: boolean;
  isSystemAccount: boolean;
  balance?: number;
  openingBalance?: number;
  currentBalance?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ChartOfAccountFormData {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  subCategory?: string;
  description?: string;
  parentAccountId?: string | number;
  parentAccountName?: string;
  isActive: boolean;
  isSystemAccount: boolean;
  openingBalance?: number;
  currentBalance?: number;
}

export interface ChartOfAccountFilters {
  search?: string;
  type?: string;
  category?: string;
  isActive?: boolean;
  isSystemAccount?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ChartOfAccountResponse {
  data: ChartOfAccount[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ChartOfAccountStats {
  totalAccounts: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  activeCount: number;
  systemAccounts: number;
}

export const ACCOUNT_TYPES = [
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense'
] as const;

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  revenue: 'Revenue',
  expense: 'Expense'
};

export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  asset: 'text-blue-600',
  liability: 'text-red-600',
  equity: 'text-purple-600',
  revenue: 'text-green-600',
  expense: 'text-amber-600'
};

export const ACCOUNT_TYPE_BADGE_COLORS: Record<string, string> = {
  asset: 'bg-blue-100 text-blue-700',
  liability: 'bg-red-100 text-red-700',
  equity: 'bg-purple-100 text-purple-700',
  revenue: 'bg-green-100 text-green-700',
  expense: 'bg-amber-100 text-amber-700'
};

// Predefined categories for each account type
export const ACCOUNT_CATEGORIES: Record<string, string[]> = {
  asset: [
    'Cash & Cash Equivalents',
    'Accounts Receivable',
    'Inventory',
    'Prepaid Expenses',
    'Fixed Assets',
    'Intangible Assets',
    'Other Current Assets',
    'Other Non-Current Assets'
  ],
  liability: [
    'Accounts Payable',
    'Accrued Expenses',
    'Unearned Revenue',
    'Short-Term Debt',
    'Long-Term Debt',
    'Other Current Liabilities',
    'Other Non-Current Liabilities'
  ],
  equity: [
    'Owner\'s Equity',
    'Retained Earnings',
    'Capital Stock',
    'Additional Paid-In Capital',
    'Treasury Stock'
  ],
  revenue: [
    'Sales Revenue',
    'Service Revenue',
    'Interest Income',
    'Other Income',
    'Discounts & Allowances'
  ],
  expense: [
    'Cost of Goods Sold',
    'Salaries & Wages',
    'Rent Expense',
    'Utilities Expense',
    'Insurance Expense',
    'Depreciation Expense',
    'Interest Expense',
    'Office Supplies',
    'Travel & Entertainment',
    'Marketing & Advertising',
    'Professional Fees',
    'Bank Charges',
    'Tax Expense',
    'Other Expenses'
  ]
};

// Predefined system accounts with codes
export const SYSTEM_ACCOUNTS = [
  { code: '1000', name: 'Cash', type: 'asset', category: 'Cash & Cash Equivalents' },
  { code: '1010', name: 'Bank', type: 'asset', category: 'Cash & Cash Equivalents' },
  { code: '1020', name: 'Accounts Receivable', type: 'asset', category: 'Accounts Receivable' },
  { code: '1030', name: 'Inventory', type: 'asset', category: 'Inventory' },
  { code: '1040', name: 'Prepaid Expenses', type: 'asset', category: 'Prepaid Expenses' },
  { code: '1050', name: 'Fixed Assets', type: 'asset', category: 'Fixed Assets' },
  { code: '1060', name: 'Accumulated Depreciation', type: 'asset', category: 'Fixed Assets' },
  { code: '2000', name: 'Accounts Payable', type: 'liability', category: 'Accounts Payable' },
  { code: '2010', name: 'Accrued Expenses', type: 'liability', category: 'Accrued Expenses' },
  { code: '2020', name: 'Unearned Revenue', type: 'liability', category: 'Unearned Revenue' },
  { code: '2030', name: 'Loans Payable', type: 'liability', category: 'Long-Term Debt' },
  { code: '2040', name: 'Tax Payable', type: 'liability', category: 'Other Current Liabilities' },
  { code: '3000', name: 'Owner\'s Equity', type: 'equity', category: 'Owner\'s Equity' },
  { code: '3010', name: 'Retained Earnings', type: 'equity', category: 'Retained Earnings' },
  { code: '4000', name: 'Sales Revenue', type: 'revenue', category: 'Sales Revenue' },
  { code: '4010', name: 'Service Revenue', type: 'revenue', category: 'Service Revenue' },
  { code: '5000', name: 'Cost of Goods Sold', type: 'expense', category: 'Cost of Goods Sold' },
  { code: '5010', name: 'Salaries Expense', type: 'expense', category: 'Salaries & Wages' },
  { code: '5020', name: 'Rent Expense', type: 'expense', category: 'Rent Expense' },
];