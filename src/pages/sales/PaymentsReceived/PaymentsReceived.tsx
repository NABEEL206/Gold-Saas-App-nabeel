// src/pages/sales/PaymentReceived/PaymentsReceived.tsx
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
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  Banknote,
  CreditCard,
  Landmark,
  Wallet,
} from 'lucide-react';
import { usePaymentReceived } from '../../../hooks/PaymentReceived/usePaymentReceived';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { TableColumn } from '../../../components/common/ReusableTable';
import type { PaymentReceived } from '../../../types/paymentReceived/PaymentReceivedTypes';

// Status Badge
const StatusBadge: React.FC<{ status: PaymentReceived['status'] }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    completed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" />, label: 'Completed' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
    failed: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" />, label: 'Failed' },
    refunded: { color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-3 w-3" />, label: 'Refunded' },
  };
  const { color, icon, label } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};

// Payment Method Badge
const PaymentMethodBadge: React.FC<{ method: PaymentReceived['paymentMethod'] }> = ({ method }) => {
  const config: Record<string, { icon: React.ReactNode; label: string }> = {
    cash: { icon: <Banknote className="h-3 w-3" />, label: 'Cash' },
    bank_transfer: { icon: <Landmark className="h-3 w-3" />, label: 'Bank Transfer' },
    cheque: { icon: <Receipt className="h-3 w-3" />, label: 'Cheque' },
    credit_card: { icon: <CreditCard className="h-3 w-3" />, label: 'Credit Card' },
    upi: { icon: <Wallet className="h-3 w-3" />, label: 'UPI' },
    other: { icon: <Receipt className="h-3 w-3" />, label: 'Other' },
  };
  const { icon, label } = config[method] || config.other;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
      {icon}
      {label}
    </span>
  );
};

const PaymentsReceived: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    currentItems,
    stats,
    filters,
    currentPage,
    totalItems,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    setFilters,
    setCurrentPage,
    deletePayment,
    handleExport,
    handleImport,
    handleRefresh,
    updateStatus,
  } = usePaymentReceived();

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
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const handleView = useCallback((payment: PaymentReceived) => {
    navigate(`/sales/payments-received/${payment.id}/view`);
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    navigate('/sales/payments-received/create');
  }, [navigate]);

  // Single delete handler using confirmation modal
  const handleDelete = useCallback(async (payment: PaymentReceived) => {
    await withConfirmation(
      {
        title: 'Delete Payment',
        message: `Are you sure you want to delete payment ${payment.paymentNumber}? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(payment.id!);
        try {
          await deletePayment(payment.id!);
          setSelectedItems(prev => prev.filter(item => item !== payment.id));
          success('Payment deleted successfully.');
        } catch (err) {
          showError('Failed to delete payment. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deletePayment, success, showError]);

  // Status update handler using confirmation modal
  const handleStatusUpdate = useCallback(async (payment: PaymentReceived, status: PaymentReceived['status']) => {
    const statusLabels: Record<string, string> = {
      completed: 'Mark as Completed',
      pending: 'Mark as Pending',
      failed: 'Mark as Failed',
      refunded: 'Mark as Refunded',
    };
    
    const actionLabel = statusLabels[status] || status;
    const variant = status === 'failed' || status === 'refunded' ? 'danger' as const : 'primary' as const;
    
    await withConfirmation(
      {
        title: `${actionLabel} Payment`,
        message: `Are you sure you want to ${actionLabel.toLowerCase()} payment ${payment.paymentNumber}?`,
        confirmText: actionLabel,
        variant,
      },
      async () => {
        setStatusUpdating(payment.id!);
        try {
          await updateStatus(payment.id!, status);
          success(`Payment ${payment.paymentNumber} ${status === 'completed' ? 'marked as completed' : `status updated to ${status}`} successfully.`);
        } catch (err) {
          showError('Failed to update payment status. Please try again.');
        } finally {
          setStatusUpdating(null);
        }
      }
    );
  }, [withConfirmation, updateStatus, success, showError]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id!));
    }
  }, [selectedItems.length, currentItems]);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const handleRefreshWithLoading = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await handleRefresh();
      success('Payment list refreshed successfully.');
    } catch (err) {
      showError('Failed to refresh. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [handleRefresh, success, showError]);

  const handleExportWithLoading = useCallback(async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      await handleExport(format);
      success(`Payments exported as ${format.toUpperCase()} successfully.`);
    } catch (err) {
      showError(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportLoading(false);
    }
  }, [handleExport, success, showError]);

  // Bulk delete handler using confirmation modal
  const handleBulkDeleteWithLoading = useCallback(async () => {
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
          await Promise.all(selectedItems.map(id => deletePayment(id)));
          success(`${selectedItems.length} payment(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (err) {
          showError('Failed to delete payments. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deletePayment, success, showError]);

  const handleImportAction = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setImportLoading(true);
    try {
      await handleImport(files);
      success('Payments imported successfully.');
    } catch (err) {
      showError('Failed to import payments. Please check the file format.');
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  }, [handleImport, success, showError]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  }, [filters, setFilters]);

  const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, status: e.target.value });
  }, [filters, setFilters]);

  const handlePaymentMethodFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, paymentMethod: e.target.value });
  }, [filters, setFilters]);

  const handleDateFromChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, dateFrom: e.target.value });
  }, [filters, setFilters]);

  const handleDateToChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, dateTo: e.target.value });
  }, [filters, setFilters]);

  // Columns
  const columns: TableColumn<PaymentReceived>[] = [
    {
      key: 'paymentNumber',
      header: 'Payment #',
      render: (item) => (
        <span className="text-sm font-medium text-gray-900">{item.paymentNumber}</span>
      ),
    },
    {
      key: 'paymentDate',
      header: 'Date',
      render: (item) => (
        <span className="text-sm text-gray-600">{new Date(item.paymentDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{item.customerName}</p>
          <p className="text-xs text-gray-500">{item.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Invoice',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.invoiceNumber || '-'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => (
        <span className="text-sm font-semibold text-amber-600">{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (item) => <PaymentMethodBadge method={item.paymentMethod} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  // Dropdown items for header
  const dropdownItems = [
    {
      label: 'Export as PDF',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <File className="h-4 w-4 text-red-500" />
      ),
      onClick: () => handleExportWithLoading('pdf'),
      disabled: exportLoading,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-green-500" />
      ),
      onClick: () => handleExportWithLoading('excel'),
      disabled: exportLoading,
    },
  ];

  // Show main loading spinner
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-amber-500" />
            Payments Received
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalItems > 0 ? `${totalItems} total payments` : 'Manage customer payments'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefreshWithLoading}
            disabled={refreshLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh payment list"
          >
            {refreshLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Payment
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteWithLoading}
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
            items={dropdownItems}
            position="right"
            onImport={handleImportAction}
            importLabel="Import Payments"
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
                placeholder="Search by payment # or customer..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status || ''}
              onChange={handleStatusFilterChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filters.paymentMethod || ''}
              onChange={handlePaymentMethodFilterChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="credit_card">Credit Card</option>
              <option value="upi">UPI</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={handleDateFromChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Start Date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={handleDateToChange}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        data={currentItems}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => item.id!}
        emptyMessage="No payments found"
        emptyIcon={<Receipt className="h-12 w-12 text-gray-300" />}
        onRowClick={(item) => handleView(item)}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          onPageChange: setCurrentPage,
          itemsPerPage: itemsPerPage || 5,
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

export default PaymentsReceived;