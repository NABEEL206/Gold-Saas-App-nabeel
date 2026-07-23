// src/pages/accountant/ManualJournal/ManualJournals.tsx
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
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  Calculator,
} from 'lucide-react';
import { useManualJournal } from '../../../hooks/ManualJournal/useManualJournal';
import type { ManualJournal } from '../../../types/ManualJournal/ManualJournalType';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { TableColumn } from '../../../components/common/ReusableTable';
import { MANUAL_JOURNAL_STATUSES, MANUAL_JOURNAL_STATUS_LABELS } from '../../../types/ManualJournal/ManualJournalType';

// ============================================================
// STATUS CONFIGURATION - Single source of truth
// ============================================================

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  draft: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-secondary)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Draft',
  },
  pending: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Pending',
  },
  posted: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Posted',
  },
  cancelled: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Cancelled',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: ManualJournal['status'] }> = ({ status }) => {
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

const ManualJournals: React.FC = () => {
  const navigate = useNavigate();
  const {
    journals,
    loading,
    error,
    filters,
    pagination,
    stats,
    deleteJournal,
    updateFilters,
    changePage,
    fetchJournals,
  } = useManualJournal({ page: 1, limit: 10 });

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

  const handleView = useCallback((journal: ManualJournal) => {
    navigate(`/accountant/manual-journals/${journal.id}`);
  }, [navigate]);

  // Single delete handler using confirmation modal
  const handleDeleteClick = useCallback(async (journal: ManualJournal) => {
    const journalId = String(journal.id);

    await withConfirmation(
      {
        title: 'Delete Manual Journal',
        message: `Are you sure you want to delete "${journal.journalNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(journalId);
        try {
          await deleteJournal(journal.id);
          setSelectedItems(prev => prev.filter(item => item !== journalId));
          success(`Manual journal "${journal.journalNumber}" deleted successfully.`);
        } catch (error) {
          console.error('Error deleting manual journal:', error);
          showError('Failed to delete manual journal. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deleteJournal, success, showError]);

  // Bulk delete handler using confirmation modal
  const handleBulkDeleteAction = useCallback(async () => {
    if (selectedItems.length === 0) {
      showError('Please select at least one manual journal to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Manual Journals',
        message: `Are you sure you want to delete ${selectedItems.length} manual journal(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          for (const id of selectedItems) {
            await deleteJournal(id);
          }
          success(`${selectedItems.length} manual journal(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (error) {
          console.error('Error deleting manual journals:', error);
          showError('Failed to delete manual journals. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteJournal, success, showError]);

  const handleExportAction = useCallback(async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Manual journals exported as ${format.toUpperCase()} successfully.`);
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
        await fetchJournals();
        success('Manual journals imported successfully.');
      } catch (error) {
        showError('Failed to import manual journals. Please check the file format.');
      } finally {
        setImportLoading(false);
        event.target.value = '';
      }
    }
  }, [fetchJournals, success, showError]);

  const handleRefreshClick = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchJournals();
      success('Manual journals list refreshed successfully.');
    } catch (error) {
      showError('Failed to refresh manual journals list. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchJournals, success, showError]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === journals.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(journals.map(item => String(item.id)));
    }
  }, [selectedItems.length, journals]);

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
  const getRowDropdownItems = (journal: ManualJournal) => [
    {
      label: 'View Details',
      icon: <BookOpen className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: () => handleView(journal),
    },
    {
      label: deleteLoading === String(journal.id) ? 'Deleting...' : 'Delete',
      icon: deleteLoading === String(journal.id) ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: () => handleDeleteClick(journal),
      danger: true,
      disabled: deleteLoading === String(journal.id),
    },
  ];

  // Columns
  const columns: TableColumn<ManualJournal>[] = [
    {
      key: 'journalNumber',
      header: 'Journal #',
      render: (item) => (
        <div>
          <p
            className="text-sm font-medium themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            {item.journalNumber}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {new Date(item.journalDate).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <div>
          <p
            className="text-sm themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            {item.description}
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
      key: 'totalDebit',
      header: 'Debit',
      render: (item) => (
        <span
          className="text-sm font-medium themed-transition"
          style={{ color: 'var(--error)' }}
        >
          {formatCurrency(item.totalDebit)}
        </span>
      ),
    },
    {
      key: 'totalCredit',
      header: 'Credit',
      render: (item) => (
        <span
          className="text-sm font-medium themed-transition"
          style={{ color: 'var(--success)' }}
        >
          {formatCurrency(item.totalCredit)}
        </span>
      ),
    },
    {
      key: 'entries',
      header: 'Entries',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.entries.length}
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
  if (loading && journals.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading manual journals..." />
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
            Manual Journals
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Manage manual journal entries
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

          {/* New Journal Button */}
          <button
            onClick={() => navigate('/accountant/manual-journals/create')}
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
            New Journal
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
            importLabel="Import Journals"
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
                placeholder="Search by journal #, description, account..."
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
              {MANUAL_JOURNAL_STATUSES.map(status => (
                <option key={status} value={status}>
                  {MANUAL_JOURNAL_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilters({ dateFrom: e.target.value || undefined })}
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
              onChange={(e) => updateFilters({ dateTo: e.target.value || undefined })}
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
        data={journals}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No manual journals found"
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

export default ManualJournals;