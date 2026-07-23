// src/pages/accountant/ChartOfAccounts/ChartOfAccounts.tsx
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
  BookOpen,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useChartOfAccounts } from '../../../hooks/ChartOfAccounts/useChartOfAccounts';
import type { ChartOfAccount } from '../../../types/ChartOfAccounts/ChartOfAccountsType';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { TableColumn } from '../../../components/common/ReusableTable';
import { 
  ACCOUNT_TYPES, 
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_BADGE_COLORS,
} from '../../../types/ChartOfAccounts/ChartOfAccountsType';

// ============================================================
// CONFIGURATIONS - Single source of truth
// ============================================================

// Account Type Configuration
const ACCOUNT_TYPE_CONFIG: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  asset: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    label: 'Asset',
  },
  liability: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    label: 'Liability',
  },
  equity: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    label: 'Equity',
  },
  revenue: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    label: 'Revenue',
  },
  expense: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    label: 'Expense',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const config = isActive 
    ? { bg: 'var(--success-light)', color: 'var(--success)', icon: <CheckCircle className="h-3 w-3" />, label: 'Active' }
    : { bg: 'var(--error-light)', color: 'var(--error)', icon: <XCircle className="h-3 w-3" />, label: 'Inactive' };
  
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: config.bg,
        color: config.color,
      }}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// Type Badge Component
const TypeBadge: React.FC<{ type: ChartOfAccount['type'] }> = ({ type }) => {
  const config = ACCOUNT_TYPE_CONFIG[type] || ACCOUNT_TYPE_CONFIG.asset;
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

// System Badge Component
const SystemBadge: React.FC<{ isSystemAccount: boolean }> = ({ isSystemAccount }) => {
  const config = isSystemAccount
    ? { bg: 'var(--info-light)', color: 'var(--info)', label: 'System' }
    : { bg: 'var(--primary-light)', color: 'var(--primary)', label: 'Custom' };
  
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: config.bg,
        color: config.color,
      }}
    >
      {config.label}
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

  const handleView = useCallback((account: ChartOfAccount) => {
    navigate(`/accountant/chart-of-accounts/${account.id}`);
  }, [navigate]);

  // Single delete handler using confirmation modal
  const handleDeleteClick = useCallback(async (account: ChartOfAccount) => {
    const accountId = String(account.id);

    await withConfirmation(
      {
        title: 'Delete Account',
        message: `Are you sure you want to delete "${account.code} - ${account.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(accountId);
        try {
          await deleteAccount(account.id);
          setSelectedItems(prev => prev.filter(item => item !== accountId));
          success(`Account "${account.code} - ${account.name}" deleted successfully.`);
        } catch (error) {
          console.error('Error deleting account:', error);
          showError('Failed to delete account. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deleteAccount, success, showError]);

  // Bulk delete handler using confirmation modal
  const handleBulkDeleteAction = useCallback(async () => {
    if (selectedItems.length === 0) {
      showError('Please select at least one account to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Accounts',
        message: `Are you sure you want to delete ${selectedItems.length} account(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          for (const id of selectedItems) {
            await deleteAccount(id);
          }
          success(`${selectedItems.length} account(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (error) {
          console.error('Error deleting accounts:', error);
          showError('Failed to delete accounts. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteAccount, success, showError]);

  const handleExportAction = useCallback(async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Chart of accounts exported as ${format.toUpperCase()} successfully.`);
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
        await fetchAccounts();
        success('Accounts imported successfully.');
      } catch (error) {
        showError('Failed to import accounts. Please check the file format.');
      } finally {
        setImportLoading(false);
        event.target.value = '';
      }
    }
  }, [fetchAccounts, success, showError]);

  const handleRefreshClick = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchAccounts();
      success('Chart of accounts refreshed successfully.');
    } catch (error) {
      showError('Failed to refresh chart of accounts. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchAccounts, success, showError]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === accounts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(accounts.map(item => String(item.id)));
    }
  }, [selectedItems.length, accounts]);

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

  // Row dropdown items
  const getRowDropdownItems = (account: ChartOfAccount) => [
    {
      label: 'View Details',
      icon: <BookOpen className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: () => handleView(account),
    },
    {
      label: deleteLoading === String(account.id) ? 'Deleting...' : 'Delete',
      icon: deleteLoading === String(account.id) ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: () => handleDeleteClick(account),
      danger: true,
      disabled: deleteLoading === String(account.id),
    },
  ];

  // Columns
  const columns: TableColumn<ChartOfAccount>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (item) => (
        <span
          className="text-sm font-medium themed-transition"
          style={{ color: 'var(--foreground)' }}
        >
          {item.code}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Account Name',
      render: (item) => (
        <div>
          <p
            className="text-sm font-medium themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            {item.name}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {item.category}
          </p>
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
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.subCategory || '-'}
        </span>
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
  if (loading && accounts.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading chart of accounts..." />
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
            className="text-2xl font-bold flex items-center gap-2 themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            <BookOpen className="h-6 w-6" style={{ color: 'var(--gold)' }} />
            Chart of Accounts
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Manage your chart of accounts
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

          {/* New Account Button */}
          <button
            onClick={() => navigate('/accountant/chart-of-accounts/create')}
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
            New Account
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
            importLabel="Import Accounts"
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
                placeholder="Search by code, name, category..."
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

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilters({ type: e.target.value || undefined })}
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
              {ACCOUNT_TYPES.map(type => (
                <option key={type} value={type}>
                  {ACCOUNT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <select
              value={filters.isActive !== undefined ? String(filters.isActive) : ''}
              onChange={(e) => {
                const value = e.target.value;
                updateFilters({ isActive: value === '' ? undefined : value === 'true' });
              }}
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
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
        data={accounts}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No accounts found"
        emptyIcon={<BookOpen className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
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

export default ChartOfAccounts;