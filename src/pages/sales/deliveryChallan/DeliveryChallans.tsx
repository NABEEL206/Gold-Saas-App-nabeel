// src/pages/sales/deliveryChallan/DeliveryChallans.tsx
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
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useDeliveryChallan } from '../../../hooks/DeliveryChallan/useDeliveryChallan';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { TableColumn } from '../../../components/common/ReusableTable';
import type { DeliveryChallan } from '../../../types/deliveryChallan/DeliveryChallanTypes';

// ============================================================
// STATUS CONFIGURATION - Single source of truth
// ============================================================

const STATUS_CONFIG: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
  draft: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-secondary)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Draft',
  },
  sent: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <Truck className="h-3 w-3" />,
    label: 'Sent',
  },
  delivered: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Delivered',
  },
  cancelled: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Cancelled',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: DeliveryChallan['status'] }> = ({ status }) => {
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

const STATUS_LABELS: Record<string, string> = {
  draft: 'draft',
  sent: 'sent',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

const DeliveryChallans: React.FC = () => {
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
    deleteChallan,
    handleExport,
    handleImport,
    handleRefresh,
    updateStatus,
  } = useDeliveryChallan();

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
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const handleView = useCallback((challan: DeliveryChallan) => {
    navigate(`/sales/delivery-challan/${challan.id}/view`);
  }, [navigate]);

  const handleEdit = useCallback((challan: DeliveryChallan) => {
    navigate(`/sales/delivery-challan/${challan.id}/edit`);
  }, [navigate]);

  // Single delete handler using confirmation modal
  const handleDelete = useCallback((id: string) => {
    withConfirmation(
      {
        title: 'Delete Delivery Challan',
        message: 'Are you sure you want to delete this delivery challan? This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(id);
        try {
          await deleteChallan(id);
          setSelectedItems(prev => prev.filter(item => item !== id));
          success('Delivery challan deleted successfully.');
        } catch (err) {
          showError('Failed to delete delivery challan. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deleteChallan, success, showError]);

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
      success('Delivery challan list refreshed.');
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
      success(`Delivery challans exported as ${format.toUpperCase()} successfully.`);
    } catch (err) {
      showError(`Failed to export as ${format.toUpperCase()}.`);
    } finally {
      setExportLoading(false);
    }
  }, [handleExport, success, showError]);

  // Bulk delete handler using confirmation modal
  const handleBulkDeleteWithLoading = useCallback(async () => {
    if (selectedItems.length === 0) {
      showError('Please select at least one delivery challan to delete.');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Delivery Challans',
        message: `Are you sure you want to delete ${selectedItems.length} delivery challan(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          await Promise.all(selectedItems.map(id => deleteChallan(id)));
          success(`${selectedItems.length} delivery challan(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (err) {
          showError('Failed to delete delivery challans. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteChallan, success, showError]);

  const handleImportAction = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setImportLoading(true);
    try {
      await handleImport(files);
      success('Delivery challans imported successfully.');
    } catch (err) {
      showError('Failed to import delivery challans. Please check the file format.');
    } finally {
      setImportLoading(false);
      event.target.value = '';
    }
  }, [handleImport, success, showError]);

  // Columns
  const columns: TableColumn<DeliveryChallan>[] = [
    {
      key: 'challanNumber',
      header: 'Challan #',
      render: (item) => (
        <span
          className="text-sm font-medium themed-transition"
          style={{ color: 'var(--foreground)' }}
        >
          {item.challanNumber}
        </span>
      ),
    },
    {
      key: 'challanDate',
      header: 'Date',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {new Date(item.challanDate).toLocaleDateString()}
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
          ₹{item.total.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'deliveryDate',
      header: 'Delivery Date',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {new Date(item.deliveryDate).toLocaleDateString()}
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
        <LoadingSpinner size="lg" text="Loading delivery challans..." />
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
            <Truck className="h-6 w-6" style={{ color: 'var(--gold)' }} />
            Delivery Challans
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Manage your delivery challans
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
          >
            {refreshLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>

          {/* New Challan Button */}
          <button
            onClick={() => navigate('/sales/delivery-challan/create')}
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
            New Challan
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
            importLabel="Import Challans"
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
                placeholder="Search by challan # or customer..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
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
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
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
        emptyMessage="No delivery challans found"
        emptyIcon={<Truck className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
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

export default DeliveryChallans;