// src/pages/sales/CreditNotes/CreditNotes.tsx
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
  Send,
  FileText,
} from 'lucide-react';
import { useCreditNote } from '../../../hooks/CreditNote/useCreditNote';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { TableColumn } from '../../../components/common/ReusableTable';
import type { CreditNote } from '../../../types/creditNote/CreditNoteTypes';

// ============================================================
// CONSTANTS - Single source of truth
// ============================================================

// Status configuration - Single source of truth
const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  draft: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-secondary)',
    icon: <FileText className="h-3 w-3" />,
    label: 'Draft',
  },
  sent: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <Send className="h-3 w-3" />,
    label: 'Sent',
  },
  approved: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Approved',
  },
  rejected: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Rejected',
  },
};

// Status filter options
const STATUS_FILTER_OPTIONS: DropdownOption[] = [
  { value: '', label: 'All Status' },
  { value: 'draft',    label: 'Draft' },
  { value: 'sent',     label: 'Sent' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

// Status Badge Component
const StatusBadge: React.FC<{ status: CreditNote['status'] }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
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

const CreditNotes: React.FC = () => {
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
    deleteCreditNote,
    handleExport,
    handleImport,
    handleRefresh,
    updateStatus,
  } = useCreditNote();

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

  const handleView = useCallback((creditNote: CreditNote) => {
    navigate(`/sales/credit-notes/${creditNote.id}/view`);
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    navigate('/sales/credit-notes/create');
  }, [navigate]);

  // Single delete handler using confirmation modal
  const handleDelete = useCallback(async (creditNote: CreditNote) => {
    await withConfirmation(
      {
        title: 'Delete Credit Note',
        message: `Are you sure you want to delete credit note ${creditNote.creditNoteNumber}? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(creditNote.id!);
        try {
          await deleteCreditNote(creditNote.id!);
          setSelectedItems(prev => prev.filter(item => item !== creditNote.id));
          success('Credit note deleted successfully.');
        } catch (err) {
          showError('Failed to delete credit note. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deleteCreditNote, success, showError]);

  // Status update handler using confirmation modal
  const handleStatusUpdate = useCallback(async (creditNote: CreditNote, status: CreditNote['status']) => {
    const statusLabels: Record<string, string> = {
      draft: 'Revert to Draft',
      sent: 'Send',
      approved: 'Approve',
      rejected: 'Reject',
    };
    
    const actionLabel = statusLabels[status] || status;
    const variant = status === 'rejected' ? 'danger' as const : status === 'approved' ? 'primary' as const : 'warning' as const;
    
    await withConfirmation(
      {
        title: `${actionLabel} Credit Note`,
        message: `Are you sure you want to ${actionLabel.toLowerCase()} credit note ${creditNote.creditNoteNumber}?`,
        confirmText: actionLabel,
        variant,
      },
      async () => {
        setStatusUpdating(creditNote.id!);
        try {
          await updateStatus(creditNote.id!, status);
          success(`Credit note ${creditNote.creditNoteNumber} ${status === 'approved' ? 'approved' : `status updated to ${status}`} successfully.`);
        } catch (err) {
          showError('Failed to update credit note status. Please try again.');
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
      success('Credit notes list refreshed successfully.');
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
      success(`Credit notes exported as ${format.toUpperCase()} successfully.`);
    } catch (err) {
      showError(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportLoading(false);
    }
  }, [handleExport, success, showError]);

  // Bulk delete handler using confirmation modal
  const handleBulkDeleteWithLoading = useCallback(async () => {
    if (selectedItems.length === 0) {
      showError('Please select at least one credit note to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Credit Notes',
        message: `Are you sure you want to delete ${selectedItems.length} credit note(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          await Promise.all(selectedItems.map(id => deleteCreditNote(id)));
          success(`${selectedItems.length} credit note(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (err) {
          showError('Failed to delete credit notes. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteCreditNote, success, showError]);

  const handleImportAction = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setImportLoading(true);
    try {
      await handleImport(files);
      success('Credit notes imported successfully.');
    } catch (err) {
      showError('Failed to import credit notes. Please check the file format.');
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  }, [handleImport, success, showError]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  }, [filters, setFilters]);

  const handleStatusFilterChange = useCallback((option: DropdownOption) => {
    setFilters({ ...filters, status: option.value });
  }, [filters, setFilters]);

  const handleDateFromChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, dateFrom: e.target.value });
  }, [filters, setFilters]);

  const handleDateToChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, dateTo: e.target.value });
  }, [filters, setFilters]);

  // Columns
  const columns: TableColumn<CreditNote>[] = [
    {
      key: 'creditNoteNumber',
      header: 'Credit Note #',
      render: (item) => (
        <span
          className="text-sm font-medium themed-transition"
          style={{ color: 'var(--foreground)' }}
        >
          {item.creditNoteNumber}
        </span>
      ),
    },
    {
      key: 'creditNoteDate',
      header: 'Date',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {new Date(item.creditNoteDate).toLocaleDateString()}
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
      key: 'invoiceNumber',
      header: 'Invoice',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.invoiceNumber || '-'}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Amount',
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
      key: 'reason',
      header: 'Reason',
      render: (item) => (
        <span
          className="text-sm truncate max-w-[150px] block themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
          title={item.reason}
        >
          {item.reason}
        </span>
      ),
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
        <LoadingSpinner size="lg" />
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
            Credit Notes
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {totalItems > 0 ? `${totalItems} total credit notes` : 'Manage customer credit notes'}
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
            title="Refresh credit notes list"
          >
            {refreshLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* New Credit Note Button */}
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
            New Credit Note
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
            importLabel="Import Credit Notes"
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
                placeholder="Search by credit note #, customer or invoice..."
                value={filters.search || ''}
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
            <SearchableDropdown
              options={STATUS_FILTER_OPTIONS}
              value={filters.status || ''}
              onChange={handleStatusFilterChange}
              triggerPlaceholder="All Status"
              placeholder="Search status..."
              className="w-40"
              resetSearchOnOpen
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom || ''}
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
              value={filters.dateTo || ''}
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
        data={currentItems}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => item.id!}
        emptyMessage="No credit notes found"
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

export default CreditNotes;