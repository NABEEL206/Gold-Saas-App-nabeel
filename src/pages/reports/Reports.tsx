// src/pages/Reports/Reports.tsx

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Building2,
  Receipt,
  Banknote,
  FileText,
  Briefcase,
  Wrench,
  Gem,
  Sparkles,
  Factory,
  Home,
  FolderOpen,
} from 'lucide-react';
import SidebarNav from '../../components/Reports/SidebarNav';
import ReportTable from '../../components/Reports/ReportTable';
import ReportHeader from '../../components/Reports/ReportHeader';
import { useReports } from '../../hooks/Reports/useReports';
import type { ReportItem, ReportCategory as ReportCategoryType } from '../../types/Reports/ReportType';

// ─── Static Report Data ────────────────────────────────────────────
const DEFAULT_REPORT_DATA: ReportItem[] = [
  // Sales Reports
  {
    id: 'sales-summary',
    title: 'Sales Summary',
    category: 'Sales',
    createdBy: 'System Generated',
    lastVisited: '25/06/2026 02:30 PM',
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'blue',
    popular: true,
  },
  {
    id: 'sales-by-product',
    title: 'Sales by Product',
    category: 'Sales',
    createdBy: 'System Generated',
    lastVisited: '24/06/2026 11:15 AM',
    icon: <Package className="h-5 w-5" />,
    color: 'teal',
    popular: false,
  },
  {
    id: 'sales-by-customer',
    title: 'Sales by Customer',
    category: 'Sales',
    createdBy: 'System Generated',
    lastVisited: '23/06/2026 09:45 AM',
    icon: <Users className="h-5 w-5" />,
    color: 'cyan',
    popular: false,
  },

  // Inventory Reports
  {
    id: 'inventory-summary',
    title: 'Inventory Summary',
    category: 'Inventory',
    createdBy: 'System Generated',
    lastVisited: '22/06/2026 04:20 PM',
    icon: <Package className="h-5 w-5" />,
    color: 'green',
    popular: true,
  },
  {
    id: 'inventory-valuation',
    title: 'Inventory Valuation',
    category: 'Inventory Valuation',
    createdBy: 'System Generated',
    lastVisited: '21/06/2026 03:10 PM',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'amber',
    popular: false,
  },
  {
    id: 'stock-movement',
    title: 'Stock Movement',
    category: 'Inventory',
    createdBy: 'System Generated',
    lastVisited: '20/06/2026 02:00 PM',
    icon: <FileText className="h-5 w-5" />,
    color: 'purple',
    popular: false,
  },

  // Receivables
  {
    id: 'receivables-aging',
    title: 'Receivables Aging Report',
    category: 'Receivables',
    createdBy: 'System Generated',
    lastVisited: '19/06/2026 01:30 PM',
    icon: <Receipt className="h-5 w-5" />,
    color: 'indigo',
    popular: true,
  },
  {
    id: 'customer-payments',
    title: 'Customer Payments Received',
    category: 'Payments Received',
    createdBy: 'System Generated',
    lastVisited: '18/06/2026 12:45 PM',
    icon: <Banknote className="h-5 w-5" />,
    color: 'green',
    popular: false,
  },

  // Payables
  {
    id: 'payables-aging',
    title: 'Payables Aging Report',
    category: 'Payables',
    createdBy: 'System Generated',
    lastVisited: '17/06/2026 11:30 AM',
    icon: <Building2 className="h-5 w-5" />,
    color: 'red',
    popular: true,
  },
  {
    id: 'vendor-payments',
    title: 'Vendor Payments',
    category: 'Payables',
    createdBy: 'System Generated',
    lastVisited: '16/06/2026 10:15 AM',
    icon: <Banknote className="h-5 w-5" />,
    color: 'rose',
    popular: false,
  },

  // Purchases and Expenses
  {
    id: 'purchase-summary',
    title: 'Purchase Summary',
    category: 'Purchases and Expenses',
    createdBy: 'System Generated',
    lastVisited: '15/06/2026 09:00 AM',
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'orange',
    popular: true,
  },
  {
    id: 'expense-report',
    title: 'Expense Report',
    category: 'Purchases and Expenses',
    createdBy: 'System Generated',
    lastVisited: '14/06/2026 08:30 AM',
    icon: <Receipt className="h-5 w-5" />,
    color: 'amber',
    popular: false,
  },

  // Taxes
  {
    id: 'gst-summary',
    title: 'GST Summary',
    category: 'Taxes',
    createdBy: 'System Generated',
    lastVisited: '13/06/2026 07:45 PM',
    icon: <FileText className="h-5 w-5" />,
    color: 'orange',
    popular: true,
  },
  {
    id: 'tds-report',
    title: 'TDS Report',
    category: 'Taxes',
    createdBy: 'System Generated',
    lastVisited: '12/06/2026 07:00 PM',
    icon: <FileText className="h-5 w-5" />,
    color: 'red',
    popular: false,
  },

  // Banking
  {
    id: 'bank-reconciliation',
    title: 'Bank Reconciliation',
    category: 'Banking',
    createdBy: 'System Generated',
    lastVisited: '11/06/2026 06:30 PM',
    icon: <Banknote className="h-5 w-5" />,
    color: 'blue',
    popular: true,
  },
  {
    id: 'bank-transactions',
    title: 'Bank Transactions',
    category: 'Banking',
    createdBy: 'System Generated',
    lastVisited: '10/06/2026 06:00 PM',
    icon: <Banknote className="h-5 w-5" />,
    color: 'teal',
    popular: false,
  },

  // Accountant
  {
    id: 'trial-balance',
    title: 'Trial Balance',
    category: 'Accountant',
    createdBy: 'System Generated',
    lastVisited: '07/06/2026 04:30 PM',
    icon: <FileText className="h-5 w-5" />,
    color: 'blue',
    popular: true,
  },
  {
    id: 'profit-loss',
    title: 'Profit and Loss',
    category: 'Accountant',
    createdBy: 'System Generated',
    lastVisited: '06/06/2026 04:00 PM',
    icon: <FileText className="h-5 w-5" />,
    color: 'green',
    popular: true,
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet',
    category: 'Accountant',
    createdBy: 'System Generated',
    lastVisited: '05/06/2026 03:30 PM',
    icon: <FileText className="h-5 w-5" />,
    color: 'blue',
    popular: true,
  },

  // Gold Inventory
  {
    id: 'gold-inventory-summary',
    title: 'Gold Inventory Summary',
    category: 'Gold Inventory',
    createdBy: 'System Generated',
    lastVisited: '04/06/2026 03:00 PM',
    icon: <Gem className="h-5 w-5" />,
    color: 'amber',
    popular: false,
  },
  {
    id: 'gold-valuation',
    title: 'Gold Valuation Report',
    category: 'Gold Inventory',
    createdBy: 'System Generated',
    lastVisited: '03/06/2026 02:30 PM',
    icon: <DollarSign className="h-5 w-5" />,
    color: 'amber',
    popular: false,
  },

  // Jewellery
  {
    id: 'jewellery-inventory',
    title: 'Jewellery Inventory',
    category: 'Jewellery',
    createdBy: 'System Generated',
    lastVisited: '01/06/2026 01:30 PM',
    icon: <Gem className="h-5 w-5" />,
    color: 'pink',
    popular: true,
  },
  {
    id: 'jewellery-sales',
    title: 'Jewellery Sales Analysis',
    category: 'Jewellery',
    createdBy: 'System Generated',
    lastVisited: '31/05/2026 01:00 PM',
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'rose',
    popular: false,
  },

  // Manufacturing
  {
    id: 'manufacturing-summary',
    title: 'Manufacturing Summary',
    category: 'Manufacturing',
    createdBy: 'System Generated',
    lastVisited: '30/05/2026 12:30 PM',
    icon: <Factory className="h-5 w-5" />,
    color: 'indigo',
    popular: true,
  },
  {
    id: 'production-report',
    title: 'Production Report',
    category: 'Manufacturing',
    createdBy: 'System Generated',
    lastVisited: '29/05/2026 12:00 PM',
    icon: <Factory className="h-5 w-5" />,
    color: 'blue',
    popular: false,
  },

  // Repairs
  {
    id: 'repairs-summary',
    title: 'Repairs Summary',
    category: 'Repairs',
    createdBy: 'System Generated',
    lastVisited: '27/05/2026 11:00 AM',
    icon: <Wrench className="h-5 w-5" />,
    color: 'orange',
    popular: true,
  },
  {
    id: 'repairs-log',
    title: 'Repairs Log',
    category: 'Repairs',
    createdBy: 'System Generated',
    lastVisited: '26/05/2026 10:30 AM',
    icon: <Wrench className="h-5 w-5" />,
    color: 'amber',
    popular: false,
  },
];

const SIDEBAR_ITEMS = [
  { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { id: 'sales', label: 'Sales', icon: <ShoppingCart className="h-4 w-4" /> },
  { id: 'gold-inventory', label: 'Gold Inventory', icon: <Gem className="h-4 w-4" /> },
  { id: 'inventory-valuation', label: 'Inventory Valuation', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'receivables', label: 'Receivables', icon: <Receipt className="h-4 w-4" /> },
  { id: 'payments-received', label: 'Payments Received', icon: <Banknote className="h-4 w-4" /> },
  { id: 'payables', label: 'Payables', icon: <Building2 className="h-4 w-4" /> },
  { id: 'purchases-expenses', label: 'Purchases and Expenses', icon: <ShoppingCart className="h-4 w-4" /> },
  { id: 'taxes', label: 'Taxes', icon: <FileText className="h-4 w-4" /> },
  { id: 'banking', label: 'Banking', icon: <Banknote className="h-4 w-4" /> },
  { id: 'accountant', label: 'Accountant', icon: <FileText className="h-4 w-4" /> },
  { id: 'repairs', label: 'Repairs', icon: <Wrench className="h-4 w-4" /> },
];

// ─── Component ──────────────────────────────────────────────────────
const Reports: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState('home');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const {
    setReportCategories,
    setRecentReports,
  } = useReports({
    initialCategory: 'all',
    initialViewMode: 'list',
  });

  // Initialize with default data
  useEffect(() => {
    const categoryMap = new Map<string, ReportItem[]>();
    
    DEFAULT_REPORT_DATA.forEach(report => {
      if (!categoryMap.has(report.category)) {
        categoryMap.set(report.category, []);
      }
      categoryMap.get(report.category)!.push(report);
    });

    const categories: ReportCategoryType[] = Array.from(categoryMap.entries()).map(([title, reports]) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      icon: <FileText className="h-5 w-5" />,
      reports,
    }));
    
    setReportCategories(categories);
    setRecentReports([]);
  }, [setReportCategories, setRecentReports]);

  // Filter reports based on selected folder and search
  const getFilteredReports = () => {
    let reports = DEFAULT_REPORT_DATA;
    
    const folderToCategory: Record<string, string> = {
      'home': 'all',
      'sales': 'Sales',
      'inventory': 'Inventory',
      'inventory-valuation': 'Inventory Valuation',
      'receivables': 'Receivables',
      'payments-received': 'Payments Received',
      'payables': 'Payables',
      'purchases-expenses': 'Purchases and Expenses',
      'taxes': 'Taxes',
      'banking': 'Banking',
      'accountant': 'Accountant',
      'gold-inventory': 'Gold Inventory',
      'jewellery': 'Jewellery',
      'manufacturing': 'Manufacturing',
      'repairs': 'Repairs',
    };
    
    if (selectedFolder !== 'home') {
      const category = folderToCategory[selectedFolder];
      if (category && category !== 'all') {
        reports = reports.filter(r => r.category === category);
      }
    }
    
    if (searchQuery) {
      reports = reports.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return reports;
  };

  const filteredReports = getFilteredReports();

  const getFolderLabel = () => {
    const item = SIDEBAR_ITEMS.find(i => i.id === selectedFolder);
    return item ? item.label : 'All Reports';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ─── Sidebar ─── */}
      <SidebarNav
        items={SIDEBAR_ITEMS}
        selectedId={selectedFolder}
        onSelect={setSelectedFolder}
      />

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ─── Header ─── */}
        <ReportHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          folderLabel={getFolderLabel()}
        />

        {/* ─── Report Table ─── */}
        <div className="flex-1 px-6 pb-6 pt-4 overflow-hidden">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  {getFolderLabel()} <span className="text-gray-400 font-normal ml-1">({filteredReports.length})</span>
                </h2>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
                  <span>Filter</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
                  <span>Sort</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <ReportTable
                reports={filteredReports}
                selectedId={selectedReport}
                onSelect={setSelectedReport}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;