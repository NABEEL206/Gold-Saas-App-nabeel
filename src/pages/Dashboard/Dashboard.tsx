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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <LoadingSpinner size="lg" text="Loading Dashboard..." />
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
            <button
              onClick={refreshData}
              className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your business performance</p>
        </div>
        <button
          onClick={refreshData}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Gold Rate Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Gold Rate</h2>
            <p className="text-xs text-gray-500">Updated on: {new Date().toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {['1W', '1M', '1Y'].map((period) => (
              <button
                key={period}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  goldRateTimeframe === period
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setGoldRateTimeframe(period as '1W' | '1M' | '1Y')}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.goldRates.map((rate) => (
            <div key={rate.karat} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">{rate.karat} Gold / GRAM</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₹{rate.rate.toFixed(0)}</p>
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

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
          <span className="text-xs text-gray-400 ml-2">Create new entries quickly</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group text-sm"
              onClick={() => console.log(`Navigate to ${action.path}`)}
            >
              <div className={`${action.color} p-1.5 rounded-lg text-white`}>
                {action.icon}
              </div>
              <span className="text-gray-700 group-hover:text-gray-900">{action.name}</span>
              <Plus className="h-3 w-3 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          {/* Total Receivables */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">Total Receivables</h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">New</span>
            </div>
            <div className="mb-3">
              <p className="text-2xl font-bold text-gray-900">₹0.00</p>
              <p className="text-xs text-gray-500">Total Unpaid Invoices</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Current</p>
                <p className="text-sm font-medium text-gray-900">₹0.00</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Overdue</p>
                <p className="text-sm font-medium text-red-600">₹0.00</p>
              </div>
            </div>
          </div>

          {/* Total Payables */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-orange-500" />
                <h3 className="text-sm font-semibold text-gray-900">Total Payables</h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">New</span>
            </div>
            <div className="mb-3">
              <p className="text-2xl font-bold text-gray-900">₹0.00</p>
              <p className="text-xs text-gray-500">Total Unpaid Bills</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Current</p>
                <p className="text-sm font-medium text-gray-900">₹0.00</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Overdue</p>
                <p className="text-sm font-medium text-red-600">₹0.00</p>
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-semibold text-gray-900">Low Stock Items</h3>
              </div>
              {criticalItems.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                  {criticalItems.length} Critical
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {lowStockItems.slice(0, showLowStock ? undefined : 3).map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
                        {getLowStockBadge(item.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.sku}</p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-sm font-semibold text-gray-900">{item.currentStock}</span>
                      <span className="text-xs text-gray-500">/{item.minStock} {item.unit}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`${getProgressColor(item.status)} h-1.5 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min((item.currentStock / item.minStock) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {lowStockItems.length > 3 && (
              <button
                onClick={() => setShowLowStock(!showLowStock)}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 mt-3 font-medium"
              >
                {showLowStock ? 'Show Less' : `View ${lowStockItems.length - 3} More Items`}
                <Eye className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
          {/* Cash Flow */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-green-500" />
                <h3 className="text-sm font-semibold text-gray-900">Cash Flow</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                <CalendarIcon className="h-3 w-3" />
                This Fiscal Year
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-500">Cash as on 01/04/2026</span>
                <span className="text-sm font-medium text-gray-900">₹0.00</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-gray-100">
                <span className="text-xs text-gray-500">Incoming</span>
                <span className="text-sm font-medium text-green-600">₹4,65,000.00 (+)</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-500">Outgoing</span>
                <span className="text-sm font-medium text-red-600">₹4,35,602.87 (-)</span>
              </div>
              <div className="flex items-center justify-between py-2 mt-1 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Cash as on 31/03/2027</span>
                <span className="text-sm font-bold text-blue-600">₹29,397.13 (=)</span>
              </div>
            </div>
          </div>

          {/* Income and Expense */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-900">Income and Expense</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                <CalendarIcon className="h-3 w-3" />
                This Fiscal Year
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total Income</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">₹0.00</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Total Expenses</p>
                <p className="text-xl font-bold text-red-600 mt-0.5">₹89,357.11</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
              <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-md">
                Accrual
              </button>
              <button className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
                Cash
              </button>
            </div>
          </div>

          {/* Recent Purchase Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-semibold text-gray-900">Recent Purchase Orders</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                View All
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recentPurchaseOrders.map((po) => (
                <div key={po.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{po.id}</p>
                    <p className="text-xs text-gray-500 truncate">{po.vendor}</p>
                    <p className="text-xs text-gray-400">{po.date}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-gray-900">₹{po.amount.toLocaleString()}</p>
                    <div className="mt-1">{getStatusBadge(po.status)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium">
              <Plus className="h-4 w-4" />
              Create New Purchase Order
            </button>
          </div>
        </div>

        {/* Column 3 */}
        <div className="space-y-6">
          {/* Top Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-red-500" />
                <h3 className="text-sm font-semibold text-gray-900">Top Expenses</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                <CalendarIcon className="h-3 w-3" />
                This Fiscal Year
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 truncate">Repairs and Maintenance...</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">₹88,565</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 truncate">Salaries and Employee Wages...</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">₹500</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">Office Supplies</span>
                  <span className="text-sm font-medium text-gray-900 ml-2">₹290.00</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">*income and expense values displayed are exclusive of taxes.</p>
            </div>
          </div>

          {/* Alerts & Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900">Alerts & Notifications</h3>
              </div>
              <button
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
              >
                {showAllAlerts ? 'Show Less' : 'View All'}
                <Eye className="h-3 w-3" />
              </button>
            </div>
            
            <div className="space-y-3">
              {data.alerts.slice(0, showAllAlerts ? undefined : 3).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
                >
                  {alert.type === 'error' && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                  {alert.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />}
                  {alert.type === 'info' && <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />}
                  {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{alert.date}</span>
                    </div>
                  </div>
                  
                  {!alert.read && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex-shrink-0">
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