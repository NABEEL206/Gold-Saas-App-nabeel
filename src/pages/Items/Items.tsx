// src/pages/Items/Items.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  File,
  Upload,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../components/common/ThreeDotDropdown';
import type { ThreeDotDropdownItem } from '../../components/common/ThreeDotDropdown';
import ReusableTable from '../../components/common/ReusableTable';
import type { TableColumn } from '../../components/common/ReusableTable';
import { useItems } from '../../hooks/items/useItems';
import type { Item } from '../../types/items/Itemstype';

export const Items: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    items,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    currentItems,
    selectedItems,
    selectedStatus,
    itemsPerPage,
    setSearchQuery,
    setSelectedStatus,
    setCurrentPage,
    handleRefresh,
    handleDelete,
    handleBulkDelete,
    handleSelectAll,
    handleSelectItem,
    handleExport,
    handleItemsPerPageChange,
  } = useItems();

  // Local loading states for specific actions
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Fallback import handler (useItems doesn't provide handleImport)
  const handleImport = async (files?: FileList) => {
    try {
      setImportLoading(true);
      // noop: implement import logic if needed
    } finally {
      setImportLoading(false);
    }
  };

  // Status Badge
  const getStatusBadge = (status: Item['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Inactive' },
      out_of_stock: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Out of Stock' },
      low_stock: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Low Stock' },
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  // Actions with loading states
  const handleView = (item: Item) => {
    navigate(`/items/${item.id}`);
  };

  const handleBulkDeleteWithLoading = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      setBulkDeleteLoading(true);
      try {
        await handleBulkDelete();
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  const handleRefreshWithLoading = async () => {
    setRefreshLoading(true);
    try {
      await handleRefresh();
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleExportWithLoading = async () => {
    setExportLoading(true);
    try {
      await handleExport();
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportWithLoading = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportLoading(true);
      try {
        await handleImport(files);
        // Show success message or refresh data
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

  // Define table columns - REMOVED actions column
  const columns: TableColumn<Item>[] = [
    {
      key: 'itemCode',
      header: 'Item Code',
      render: (item) => <span className="font-medium text-gray-900">{item.itemCode}</span>,
    },
    {
      key: 'itemName',
      header: 'Item Name',
      render: (item) => <span className="text-gray-700">{item.itemName}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <span className="text-gray-600">{item.category}</span>,
    },
    {
      key: 'metalType',
      header: 'Metal',
      render: (item) => <span className="text-gray-600">{item.metalType}</span>,
    },
    {
      key: 'purity',
      header: 'Purity',
      render: (item) => <span className="text-gray-600">{item.purity}</span>,
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      render: (item) => (
        <span className={`font-medium ${item.openingStock <= item.reorderLevel ? 'text-red-600' : 'text-gray-900'}`}>
          {item.openingStock} {item.unit}
          {item.openingStock <= item.reorderLevel && (
            <span className="ml-1 text-xs text-red-500">(Low)</span>
          )}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (item) => (
        <span className="font-medium text-gray-900">₹{item.sellingPrice.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => getStatusBadge(item.status),
    },
    // ACTIONS COLUMN REMOVED - No longer needed
  ];

  // Three-dot dropdown items for the header actions (export, import)
  const headerDropdownItems = [
    {
      label: 'Export as PDF',
      icon: <File className="h-4 w-4 text-red-500" />,
      onClick: handleExportWithLoading,
    },
    {
      label: 'Export as Excel',
      icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
      onClick: handleExportWithLoading,
    },
  ];

  // Show main loading spinner
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading items..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your inventory items</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteWithLoading}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkDeleteLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Delete Selected ({selectedItems.length})
            </button>
          )}
          
          <button
            onClick={handleRefreshWithLoading}
            disabled={refreshLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>

          <button
            onClick={() => navigate('/items/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Item
          </button>

          {/* Three Dot Dropdown - with Import option */}
          <ThreeDotDropdown 
            items={headerDropdownItems} 
            position="right"
            onImport={handleImportWithLoading}
            importLabel="Import Items"
            importIcon={<Upload className="h-4 w-4 text-blue-500" />}
            importAccept=".csv,.xlsx,.xls"
            importMultiple={true}
          />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items by name, code or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reusable Table with Pagination - No actions column */}
      <ReusableTable
        data={currentItems}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => item.id}
        onRowClick={handleView}
        emptyMessage="No items found"
        emptyIcon={<Package className="h-12 w-12 text-gray-300" />}
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

export default Items;