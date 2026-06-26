// src/pages/purchases/Expenses/Expenses.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  File,
  Upload,
  Trash,
} from 'lucide-react';
import { useExpense } from '../../../hooks/Expense/useExpense';
import type { Expense } from '../../../types/Expense/ExpenseType';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { TableColumn } from '../../../components/common/ReusableTable';
import { EXPENSE_CATEGORIES } from '../../../types/Expense/ExpenseType';

// Status Badge
const StatusBadge: React.FC<{ status: Expense['paymentStatus'] }> = ({ status }) => {
  const config = {
    paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
    unpaid: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Unpaid' },
    partial: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Partial' },
    overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Overdue' },
  };
  const defaultConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = config[status as keyof typeof config] || defaultConfig;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const {
    expenses,
    loading,
    error,
    filters,
    pagination,
    deleteExpense,
    updateFilters,
    changePage,
    fetchExpenses,
  } = useExpense({ page: 1, limit: 10 });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const handleView = (expense: Expense) => {
    navigate(`/purchases/expenses/${expense.id}`);
  };

  const handleEdit = (expense: Expense) => {
    navigate(`/purchases/expenses/${expense.id}/edit`);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense(expenseToDelete.id);
        setShowDeleteModal(false);
        setExpenseToDelete(null);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleBulkDeleteAction = async () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Delete ${selectedItems.length} expenses?`)) {
      setBulkDeleteLoading(true);
      try {
        for (const id of selectedItems) {
          await deleteExpense(id);
        }
        setSelectedItems([]);
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  const handleExportAction = async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Exporting expenses as ${format}`);
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportAction = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Importing files:', files);
        await fetchExpenses();
      } finally {
        setImportLoading(false);
      }
    }
  };

  const handleRefreshClick = async () => {
    setRefreshLoading(true);
    try {
      await fetchExpenses();
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === expenses.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(expenses.map(item => String(item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Format currency in Rupees
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  // Columns - NO actions column
  const columns: TableColumn<Expense>[] = [
    {
      key: 'expenseNumber',
      header: 'Expense #',
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{item.expenseNumber}</p>
          <p className="text-xs text-gray-500">{item.receiptNumber || 'No receipt'}</p>
        </div>
      ),
    },
    {
      key: 'vendorName',
      header: 'Vendor',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.vendorName || 'N/A'}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.category}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => (
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(item.totalAmount)}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <div>
          <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
          {item.dueDate && (
            <span className="text-xs text-gray-400 block">Due: {new Date(item.dueDate).toLocaleDateString()}</span>
          )}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (item) => {
        const methods: Record<string, string> = {
          cash: 'Cash',
          bank: 'Bank',
          credit_card: 'Card',
          cheque: 'Cheque'
        };
        return (
          <span className="text-sm text-gray-600">{methods[item.paymentMethod] || item.paymentMethod}</span>
        );
      },
    },
    {
      key: 'paymentStatus',
      header: 'Status',
      render: (item) => <StatusBadge status={item.paymentStatus} />,
    },
  ];

  // Dropdown items for header ThreeDotDropdown
  const headerDropdownItems = [
    {
      label: 'Export as PDF',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <File className="h-4 w-4 text-red-500" />
      ),
      onClick: () => handleExportAction('pdf'),
      disabled: exportLoading,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-green-500" />
      ),
      onClick: () => handleExportAction('excel'),
      disabled: exportLoading,
    },
  ];

  // Show main loading spinner
  if (loading && expenses.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading expenses..." />
      </div>
    );
  }

  // Show refresh loading spinner
  if (refreshLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Refreshing expenses..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your business expenses</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefreshClick}
            disabled={refreshLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/purchases/expenses/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Expense
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteAction}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkDeleteLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              Delete ({selectedItems.length})
            </button>
          )}
          <ThreeDotDropdown
            items={headerDropdownItems}
            position="right"
            onImport={handleImportAction}
            importLabel="Import Expenses"
            importIcon={
              importLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Upload className="h-4 w-4 text-blue-500" />
              )
            }
            importAccept=".csv,.xlsx,.xls"
            importMultiple={true}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by expense #, vendor, category..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.category || ''}
              onChange={(e) => updateFilters({ category: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.paymentStatus || ''}
              onChange={(e) => updateFilters({ paymentStatus: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Table - NO actions column */}
      <ReusableTable
        data={expenses}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No expenses found"
        emptyIcon={<DollarSign className="h-12 w-12 text-gray-300" />}
        onRowClick={(item) => handleView(item)}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          totalItems: pagination.total,
          startIndex: (pagination.page - 1) * pagination.limit,
          endIndex: pagination.page * pagination.limit,
          onPageChange: changePage,
          itemsPerPage: pagination.limit,
        }}
      />

      {/* Delete Modal */}
      {showDeleteModal && expenseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Expense</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete expense "<span className="font-medium">{expenseToDelete.expenseNumber}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;