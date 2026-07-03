// src/pages/Items/Items.tsx
import React, { useState, useCallback } from 'react';
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
  Grid,
  List,
  Trash2,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../components/common/ThreeDotDropdown';
import type { ThreeDotDropdownItem } from '../../components/common/ThreeDotDropdown';
import ReusableTable from '../../components/common/ReusableTable';
import type { TableColumn } from '../../components/common/ReusableTable';
import Pagination from '../../components/common/Pagination';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useItems } from '../../hooks/items/useItems';
import { useToastAndConfirm } from '../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { Item } from '../../types/items/Itemstype';

const Items: React.FC = () => {
  const navigate = useNavigate();
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

  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

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

  const handleView = useCallback((item: Item) => {
    navigate(`/items/${item.id}`);
  }, [navigate]);

  const handleEdit = useCallback((item: Item) => {
    navigate(`/items/${item.id}/edit`);
  }, [navigate]);

  // Delete single item with confirmation
  const handleDeleteWithConfirm = useCallback(async (item: Item) => {
    await withConfirmation(
      {
        title: 'Delete Item',
        message: `Are you sure you want to delete "${item.itemName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(item.id);
        try {
          await handleDelete(item.id);
          success(`"${item.itemName}" deleted successfully!`);
        } catch (err) {
          showError(`Failed to delete "${item.itemName}"`);
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, handleDelete, success, showError]);

  // Bulk delete with confirmation
  const handleBulkDeleteWithConfirm = useCallback(async () => {
    if (selectedItems.length === 0) {
      warning('Please select items to delete');
      return;
    }

    await withConfirmation(
      {
        title: 'Delete Multiple Items',
        message: `Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`,
        confirmText: 'Delete All',
        cancelText: 'Cancel',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          await handleBulkDelete();
          success(`${selectedItems.length} items deleted successfully!`);
        } catch (err) {
          showError('Failed to delete items');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, handleBulkDelete, success, showError, warning]);

  const handleRefreshWithLoading = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await handleRefresh();
      success('Items refreshed successfully!');
    } catch (err) {
      showError('Failed to refresh items');
    } finally {
      setRefreshLoading(false);
    }
  }, [handleRefresh, success, showError]);

  const handleExportWithLoading = useCallback(async () => {
    if (items.length === 0) {
      warning('No items to export');
      return;
    }

    setExportLoading(true);
    try {
      await handleExport();
      success(`Successfully exported ${items.length} items!`);
    } catch (err) {
      showError('Failed to export items');
    } finally {
      setExportLoading(false);
    }
  }, [items.length, handleExport, success, showError, warning]);

  const handleImportWithLoading = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await handleRefresh();
        success(`Successfully imported ${files.length} file(s)`);
      } catch (err) {
        console.error('Import error:', err);
        showError('Failed to import files. Please check the file format.');
      } finally {
        setImportLoading(false);
        event.target.value = '';
      }
    }
  }, [handleRefresh, success, showError]);

  const handleSelectAllWrapper = useCallback(() => {
    const shouldSelectAll = selectedItems.length !== currentItems.length;
    handleSelectAll(shouldSelectAll);
  }, [selectedItems.length, currentItems.length, handleSelectAll]);

  const handleSelectItemWrapper = useCallback((id: string) => {
    const checked = !selectedItems.includes(id);
    handleSelectItem(id, checked);
  }, [selectedItems, handleSelectItem]);

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
  ];

  const headerDropdownItems: ThreeDotDropdownItem[] = [
    {
      label: 'Export as PDF',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <File className="h-4 w-4 text-red-500" />
      ),
      onClick: handleExportWithLoading,
      disabled: exportLoading,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-green-500" />
      ),
      onClick: handleExportWithLoading,
      disabled: exportLoading,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading items..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your inventory items
            {items.length > 0 && (
              <span className="ml-2 text-xs text-gray-400">
                (Total: {items.length} items)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteWithConfirm}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkDeleteLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Selected ({selectedItems.length})
            </button>
          )}
          
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>

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

          <ThreeDotDropdown 
            items={headerDropdownItems} 
            position="right"
            onImport={handleImportWithLoading}
            importLabel="Import Items"
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

      {/* Table View */}
      {viewMode === 'table' ? (
        <ReusableTable
          data={currentItems}
          columns={columns}
          selectable={true}
          selectedItems={selectedItems}
          onSelectAll={handleSelectAllWrapper}
          onSelectItem={handleSelectItemWrapper}
          getId={(item) => item.id}
          onRowClick={handleView}
          emptyMessage="No items found"
          emptyIcon={<Package className="h-12 w-12 text-gray-300" />}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage: itemsPerPage || 10,
            onPageChange: setCurrentPage,
            onItemsPerPageChange: handleItemsPerPageChange,
            itemsPerPageOptions: [10, 20, 50, 100, 200],
          }}
        />
      ) : (
        // Grid View
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleView(item)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{item.itemName}</h3>
                    <p className="text-xs text-gray-500">{item.itemCode}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="text-gray-700">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Metal</span>
                    <span className="text-gray-700">{item.metalType} - {item.purity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stock</span>
                    <span className={`font-medium ${item.openingStock <= item.reorderLevel ? 'text-red-600' : 'text-gray-700'}`}>
                      {item.openingStock} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price</span>
                    <span className="font-medium text-amber-600">₹{item.sellingPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination for Grid View */}
          {currentItems.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage || 10}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[10, 20, 50, 100, 200]}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              />
            </div>
          )}
        </>
      )}

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

export default Items;