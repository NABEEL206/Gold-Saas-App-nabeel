// src/types/ManualJournal/ManualJournalType.ts

export interface ManualJournalEntry {
  id?: string;
  accountId: string;
  accountName: string;
  accountCode?: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  [key: string]: any;
}

export interface ManualJournal {
  id: string | number;
  journalNumber: string;
  journalDate: string;
  description: string;
  entries: ManualJournalEntry[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'cancelled' | 'pending';
  referenceNumber?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  postedBy?: string;
  postedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  attachment?: string;
}

export interface ManualJournalFormData {
  journalDate: string;
  description: string;
  entries: ManualJournalEntry[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'cancelled' | 'pending';
  referenceNumber?: string;
  notes?: string;
  attachment?: string;
}

export interface ManualJournalFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ManualJournalResponse {
  data: ManualJournal[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ManualJournalStats {
  totalJournals: number;
  totalDebit: number;
  totalCredit: number;
  draftCount: number;
  postedCount: number;
  pendingCount: number;
  cancelledCount: number;
}

export const MANUAL_JOURNAL_STATUSES = [
  'draft',
  'pending',
  'posted',
  'cancelled'
] as const;

export const MANUAL_JOURNAL_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending Approval',
  posted: 'Posted',
  cancelled: 'Cancelled'
};

export const MANUAL_JOURNAL_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
  posted: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

// Sample Chart of Accounts for manual journals
export const CHART_OF_ACCOUNTS = [
  // Assets
  { id: '1000', code: '1000', name: 'Cash', category: 'Asset' },
  { id: '1010', code: '1010', name: 'Bank', category: 'Asset' },
  { id: '1020', code: '1020', name: 'Accounts Receivable', category: 'Asset' },
  { id: '1030', code: '1030', name: 'Inventory', category: 'Asset' },
  { id: '1040', code: '1040', name: 'Prepaid Expenses', category: 'Asset' },
  { id: '1050', code: '1050', name: 'Fixed Assets', category: 'Asset' },
  { id: '1060', code: '1060', name: 'Accumulated Depreciation', category: 'Asset' },
  
  // Liabilities
  { id: '2000', code: '2000', name: 'Accounts Payable', category: 'Liability' },
  { id: '2010', code: '2010', name: 'Accrued Expenses', category: 'Liability' },
  { id: '2020', code: '2020', name: 'Unearned Revenue', category: 'Liability' },
  { id: '2030', code: '2030', name: 'Loans Payable', category: 'Liability' },
  { id: '2040', code: '2040', name: 'Tax Payable', category: 'Liability' },
  
  // Equity
  { id: '3000', code: '3000', name: 'Owner\'s Equity', category: 'Equity' },
  { id: '3010', code: '3010', name: 'Retained Earnings', category: 'Equity' },
  { id: '3020', code: '3020', name: 'Capital Stock', category: 'Equity' },
  
  // Revenue
  { id: '4000', code: '4000', name: 'Sales Revenue', category: 'Revenue' },
  { id: '4010', code: '4010', name: 'Service Revenue', category: 'Revenue' },
  { id: '4020', code: '4020', name: 'Interest Income', category: 'Revenue' },
  
  // Expenses
  { id: '5000', code: '5000', name: 'Cost of Goods Sold', category: 'Expense' },
  { id: '5010', code: '5010', name: 'Salaries Expense', category: 'Expense' },
  { id: '5020', code: '5020', name: 'Rent Expense', category: 'Expense' },
  { id: '5030', code: '5030', name: 'Utilities Expense', category: 'Expense' },
  { id: '5040', code: '5040', name: 'Insurance Expense', category: 'Expense' },
  { id: '5050', code: '5050', name: 'Depreciation Expense', category: 'Expense' },
  { id: '5060', code: '5060', name: 'Interest Expense', category: 'Expense' },
  { id: '5070', code: '5070', name: 'Office Supplies Expense', category: 'Expense' },
  { id: '5080', code: '5080', name: 'Travel Expense', category: 'Expense' },
  { id: '5090', code: '5090', name: 'Marketing Expense', category: 'Expense' },
  { id: '5100', code: '5100', name: 'Professional Fees', category: 'Expense' },
  { id: '5110', code: '5110', name: 'Bank Charges', category: 'Expense' },
];