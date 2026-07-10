// src/pages/Inventory/InventoryAdjustments.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  FileText,
  CheckCircle,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  File,
  Calendar,
  Layers,
  Trash,
  Upload,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../components/common/ThreeDotDropdown';
import ReusableTable from '../../components/common/ReusableTable';
import type { TableColumn } from '../../components/common/ReusableTable';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useInventoryAdjustments } from '../../hooks/inventory/useInventoryAdjustments';
import { useToastAndConfirm } from '../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { InventoryAdjustment } from '../../types/inventory/InventoryAdjustmentTypes';

// Status Badge Component
const StatusBadge: React.FC<{ status: InventoryAdjustment['status'] }> = ({ status }) => {
  const statusConfig = {
    draft: { icon: FileText, label: 'Draft' },
    pending: { icon: Clock, label: 'Pending' },
    adjusted: { icon: CheckCircle, label: 'Adjusted' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  
  if (!config) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
        style={{
          background: 'var(--surface-hover)',
          color: 'var(--foreground-secondary)',
        }}
      >
        <FileText className="h-3 w-3" />
        {status || 'Unknown'}
      </span>
    );
  }
  
  const Icon = config.icon;

  const getStatusStyles = () => {
    switch (status) {
      case 'draft':
        return { bg: 'var(--surface-hover)', color: 'var(--foreground-secondary)' };
      case 'pending':
        return { bg: 'var(--warning-light)', color: 'var(--warning)' };
      case 'adjusted':
        return { bg: 'var(--success-light)', color: 'var(--success)' };
      default:
        return { bg: 'var(--surface-hover)', color: 'var(--foreground-secondary)' };
    }
  };

  const styles = getStatusStyles();
  
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: styles.bg,
        color: styles.color,
      }}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

// Type Badge Component
const TypeBadge: React.FC<{ type: InventoryAdjustment['type'] }> = ({ type }) => {
  const typeConfig = {
    quantity: { icon: Layers, label: 'Quantity' },
    weight: { icon: Layers, label: 'Weight' },
    value: { icon: Layers, label: 'Value' },
  };
  
  const config = typeConfig[type];
  const Icon = config.icon;

  const getTypeStyles = () => {
    switch (type) {
      case 'quantity':
        return { bg: 'var(--info-light)', color: 'var(--info)' };
      case 'weight':
        return { bg: 'var(--primary-light)', color: 'var(--primary)' };
      case 'value':
        return { bg: 'var(--warning-light)', color: 'var(--warning)' };
      default:
        return { bg: 'var(--surface-hover)', color: 'var(--foreground-secondary)' };
    }
  };

  const styles = getTypeStyles();
  
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: styles.bg,
        color: styles.color,
      }}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

const InventoryAdjustments: React.FC = () => {
  const navigate = useNavigate();
  
  // Use toast and confirm hook
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
  
  const {
    loading,
    currentItems,
    filters,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    itemsPerPage,
    setFilters,
    setCurrentPage,
    handleRefresh,
    handleDelete,
    handleBulkDelete,
    handleExport,
    handleStatusUpdate,
    handleItemsPerPageChange,
    handleImport,
  } = useInventoryAdjustments() as any;

  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<'excel' | 'pdf' | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const handleView = useCallback((adjustment: InventoryAdjustment) => {
    navigate(`/inventory/adjustments/${adjustment.id}`);
  }, [navigate]);

  const handleEdit = useCallback((adjustment: InventoryAdjustment) => {
    navigate(`/inventory/adjustments/edit/${adjustment.id}`);
  }, [navigate]);

  // Single delete with confirmation modal
  const handleDeleteWithConfirm = useCallback(async (adjustment: InventoryAdjustment) => {
    await withConfirmation(
      {
        title: 'Delete Adjustment',
        message: `Are you sure you want to delete adjustment "${adjustment.adjustmentNo}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(adjustment.id);
        try {
          await handleDelete(adjustment.id);
          setSelectedItems(prev => prev.filter(itemId => itemId !== adjustment.id));
          success('Adjustment deleted successfully.');
        } catch {
          showError('Failed to delete adjustment. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, handleDelete, success, showError]);

  // Bulk delete with confirmation modal
  const handleBulkDeleteWithConfirm = useCallback(async () => {
    if (selectedItems.length === 0) {
      warning('Please select adjustments to delete');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Multiple Adjustments',
        message: `Are you sure you want to delete ${selectedItems.length} adjustment(s)? This action cannot be undone.`,
        confirmText: 'Delete All',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          await handleBulkDelete(selectedItems);
          setSelectedItems([]);
          success(`${selectedItems.length} adjustment(s) deleted successfully.`);
        } catch {
          showError('Failed to delete adjustments. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, handleBulkDelete, success, showError, warning]);

  // Refresh with toast
  const handleRefreshWithLoading = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await handleRefresh();
      setSelectedItems([]);
      success('Adjustments refreshed.');
    } catch {
      showError('Failed to refresh. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [handleRefresh, success, showError]);

  // Export with toast
  const handleExportWithLoading = useCallback(async (format: 'excel' | 'pdf') => {
    setExportLoading(format);
    try {
      await handleExport(format);
      success(`Exported as ${format.toUpperCase()} successfully.`);
    } catch {
      showError(`Failed to export as ${format.toUpperCase()}.`);
    } finally {
      setExportLoading(null);
    }
  }, [handleExport, success, showError]);

  // Import with toast
  const handleImportWithLoading = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportLoading(true);
      try {
        await handleImport(files);
        await handleRefresh();
        success(`Successfully imported ${files.length} file(s).`);
      } catch (error) {
        console.error('Import error:', error);
        showError('Failed to import. Please check the file format.');
      } finally {
        setImportLoading(false);
        event.target.value = '';
      }
    }
  }, [handleImport, handleRefresh, success, showError]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map((item: { id: any }) => item.id));
    }
  }, [selectedItems.length, currentItems]);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  }, []);

  // Handle row click - navigate to view page
  const handleRowClick = useCallback((adjustment: InventoryAdjustment) => {
    navigate(`/inventory/adjustments/${adjustment.id}`);
  }, [navigate]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format datetime
  const formatDateTime = (dateString: string) => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  };

  // Table Columns
  const columns: TableColumn<InventoryAdjustment>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {formatDate(item.date)}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item) => (
        <span
          className="text-sm max-w-xs truncate block themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.reason || item.notes || '-'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => <TypeBadge type={item.type} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {formatDateTime(item.createdAt)}
        </span>
      ),
    },
  ];

  // Three-dot dropdown items for header
  const headerDropdownItems = [
    {
      label: 'Export as PDF',
      icon: exportLoading === 'pdf' ? <LoadingSpinner size="sm" /> : <File className="h-4 w-4" style={{ color: 'var(--error)' }} />,
      onClick: () => handleExportWithLoading('pdf'),
      disabled: exportLoading !== null,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading === 'excel' ? <LoadingSpinner size="sm" /> : <FileSpreadsheet className="h-4 w-4" style={{ color: 'var(--success)' }} />,
      onClick: () => handleExportWithLoading('excel'),
      disabled: exportLoading !== null,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading adjustments..." />
      </div>
    );
  }

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            Inventory Adjustments
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Manage inventory adjustments and corrections
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
            {refreshLoading ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>

          <button
            onClick={() => navigate('/inventory/adjustments/create')}
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
            New Adjustment
          </button>

          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteWithConfirm}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                color: 'var(--error)',
                background: 'var(--error-light)',
                border: '1px solid var(--error)',
              }}
              onMouseEnter={(e) => {
                if (!bulkDeleteLoading) {
                  e.currentTarget.style.background = 'var(--error-light)';
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--error-light)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              {bulkDeleteLoading ? <LoadingSpinner size="sm" /> : <Trash className="h-4 w-4" />}
              Delete Selected ({selectedItems.length})
            </button>
          )}

          {/* Three Dot Dropdown with Import option */}
          <ThreeDotDropdown 
            items={headerDropdownItems} 
            position="right"
            onImport={handleImportWithLoading}
            importLabel="Import Adjustments"
            importIcon={importLoading ? <LoadingSpinner size="sm" /> : <Upload className="h-4 w-4" style={{ color: 'var(--info)' }} />}
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
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 themed-transition"
                style={{ color: 'var(--foreground-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Search Adjustment No / Reason..."
                value={filters.searchQuery}
                onChange={(e) => { setFilters({ ...filters, searchQuery: e.target.value }); setCurrentPage(1); }}
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

          <div className="flex items-center gap-2">
            <Filter
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value as InventoryAdjustment['status'] | 'all' }); setCurrentPage(1); }}
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
              <option value="pending">Pending</option>
              <option value="adjusted">Adjusted</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Layers
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <select
              value={filters.type}
              onChange={(e) => { setFilters({ ...filters, type: e.target.value as InventoryAdjustment['type'] | 'all' }); setCurrentPage(1); }}
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
              <option value="all">All Types</option>
              <option value="quantity">Quantity</option>
              <option value="weight">Weight</option>
              <option value="value">Value</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar
              className="h-4 w-4 themed-transition"
              style={{ color: 'var(--foreground-tertiary)' }}
            />
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => { setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } }); setCurrentPage(1); }}
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
              onChange={(e) => { setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } }); setCurrentPage(1); }}
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
            />
          </div>
        </div>
      </div>

      {/* Reusable Table */}
      <ReusableTable
        data={currentItems}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => item.id}
        emptyMessage="No adjustments found"
        emptyIcon={<FileText className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
        onRowClick={handleRowClick}
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

export default InventoryAdjustments;