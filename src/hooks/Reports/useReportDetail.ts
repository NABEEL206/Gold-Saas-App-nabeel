// src/hooks/Reports/useReportDetail.ts

import { useState, useEffect, useCallback } from 'react';

export interface ReportDetailData {
  id: string;
  title: string;
  category: string;
  data: any;
  metadata: {
    createdBy: string;
    createdAt: string;
    lastModified: string;
  };
}

export interface ReportFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
}

interface UseReportDetailOptions {
  reportId: string;
  autoFetch?: boolean;
  filters?: ReportFilters;
}

export const useReportDetail = ({
  reportId,
  autoFetch = true,
  filters = {},
}: UseReportDetailOptions) => {
  const [data, setData] = useState<ReportDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ReportFilters>(filters);

  // Mock data generator for all report types
  const getMockData = (id: string): ReportDetailData => {
    const mockData: Record<string, any> = {
      // ========== Accountant Reports ==========
      'balance-sheet': {
        id: 'balance-sheet',
        title: 'Balance Sheet',
        category: 'Accountant',
        data: {
          assets: { current: 1500000, fixed: 1350000, total: 2850000 },
          liabilities: { current: 750000, longTerm: 500000, total: 1250000 },
          equity: { shareCapital: 1000000, retainedEarnings: 600000, total: 1600000 },
          ratios: { debtToEquity: 0.78, currentRatio: 2.0, quickRatio: 1.2 },
          breakdown: {
            cash: 500000,
            accountsReceivable: 600000,
            inventory: 400000,
            accountsPayable: 450000,
            property: 1000000,
            goodwill: 350000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'profit-loss': {
        id: 'profit-loss',
        title: 'Profit and Loss Statement',
        category: 'Accountant',
        data: {
          revenue: 1250000,
          cogs: 750000,
          grossProfit: 500000,
          operatingExpenses: 125000,
          netProfit: 375000,
          otherIncome: 25000,
          tax: 75000,
          comparisons: {
            previousYear: { revenue: 1120000, netProfit: 325000 },
            changePercent: { revenue: 11.6, netProfit: 15.4 },
          },
          monthlyData: [
            { month: 'Jan', revenue: 98000, profit: 28000 },
            { month: 'Feb', revenue: 102000, profit: 30000 },
            { month: 'Mar', revenue: 115000, profit: 35000 },
            { month: 'Apr', revenue: 108000, profit: 32000 },
            { month: 'May', revenue: 125000, profit: 38000 },
            { month: 'Jun', revenue: 132000, profit: 40000 },
          ],
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'trial-balance': {
        id: 'trial-balance',
        title: 'Trial Balance',
        category: 'Accountant',
        data: {
          accounts: [
            { name: 'Cash', debit: 500000, credit: 0 },
            { name: 'Accounts Receivable', debit: 600000, credit: 0 },
            { name: 'Inventory', debit: 400000, credit: 0 },
            { name: 'Accounts Payable', debit: 0, credit: 450000 },
            { name: 'Share Capital', debit: 0, credit: 1000000 },
            { name: 'Revenue', debit: 0, credit: 1250000 },
            { name: 'Expenses', debit: 875000, credit: 0 },
          ],
          totalDebit: 2375000,
          totalCredit: 2700000,
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },

      // ========== Banking Reports ==========
      'bank-transactions': {
        id: 'bank-transactions',
        title: 'Bank Transactions Details',
        category: 'Banking',
        data: {
          transactions: [
            { date: '2026-06-30', description: 'Customer Payment', amount: 50000, type: 'Credit', balance: 550000 },
            { date: '2026-06-29', description: 'Supplier Payment', amount: 25000, type: 'Debit', balance: 500000 },
            { date: '2026-06-28', description: 'Sales Revenue', amount: 75000, type: 'Credit', balance: 525000 },
            { date: '2026-06-27', description: 'Rent Payment', amount: 15000, type: 'Debit', balance: 450000 },
            { date: '2026-06-26', description: 'Interest Received', amount: 5000, type: 'Credit', balance: 465000 },
          ],
          summary: {
            totalCredits: 130000,
            totalDebits: 40000,
            netBalance: 90000,
            openingBalance: 460000,
            closingBalance: 550000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },

      // ========== Inventory Reports ==========
      'gold-inventory-summary': {
        id: 'gold-inventory-summary',
        title: 'Gold Inventory Summary',
        category: 'Gold Inventory',
        data: {
          items: [
            { purity: '24K', quantity: 500, weight: '500g', value: 2500000 },
            { purity: '22K', quantity: 300, weight: '300g', value: 1350000 },
            { purity: '18K', quantity: 200, weight: '200g', value: 750000 },
          ],
          total: {
            quantity: 1000,
            weight: '1000g',
            value: 4600000,
          },
          valuation: {
            rate: '₹5000/g',
            date: '2026-06-30',
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'stock-movement': {
        id: 'stock-movement',
        title: 'Stock Movement',
        category: 'Inventory',
        data: {
          movements: [
            { date: '2026-06-30', item: 'Gold Bars', type: 'In', quantity: 50, value: 100000 },
            { date: '2026-06-29', item: 'Gold Bars', type: 'Out', quantity: 20, value: 40000 },
            { date: '2026-06-28', item: 'Silver Bars', type: 'In', quantity: 100, value: 20000 },
            { date: '2026-06-27', item: 'Diamonds', type: 'Out', quantity: 10, value: 10000 },
            { date: '2026-06-26', item: 'Gold Bars', type: 'In', quantity: 30, value: 60000 },
          ],
          summary: {
            totalIn: { quantity: 180, value: 180000 },
            totalOut: { quantity: 30, value: 50000 },
            netMovement: { quantity: 150, value: 130000 },
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'inventory-valuation': {
        id: 'inventory-valuation',
        title: 'Inventory Valuation',
        category: 'Inventory Valuation',
        data: {
          items: [
            { name: 'Gold Bars', quantity: 100, unitPrice: 2000, total: 200000 },
            { name: 'Silver Bars', quantity: 500, unitPrice: 200, total: 100000 },
            { name: 'Diamonds', quantity: 50, unitPrice: 1000, total: 50000 },
            { name: 'Gemstones', quantity: 200, unitPrice: 250, total: 50000 },
          ],
          totalValue: 400000,
          valuationMethod: 'FIFO',
          asOn: '2026-06-30',
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },

      // ========== Payables Reports ==========
      'payable-summary': {
        id: 'payable-summary',
        title: 'Payable Summary',
        category: 'Payables',
        data: {
          vendors: [
            { name: 'Vendor A', total: 150000, due: 75000, overdue: 25000 },
            { name: 'Vendor B', total: 100000, due: 50000, overdue: 15000 },
            { name: 'Vendor C', total: 75000, due: 30000, overdue: 10000 },
          ],
          summary: {
            totalPayable: 325000,
            totalDue: 155000,
            totalOverdue: 50000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'purchase-order-details': {
        id: 'purchase-order-details',
        title: 'Purchase Order Details',
        category: 'Payables',
        data: {
          orders: [
            { id: 'PO-001', vendor: 'Vendor A', date: '2026-06-25', amount: 50000, status: 'Delivered' },
            { id: 'PO-002', vendor: 'Vendor B', date: '2026-06-24', amount: 35000, status: 'Pending' },
            { id: 'PO-003', vendor: 'Vendor C', date: '2026-06-23', amount: 25000, status: 'Processing' },
          ],
          summary: {
            totalOrders: 3,
            totalAmount: 110000,
            delivered: 1,
            pending: 2,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'vendor-payment': {
        id: 'vendor-payment',
        title: 'Vendor Payment',
        category: 'Payables',
        data: {
          payments: [
            { vendor: 'Vendor A', date: '2026-06-30', amount: 25000, method: 'Bank Transfer', status: 'Completed' },
            { vendor: 'Vendor B', date: '2026-06-29', amount: 15000, method: 'Cheque', status: 'Pending' },
            { vendor: 'Vendor C', date: '2026-06-28', amount: 20000, method: 'Cash', status: 'Completed' },
          ],
          summary: {
            totalPaid: 60000,
            pending: 15000,
            total: 75000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },

      // ========== Payments Received ==========
      'payment-received': {
        id: 'payment-received',
        title: 'Payment Received',
        category: 'Payments Received',
        data: {
          payments: [
            { customer: 'Customer A', date: '2026-06-30', amount: 50000, method: 'Bank Transfer', status: 'Received' },
            { customer: 'Customer B', date: '2026-06-29', amount: 30000, method: 'Cheque', status: 'Pending' },
            { customer: 'Customer C', date: '2026-06-28', amount: 25000, method: 'Cash', status: 'Received' },
          ],
          summary: {
            totalReceived: 105000,
            pending: 30000,
            total: 135000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },

      // ========== Purchases and Expenses ==========
      'expense-report': {
        id: 'expense-report',
        title: 'Expense Report',
        category: 'Purchases and Expenses',
        data: {
          expenses: [
            { category: 'Rent', amount: 50000, date: '2026-06-30', type: 'Fixed' },
            { category: 'Utilities', amount: 15000, date: '2026-06-29', type: 'Variable' },
            { category: 'Salaries', amount: 75000, date: '2026-06-28', type: 'Fixed' },
            { category: 'Marketing', amount: 25000, date: '2026-06-27', type: 'Variable' },
          ],
          summary: {
            totalExpenses: 165000,
            fixed: 125000,
            variable: 40000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'purchase-summary': {
        id: 'purchase-summary',
        title: 'Purchase Summary',
        category: 'Purchases and Expenses',
        data: {
          purchases: [
            { item: 'Gold Bars', quantity: 100, rate: 5000, total: 500000, date: '2026-06-30' },
            { item: 'Silver Bars', quantity: 200, rate: 200, total: 40000, date: '2026-06-29' },
            { item: 'Diamonds', quantity: 50, rate: 1000, total: 50000, date: '2026-06-28' },
          ],
          summary: {
            totalPurchases: 590000,
            totalItems: 350,
            averageRate: 1685,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },

      // ========== Receivables ==========
      'invoice-details': {
        id: 'invoice-details',
        title: 'Invoice Details',
        category: 'Receivables',
        data: {
          invoices: [
            { id: 'INV-001', customer: 'Customer A', date: '2026-06-30', amount: 75000, status: 'Paid' },
            { id: 'INV-002', customer: 'Customer B', date: '2026-06-29', amount: 50000, status: 'Pending' },
            { id: 'INV-003', customer: 'Customer C', date: '2026-06-28', amount: 35000, status: 'Overdue' },
          ],
          summary: {
            totalInvoices: 160000,
            paid: 75000,
            pending: 50000,
            overdue: 35000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'receivables-summary': {
        id: 'receivables-summary',
        title: 'Receivables Summary',
        category: 'Receivables',
        data: {
          customers: [
            { name: 'Customer A', total: 75000, due: 25000, overdue: 0 },
            { name: 'Customer B', total: 50000, due: 50000, overdue: 25000 },
            { name: 'Customer C', total: 35000, due: 0, overdue: 35000 },
          ],
          summary: {
            totalReceivables: 160000,
            totalDue: 75000,
            totalOverdue: 60000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },

      // ========== Repairs ==========
      'repairs-summary': {
        id: 'repairs-summary',
        title: 'Repairs Summary',
        category: 'Repairs',
        data: {
          repairs: [
            { id: 'R-001', item: 'Gold Necklace', date: '2026-06-30', cost: 5000, status: 'Completed' },
            { id: 'R-002', item: 'Diamond Ring', date: '2026-06-29', cost: 3000, status: 'In Progress' },
            { id: 'R-003', item: 'Silver Bracelet', date: '2026-06-28', cost: 2000, status: 'Pending' },
          ],
          summary: {
            totalRepairs: 3,
            totalCost: 10000,
            completed: 1,
            inProgress: 1,
            pending: 1,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },

      // ========== Sales Reports ==========
      'sales-summary': {
        id: 'sales-summary',
        title: 'Sales Summary',
        category: 'Sales',
        data: {
          totalSales: 1250000,
          totalOrders: 456,
          averageOrderValue: 2741,
          topProducts: [
            { name: 'Gold Necklace', sales: 250000, quantity: 50 },
            { name: 'Diamond Ring', sales: 180000, quantity: 30 },
            { name: 'Silver Bracelet', sales: 120000, quantity: 100 },
          ],
          monthlyTrend: [
            { month: 'Jan', sales: 98000 },
            { month: 'Feb', sales: 102000 },
            { month: 'Mar', sales: 115000 },
            { month: 'Apr', sales: 108000 },
            { month: 'May', sales: 125000 },
            { month: 'Jun', sales: 132000 },
          ],
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'sales-by-customer': {
        id: 'sales-by-customer',
        title: 'Sales by Customer',
        category: 'Sales',
        data: {
          customers: [
            { name: 'Luxury Jewels', total: 350000, orders: 25, average: 14000 },
            { name: 'Diamond World', total: 280000, orders: 20, average: 14000 },
            { name: 'Gold Palace', total: 220000, orders: 18, average: 12222 },
            { name: 'Silver City', total: 180000, orders: 15, average: 12000 },
            { name: 'Gem House', total: 150000, orders: 12, average: 12500 },
          ],
          summary: {
            totalCustomers: 5,
            totalSales: 1180000,
            averagePerCustomer: 236000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
      'sales-by-product': {
        id: 'sales-by-product',
        title: 'Sales by Product',
        category: 'Sales',
        data: {
          products: [
            { name: 'Gold Necklace', quantity: 50, revenue: 250000, profit: 100000 },
            { name: 'Diamond Ring', quantity: 30, revenue: 180000, profit: 72000 },
            { name: 'Silver Bracelet', quantity: 100, revenue: 120000, profit: 48000 },
            { name: 'Platinum Chain', quantity: 20, revenue: 150000, profit: 60000 },
            { name: 'Gemstone Pendant', quantity: 40, revenue: 100000, profit: 40000 },
          ],
          summary: {
            totalProducts: 5,
            totalRevenue: 800000,
            totalProfit: 320000,
            averageProfitMargin: 40,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },

      // ========== Taxes ==========
      'tax-summary': {
        id: 'tax-summary',
        title: 'Tax Summary',
        category: 'Taxes',
        data: {
          taxes: [
            { type: 'GST', amount: 150000, period: 'Q2 2026', status: 'Filled' },
            { type: 'Income Tax', amount: 375000, period: 'FY 2025-26', status: 'Pending' },
            { type: 'TDS', amount: 25000, period: 'June 2026', status: 'Filled' },
          ],
          summary: {
            totalTaxLiability: 550000,
            paid: 175000,
            pending: 375000,
          },
          gstBreakdown: {
            cgst: 75000,
            sgst: 75000,
            igst: 25000,
          }
        },
        metadata: {
          createdBy: 'System Generated',
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      },
    };

    return mockData[id] || {
      id: id,
      title: 'Report',
      category: 'General',
      data: { message: 'No data available for this report' },
      metadata: {
        createdBy: 'System Generated',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      },
    };
  };

  const fetchData = useCallback(async (newFilters?: ReportFilters) => {
    setLoading(true);
    setError(null);
    try {
      // 🔌 API Ready - Replace with actual API call
      // const response = await api.get(`/reports/${reportId}`, { params: newFilters || currentFilters });
      // setData(response.data);
      
      // 🎯 Using Mock Data for now
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
      const mockData = getMockData(reportId);
      setData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [reportId, currentFilters]);

  const refreshData = useCallback(async () => {
    await fetchData(currentFilters);
  }, [fetchData, currentFilters]);

  const updateFilters = useCallback((newFilters: ReportFilters) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const exportReport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // 🔌 API Ready - Replace with actual API call
      // const response = await api.get(`/reports/${reportId}/export`, {
      //   params: { format },
      //   responseType: 'blob',
      // });
      // const blob = response.data;
      
      // 🎯 Mock Export for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      const content = `Mock ${format} export for ${reportId}`;
      const blob = new Blob([content], { 
        type: format === 'pdf' ? 'application/pdf' : 
              format === 'excel' ? 'application/vnd.ms-excel' : 
              'text/csv' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting report:', err);
      throw err;
    }
  }, [reportId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch]);

  return {
    data,
    loading,
    error,
    fetchData,
    refreshData,
    exportReport,
    updateFilters,
    clearError,
    currentFilters,
  };
};