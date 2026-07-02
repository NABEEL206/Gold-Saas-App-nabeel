// src/pages/banking/Banks/Banks.tsx

import React, { useState, useCallback } from 'react';
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
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../hooks/ToastConfirmModal/useToastAndConfirm';
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

  // Use the toast and confirm hook
  const {
    success,
    error: showError,
    warning,
    withConfirmation,
    withLoading,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleView = useCallback((bank: Bank) => {
    navigate(`/banking/banks/${bank.id}`);
  }, [navigate]);


  // Single delete handler using confirmation modal
  const handleDeleteClick = useCallback(async (bank: Bank) => {
    await withConfirmation(
      {
        title: 'Delete Bank',
        message: `Are you sure you want to delete bank "${bank.bankName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        const bankId = String(bank.id);
        setDeleteLoading(bankId);
        try {
          await deleteBank(bank.id);
          setSelectedItems(prev => prev.filter(item => item !== bankId));
          success(`Bank "${bank.bankName}" deleted successfully.`);
        } catch (error) {
          console.error('Error deleting bank:', error);
          showError('Failed to delete bank. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deleteBank, success, showError]);

  // Bulk delete handler using confirmation modal
  const handleBulkDeleteAction = useCallback(async () => {
    if (selectedItems.length === 0) {
      showError('Please select at least one bank to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Banks',
        message: `Are you sure you want to delete ${selectedItems.length} bank(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          for (const id of selectedItems) {
            await deleteBank(id);
          }
          success(`${selectedItems.length} bank(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (error) {
          console.error('Error deleting banks:', error);
          showError('Failed to delete banks. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteBank, success, showError]);

  const handleExportAction = useCallback(async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Banks exported as ${format.toUpperCase()} successfully.`);
    } catch (error) {
      showError(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportLoading(false);
    }
  }, [success, showError]);

  const handleImportAction = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchBanks();
        success('Banks imported successfully.');
      } catch (error) {
        showError('Failed to import banks. Please check the file format.');
      } finally {
        setImportLoading(false);
        event.target.value = '';
      }
    }
  }, [fetchBanks, success, showError]);

  const handleRefreshClick = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchBanks();
      success('Bank list refreshed successfully.');
    } catch (error) {
      showError('Failed to refresh bank list. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchBanks, success, showError]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === banks.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(banks.map(item => String(item.id)));
    }
  }, [selectedItems.length, banks]);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  // Show error toast when error changes
  React.useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

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
            {refreshLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
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
          onPageChange: changePage,
          itemsPerPage: pagination.limit,
        }}
      />

      {/* Confirmation Modal - Replaces the custom delete modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={onModalCancel}
        onConfirm={onModalConfirm}
        title={modalOptions?.title}
        message={modalOptions?.message ?? ''}
        confirmText={modalOptions?.confirmText}
        cancelText={modalOptions?.cancelText}
        variant={modalOptions?.variant}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default Banks;