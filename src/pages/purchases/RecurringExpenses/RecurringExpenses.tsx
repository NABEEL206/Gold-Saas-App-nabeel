// src/pages/purchases/RecurringExpenses/RecurringExpenses.tsx
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
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  XCircle,
  DollarSign,
  Repeat
} from 'lucide-react';
import { useRecurringExpense } from '../../../hooks/RecurringExpense/useRecurringExpense';
import type { RecurringExpense } from '../../../types/RecurringExpense/RecurringExpenseType';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { TableColumn } from '../../../components/common/ReusableTable';
import { RECURRING_CATEGORIES, RECURRING_STATUSES, FREQUENCY_LABELS } from '../../../types/RecurringExpense/RecurringExpenseType';

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
  paused: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Pause className="h-3 w-3" />,
    label: 'Paused',
  },
  cancelled: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Cancelled',
  },
  completed: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Completed',
  },
};

// Frequency configuration
const FREQUENCY_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  daily: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Daily',
  },
  weekly: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Weekly',
  },
  monthly: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Monthly',
  },
  quarterly: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Quarterly',
  },
  half_yearly: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Half Yearly',
  },
  yearly: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Yearly',
  },
  custom: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-secondary)',
    icon: <Repeat className="h-3 w-3" />,
    label: 'Custom',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: RecurringExpense['paymentStatus'] }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
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

// Frequency Badge Component
const FrequencyBadge: React.FC<{ frequency: RecurringExpense['frequency'] }> = ({ frequency }) => {
  const config = FREQUENCY_CONFIG[frequency] || FREQUENCY_CONFIG.custom;
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

const RecurringExpenses: React.FC = () => {
  const navigate = useNavigate();
  const {
    expenses,
    loading,
    error,
    filters,
    pagination,
    stats,
    deleteExpense,
    updateFilters,
    changePage,
    fetchExpenses,
  } = useRecurringExpense({ page: 1, limit: 10 });

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

  const handleView = useCallback((expense: RecurringExpense) => {
    navigate(`/purchases/recurring-expenses/${expense.id}`);
  }, [navigate]);

  // Single delete handler using confirmation modal
  const handleDeleteClick = useCallback(async (expense: RecurringExpense) => {
    const expenseId = String(expense.id);

    await withConfirmation(
      {
        title: 'Delete Recurring Expense',
        message: `Are you sure you want to delete "${expense.recurringNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(expenseId);
        try {
          await deleteExpense(expense.id);
          setSelectedItems(prev => prev.filter(item => item !== expenseId));
          success(`Recurring expense "${expense.recurringNumber}" deleted successfully.`);
        } catch (error) {
          console.error('Error deleting recurring expense:', error);
          showError('Failed to delete recurring expense. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deleteExpense, success, showError]);

  // Bulk delete handler using confirmation modal
  const handleBulkDeleteAction = useCallback(async () => {
    if (selectedItems.length === 0) {
      showError('Please select at least one recurring expense to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Recurring Expenses',
        message: `Are you sure you want to delete ${selectedItems.length} recurring expense(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          for (const id of selectedItems) {
            await deleteExpense(id);
          }
          success(`${selectedItems.length} recurring expense(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (error) {
          console.error('Error deleting recurring expenses:', error);
          showError('Failed to delete recurring expenses. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteExpense, success, showError]);

  const handleExportAction = useCallback(async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Recurring expenses exported as ${format.toUpperCase()} successfully.`);
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
        await fetchExpenses();
        success('Recurring expenses imported successfully.');
      } catch (error) {
        showError('Failed to import recurring expenses. Please check the file format.');
      } finally {
        setImportLoading(false);
        event.target.value = '';
      }
    }
  }, [fetchExpenses, success, showError]);

  const handleRefreshClick = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchExpenses();
      success('Recurring expenses list refreshed successfully.');
    } catch (error) {
      showError('Failed to refresh recurring expenses list. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchExpenses, success, showError]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === expenses.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(expenses.map(item => String(item.id)));
    }
  }, [selectedItems.length, expenses]);

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

  // Columns - NO actions column
  const columns: TableColumn<RecurringExpense>[] = [
    {
      key: 'recurringNumber',
      header: 'Recurring #',
      render: (item) => (
        <div>
          <p
            className="text-sm font-medium themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            {item.recurringNumber}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {item.referenceNumber || 'No ref'}
          </p>
        </div>
      ),
    },
    {
      key: 'vendorName',
      header: 'Vendor',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.vendorName || 'N/A'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.category}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => (
        <span
          className="text-sm font-medium themed-transition"
          style={{ color: 'var(--gold)' }}
        >
          {formatCurrency(item.totalAmount)}
        </span>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (item) => <FrequencyBadge frequency={item.frequency} />,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (item) => (
        <div>
          <span
            className="text-sm themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {new Date(item.startDate).toLocaleDateString()}
          </span>
          {item.nextProcessingDate && (
            <span
              className="text-xs block themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            >
              Next: {new Date(item.nextProcessingDate).toLocaleDateString()}
            </span>
          )}
        </div>
      ),
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

  // Row dropdown items
  const getRowDropdownItems = (expense: RecurringExpense) => [
    {
      label: 'View Details',
      icon: <DollarSign className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: () => handleView(expense),
    },
    {
      label: deleteLoading === String(expense.id) ? 'Deleting...' : 'Delete',
      icon: deleteLoading === String(expense.id) ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: () => handleDeleteClick(expense),
      danger: true,
      disabled: deleteLoading === String(expense.id),
    },
  ];

  // Show main loading spinner
  if (loading && expenses.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading recurring expenses..." />
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
            Recurring Expenses
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Manage your recurring business expenses
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

          {/* New Recurring Expense Button */}
          <button
            onClick={() => navigate('/purchases/recurring-expenses/create')}
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
            New Recurring Expense
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
            importLabel="Import Recurring Expenses"
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
                placeholder="Search by recurring #, vendor, category..."
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

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <select
              value={filters.category || ''}
              onChange={(e) => updateFilters({ category: e.target.value || undefined })}
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
              <option value="">All Categories</option>
              {RECURRING_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
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
              value={filters.paymentStatus || ''}
              onChange={(e) => updateFilters({ paymentStatus: e.target.value || undefined })}
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
              {RECURRING_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency Filter */}
          <div className="flex items-center gap-2">
            <Filter
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <select
              value={filters.frequency || ''}
              onChange={(e) => updateFilters({ frequency: e.target.value || undefined })}
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
              <option value="">All Frequencies</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half_yearly">Half Yearly</option>
              <option value="yearly">Yearly</option>
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
        data={expenses}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No recurring expenses found"
        emptyIcon={<Calendar className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
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

export default RecurringExpenses;