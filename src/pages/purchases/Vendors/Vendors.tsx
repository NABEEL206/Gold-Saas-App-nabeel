// src/pages/purchases/Vendors/Vendors.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Users,
  Building2,
  CheckCircle,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  File,
  Upload,
  Trash,
} from 'lucide-react';
import { useVendor } from '../../../hooks/vendor/useVendor';
import type { Vendor } from '../../../types/Vendor/VendorType';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { TableColumn } from '../../../components/common/ReusableTable';
import { 
  validateVendorForm, 
  formatValidationErrors,
  hasValidationErrors,
  getErrorCount 
} from '../../../validations/vendor.validation';

// Status Badge Component
const StatusBadge: React.FC<{ status: Vendor['status'] }> = ({ status }) => {
  const config = {
    active: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Inactive' },
  };
  const defaultConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = config[status as keyof typeof config] || defaultConfig;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const Vendors: React.FC = () => {
  const navigate = useNavigate();
  const {
    vendors,
    loading,
    error,
    filters,
    pagination,
    deleteVendor,
    updateFilters,
    changePage,
    fetchVendors,
  } = useVendor({ page: 1, limit: 10 });

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
  
  // Validation state for bulk operations
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  const handleView = useCallback((vendor: Vendor) => {
    navigate(`/purchases/vendors/${vendor.id}`);
  }, [navigate]);

  const handleEdit = useCallback((vendor: Vendor) => {
    navigate(`/purchases/vendors/${vendor.id}/edit`);
  }, [navigate]);

  // Single delete handler using confirmation modal
  const handleDeleteClick = useCallback(async (vendor: Vendor) => {
    const vendorId = String(vendor.id);

    await withConfirmation(
      {
        title: 'Delete Vendor',
        message: `Are you sure you want to delete "${vendor.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(vendorId);
        try {
          await deleteVendor(vendor.id);
          setSelectedItems(prev => prev.filter(item => item !== vendorId));
          success(`Vendor "${vendor.name}" deleted successfully.`);
          // Clear validation errors on success
          setValidationErrors({});
          setShowValidationSummary(false);
        } catch (error) {
          console.error('Error deleting vendor:', error);
          showError('Failed to delete vendor. Please try again.');
        } finally {
          setDeleteLoading(null);
        }
      }
    );
  }, [withConfirmation, deleteVendor, success, showError]);

  // Bulk delete handler with validation
  const handleBulkDeleteAction = useCallback(async () => {
    if (selectedItems.length === 0) {
      // Set validation error
      setValidationErrors({
        selection: 'Please select at least one vendor to delete.'
      });
      setShowValidationSummary(true);
      showError('Please select at least one vendor to delete.');
      return;
    }

    // Clear validation errors
    setValidationErrors({});
    setShowValidationSummary(false);

    await withConfirmation(
      {
        title: 'Delete Vendors',
        message: `Are you sure you want to delete ${selectedItems.length} vendor(s)? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setBulkDeleteLoading(true);
        try {
          for (const id of selectedItems) {
            await deleteVendor(id);
          }
          success(`${selectedItems.length} vendor(s) deleted successfully.`);
          setSelectedItems([]);
        } catch (error) {
          console.error('Error deleting vendors:', error);
          showError('Failed to delete vendors. Please try again.');
        } finally {
          setBulkDeleteLoading(false);
        }
      }
    );
  }, [selectedItems, withConfirmation, deleteVendor, success, showError]);

  // Export handler with validation
  const handleExportAction = useCallback(async (format: 'excel' | 'pdf') => {
    // Validate if there are vendors to export
    if (vendors.length === 0) {
      setValidationErrors({
        export: `No vendors available to export as ${format.toUpperCase()}.`
      });
      setShowValidationSummary(true);
      showError(`No vendors available to export as ${format.toUpperCase()}.`);
      return;
    }

    // Clear validation errors
    setValidationErrors({});
    setShowValidationSummary(false);

    setExportLoading(true);
    try {
      // Replace with actual export logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Vendors exported as ${format.toUpperCase()} successfully.`);
    } catch (error) {
      showError(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportLoading(false);
    }
  }, [vendors.length, success, showError]);

  // Import handler with validation
  const handleImportAction = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Validate file type
      const file = files[0];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setValidationErrors({
          import: 'Please upload a valid file (CSV, XLSX, or XLS format).'
        });
        setShowValidationSummary(true);
        showError('Invalid file format. Please upload CSV, XLSX, or XLS file.');
        event.target.value = '';
        return;
      }

      // Clear validation errors
      setValidationErrors({});
      setShowValidationSummary(false);

      setImportLoading(true);
      try {
        // Replace with actual import logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchVendors();
        success('Vendors imported successfully.');
      } catch (error) {
        showError('Failed to import vendors. Please check the file format.');
      } finally {
        setImportLoading(false);
        event.target.value = '';
      }
    }
  }, [fetchVendors, success, showError]);

  const handleRefreshClick = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchVendors();
      success('Vendor list refreshed successfully.');
      // Clear validation errors on refresh
      setValidationErrors({});
      setShowValidationSummary(false);
    } catch (error) {
      showError('Failed to refresh vendor list. Please try again.');
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchVendors, success, showError]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === vendors.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(vendors.map(item => String(item.id)));
    }
  }, [selectedItems.length, vendors]);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    // Clear selection validation errors when user selects items
    if (validationErrors.selection) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.selection;
        return newErrors;
      });
      if (Object.keys(validationErrors).length === 1) {
        setShowValidationSummary(false);
      }
    }
  }, [validationErrors]);

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  // Columns
  const columns: TableColumn<Vendor>[] = [
    {
      key: 'name',
      header: 'Vendor',
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.company || '-'}</span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.phone || '-'}</span>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.contactPerson || '-'}</span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {item.city && item.state ? `${item.city}, ${item.state}` : '-'}
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
        <File className="h-4 w-4 text-red-500" />
      ),
      onClick: () => handleExportAction('pdf'),
      disabled: exportLoading,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-green-500" />
      ),
      onClick: () => handleExportAction('excel'),
      disabled: exportLoading,
    },
  ];

  // Dropdown items for each row
  const getRowDropdownItems = (vendor: Vendor) => [
    {
      label: 'View Details',
      icon: <Users className="h-4 w-4 text-blue-500" />,
      onClick: () => handleView(vendor),
    },
    {
      label: 'Edit Vendor',
      icon: <Building2 className="h-4 w-4 text-green-500" />,
      onClick: () => handleEdit(vendor),
    },
    {
      label: deleteLoading === vendor.id ? 'Deleting...' : 'Delete',
      icon: deleteLoading === vendor.id ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash className="h-4 w-4 text-red-500" />
      ),
      onClick: () => handleDeleteClick(vendor),
      danger: true,
      disabled: deleteLoading === vendor.id,
    },
  ];

  // Show main loading spinner
  if (loading && vendors.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading vendors..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your vendor database</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefreshClick}
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
            onClick={() => navigate('/purchases/vendors/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Vendor
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteAction}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkDeleteLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              Delete ({selectedItems.length})
            </button>
          )}
          <ThreeDotDropdown
            items={headerDropdownItems}
            position="right"
            onImport={handleImportAction}
            importLabel="Import Vendors"
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

      {/* Error Summary Component - Shows validation errors */}
      {showValidationSummary && Object.keys(validationErrors).length > 0 && (
        <ErrorSummary
          errors={validationErrors}
          title="Validation Errors:"
          variant="error"
          onClose={() => {
            setShowValidationSummary(false);
            setValidationErrors({});
          }}
          showIcon={true}
          showBadge={false}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, company, email, phone..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status || 'all'}
              onChange={(e) => updateFilters({ status: e.target.value === 'all' ? undefined : e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        data={vendors}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No vendors found"
        emptyIcon={<Users className="h-12 w-12 text-gray-300" />}
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

export default Vendors;