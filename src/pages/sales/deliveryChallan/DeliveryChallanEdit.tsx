// src/pages/sales/deliveryChallan/DeliveryChallanEdit.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Truck,
  MapPin,
  Building2,
  Mail,
  Phone,
  FileText,
  Users,
  AlertCircle,
  Truck as TruckIcon,
  RefreshCw,
} from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { useDeliveryChallanEdit } from '../../../hooks/DeliveryChallan/useDeliveryChallanEdit';
import ErrorSummary from '../../../components/common/ErrorSummary';
import {
  validateDeliveryChallanForm,
  formatValidationErrors,
  type ValidationResult,
} from '../../../validations/deliveryChallan.validation';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';

// ============================================================
// MOCK DATA - Consolidated single source of truth
// ============================================================

// Customer options
const MOCK_CUSTOMERS: DropdownOption[] = [
  { value: 'CUST-001', label: 'Rajesh Jewelers', group: 'Regular' },
  { value: 'CUST-002', label: 'Priya Gold House', group: 'Regular' },
  { value: 'CUST-003', label: 'Amit Diamond Co.', group: 'VIP' },
  { value: 'CUST-004', label: 'Sneha Jewellery', group: 'Regular' },
  { value: 'CUST-005', label: 'Vikram Gems', group: 'Corporate' },
];

// Customer details lookup - Single source of truth
const CUSTOMER_DETAILS: Record<string, any> = {
  'CUST-001': { 
    name: 'Rajesh Jewelers', 
    email: 'rajesh@jewelers.com', 
    phone: '+91-98765-43210', 
    address: '123, Jewelry Market, Mumbai', 
    gst: '22AAAAA0000A1Z5' 
  },
  'CUST-002': { 
    name: 'Priya Gold House', 
    email: 'priya@goldhouse.com', 
    phone: '+91-98765-43211', 
    address: '45, Gold Street, Chennai', 
    gst: '22BBBBB0000B1Z5' 
  },
  'CUST-003': { 
    name: 'Amit Diamond Co.', 
    email: 'amit@diamond.com', 
    phone: '+91-98765-43212', 
    address: '789, Diamond Plaza, Surat', 
    gst: '22CCCCC0000C1Z5' 
  },
  'CUST-004': { 
    name: 'Sneha Jewellery', 
    email: 'sneha@jewellery.com', 
    phone: '+91-98765-43213', 
    address: '321, Jewel Lane, Jaipur', 
    gst: '22DDDDD0000D1Z5' 
  },
  'CUST-005': { 
    name: 'Vikram Gems', 
    email: 'vikram@gems.com', 
    phone: '+91-98765-43214', 
    address: '654, Gem Tower, Mumbai', 
    gst: '22EEEEE0000E1Z5' 
  },
};

// Product suggestions - Single source of truth
const MOCK_PRODUCTS = [
  { id: '1', name: 'Gold Ring', code: 'GR-001', category: 'Ring', purity: '22K', price: 7500, description: '22K Gold Ring with diamond', unit: 'Pcs' },
  { id: '2', name: 'Gold Chain', code: 'GC-001', category: 'Chain', purity: '22K', price: 4500, description: '22K Gold Chain with pendant', unit: 'Pcs' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', category: 'Earring', purity: '22K', price: 3200, description: '22K Gold Earrings with pearl', unit: 'Pair' },
  { id: '4', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', purity: '18K', price: 8500, description: '18K Diamond Ring with 0.5ct diamond', unit: 'Pcs' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', category: 'Bracelet', purity: '22K', price: 3800, description: '22K Gold Bracelet with diamonds', unit: 'Pcs' },
  { id: '6', name: 'Silver Necklace', code: 'SN-001', category: 'Necklace', purity: '18K', price: 2800, description: '18K Silver Necklace with chain', unit: 'Pcs' },
];

// Default columns configuration for Delivery Challan
const deliveryChallanColumns: any[] = [
  { key: 'productName', label: 'Product' },
  { key: 'description', label: 'Description' },
  { key: 'quantity', label: 'Qty' },
  { key: 'unit', label: 'Unit' },
  { key: 'rate', label: 'Rate' },
  { key: 'discount', label: 'Discount' },
  { key: 'taxRate', label: 'Tax' },
  { key: 'total', label: 'Total' },
];

// Status badge color mapping
const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'var(--surface-hover)', text: 'var(--foreground-secondary)' },
  sent: { bg: 'var(--success-light)', text: 'var(--success)' },
  delivered: { bg: 'var(--info-light)', text: 'var(--info)' },
  cancelled: { bg: 'var(--error-light)', text: 'var(--error)' },
};

const DeliveryChallanEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    formData,
    errors: hookErrors,
    loading,
    refreshing,
    saving,
    submitLoading,
    productSearch,
    productSuggestions,
    isEditable,
    totals,
    challanStatus,
    updateFormData,
    updateItem,
    addItem,
    removeItem,
    handleSubmit,
    handleRefresh,
    setProductSearch,
  } = useDeliveryChallanEdit(id);

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

  const [items, setItems] = useState<ItemSelectionItem[]>(formData?.items || []);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
  });

  // Snapshot the loaded form once, to detect unsaved changes on Cancel
  const initialSnapshotRef = useRef<string | null>(null);
  useEffect(() => {
    if (!loading && initialSnapshotRef.current === null && formData) {
      initialSnapshotRef.current = JSON.stringify(formData);
      // Set items from formData
      if (formData.items) {
        setItems(formData.items.map((item: any) => ({
          productId: item.productId || '',
          productName: item.productName || '',
          description: item.description || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'Pcs',
          rate: item.rate || 0,
          discount: item.discount || 0,
          discountType: 'percentage' as const,
          taxRate: item.taxRate || 0,
          taxAmount: item.taxAmount || 0,
          total: item.total || 0,
          purity: item.purity || '22K',
        })));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, formData]);

  const hasUnsavedChanges = Boolean(
    initialSnapshotRef.current !== null && 
    formData && 
    JSON.stringify(formData) !== initialSnapshotRef.current
  );

  // Surface load errors as a toast
  const hasShownLoadErrorRef = useRef(false);
  useEffect(() => {
    if (hookErrors?.load && !hasShownLoadErrorRef.current) {
      hasShownLoadErrorRef.current = true;
      showError(hookErrors.load);
    }
    if (!hookErrors?.load) {
      hasShownLoadErrorRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookErrors?.load]);

  // Show error if id is missing
  useEffect(() => {
    if (!id) {
      showError('Invalid delivery challan ID. Redirecting back...');
      setTimeout(() => navigate('/sales/delivery-challan'), 2000);
    }
  }, [id, navigate, showError]);

  // Handle customer selection from dropdown
  const handleCustomerSelect = useCallback((selectedOption: DropdownOption) => {
    const details = CUSTOMER_DETAILS[selectedOption.value];
    if (details) {
      updateFormData('customerId', selectedOption.value);
      updateFormData('customerName', details.name || selectedOption.label);
      updateFormData('customerEmail', details.email || '');
      updateFormData('customerPhone', details.phone || '');
      updateFormData('customerGst', details.gst || '');
      updateFormData('customerAddress', details.address || '');
      updateFormData('deliveryAddress', details.address || '');
    } else {
      updateFormData('customerId', selectedOption.value);
      updateFormData('customerName', selectedOption.label);
    }
    // Clear customer error when selected
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.customerId;
      delete newErrors.customerName;
      return newErrors;
    });
  }, [updateFormData]);

  // Handle items change from ItemSelectionTable
  const handleItemsChange = useCallback((newItems: ItemSelectionItem[]) => {
    setItems(newItems);
    const convertedItems = newItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      description: item.description || '',
      quantity: item.quantity || 1,
      unit: item.unit || 'Pcs',
      rate: item.rate || 0,
      discount: item.discount || 0,
      taxRate: item.taxRate || 0,
      taxAmount: item.taxAmount || 0,
      total: item.total || 0,
      purity: item.purity || '22K',
    }));
    updateFormData('items', convertedItems);
    // Clear items error when items change
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.items;
      return newErrors;
    });
  }, [updateFormData]);

  const validateForm = useCallback((): boolean => {
    const result = validateDeliveryChallanForm(formData || { items: [] }, items);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result);
    setValidationErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, items]);

  // Handle form submit with loading toast
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }
    
    await withLoading(
      async () => {
        const result = await handleSubmit();
        if (!result) {
          throw new Error('Validation failed');
        }
        navigate('/sales/delivery-challan');
      },
      'Updating delivery challan...',
      'Delivery challan updated successfully.',
      'Failed to update delivery challan. Please try again.'
    );
  }, [validateForm, showError, withLoading, handleSubmit, navigate]);

  // Refresh handler with confirmation for unsaved changes
  const onRefresh = useCallback(async () => {
    if (hasUnsavedChanges) {
      await withConfirmation(
        {
          title: 'Refresh Data',
          message: 'You have unsaved changes. Refreshing will discard all changes. Are you sure?',
          confirmText: 'Refresh',
          variant: 'warning',
        },
        async () => {
          await handleRefresh();
          initialSnapshotRef.current = JSON.stringify(formData);
        },
        'Delivery challan data refreshed.',
        'Failed to refresh. Please try again.'
      );
    } else {
      await withLoading(
        async () => {
          await handleRefresh();
          initialSnapshotRef.current = JSON.stringify(formData);
        },
        'Refreshing data...',
        'Delivery challan data refreshed.',
        'Failed to refresh. Please try again.'
      );
    }
  }, [hasUnsavedChanges, withConfirmation, withLoading, handleRefresh, formData]);

  // Cancel handler - confirm before discarding unsaved changes
  const handleCancel = useCallback(async () => {
    if (!hasUnsavedChanges) {
      navigate('/sales/delivery-challan');
      return;
    }

    await withConfirmation(
      {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/sales/delivery-challan');
      }
    );
  }, [hasUnsavedChanges, withConfirmation, navigate]);

  // Check if there are any errors
  const hasErrors = Object.keys(validationErrors).length > 0 || Object.keys(hookErrors).length > 0;

  // If no id provided, show error state
  if (!id) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--error)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Invalid delivery challan ID
          </p>
          <button
            onClick={() => navigate('/sales/delivery-challan')}
            className="mt-4 px-4 py-2 rounded-lg transition-colors themed-transition"
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
            Back to Delivery Challans
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Truck className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Delivery Challan not found
          </p>
          <button
            onClick={() => navigate('/sales/delivery-challan')}
            className="mt-4 px-4 py-2 rounded-lg transition-colors themed-transition"
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
            Back to Delivery Challans
          </button>
        </div>
      </div>
    );
  }

  // Get status colors
  const statusColors = STATUS_COLORS[challanStatus || 'draft'] || STATUS_COLORS.draft;

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg transition-colors themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1
                className="text-2xl font-semibold flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <Truck className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                Edit Delivery Challan
              </h1>
              <p
                className="text-sm themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {formData.challanNumber ? `Editing ${formData.challanNumber}` : 'Edit delivery challan'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {challanStatus && (
              <span
                className="px-3 py-1 text-xs font-medium rounded-full themed-transition"
                style={{
                  background: statusColors.bg,
                  color: statusColors.text,
                }}
              >
                {challanStatus.charAt(0).toUpperCase() + challanStatus.slice(1)}
              </span>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg transition-colors disabled:opacity-50 themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!refreshing) {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={saving || submitLoading || !isEditable}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!saving && !submitLoading && isEditable) {
                  e.currentTarget.style.background = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
            >
              {saving || submitLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Challan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Warning for non-draft */}
        {!isEditable && (
          <div
            className="mb-6 p-4 rounded-lg flex items-start gap-3 themed-transition"
            style={{
              background: 'var(--warning-light)',
              border: '1px solid var(--warning)',
            }}
          >
            <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: 'var(--warning)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                This challan is in <strong>{challanStatus}</strong> status and cannot be edited.
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--foreground-secondary)' }}>
                Only draft challans can be modified.
              </p>
            </div>
          </div>
        )}

        {/* Error summary - Submit errors */}
        {(hookErrors.submit || validationErrors.submit) && (
          <ErrorSummary
            errors={{ submit: hookErrors.submit || validationErrors.submit || '' }}
            title="Form Error:"
            variant="error"
          />
        )}

        {/* Validation Error Summary */}
        {hasErrors && !hookErrors.submit && !validationErrors.submit && (
          <ErrorSummary
            errors={validationErrors}
            title="Please fix the following errors:"
            variant="warning"
            maxDisplay={5}
          />
        )}

        {/* Load error */}
        {hookErrors?.load && (
          <div
            className="mb-6 p-4 rounded-lg flex items-start gap-3 themed-transition"
            style={{
              background: 'var(--error-light)',
              border: '1px solid var(--error)',
            }}
          >
            <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: 'var(--error)' }} />
            <div className="flex-1">
              <p className="text-sm" style={{ color: 'var(--error)' }}>
                {hookErrors.load}
              </p>
              <button
                onClick={onRefresh}
                className="mt-2 text-sm font-medium flex items-center gap-1 themed-transition"
                style={{ color: 'var(--error)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Information */}
          <div
            className="rounded-lg p-6 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              <FileText className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Challan Number <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.challanNumber || ''}
                  onChange={(e) => updateFormData('challanNumber', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: `1px solid ${validationErrors.challanNumber ? 'var(--error)' : 'var(--border)'}`,
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = validationErrors.challanNumber ? 'var(--error)' : 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter challan number"
                />
                {validationErrors.challanNumber && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {validationErrors.challanNumber}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Challan Date <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.challanDate || ''}
                  onChange={(e) => updateFormData('challanDate', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: `1px solid ${validationErrors.challanDate ? 'var(--error)' : 'var(--border)'}`,
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = validationErrors.challanDate ? 'var(--error)' : 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {validationErrors.challanDate && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {validationErrors.challanDate}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate || ''}
                  onChange={(e) => updateFormData('deliveryDate', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: '1px solid var(--border)',
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Customer Section - Using SearchableDropdown */}
          <div
            className="rounded-lg p-6 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              <Users className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              Customer Details
            </h2>
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Select Customer <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <SearchableDropdown
                options={MOCK_CUSTOMERS}
                value={formData.customerId}
                onChange={handleCustomerSelect}
                placeholder="Search customer by name..."
                triggerPlaceholder="Select or search customer..."
                className="w-full max-w-full"
                showEmptyState={true}
                emptyStateText="No customers found"
                resetSearchOnOpen={true}
                disabled={!isEditable}
              />
              {validationErrors.customerId && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                  {validationErrors.customerId}
                </p>
              )}
            </div>

            {formData.customerName && (
              <div
                className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg themed-transition"
                style={{
                  background: 'var(--primary-light)',
                }}
              >
                <div>
                  <p
                    className="text-sm font-medium themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {formData.customerName}
                  </p>
                  {formData.customerEmail && (
                    <p
                      className="text-sm flex items-center gap-2 mt-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      <Mail className="h-4 w-4" /> {formData.customerEmail}
                    </p>
                  )}
                  {formData.customerPhone && (
                    <p
                      className="text-sm flex items-center gap-2 mt-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      <Phone className="h-4 w-4" /> {formData.customerPhone}
                    </p>
                  )}
                </div>
                <div>
                  {formData.customerGst && (
                    <p
                      className="text-sm flex items-center gap-2 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      <FileText className="h-4 w-4" /> GST: {formData.customerGst}
                    </p>
                  )}
                  {formData.customerAddress && (
                    <p
                      className="text-sm flex items-center gap-2 mt-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      <Building2 className="h-4 w-4" /> {formData.customerAddress}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div
            className="rounded-lg p-6 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              <MapPin className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              Delivery Address
            </h2>
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Delivery Address <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <textarea
                value={formData.deliveryAddress || ''}
                onChange={(e) => updateFormData('deliveryAddress', e.target.value)}
                disabled={!isEditable}
                rows={3}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                style={{
                  border: `1px solid ${validationErrors.deliveryAddress ? 'var(--error)' : 'var(--border)'}`,
                  background: isEditable ? 'var(--background)' : 'var(--surface)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  if (isEditable) {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = validationErrors.deliveryAddress ? 'var(--error)' : 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter delivery address..."
              />
              {validationErrors.deliveryAddress && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                  {validationErrors.deliveryAddress}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <ItemSelectionTable
            items={items}
            onItemsChange={handleItemsChange}
            productSuggestions={productSuggestions}
            productSearch={productSearch}
            onProductSearchChange={setProductSearch}
            errors={validationErrors}
            columns={deliveryChallanColumns}
            showJewelryFields={true}
            showDescription={true}
            showDiscount={true}
            showTax={true}
            showUnit={true}
            showPurity={true}
            showMakingCharges={false}
            showWeightFields={false}
            showSubtotalSection={true}
            showTotalSection={true}
            searchPlaceholder="Search jewelry items..."
            addButtonLabel="Add Item"
            title="Jewelry Items"
            additionalCharges={[]}
            autoAddDefaultRow={false}
            addButtonAtBottom={true}
            className={!isEditable ? 'pointer-events-none opacity-75' : ''}
          />
          {validationErrors.items && (
            <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
              {validationErrors.items}
            </p>
          )}

          {/* Transport Details */}
          <div
            className="rounded-lg p-6 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              <TruckIcon className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              Transport Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Transporter Name
                </label>
                <input
                  type="text"
                  value={formData.transporterName || ''}
                  onChange={(e) => updateFormData('transporterName', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: '1px solid var(--border)',
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter transporter name"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Vehicle Number
                </label>
                <input
                  type="text"
                  value={formData.vehicleNumber || ''}
                  onChange={(e) => updateFormData('vehicleNumber', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: '1px solid var(--border)',
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter vehicle number"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  LR Number
                </label>
                <input
                  type="text"
                  value={formData.lrNumber || ''}
                  onChange={(e) => updateFormData('lrNumber', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: '1px solid var(--border)',
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter LR number"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  LR Date
                </label>
                <input
                  type="date"
                  value={formData.lrDate || ''}
                  onChange={(e) => updateFormData('lrDate', e.target.value)}
                  disabled={!isEditable}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: '1px solid var(--border)',
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div
            className="rounded-lg p-6 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-4 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              Payment Terms
            </h2>
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Payment Terms
              </label>
              <select
                value={formData.paymentTerms || 'Net 15'}
                onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                disabled={!isEditable}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                style={{
                  border: '1px solid var(--border)',
                  background: isEditable ? 'var(--background)' : 'var(--surface)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  if (isEditable) {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="Net 7">Net 7</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="COD">COD</option>
                <option value="Advance">Advance</option>
              </select>
            </div>
          </div>

          {/* Notes & Terms */}
          <div
            className="rounded-lg p-6 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  disabled={!isEditable}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: '1px solid var(--border)',
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter any notes..."
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Terms & Conditions
                </label>
                <textarea
                  value={formData.termsAndConditions || ''}
                  onChange={(e) => updateFormData('termsAndConditions', e.target.value)}
                  disabled={!isEditable}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                  style={{
                    border: '1px solid var(--border)',
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    if (isEditable) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder="Enter terms and conditions..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {saving && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div
            className="rounded-lg p-8 flex flex-col items-center themed-transition"
            style={{
              background: 'var(--card)',
            }}
          >
            <LoadingSpinner size="lg" />
          </div>
        </div>
      )}

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

export default DeliveryChallanEdit;