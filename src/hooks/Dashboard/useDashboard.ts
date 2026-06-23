// src/hooks/Dashboard/useDashboard.ts
import { useState, useEffect } from 'react';
import type { 
  DashboardData, 
  GoldRate, 
  DashboardStats, 
  KaratWiseInventory, 
  RateTrend, 
  FinancialSummary, 
  Transaction, 
  Alert 
} from '../../types/dashboard/Dashboardtype';

// Mock data generator functions
const generateGoldRates = (): GoldRate[] => {
  return [
    { karat: '24K', rate: 15142, change: 0.85 },
    { karat: '22K', rate: 13875, change: -0.32 },
    { karat: '18K', rate: 11465, change: 0.45 },
  ];
};

const generateStats = (): DashboardStats => {
  return {
    totalStock: 45.8 + Math.random() * 10,
    inventoryValue: 250000 + Math.random() * 50000,
    sales: 185000 + Math.random() * 30000,
    profit: 52000 + Math.random() * 10000,
  };
};

const generateKaratWiseInventory = (): KaratWiseInventory[] => {
  return [
    { karat: '24K', weight: 15.2 + Math.random() * 5, percentage: 30 },
    { karat: '22K', weight: 20.5 + Math.random() * 5, percentage: 40 },
    { karat: '18K', weight: 10.1 + Math.random() * 5, percentage: 20 },
  ];
};

const generateRateTrend = (): RateTrend[] => {
  const trends: RateTrend[] = [];
  const now = new Date();
  const baseRate = 14500;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const randomVariation = (Math.random() - 0.5) * 800;
    trends.push({
      date: date.toISOString().split('T')[0],
      rate: baseRate + randomVariation,
    });
  }
  return trends;
};

const generateFinancialSummary = (): FinancialSummary => {
  return {
    purchases: 120000 + Math.random() * 30000,
    sales: 185000 + Math.random() * 30000,
    receivables: 45000 + Math.random() * 10000,
    payables: 32000 + Math.random() * 8000,
  };
};

const generateTransactions = (): Transaction[] => {
  const types: Transaction['type'][] = ['purchase', 'sale', 'payment', 'receipt'];
  const statuses: Transaction['status'][] = ['completed', 'pending', 'cancelled'];
  const customers = ['Rajesh Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Reddy', 'Vikram Singh'];
  const vendors = ['Mumbai Gold Traders', 'Delhi Jewellers', 'Bangalore Gems', 'Chennai Diamonds'];
  
  return Array.from({ length: 5 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const isPurchase = type === 'purchase' || type === 'payment';
    return {
      id: `TXN${String(i + 1).padStart(5, '0')}`,
      type,
      customer: !isPurchase ? customers[Math.floor(Math.random() * customers.length)] : undefined,
      vendor: isPurchase ? vendors[Math.floor(Math.random() * vendors.length)] : undefined,
      amount: 5000 + Math.random() * 45000,
      date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      reference: `REF${String(i + 1).padStart(6, '0')}`,
    };
  });
};

const generateAlerts = (): Alert[] => {
  return [
    {
      id: '1',
      type: 'warning',
      message: 'Gold inventory below threshold for 24K (15g remaining)',
      date: new Date().toISOString().split('T')[0],
      read: false,
    },
    {
      id: '2',
      type: 'info',
      message: 'New customer registration: Priya Jewellers',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      read: false,
    },
    {
      id: '3',
      type: 'error',
      message: 'Payment failed for invoice #INV-2024-001',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      read: true,
    },
    {
      id: '4',
      type: 'success',
      message: 'Monthly sales target achieved! 105% of goal',
      date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
      read: false,
    },
  ];
};

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dashboardData: DashboardData = {
          goldRates: generateGoldRates(),
          stats: generateStats(),
          karatWiseInventory: generateKaratWiseInventory(),
          rateTrend: generateRateTrend(),
          financialSummary: generateFinancialSummary(),
          recentTransactions: generateTransactions(),
          alerts: generateAlerts(),
        };
        
        setData(dashboardData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const dashboardData: DashboardData = {
        goldRates: generateGoldRates(),
        stats: generateStats(),
        karatWiseInventory: generateKaratWiseInventory(),
        rateTrend: generateRateTrend(),
        financialSummary: generateFinancialSummary(),
        recentTransactions: generateTransactions(),
        alerts: generateAlerts(),
      };
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    data,
    error,
    refreshData,
  };
};