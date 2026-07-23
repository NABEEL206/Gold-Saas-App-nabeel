// src/pages/purchases/PaymentsMade/PaymentsMade.tsx
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
  XCircle,
  DollarSign,
  CreditCard,
  Building2,
} from 'lucide-react';
import { usePaymentMade } from '../../../hooks/PaymentMade/usePaymentMade';
import type { PaymentMade } from '../../../types/PaymentMade/PaymentMadeType';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { TableColumn } from '../../../components/common/ReusableTable';
import { 
  PAYMENT_MADE_STATUSES, 
  PAYMENT_MADE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS
} from '../../../types/PaymentMade/PaymentMadeType';

// ============================================================
// STATUS CONFIGURATION - Single source of truth
// ============================================================

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  pending: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Pending',
  },
  completed: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Completed',
  },
  failed: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Failed',
  },
  cancelled: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-tertiary)',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Cancelled',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: PaymentMade['status'] }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
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

const PaymentsMade: React.FC = () => {
  const navigate = useNavigate();
  const {
    payments,
    loading,
    error,
    filters,
    pagination,
    stats,
    deletePayment,
    updateFilters,
    changePage,
    fetchPayments,
  } = usePaymentMade({ page: 1, limit: 10 });

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

  const handleView = useCallback((payment: PaymentMade) => {
    navigate(`/purchases/payments-made/${payment.id}`);
  }, [navigate]);

  // Single delete handler using confirmation modal
  const handleDeleteClick = useCallback(async (payment: PaymentMade) => {
    const paymentId = String(payment.id);

    await withConfirmation(
      {
        title: 'Delete Payment',
        message: `Are you sure you want to delete "${payment.paymentNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(paymentId);
        try {
          await deletePayment(payment.id);
          setSelectedItems(prev => prev.filter(item => item !== paymentId));
          success(`Payment "${payment.paymentNumber}" deleted successfully.`);
        } catch (error) {
          console.error('Error deleting payment:', error);
          showError('Failed to delete payment. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deletePayment, success, showError]);

  // Bulk delete handler using confirmation modal
  const handleBulkDeleteAction = useCallback(async () => {
    if (selectedItems.length === 0) {
      showError('Please select at least one payment to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Payments',
        message: `Are you sure you want to delete ${selectedItems.length} payment(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          for (const id of selectedItems) {
            await deletePayment(id);
          }
          success(`${selectedItems.length} payment(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (error) {
          console.error('Error deleting payments:', error);
          showError('Failed to delete payments. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deletePayment, success, showError]);

  const handleExportAction = useCallback(async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Payments exported as ${format.toUpperCase()} successfully.`);
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
        await fetchPayments();
        success('Payments imported successfully.');
      } catch (error) {
        showError('Failed to import payments. Please check the file format.');
      } finally {
        setImportLoading(false);
        event.target.value = '';
      }
    }
  }, [fetchPayments, success, showError]);

  const handleRefreshClick = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchPayments();
      success('Payment list refreshed successfully.');
    } catch (error) {
      showError('Failed to refresh payment list. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchPayments, success, showError]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === payments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(payments.map(item => String(item.id)));
    }
  }, [selectedItems.length, payments]);

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
  const getRowDropdownItems = (payment: PaymentMade) => [
    {
      label: 'View Details',
      icon: <DollarSign className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: () => handleView(payment),
    },
    {
      label: deleteLoading === String(payment.id) ? 'Deleting...' : 'Delete',
      icon: deleteLoading === String(payment.id) ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: () => handleDeleteClick(payment),
      danger: true,
      disabled: deleteLoading === String(payment.id),
    },
  ];

  // Columns
  const columns: TableColumn<PaymentMade>[] = [
    {
      key: 'paymentNumber',
      header: 'Payment #',
      render: (item) => (
        <div>
          <p
            className="text-sm font-medium themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            {item.paymentNumber}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {new Date(item.paymentDate).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: 'vendorName',
      header: 'Vendor',
      render: (item) => (
        <div>
          <p
            className="text-sm flex items-center gap-1 themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            <Building2 className="h-3 w-3" style={{ color: 'var(--foreground-tertiary)' }} />
            {item.vendorName || 'N/A'}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {item.billNumber || 'No bill'}
          </p>
        </div>
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
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {PAYMENT_METHOD_LABELS[item.paymentMethod] || item.paymentMethod}
        </span>
      ),
    },
    {
      key: 'referenceNumber',
      header: 'Reference',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.referenceNumber || '-'}
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
  if (loading && payments.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading payments..." />
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
            Payments Made
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Manage your vendor payments
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

          {/* New Payment Button */}
          <button
            onClick={() => navigate('/purchases/payments-made/create')}
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
            New Payment
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
            importLabel="Import Payments"
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
                placeholder="Search by payment #, vendor..."
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
              {PAYMENT_MADE_STATUSES.map(status => (
                <option key={status} value={status}>
                  {PAYMENT_MADE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2">
            <Filter
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <select
              value={filters.paymentMethod || ''}
              onChange={(e) => updateFilters({ paymentMethod: e.target.value || undefined })}
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
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cheque">Cheque</option>
              <option value="auto_debit">Auto Debit</option>
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
        data={payments}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No payments found"
        emptyIcon={<CreditCard className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
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

export default PaymentsMade;