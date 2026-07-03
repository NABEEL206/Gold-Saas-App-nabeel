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
    draft: { color: 'bg-gray-100 text-gray-700', icon: FileText, label: 'Draft' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
    adjusted: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Adjusted' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        <FileText className="h-3 w-3" />
        {status || 'Unknown'}
      </span>
    );
  }
  
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

// Type Badge Component
const TypeBadge: React.FC<{ type: InventoryAdjustment['type'] }> = ({ type }) => {
  const typeConfig = {
    quantity: { color: 'bg-blue-100 text-blue-700', icon: Layers, label: 'Quantity' },
    weight: { color: 'bg-purple-100 text-purple-700', icon: Layers, label: 'Weight' },
    value: { color: 'bg-amber-100 text-amber-700', icon: Layers, label: 'Value' },
  };
  
  const config = typeConfig[type];
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
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
      render: (item) => <span className="text-sm text-gray-600">{formatDate(item.date)}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (item) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
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
      render: (item) => <span className="text-sm text-gray-600">{formatDateTime(item.createdAt)}</span>,
    },
  ];

  // Three-dot dropdown items for header
  const headerDropdownItems = [
    {
      label: 'Export as PDF',
      icon: exportLoading === 'pdf' ? <LoadingSpinner size="sm" /> : <File className="h-4 w-4 text-red-500" />,
      onClick: () => handleExportWithLoading('pdf'),
      disabled: exportLoading !== null,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading === 'excel' ? <LoadingSpinner size="sm" /> : <FileSpreadsheet className="h-4 w-4 text-green-500" />,
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Adjustments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage inventory adjustments and corrections</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefreshWithLoading}
            disabled={refreshLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshLoading ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>

          <button
            onClick={() => navigate('/inventory/adjustments/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Adjustment
          </button>

          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteWithConfirm}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            importIcon={importLoading ? <LoadingSpinner size="sm" /> : <Upload className="h-4 w-4 text-blue-500" />}
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
                placeholder="Search Adjustment No / Reason..."
                value={filters.searchQuery}
                onChange={(e) => { setFilters({ ...filters, searchQuery: e.target.value }); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value as InventoryAdjustment['status'] | 'all' }); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="adjusted">Adjusted</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-400" />
            <select
              value={filters.type}
              onChange={(e) => { setFilters({ ...filters, type: e.target.value as InventoryAdjustment['type'] | 'all' }); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="quantity">Quantity</option>
              <option value="weight">Weight</option>
              <option value="value">Value</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => { setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } }); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => { setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } }); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
        emptyIcon={<FileText className="h-12 w-12 text-gray-300" />}
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