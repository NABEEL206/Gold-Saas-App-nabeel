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
  getErrorCount,
} from '../../../validations/vendor.validation';

// ============================================================
// STATUS CONFIGURATION - Single source of truth
// ============================================================

const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  active: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Active',
  },
  inactive: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-secondary)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Inactive',
  },
};

// Status Badge Component
const StatusBadge: React.FC<{ status: Vendor['status'] }> = ({ status }) => {
  const config = status && STATUS_CONFIG[status] ? STATUS_CONFIG[status] : STATUS_CONFIG.inactive;
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
  
  // Validation state for operations
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
    // Validate selection
    if (selectedItems.length === 0) {
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
          // Validate each vendor before deletion (optional check)
          for (const id of selectedItems) {
            // You could validate vendor data here if needed
            // For example: check if vendor has associated records before deleting
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
      // Validate vendor data before export (optional)
      let hasInvalidData = false;
      const validationResults = vendors.map(vendor => {
        // Convert vendor to form data format for validation
        const formData = {
          name: vendor.name || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          company: vendor.company || '',
          address: vendor.address || '',
          city: vendor.city || '',
          state: vendor.state || '',
          country: vendor.country || '',
          zipCode: vendor.zipCode || '',
          taxId: vendor.taxId || '',
          website: vendor.website || '',
          notes: vendor.notes || '',
          status: vendor.status || 'active',
          contactPerson: vendor.contactPerson || '',
          contactEmail: vendor.contactEmail || '',
          contactPhone: vendor.contactPhone || '',
        };
        return validateVendorForm(formData);
      });

      // Check if any vendor has validation errors
      const invalidVendors = validationResults.filter(r => !r.isValid);
      if (invalidVendors.length > 0) {
        const errorCount = invalidVendors.reduce((sum, r) => sum + getErrorCount(r.errors), 0);
        warning(`Found ${invalidVendors.length} vendor(s) with ${errorCount} validation issue(s). Exporting anyway.`);
      }

      // Replace with actual export logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Vendors exported as ${format.toUpperCase()} successfully.`);
    } catch (error) {
      showError(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportLoading(false);
    }
  }, [vendors, success, showError, warning]);

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
        // Simulate file parsing and validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If you had actual file parsing, you would validate each record here
        // const importedData = parseFile(file);
        // const validationResults = importedData.map(record => validateVendorForm(record));
        // Check for invalid records and show appropriate messages
        
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
          <p
            className="text-sm font-medium themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            {item.name}
          </p>
          <p
            className="text-xs themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            {item.email}
          </p>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.company || '-'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.phone || '-'}
        </span>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          {item.contactPerson || '-'}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <span
          className="text-sm themed-transition"
          style={{ color: 'var(--foreground-secondary)' }}
        >
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

  // Dropdown items for each row
  const getRowDropdownItems = (vendor: Vendor) => [
    {
      label: 'View Details',
      icon: <Users className="h-4 w-4" style={{ color: 'var(--info)' }} />,
      onClick: () => handleView(vendor),
    },
    {
      label: 'Edit Vendor',
      icon: <Building2 className="h-4 w-4" style={{ color: 'var(--primary)' }} />,
      onClick: () => handleEdit(vendor),
    },
    {
      label: deleteLoading === String(vendor.id) ? 'Deleting...' : 'Delete',
      icon: deleteLoading === String(vendor.id) ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />
      ),
      onClick: () => handleDeleteClick(vendor),
      danger: true,
      disabled: deleteLoading === String(vendor.id),
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
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl font-bold themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            Vendors
          </h1>
          <p
            className="text-sm mt-0.5 themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Manage your vendor database
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

          {/* New Vendor Button */}
          <button
            onClick={() => navigate('/purchases/vendors/create')}
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
            New Vendor
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
            importLabel="Import Vendors"
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
                placeholder="Search by name, company, email, phone..."
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
              value={filters.status || 'all'}
              onChange={(e) => updateFilters({ status: e.target.value === 'all' ? undefined : e.target.value })}
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
        emptyIcon={<Users className="h-12 w-12" style={{ color: 'var(--foreground-tertiary)' }} />}
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