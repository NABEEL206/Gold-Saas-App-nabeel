// src/pages/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Eye,
  FileText,
  Users,
  ShoppingBag,
  Plus,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Clock,
  Building2,
  Receipt,
  CreditCard,
  Landmark,
  BarChart3,
  PieChart,
  Zap,
  AlertTriangle,
  Truck,
} from 'lucide-react';
import { useDashboard } from '../../hooks/Dashboard/useDashboard';
import type { 
  Alert, 
  LowStockItem, 
  PurchaseOrder, 
  QuickAction 
} from '../../types/dashboard/Dashboardtype';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Mock data for low stock items
const lowStockItems: LowStockItem[] = [
  { id: '1', name: '24K Gold Bar', sku: 'G-24K-001', currentStock: 15, minStock: 50, unit: 'g', status: 'critical' },
  { id: '2', name: '22K Gold Chain', sku: 'G-22K-045', currentStock: 8, minStock: 25, unit: 'pcs', status: 'critical' },
  { id: '3', name: '18K Gold Ring', sku: 'G-18K-123', currentStock: 12, minStock: 30, unit: 'pcs', status: 'warning' },
  { id: '4', name: 'Silver Bracelet', sku: 'S-001-067', currentStock: 20, minStock: 40, unit: 'pcs', status: 'warning' },
  { id: '5', name: 'Gold Earrings', sku: 'G-E-089', currentStock: 5, minStock: 15, unit: 'pairs', status: 'critical' },
];

// Mock data for purchase orders
const recentPurchaseOrders: PurchaseOrder[] = [
  { id: 'PO-2024-001', vendor: 'Mumbai Gold Traders', date: '2024-01-15', amount: 450000, status: 'pending' },
  { id: 'PO-2024-002', vendor: 'Delhi Jewellers', date: '2024-01-14', amount: 320000, status: 'completed' },
  { id: 'PO-2024-003', vendor: 'Bangalore Gems', date: '2024-01-12', amount: 280000, status: 'pending' },
  { id: 'PO-2024-004', vendor: 'Chennai Diamonds', date: '2024-01-10', amount: 150000, status: 'cancelled' },
];

// Line Chart Component
const LineChart: React.FC<{ data: { date: string; rate: number }[]; timeframe: string }> = ({ data, timeframe }) => {
  const max = Math.max(...data.map(d => d.rate));
  const min = Math.min(...data.map(d => d.rate));
  const range = max - min;
  
  let filteredData = data;
  if (timeframe === '1W') {
    filteredData = data.slice(-7);
  } else if (timeframe === '1M') {
    filteredData = data.slice(-30);
  }
  
  const points = filteredData.map((d, i) => {
    const x = (i / (filteredData.length - 1)) * 100;
    const y = 100 - ((d.rate - min) / range) * 80 - 10;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="w-full h-32">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2"
        />
        <polygon
          points={`${points} ${100},${100 - ((filteredData[filteredData.length - 1]?.rate - min) / range) * 80 - 10}`}
          fill="url(#gradient)"
        />
        {filteredData.map((d, i) => (
          <circle
            key={i}
            cx={(i / (filteredData.length - 1)) * 100}
            cy={100 - ((d.rate - min) / range) * 80 - 10}
            r="1.5"
            fill="#F59E0B"
          />
        ))}
      </svg>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { loading, data, error, refreshData } = useDashboard();
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [goldRateTimeframe, setGoldRateTimeframe] = useState<'1W' | '1M' | '1Y'>('1M');
  const [showLowStock, setShowLowStock] = useState(false);

  // Show loading spinner within the page (not full screen)
  if (loading) {
    return (
      <div className="p-6 min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <LoadingSpinner size="lg" text="Loading Dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen" style={{ background: 'var(--background)' }}>
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p style={{ color: 'var(--danger)' }}>{error}</p>
            <button
              onClick={refreshData}
              className="mt-4 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ background: 'var(--primary)' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Quick Actions
  const quickActions: QuickAction[] = [
    { id: 'invoice', name: 'New Invoice', icon: <FileText className="h-4 w-4" />, color: 'bg-blue-500', path: '/sales/invoices' },
    { id: 'purchase', name: 'Purchase Order', icon: <ShoppingBag className="h-4 w-4" />, color: 'bg-purple-500', path: '/purchases/orders' },
    { id: 'customer', name: 'Add Customer', icon: <Users className="h-4 w-4" />, color: 'bg-green-500', path: '/sales/customers' },
    { id: 'payment', name: 'Record Payment', icon: <DollarSign className="h-4 w-4" />, color: 'bg-teal-500', path: '/sales/payments-received' },
    { id: 'expense', name: 'Add Expense', icon: <Wallet className="h-4 w-4" />, color: 'bg-red-500', path: '/purchases/expenses' },
    { id: 'vendor', name: 'Add Vendor', icon: <Building2 className="h-4 w-4" />, color: 'bg-orange-500', path: '/purchases/vendors' },
  ];

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
      default:
        return null;
    }
  };

  const getLowStockBadge = (status: LowStockItem['status']) => {
    switch (status) {
      case 'critical':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">Critical</span>;
      case 'warning':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Warning</span>;
      case 'low':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Low</span>;
      default:
        return null;
    }
  };

  const getProgressColor = (status: LowStockItem['status']) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const criticalItems = lowStockItems.filter(item => item.status === 'critical');

  return (
    <div className="p-6 min-h-screen themed-transition" style={{ background: 'var(--background)' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Overview of your business performance</p>
        </div>
        <button
          onClick={refreshData}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
          style={{ color: 'var(--text)', background: 'var(--card)', border: '1px solid var(--border)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--card)'}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Gold Rate Section */}
      <div className="rounded-xl p-6 mb-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Gold Rate</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Updated on: {new Date().toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--hover-bg)' }}>
            {(['1W', '1M', '1Y'] as const).map((period) => (
              <button
                key={period}
                className="px-3 py-1 text-xs font-medium rounded-md transition-colors"
                style={goldRateTimeframe === period
                  ? { background: 'var(--card)', color: 'var(--text)', boxShadow: 'var(--shadow-sm)' }
                  : { color: 'var(--text-secondary)' }}
                onClick={() => setGoldRateTimeframe(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.goldRates.map((rate) => (
            <div key={rate.karat} className="rounded-lg p-4" style={{ background: 'var(--primary-light)', border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{rate.karat} Gold / GRAM</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>₹{rate.rate.toFixed(0)}</p>
                </div>
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  rate.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {rate.change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(rate.change).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <LineChart data={data.rateTrend} timeframe={goldRateTimeframe} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl p-4 mb-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5" style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Quick Actions</h3>
          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>Create new entries quickly</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm themed-transition"
              style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--active-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
              onClick={() => console.log(`Navigate to ${action.path}`)}
            >
              <div className={`${action.color} p-1.5 rounded-lg text-white`}>{action.icon}</div>
              <span>{action.name}</span>
              <Plus className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          {/* Total Receivables */}
          <div className="rounded-xl p-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Total Receivables</h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">New</span>
            </div>
            <div className="mb-3">
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>₹0.00</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Unpaid Invoices</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Current</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>₹0.00</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Overdue</p>
                <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>₹0.00</p>
              </div>
            </div>
          </div>

          {/* Total Payables */}
          <div className="rounded-xl p-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-orange-500" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Total Payables</h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">New</span>
            </div>
            <div className="mb-3">
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>₹0.00</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Unpaid Bills</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Current</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>₹0.00</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Overdue</p>
                <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>₹0.00</p>
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="rounded-xl p-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Low Stock Items</h3>
              </div>
              {criticalItems.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                  {criticalItems.length} Critical
                </span>
              )}
            </div>
            <div className="space-y-3">
              {lowStockItems.slice(0, showLowStock ? undefined : 3).map((item) => (
                <div key={item.id} className="p-3 rounded-lg" style={{ background: 'var(--hover-bg)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{item.name}</span>
                        {getLowStockBadge(item.status)}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.sku}</p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.currentStock}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/{item.minStock} {item.unit}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full rounded-full h-1.5" style={{ background: 'var(--border)' }}>
                      <div className={`${getProgressColor(item.status)} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min((item.currentStock / item.minStock) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {lowStockItems.length > 3 && (
              <button onClick={() => setShowLowStock(!showLowStock)} className="inline-flex items-center gap-1 text-xs mt-3 font-medium" style={{ color: 'var(--primary)' }}>
                {showLowStock ? 'Show Less' : `View ${lowStockItems.length - 3} More Items`}
                <Eye className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Cash Flow */}
          <div className="rounded-xl p-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-green-500" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Cash Flow</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <CalendarIcon className="h-3 w-3" /> This Fiscal Year
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Cash as on 01/04/2026</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>₹0.00</span>
              </div>
              <div className="flex items-center justify-between py-1" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Incoming</span>
                <span className="text-sm font-medium text-green-600">₹4,65,000.00 (+)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Outgoing</span>
                <span className="text-sm font-medium" style={{ color: 'var(--danger)' }}>₹4,35,602.87 (-)</span>
              </div>
              <div className="flex items-center justify-between py-2 mt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Cash as on 31/03/2027</span>
                <span className="text-sm font-bold text-blue-500">₹29,397.13 (=)</span>
              </div>
            </div>
          </div>

          {/* Income and Expense */}
          <div className="rounded-xl p-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Income and Expense</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <CalendarIcon className="h-3 w-3" /> This Fiscal Year
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'var(--hover-bg)' }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Income</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text)' }}>₹0.00</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--hover-bg)' }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Expenses</p>
                <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--danger)' }}>₹89,357.11</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md" style={{ background: 'var(--primary)' }}>Accrual</button>
              <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors" style={{ background: 'var(--hover-bg)', color: 'var(--text-secondary)' }}>Cash</button>
            </div>
          </div>

          {/* Recent Purchase Orders */}
          <div className="rounded-xl p-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Recent Purchase Orders</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)' }}>
                View All <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              {recentPurchaseOrders.map((po) => (
                <div
                  key={po.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--hover-bg)', border: '1px solid var(--border)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{po.id}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{po.vendor}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{po.date}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>₹{po.amount.toLocaleString()}</p>
                    <div className="mt-1">{getStatusBadge(po.status)}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              <Plus className="h-4 w-4" />
              Create New Purchase Order
            </button>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-6">
          {/* Top Expenses */}
          <div className="rounded-xl p-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Top Expenses</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <CalendarIcon className="h-3 w-3" /> This Fiscal Year
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Repairs and Maintenance...', amount: '₹88,565', pct: 95, color: 'bg-red-500' },
                { label: 'Salaries and Employee Wages...', amount: '₹500', pct: 15, color: 'bg-orange-500' },
                { label: 'Office Supplies', amount: '₹290.00', pct: 5, color: 'bg-yellow-500' },
              ].map((exp, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm truncate" style={{ color: 'var(--text)' }}>{exp.label}</span>
                    <span className="text-sm font-semibold ml-2 tabular-nums" style={{ color: 'var(--text)' }}>{exp.amount}</span>
                  </div>
                  {/* Track */}
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className={`${exp.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${exp.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                *Income and expense values displayed are exclusive of taxes.
              </p>
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="rounded-xl p-6 themed-transition" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" style={{ color: 'var(--warning)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Alerts & Notifications</h3>
              </div>
              <button
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--primary)' }}
              >
                {showAllAlerts ? 'Show Less' : 'View All'}
                <Eye className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-3">
              {data.alerts.slice(0, showAllAlerts ? undefined : 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                  style={{ background: 'var(--hover-bg)', border: '1px solid var(--border)' }}
                >
                  {/* Alert type icon */}
                  {alert.type === 'error'   && <XCircle     className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)'  }} />}
                  {alert.type === 'warning' && <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />}
                  {alert.type === 'info'    && <Info        className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--info)'    }} />}
                  {alert.type === 'success' && <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{alert.message}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{alert.date}</span>
                    </div>
                  </div>

                  {!alert.read && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                    >
                      New
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;