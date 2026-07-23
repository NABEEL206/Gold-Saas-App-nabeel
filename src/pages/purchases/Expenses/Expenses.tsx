// src/pages/purchases/Expenses/Expenses.tsx
import React, { useState, useCallback, useEffect } from 'react';
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
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { TableColumn } from '../../../components/common/ReusableTable';
import { EXPENSE_CATEGORIES } from '../../../types/Expense/ExpenseType';
import { 
  validateExpenseForm,
  formatValidationErrors,
  hasValidationErrors,
  getErrorCount
} from '../../../validations/expense.validation';

// ============================================================
// STATUS CONFIGURATION - Single source of truth
// ============================================================

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  paid: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Paid',
  },
  unpaid: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Unpaid',
  },
  partial: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Partial',
  },
  overdue: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Overdue',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: Expense['paymentStatus'] }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unpaid;
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

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const {
    expenses,
    loading,
    error,
    validationErrors: apiValidationErrors,
    filters,
    pagination,
    deleteExpense,
    updateFilters,
    changePage,
    fetchExpenses,
    clearErrors,
  } = useExpense({ page: 1, limit: 10 });

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
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleView = useCallback((expense: Expense) => {
    navigate(`/purchases/expenses/${expense.id}`);
  }, [navigate]);

  const handleEdit = useCallback((expense: Expense) => {
    navigate(`/purchases/expenses/${expense.id}/edit`);
  }, [navigate]);

  // Single delete handler
  const handleDeleteClick = useCallback(async (expense: Expense) => {
    const expenseId = String(expense.id);

    await withConfirmation(
      {
        title: 'Delete Expense',
        message: `Are you sure you want to delete "${expense.expenseNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(expenseId);
        try {
          await deleteExpense(expense.id);
          setSelectedItems(prev => prev.filter(item => item !== expenseId));
          success(`Expense "${expense.expenseNumber}" deleted successfully.`);
          setValidationErrors({});
          setShowErrorSummary(false);
        } catch (error) {
          console.error('Error deleting expense:', error);
          showError('Failed to delete expense. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deleteExpense, success, showError]);

  // Bulk delete handler
  const handleBulkDeleteAction = useCallback(async () => {
    if (selectedItems.length === 0) {
      setValidationErrors({
        selection: 'Please select at least one expense to delete.'
      });
      setShowErrorSummary(true);
      showError('Please select at least one expense to delete.');
      return;
    }

    setValidationErrors({});
    setShowErrorSummary(false);

    await withConfirmation(
      {
        title: 'Delete Expenses',
        message: `Are you sure you want to delete ${selectedItems.length} expense(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          for (const id of selectedItems) {
            await deleteExpense(id);
          }
          success(`${selectedItems.length} expense(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (error) {
          console.error('Error deleting expenses:', error);
          showError('Failed to delete expenses. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteExpense, success, showError]);

  const handleExportAction = useCallback(async (format: 'excel' | 'pdf') => {
    if (expenses.length === 0) {
      setValidationErrors({
        export: `No expenses available to export as ${format.toUpperCase()}.`
      });
      setShowErrorSummary(true);
      showError(`No expenses available to export as ${format.toUpperCase()}.`);
      return;
    }

    setValidationErrors({});
    setShowErrorSummary(false);

    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Expenses exported as ${format.toUpperCase()} successfully.`);
    } catch (error) {
      showError(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportLoading(false);
    }
  }, [expenses.length, success, showError]);

  const handleImportAction = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setValidationErrors({
          import: 'Please upload a valid file (CSV, XLSX, or XLS format).'
        });
        setShowErrorSummary(true);
        showError('Invalid file format. Please upload CSV, XLSX, or XLS file.');
        event.target.value = '';
        return;
      }

      setValidationErrors({});
      setShowErrorSummary(false);

      setImportLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchExpenses();
        success('Expenses imported successfully.');
      } catch (error) {
        showError('Failed to import expenses. Please check the file format.');
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
      success('Expense list refreshed successfully.');
      setValidationErrors({});
      setShowErrorSummary(false);
    } catch (error) {
      showError('Failed to refresh expense list. Please try again.');
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
    if (validationErrors.selection) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.selection;
        return newErrors;
      });
      if (Object.keys(validationErrors).length === 1) {
        setShowErrorSummary(false);
      }
    }
  }, [validationErrors]);

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  // Handle API validation errors
  useEffect(() => {
    if (Object.keys(apiValidationErrors).length > 0) {
      const formattedErrors: Record<string, string> = {};
      Object.entries(apiValidationErrors).forEach(([key, value]) => {
        if (value) {
          formattedErrors[key] = value;
        }
      });
      setValidationErrors(prev => ({
        ...prev,
        ...formattedErrors
      }));
      setShowErrorSummary(true);
      showError('Please check the form for errors.');
    }
  }, [apiValidationErrors, showError]);

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
          <p
            className="text-sm font-medium themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            {item.expenseNumber}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {item.receiptNumber || 'No receipt'}
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
      key: 'date',
      header: 'Date',
      render: (item) => (
        <div>
          <span
            className="text-sm themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {new Date(item.date).toLocaleDateString()}
          </span>
          {item.dueDate && (
            <span
              className="text-xs block themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            >
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </span>
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
          <span
            className="text-sm themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {methods[item.paymentMethod] || item.paymentMethod}
          </span>
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
  const getRowDropdownItems = (expense: Expense) => [
    {
      label: 'View Details',
      icon: <DollarSign className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: () => handleView(expense),
    },
    {
      label: 'Edit Expense',
      icon: <File className="h-4 w-4" style={{ color: 'var(--primary)' }} />,
      onClick: () => handleEdit(expense),
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
        <LoadingSpinner size="lg" text="Loading expenses..." />
      </div>
    );
  }

  // Get filter errors (exclude submit error)
  const getFilteredErrors = () => {
    const filtered: Record<string, string> = {};
    Object.entries(validationErrors).forEach(([key, value]) => {
      if (key !== 'submit' && value) {
        filtered[key] = value;
      }
    });
    return filtered;
  };

  const filteredErrors = getFilteredErrors();
  const hasErrors = Object.keys(filteredErrors).length > 0;

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
            Expenses
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Manage your business expenses
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

          {/* New Expense Button */}
          <button
            onClick={() => navigate('/purchases/expenses/create')}
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
            New Expense
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
            importLabel="Import Expenses"
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

      {/* Error Summary */}
      {(showErrorSummary || hasErrors) && hasErrors && (
        <ErrorSummary
          errors={filteredErrors}
          title="Please fix the following errors:"
          variant="warning"
          onClose={() => {
            setShowErrorSummary(false);
            setValidationErrors({});
            clearErrors();
          }}
          showIcon={true}
          showBadge={false}
        />
      )}

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
                placeholder="Search by expense #, vendor, category..."
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
              {EXPENSE_CATEGORIES.map(cat => (
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
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        data={expenses}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No expenses found"
        emptyIcon={<DollarSign className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
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

export default Expenses;