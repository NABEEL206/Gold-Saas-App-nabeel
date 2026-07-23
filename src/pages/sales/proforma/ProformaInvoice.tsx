// src/pages/sales/proforma/ProformaInvoices.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  File,
  Upload,
  Trash,
  Receipt,
  XCircle,
  Send,
} from 'lucide-react';
import { useProformaInvoice } from '../../../hooks/Proforma/useProformaInvoice';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { TableColumn } from '../../../components/common/ReusableTable';
import type { ProformaInvoice as ProformaInvoiceType } from '../../../types/proforma/ProformaInvoiceType';

// Status Badge with theme variables
const StatusBadge: React.FC<{ status: ProformaInvoiceType['status'] }> = ({ status }) => {
  const config: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
    draft: { 
      bg: 'var(--surface-hover)', 
      color: 'var(--foreground-secondary)', 
      icon: <FileText className="h-3 w-3" />, 
      label: 'Draft' 
    },
    sent: { 
      bg: 'var(--info-light)', 
      color: 'var(--info)', 
      icon: <Send className="h-3 w-3" />, 
      label: 'Sent' 
    },
    approved: { 
      bg: 'var(--success-light)', 
      color: 'var(--success)', 
      icon: <FileText className="h-3 w-3" />, 
      label: 'Approved' 
    },
    rejected: { 
      bg: 'var(--error-light)', 
      color: 'var(--error)', 
      icon: <XCircle className="h-3 w-3" />, 
      label: 'Rejected' 
    },
    expired: { 
      bg: 'var(--warning-light)', 
      color: 'var(--warning)', 
      icon: <Clock className="h-3 w-3" />, 
      label: 'Expired' 
    },
  };
  
  const { bg, color, icon, label } = config[status] || config.draft;
  
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

const ProformaInvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const {
    invoices,
    loading,
    error,
    totalItems,
    currentPage,
    itemsPerPage,
    filters,
    fetchInvoices,
    deleteInvoice,
    updateInvoiceStatus,
    setPage,
    setItemsPerPage,
    setFilters,
  } = useProformaInvoice();

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
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Navigate to view page on row click
  const handleRowClick = useCallback((invoice: ProformaInvoiceType) => {
    navigate(`/sales/proforma/${invoice.id}/view`);
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    navigate('/sales/proforma/create');
  }, [navigate]);

  // Single delete handler with confirmation modal
  const handleDelete = useCallback((id: string) => {
    withConfirmation(
      {
        title: 'Delete Proforma Invoice',
        message: 'Are you sure you want to delete this proforma invoice? This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(id);
        try {
          await deleteInvoice(id);
          setSelectedItems(prev => prev.filter(item => item !== id));
          success('Proforma invoice deleted successfully.');
        } catch (err) {
          showError('Failed to delete proforma invoice. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deleteInvoice, success, showError]);

  const handleStatusUpdate = useCallback(async (id: string, status: ProformaInvoiceType['status']) => {
    try {
      await updateInvoiceStatus(id, status);
      success(`Invoice status updated to ${status}.`);
    } catch (err) {
      showError('Failed to update invoice status. Please try again.');
    }
  }, [updateInvoiceStatus, success, showError]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === invoices.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(invoices.map(item => item.id!));
    }
  }, [selectedItems.length, invoices]);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const handleRefreshWithLoading = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchInvoices();
      success('Proforma invoice list refreshed.');
    } catch (err) {
      showError('Failed to refresh. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchInvoices, success, showError]);

  const handleExportWithLoading = useCallback(async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Proforma invoices exported as ${format.toUpperCase()} successfully.`);
    } catch (err) {
      showError(`Failed to export as ${format.toUpperCase()}.`);
    } finally {
      setExportLoading(false);
    }
  }, [success, showError]);

  // Bulk delete handler with confirmation modal
  const handleBulkDeleteWithLoading = useCallback(async () => {
    if (selectedItems.length === 0) {
      showError('Please select at least one proforma invoice to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Proforma Invoices',
        message: `Are you sure you want to delete ${selectedItems.length} proforma invoice(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          await Promise.all(selectedItems.map(id => deleteInvoice(id)));
          success(`${selectedItems.length} proforma invoice(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (err) {
          showError('Failed to delete proforma invoices. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteInvoice, success, showError]);

  const handleImportAction = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImportLoading(true);
    try {
      console.log('Importing files:', files);
      await new Promise(resolve => setTimeout(resolve, 800));
      success('Proforma invoices imported successfully.');
    } catch (err) {
      showError('Failed to import proforma invoices. Please check the file format.');
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  }, [success, showError]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  }, [filters, setFilters]);

  const handleStatusFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, status: e.target.value });
  }, [filters, setFilters]);

  const handleDateFromChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, dateFrom: e.target.value });
  }, [filters, setFilters]);

  const handleDateToChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, dateTo: e.target.value });
  }, [filters, setFilters]);

  // Columns
  const columns: TableColumn<ProformaInvoiceType>[] = [
    {
      key: 'invoiceNumber',
      header: 'Proforma #',
      render: (item) => (
        <span
          className="text-sm font-medium themed-transition"
          style={{ color: 'var(--foreground)' }}
        >
          {item.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'invoiceDate',
      header: 'Date',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {new Date(item.invoiceDate).toLocaleDateString()}
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
      key: 'grandTotal',
      header: 'Total',
      render: (item) => (
        <span
          className="text-sm font-semibold themed-transition"
          style={{ color: 'var(--gold)' }}
        >
          {formatCurrency(item.grandTotal)}
        </span>
      ),
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {new Date(item.validUntil).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  // Dropdown items for ThreeDotDropdown
  const dropdownItems = [
    {
      label: 'Export as PDF',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <File className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: () => handleExportWithLoading('pdf'),
      disabled: exportLoading,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" style={{ color: 'var(--success)' }} />
      ),
      onClick: () => handleExportWithLoading('excel'),
      disabled: exportLoading,
    },
  ];

  // Show main loading spinner
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading proforma invoices..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div
          className="px-4 py-3 rounded-lg themed-transition"
          style={{
            background: 'var(--error-light)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
          }}
        >
          <p>Error: {error}</p>
          <button
            onClick={() => fetchInvoices()}
            className="mt-2 text-sm font-medium themed-transition"
            style={{ color: 'var(--error)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Try Again
          </button>
        </div>
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
            Proforma Invoices
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {totalItems > 0 ? `${totalItems} total proforma invoices` : 'Manage your proforma invoices'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh Button */}
          <button
            onClick={handleRefreshWithLoading}
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
            title="Refresh proforma list"
          >
            {refreshLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* New Proforma Button */}
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
            <span>New Proforma</span>
          </button>

          {/* Bulk Delete Button */}
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteWithLoading}
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
            items={dropdownItems}
            position="right"
            onImport={handleImportAction}
            importLabel="Import Proformas"
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
                placeholder="Search by proforma # or customer..."
                value={filters.search}
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
              onChange={handleStatusFilterChange}
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={handleDateFromChange}
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
              value={filters.dateTo}
              onChange={handleDateToChange}
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
        data={invoices}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => item.id!}
        emptyMessage="No proforma invoices found"
        emptyIcon={<Receipt className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
        onRowClick={handleRowClick}
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalItems / itemsPerPage),
          totalItems,
          onPageChange: setPage,
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

export default ProformaInvoiceList;