// src/pages/accountant/ChartOfAccounts/ChartOfAccounts.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  File,
  Upload,
  Trash,
  BookOpen,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useChartOfAccounts } from '../../../hooks/ChartOfAccounts/useChartOfAccounts';
import type { ChartOfAccount } from '../../../types/ChartOfAccounts/ChartOfAccountsType';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { TableColumn } from '../../../components/common/ReusableTable';
import { 
  ACCOUNT_TYPES, 
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_BADGE_COLORS,
} from '../../../types/ChartOfAccounts/ChartOfAccountsType';

// Type Badge
const TypeBadge: React.FC<{ type: ChartOfAccount['type'] }> = ({ type }) => {
  const color = ACCOUNT_TYPE_BADGE_COLORS[type] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {ACCOUNT_TYPE_LABELS[type] || type}
    </span>
  );
};

// Status Badge
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <CheckCircle className="h-3 w-3" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <XCircle className="h-3 w-3" />
      Inactive
    </span>
  );
};

// System Badge
const SystemBadge: React.FC<{ isSystemAccount: boolean }> = ({ isSystemAccount }) => {
  return isSystemAccount ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      System
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
      Custom
    </span>
  );
};

const ChartOfAccounts: React.FC = () => {
  const navigate = useNavigate();
  const {
    accounts,
    loading,
    error,
    filters,
    pagination,
    stats,
    deleteAccount,
    updateFilters,
    changePage,
    fetchAccounts,
  } = useChartOfAccounts({ page: 1, limit: 10 });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<ChartOfAccount | null>(null);

  const handleView = (account: ChartOfAccount) => {
    navigate(`/accountant/chart-of-accounts/${account.id}`);
  };

  const handleEdit = (account: ChartOfAccount) => {
    navigate(`/accountant/chart-of-accounts/${account.id}/edit`);
  };

  const handleDeleteClick = (account: ChartOfAccount) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id);
        setShowDeleteModal(false);
        setAccountToDelete(null);
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const handleBulkDeleteAction = async () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Delete ${selectedItems.length} accounts?`)) {
      setBulkDeleteLoading(true);
      try {
        for (const id of selectedItems) {
          await deleteAccount(id);
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
      console.log(`Exporting chart of accounts as ${format}`);
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
        await fetchAccounts();
      } finally {
        setImportLoading(false);
      }
    }
  };

  const handleRefreshClick = async () => {
    setRefreshLoading(true);
    try {
      await fetchAccounts();
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === accounts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(accounts.map(item => String(item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Columns - NO actions column
  const columns: TableColumn<ChartOfAccount>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (item) => (
        <span className="text-sm font-medium text-gray-900">{item.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Account Name',
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">{item.category}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => <TypeBadge type={item.type} />,
    },
    {
      key: 'subCategory',
      header: 'Sub Category',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.subCategory || '-'}</span>
      ),
    },
    {
      key: 'system',
      header: 'Type',
      render: (item) => <SystemBadge isSystemAccount={item.isSystemAccount} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge isActive={item.isActive} />,
    },
  ];

  // Dropdown items for header
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
  if (loading && accounts.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading chart of accounts..." />
      </div>
    );
  }

  // Show refresh loading spinner
  if (refreshLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Refreshing accounts..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-500" />
            Chart of Accounts
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your chart of accounts</p>
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
            onClick={() => navigate('/accountant/chart-of-accounts/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Account
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
            importLabel="Import Accounts"
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
                placeholder="Search by code, name, category..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilters({ type: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Types</option>
              {ACCOUNT_TYPES.map(type => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.isActive !== undefined ? String(filters.isActive) : ''}
              onChange={(e) => {
                const value = e.target.value;
                updateFilters({ isActive: value === '' ? undefined : value === 'true' });
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
        data={accounts}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No accounts found"
        emptyIcon={<BookOpen className="h-12 w-12 text-gray-300" />}
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
      {showDeleteModal && accountToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete account "<span className="font-medium">{accountToDelete.name}</span>"? 
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

export default ChartOfAccounts;