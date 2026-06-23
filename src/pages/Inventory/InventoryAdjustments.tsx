// src/pages/Inventory/InventoryAdjustments.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
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
import type { TableColumn, TableAction } from '../../components/common/ReusableTable';
import { useInventoryAdjustments } from '../../hooks/inventory/useInventoryAdjustments';
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

  const handleView = (adjustment: InventoryAdjustment) => {
    navigate(`/inventory/adjustments/${adjustment.id}`);
  };

  const handleEdit = (adjustment: InventoryAdjustment) => {
    navigate(`/inventory/adjustments/edit/${adjustment.id}`);
  };

  const handleDeleteWithLoading = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this adjustment?')) {
      setDeleteLoading(id);
      try {
        await handleDelete(id);
        setSelectedItems(prev => prev.filter(itemId => itemId !== id));
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleBulkDeleteWithLoading = async () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} adjustment(s)?`)) {
      setBulkDeleteLoading(true);
      try {
        await handleBulkDelete(selectedItems);
        setSelectedItems([]);
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  const handleRefreshWithLoading = async () => {
    setRefreshLoading(true);
    try {
      await handleRefresh();
      setSelectedItems([]);
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleExportWithLoading = async (format: 'excel' | 'pdf') => {
    setExportLoading(format);
    try {
      await handleExport(format);
    } finally {
      setExportLoading(null);
    }
  };

  const handleImportWithLoading = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportLoading(true);
      try {
        await handleImport(files);
        await handleRefresh();
        alert(`Successfully imported ${files.length} file(s)`);
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import files. Please check the file format.');
      } finally {
        setImportLoading(false);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map((item: { id: any; }) => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Handle row click - navigate to view page
  const handleRowClick = (adjustment: InventoryAdjustment) => {
    navigate(`/inventory/adjustments/${adjustment.id}`);
  };

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
      header: 'Created Time',
      render: (item) => <span className="text-sm text-gray-600">{formatDateTime(item.createdAt)}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Last Modified',
      render: (item) => <span className="text-sm text-gray-600">{formatDateTime(item.updatedAt)}</span>,
    },
  ];

  // Table Actions
  const actions: TableAction<InventoryAdjustment>[] = [
    {
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => handleView(item),
      label: 'View',
      className: 'text-gray-400 hover:text-blue-500 hover:bg-blue-50',
    },
    {
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => handleEdit(item),
      label: 'Edit',
      className: 'text-gray-400 hover:text-amber-500 hover:bg-amber-50',
      show: (item) => item.status === 'draft' || item.status === 'pending',
    },
    {
      icon: deleteLoading ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />,
      onClick: (item) => handleDeleteWithLoading(item.id),
      label: 'Delete',
      className: 'text-gray-400 hover:text-red-500 hover:bg-red-50',
      show: (item) => item.status === 'draft' || item.status === 'pending',
      disabled: (item) => deleteLoading === item.id,
    },
    {
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (item) => handleStatusUpdate(item.id, 'adjusted'),
      label: 'Approve',
      className: 'text-green-400 hover:text-green-600 hover:bg-green-50',
      show: (item) => item.status === 'pending',
    },
  ];

  // Three-dot dropdown items
  const dropdownItems = [
    {
      label: 'Export as PDF',
      icon: <File className="h-4 w-4 text-red-500" />,
      onClick: () => handleExportWithLoading('pdf'),
    },
    {
      label: 'Export as Excel',
      icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
      onClick: () => handleExportWithLoading('excel'),
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
              onClick={handleBulkDeleteWithLoading}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkDeleteLoading ? <LoadingSpinner size="sm" /> : <Trash className="h-4 w-4" />}
              Delete Selected ({selectedItems.length})
            </button>
          )}

          {/* Three Dot Dropdown with Import option */}
          <ThreeDotDropdown 
            items={dropdownItems} 
            position="right"
            onImport={handleImportWithLoading}
            importLabel="Import Adjustments"
            importIcon={<Upload className="h-4 w-4 text-blue-500" />}
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

      {/* Reusable Table with Full Pagination and Row Click */}
      <ReusableTable
        data={currentItems}
        columns={columns}
        actions={actions}
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
          startIndex,
          endIndex,
          onPageChange: setCurrentPage,
          itemsPerPage: itemsPerPage || 5,
        }}
      />
    </div>
  );
};

export default InventoryAdjustments;