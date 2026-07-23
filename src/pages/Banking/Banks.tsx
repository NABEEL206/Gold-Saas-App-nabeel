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

// ============================================================
// STATUS CONFIGURATION - Single source of truth
// ============================================================

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  active: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Active',
  },
  inactive: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-secondary)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Inactive',
  },
  suspended: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Suspended',
  },
};

// Account Type Configuration
const ACCOUNT_TYPE_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  savings: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    label: 'Savings',
  },
  current: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    label: 'Current',
  },
  fixed_deposit: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    label: 'Fixed Deposit',
  },
  recurring_deposit: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    label: 'Recurring Deposit',
  },
  salary: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    label: 'Salary',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: Bank['status'] }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
  const { bg, color, icon, label } = config;
  
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: bg,
        color: color,
      }}
    >
      {icon}
      {label}
    </span>
  );
};

// Account Type Badge Component
const AccountTypeBadge: React.FC<{ accountType: Bank['accountType'] }> = ({ accountType }) => {
  const config = ACCOUNT_TYPE_CONFIG[accountType] || ACCOUNT_TYPE_CONFIG.savings;
  const { bg, color, label } = config;
  
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: bg,
        color: color,
      }}
    >
      {label}
    </span>
  );
};

// Bank Stats Component
const BankStats: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div
        className="rounded-xl p-4 themed-transition"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--info-light)' }}>
            <Building2 className="h-5 w-5" style={{ color: 'var(--info)' }} />
          </div>
          <div>
            <p className="text-2xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
              {stats.totalBanks}
            </p>
            <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
              Total Banks
            </p>
          </div>
        </div>
      </div>
      <div
        className="rounded-xl p-4 themed-transition"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--success-light)' }}>
            <CheckCircle className="h-5 w-5" style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <p className="text-2xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
              {stats.activeCount}
            </p>
            <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
              Active
            </p>
          </div>
        </div>
      </div>
      <div
        className="rounded-xl p-4 themed-transition"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--primary-light)' }}>
            <DollarSign className="h-5 w-5" style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <p className="text-2xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
              ₹{stats.totalBalance.toFixed(2)}
            </p>
            <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
              Total Balance
            </p>
          </div>
        </div>
      </div>
      <div
        className="rounded-xl p-4 themed-transition"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--info-light)' }}>
            <CreditCard className="h-5 w-5" style={{ color: 'var(--info)' }} />
          </div>
          <div>
            <p className="text-2xl font-bold themed-transition" style={{ color: 'var(--foreground)' }}>
              {stats.savingsCount + stats.currentCount + stats.fixedDepositCount}
            </p>
            <p className="text-sm themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
              Active Accounts
            </p>
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

  // Row dropdown items
  const getRowDropdownItems = (bank: Bank) => [
    {
      label: 'View Details',
      icon: <Building2 className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: () => handleView(bank),
    },
    {
      label: deleteLoading === String(bank.id) ? 'Deleting...' : 'Delete',
      icon: deleteLoading === String(bank.id) ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: () => handleDeleteClick(bank),
      danger: true,
      disabled: deleteLoading === String(bank.id),
    },
  ];

  // Columns
  const columns: TableColumn<Bank>[] = [
    {
      key: 'bankName',
      header: 'Bank',
      render: (item) => (
        <div>
          <p
            className="text-sm font-medium flex items-center gap-1 themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            <Building2 className="h-3 w-3" style={{ color: 'var(--foreground-tertiary)' }} />
            {item.bankName}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {item.branchName}
          </p>
        </div>
      ),
    },
    {
      key: 'accountName',
      header: 'Account',
      render: (item) => (
        <div>
          <p
            className="text-sm themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            {item.accountName}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            XXXX{item.accountNumber.slice(-4)}
          </p>
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
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.ifscCode}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (item) => (
        <span
          className="text-sm font-medium themed-transition"
          style={{ color: 'var(--gold)' }}
        >
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
        <File className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: () => handleExportAction('pdf'),
      disabled: exportLoading,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" style={{ color: 'var(--success)' }} />
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
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            Banks
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Manage your bank accounts
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh Button */}
          <button
            onClick={handleRefreshClick}
            disabled={refreshLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
            style={{
              color: 'var(--foreground-secondary)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={(e) => {
              if (!refreshLoading) {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            {refreshLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>

          {/* New Bank Button */}
          <button
            onClick={() => navigate('/banking/banks/create')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors themed-transition"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            <Plus className="h-4 w-4" />
            New Bank
          </button>

          {/* Bulk Delete Button */}
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteAction}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                color: 'var(--error)',
                background: 'var(--error-light)',
                border: '1px solid var(--error)',
              }}
              onMouseEnter={(e) => {
                if (!bulkDeleteLoading) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {bulkDeleteLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              Delete ({selectedItems.length})
            </button>
          )}

          {/* More Options Dropdown */}
          <ThreeDotDropdown
            items={headerDropdownItems}
            position="right"
            onImport={handleImportAction}
            importLabel="Import Banks"
            importIcon={
              importLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Upload className="h-4 w-4" style={{ color: 'var(--info)' }} />
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
      <div
        className="rounded-xl p-4 mb-6 themed-transition"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 themed-transition"
                style={{ color: 'var(--foreground-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Search by bank name, account, IFSC..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value || undefined })}
              className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--focus-ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="">All Status</option>
              {BANK_STATUSES.map(status => (
                <option key={status} value={status}>
                  {BANK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {/* Account Type Filter */}
          <div className="flex items-center gap-2">
            <Filter
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <select
              value={filters.accountType || ''}
              onChange={(e) => updateFilters({ accountType: e.target.value || undefined })}
              className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--focus-ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
        <div
          className="mb-4 p-4 rounded-lg themed-transition"
          style={{
            background: 'var(--error-light)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
          }}
        >
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
        emptyIcon={<Banknote className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
        onRowClick={(item) => handleView(item)}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          totalItems: pagination.total,
          onPageChange: changePage,
          itemsPerPage: pagination.limit,
        }}
      />

      {/* Confirmation Modal */}
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