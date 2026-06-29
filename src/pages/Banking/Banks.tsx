// src/pages/banking/Banks/Banks.tsx

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
  Building2,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  Banknote,
  Users,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useBank } from '../../hooks/Bank/useBank';
import type { Bank } from '../../types/Bank/BankTypes';
import ThreeDotDropdown from '../../components/common/ThreeDotDropdown';
import ReusableTable from '../../components/common/ReusableTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { TableColumn } from '../../components/common/ReusableTable';
import { 
  BANK_STATUSES, 
  BANK_STATUS_LABELS,
  BANK_ACCOUNT_TYPES,
  BANK_ACCOUNT_TYPE_LABELS
} from '../../types/Bank/BankTypes';

// Status Badge
const StatusBadge: React.FC<{ status: Bank['status'] }> = ({ status }) => {
  const config = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Inactive' },
    suspended: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Suspended' },
  };
  const defaultConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = config[status] || defaultConfig;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

// Account Type Badge
const AccountTypeBadge: React.FC<{ accountType: Bank['accountType'] }> = ({ accountType }) => {
  const colors = {
    savings: 'bg-blue-100 text-blue-700',
    current: 'bg-purple-100 text-purple-700',
    fixed_deposit: 'bg-amber-100 text-amber-700',
    recurring_deposit: 'bg-green-100 text-green-700',
    salary: 'bg-pink-100 text-pink-700'
  };
  const color = colors[accountType] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {BANK_ACCOUNT_TYPE_LABELS[accountType] || accountType}
    </span>
  );
};

// Bank Stats Component
const BankStats: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalBanks}</p>
            <p className="text-sm text-gray-500">Total Banks</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCount}</p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalBalance.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Total Balance</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.savingsCount + stats.currentCount + stats.fixedDepositCount}
            </p>
            <p className="text-sm text-gray-500">Active Accounts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Banks: React.FC = () => {
  const navigate = useNavigate();
  const {
    banks,
    loading,
    error,
    filters,
    pagination,
    stats,
    deleteBank,
    updateFilters,
    changePage,
    fetchBanks,
  } = useBank({ page: 1, limit: 10 });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);

  const handleView = (bank: Bank) => {
    navigate(`/banking/banks/${bank.id}`);
  };

  const handleEdit = (bank: Bank) => {
    navigate(`/banking/banks/${bank.id}/edit`);
  };

  const handleDeleteClick = (bank: Bank) => {
    setBankToDelete(bank);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (bankToDelete) {
      try {
        await deleteBank(bankToDelete.id);
        setShowDeleteModal(false);
        setBankToDelete(null);
      } catch (error) {
        console.error('Error deleting bank:', error);
      }
    }
  };

  const handleBulkDeleteAction = async () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Delete ${selectedItems.length} banks?`)) {
      setBulkDeleteLoading(true);
      try {
        for (const id of selectedItems) {
          await deleteBank(id);
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
      console.log(`Exporting banks as ${format}`);
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
        await fetchBanks();
      } finally {
        setImportLoading(false);
      }
    }
  };

  const handleRefreshClick = async () => {
    setRefreshLoading(true);
    try {
      await fetchBanks();
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === banks.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(banks.map(item => String(item.id)));
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

  // Columns
  const columns: TableColumn<Bank>[] = [
    {
      key: 'bankName',
      header: 'Bank',
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
            <Building2 className="h-3 w-3 text-gray-400" />
            {item.bankName}
          </p>
          <p className="text-xs text-gray-500">{item.branchName}</p>
        </div>
      ),
    },
    {
      key: 'accountName',
      header: 'Account',
      render: (item) => (
        <div>
          <p className="text-sm text-gray-900">{item.accountName}</p>
          <p className="text-xs text-gray-500">XXXX{item.accountNumber.slice(-4)}</p>
        </div>
      ),
    },
    {
      key: 'accountType',
      header: 'Type',
      render: (item) => <AccountTypeBadge accountType={item.accountType} />,
    },
    {
      key: 'ifscCode',
      header: 'IFSC',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.ifscCode}</span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (item) => (
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(item.currentBalance)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
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
  if (loading && banks.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading banks..." />
      </div>
    );
  }

  // Show refresh loading spinner
  if (refreshLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Refreshing banks..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banks</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your bank accounts</p>
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
            onClick={() => navigate('/banking/banks/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Bank
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
            importLabel="Import Banks"
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

      {/* Stats Cards */}
      <BankStats stats={stats} />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by bank name, account, IFSC..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Status</option>
              {BANK_STATUSES.map(status => (
                <option key={status} value={status}>
                  {BANK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.accountType || ''}
              onChange={(e) => updateFilters({ accountType: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Types</option>
              {BANK_ACCOUNT_TYPES.map(type => (
                <option key={type} value={type}>
                  {BANK_ACCOUNT_TYPE_LABELS[type]}
                </option>
              ))}
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

      {/* Table */}
      <ReusableTable
        data={banks}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No banks found"
        emptyIcon={<Banknote className="h-12 w-12 text-gray-300" />}
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
      {showDeleteModal && bankToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Bank</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete bank "<span className="font-medium">{bankToDelete.bankName}</span>"? 
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

export default Banks;