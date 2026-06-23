// src/types/dashboardtype.ts
export interface GoldRate {
  karat: string;
  rate: number;
  change: number;
}

export interface DashboardStats {
  totalStock: number;
  inventoryValue: number;
  sales: number;
  profit: number;
}

export interface KaratWiseInventory {
  karat: string;
  weight: number;
  percentage: number;
}

export interface RateTrend {
  date: string;
  rate: number;
}

export interface FinancialSummary {
  purchases: number;
  sales: number;
  receivables: number;
  payables: number;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'payment' | 'receipt';
  customer?: string;
  vendor?: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  reference: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  date: string;
  read: boolean;
}

export interface DashboardData {
  goldRates: GoldRate[];
  stats: DashboardStats;
  karatWiseInventory: KaratWiseInventory[];
  rateTrend: RateTrend[];
  financialSummary: FinancialSummary;
  recentTransactions: Transaction[];
  alerts: Alert[];
}

// New types for Dashboard components
export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  unit: string;
  status: 'critical' | 'warning' | 'low';
}

export interface PurchaseOrder {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface QuickAction {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}