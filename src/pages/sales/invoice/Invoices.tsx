// src/pages/sales/invoice/Invoices.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  File,
  Upload,
  Trash,
  Receipt,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { useInvoices } from '../../../hooks/Invoices/useInvoices';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { TableColumn } from '../../../components/common/ReusableTable';
import type { Invoice } from '../../../types/Invoice/InvoiceTypes';

// Status Badge
const StatusBadge: React.FC<{ status: Invoice['status'] }> = ({ status }) => {
  const config: Record<string, { icon: React.ReactNode; label: string }> = {
    draft: { icon: <FileText className="h-3 w-3" />, label: 'Draft' },
    sent: { icon: <Clock className="h-3 w-3" />, label: 'Sent' },
    paid: { icon: <CheckCircle className="h-3 w-3" />, label: 'Paid' },
    partial: { icon: <Clock className="h-3 w-3" />, label: 'Partial' },
    overdue: { icon: <AlertCircle className="h-3 w-3" />, label: 'Overdue' },
    cancelled: { icon: <XCircle className="h-3 w-3" />, label: 'Cancelled' },
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return { bg: 'var(--surface-hover)', color: 'var(--foreground-secondary)' };
      case 'sent':
        return { bg: 'var(--info-light)', color: 'var(--info)' };
      case 'paid':
        return { bg: 'var(--success-light)', color: 'var(--success)' };
      case 'partial':
        return { bg: 'var(--warning-light)', color: 'var(--warning)' };
      case 'overdue':
        return { bg: 'var(--error-light)', color: 'var(--error)' };
      case 'cancelled':
        return { bg: 'var(--surface-hover)', color: 'var(--foreground-tertiary)' };
      default:
        return { bg: 'var(--surface-hover)', color: 'var(--foreground-secondary)' };
    }
  };

  const { icon, label } = config[status];
  const styles = getStatusStyles();

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: styles.bg,
        color: styles.color,
      }}
    >
      {icon}
      {label}
    </span>
  );
};

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    currentItems,
    stats,
    filters,
    currentPage,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    totalPages,
    setFilters,
    setCurrentPage,
    deleteInvoice,
    handleExport,
    handleImport,
    handleRefresh,
  } = useInvoices();

  const {
    success,
    error: showError,
    withConfirmation,
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

  // Navigation handlers
  const handleView = useCallback((invoice: Invoice) => {
    navigate(`/sales/invoices/${invoice.id}`);
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    navigate('/sales/invoices/create');
  }, [navigate]);

  // Bulk delete handler with confirmation
  const handleBulkDeleteAction = useCallback(async () => {
    if (selectedItems.length === 0) {
      showError('Please select at least one invoice to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Invoices',
        message: `Are you sure you want to delete ${selectedItems.length} invoice(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          await Promise.all(selectedItems.map(id => deleteInvoice(id)));
          setSelectedItems([]);
          success(`${selectedItems.length} invoice(s) deleted successfully.`);
        } catch (err) {
          showError('Failed to delete invoices. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteInvoice, success, showError]);

  // Export handler
  const handleExportAction = useCallback(async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      await handleExport(format);
      success(`Invoices exported as ${format.toUpperCase()} successfully.`);
    } catch (err) {
      showError(`Failed to export as ${format.toUpperCase()}.`);
    } finally {
      setExportLoading(false);
    }
  }, [handleExport, success, showError]);

  // Import handler
  const handleImportAction = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImportLoading(true);
    try {
      await handleImport(files);
      success('Invoices imported successfully.');
    } catch (err) {
      showError('Failed to import invoices. Please check the file format.');
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  }, [handleImport, success, showError]);

  // Refresh handler
  const handleRefreshClick = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await handleRefresh();
      success('Invoice list refreshed.');
    } catch (err) {
      showError('Failed to refresh. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [handleRefresh, success, showError]);

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
  }, [selectedItems.length, currentItems]);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  // Filter handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  }, [setFilters]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as Invoice['status'] | 'all';
    setFilters(prev => ({ ...prev, status }));
  }, [setFilters]);

  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }));
  }, [setFilters]);

  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }));
  }, [setFilters]);

  // Get old gold count for an invoice
  const getOldGoldCount = useCallback((invoice: Invoice): number => {
    return (invoice as any).oldGoldItems?.length || 0;
  }, []);

  // Get old gold total for an invoice
  const getOldGoldTotal = useCallback((invoice: Invoice): number => {
    const items = (invoice as any).oldGoldItems || [];
    return items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
  }, []);

  // Columns definition
  const columns: TableColumn<Invoice>[] = [
    {
      key: 'invoiceNo',
      header: 'Invoice No',
      render: (item) => (
        <span
          className="text-sm font-medium themed-transition"
          style={{ color: 'var(--foreground)' }}
        >
          {item.invoiceNo}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {new Date(item.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (item) => (
        <div>
          <p
            className="text-sm font-medium themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            {item.customerName}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {item.customerEmail}
          </p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (item) => (
        <span
          className="text-sm font-semibold themed-transition"
          style={{ color: 'var(--gold)' }}
        >
          {formatCurrency(item.total)}
        </span>
      ),
    },
    {
      key: 'oldGold',
      header: 'Old Gold',
      render: (item) => {
        const count = getOldGoldCount(item);
        const total = getOldGoldTotal(item);
        if (count === 0) return <span className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>-</span>;
        return (
          <div className="flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3" style={{ color: 'var(--gold)' }} />
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--gold)' }}
            >
              {count} item{count > 1 ? 's' : ''}
            </span>
            {total > 0 && (
              <span className="text-xs" style={{ color: 'var(--gold)' }}>
                ({formatCurrency(total)})
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'balanceDue',
      header: 'Balance',
      render: (item) => (
        <span
          className={`text-sm font-medium themed-transition ${
            item.balanceDue > 0 ? 'text-error' : 'text-success'
          }`}
          style={{
            color: item.balanceDue > 0 ? 'var(--error)' : 'var(--success)',
          }}
        >
          {formatCurrency(item.balanceDue)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {new Date(item.dueDate).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Dropdown items for header
  const dropdownItems = [
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

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading invoices..." />
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
            <Receipt className="h-6 w-6" style={{ color: 'var(--gold)' }} />
            Invoices
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {stats ? `${stats.totalInvoices} total invoices` : 'Manage your sales invoices'}
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
            title="Refresh invoice list"
          >
            {refreshLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* New Invoice Button */}
          <button
            onClick={handleCreateNew}
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
            <span>New Invoice</span>
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
              <span>Delete ({selectedItems.length})</span>
            </button>
          )}

          {/* More Options Dropdown */}
          <ThreeDotDropdown
            items={dropdownItems}
            position="right"
            onImport={handleImportAction}
            importLabel="Import Invoices"
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
          boxShadow: 'var(--shadow-card)',
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
                placeholder="Search by invoice no, customer..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
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
              value={filters.status}
              onChange={handleStatusChange}
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
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={handleStartDateChange}
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
              placeholder="Start Date"
            />
            <span
              className="text-sm themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            >
              to
            </span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={handleEndDateChange}
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
        getId={(item) => item.id}
        emptyMessage="No invoices found"
        emptyIcon={<Receipt className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
        onRowClick={(item) => handleView(item)}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          onPageChange: setCurrentPage,
          itemsPerPage: itemsPerPage || 5,
        }}
      />

      {/* Reusable Confirmation Modal */}
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

export default Invoices;