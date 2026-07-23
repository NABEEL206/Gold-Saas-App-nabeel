// src/pages/purchases/PurchaseOrders/PurchaseOrderCreate.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Mail, Phone, MapPin } from 'lucide-react';
import { usePurchaseOrder } from '../../../hooks/purchaseOrder/usePurchaseOrder';
import { usePurchaseOrderCreate } from '../../../hooks/purchaseOrder/usePurchaseOrderCreate';
import { useVendor } from '../../../hooks/vendor/useVendor';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import {
  PURCHASE_ORDER_STATUSES,
  PURCHASE_ORDER_PRIORITIES,
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_PRIORITY_LABELS,
} from '../../../types/purchaseOrder/PurchaseOrderType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// ============================================================
// CONSTANTS - Single source of truth
// ============================================================

// ─── Static option lists ───────────────────────────────────────────────────────
const PO_STATUS_OPTIONS: DropdownOption[] = PURCHASE_ORDER_STATUSES.map(s => ({
  value: s,
  label: PURCHASE_ORDER_STATUS_LABELS[s],
}));
const PO_PRIORITY_OPTIONS: DropdownOption[] = PURCHASE_ORDER_PRIORITIES.map(p => ({
  value: p,
  label: PURCHASE_ORDER_PRIORITY_LABELS[p],
}));

const CURRENCY_OPTIONS: DropdownOption[] = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

// ─── Product suggestions (replace with real API later) ────────────────────────
const PRODUCT_SUGGESTIONS = [
  { id: '1', name: 'Gold Ring 22K',    code: 'GR-001',  price: 7500,  unit: 'Pcs', description: '22K Gold Ring' },
  { id: '2', name: 'Gold Chain 22K',   code: 'GC-001',  price: 4500,  unit: 'Pcs', description: '22K Gold Chain' },
  { id: '3', name: 'Diamond Ring 18K', code: 'DR-001',  price: 8500,  unit: 'Pcs', description: '18K Diamond Ring' },
  { id: '4', name: 'Gold Bracelet',    code: 'GB-001',  price: 3800,  unit: 'Pcs', description: 'Gold Bracelet' },
  { id: '5', name: 'Silver Necklace',  code: 'SN-001',  price: 2800,  unit: 'Pcs', description: 'Silver Necklace' },
  { id: '6', name: 'Machine Parts',    code: 'MAC-001', price: 2000,  unit: 'Pcs', description: 'Industrial Parts' },
];

// Combined blur handler for input fields
const handleInputBlur = (field: string, e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, errors: Record<string, string>) => {
  e.currentTarget.style.borderColor = errors[field] ? 'var(--error)' : 'var(--border)';
  e.currentTarget.style.boxShadow = 'none';
};

// Focus handler for input fields
const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--primary)';
  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
};

// ─── Component ────────────────────────────────────────────────────────────────
const PurchaseOrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createOrder } = usePurchaseOrder();
  const { vendors } = useVendor();
  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleItemsChange,
    handleSubmit,
  } = usePurchaseOrderCreate();

  // Use the toast and confirm hook
  const {
    success,
    error: showError,
    warning: showWarning,
    withConfirmation,
    withLoading,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  // Vendor dropdown state
  const [vendorOptions, setVendorOptions] = useState<DropdownOption[]>([]);
  const [selectedVendorInfo, setSelectedVendorInfo] = useState<{
    email?: string; phone?: string; address?: string; city?: string; state?: string;
  } | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentState = JSON.stringify(formData);
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = currentState;
    }
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData]);

  // Build vendor dropdown options whenever vendor list changes
  useEffect(() => {
    setVendorOptions(
      vendors.map(v => ({
        value: String(v.id),
        label: v.name,
        group: v.status === 'active' ? 'Active Vendors' : 'Inactive Vendors',
      }))
    );
  }, [vendors]);

  // Show error toast for submit errors
  useEffect(() => {
    if (errors.submit) {
      showError(errors.submit);
    }
  }, [errors.submit, showError]);

  // Auto-show error summary when new errors appear
  useEffect(() => {
    const formErrors = getFormErrors();
    if (Object.keys(formErrors).length > 0) {
      setShowErrorSummary(true);
    }
  }, [errors]);

  // Show warnings as toasts
  useEffect(() => {
    if (warnings && warnings.length > 0) {
      warnings.forEach(warning => showWarning(warning));
    }
  }, [warnings, showWarning]);

  // Filter out submit error from form errors for display
  const getFormErrors = () => {
    return Object.entries(errors).reduce((acc, [key, value]) => {
      if (key !== 'submit') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
  };

  // Convert warnings array to errors object for ErrorSummary
  const getWarningErrors = () => {
    if (!warnings || warnings.length === 0) return {};
    return warnings.reduce((acc, warning, index) => {
      acc[`warning_${index}`] = warning;
      return acc;
    }, {} as Record<string, string>);
  };

  // Handle vendor selection — auto-fill all vendor fields
  const handleVendorSelect = (option: DropdownOption) => {
    const vendor = vendors.find(v => String(v.id) === option.value);
    handleChange('vendorId', option.value);
    handleChange('vendorName', vendor?.name ?? option.label);
    handleChange('vendorEmail', vendor?.email ?? '');
    handleChange('vendorPhone', vendor?.phone ?? '');
    // Compose address from available fields
    const addr = [vendor?.address, vendor?.city, vendor?.state, vendor?.country]
      .filter(Boolean).join(', ');
    handleChange('vendorAddress', addr);
    setSelectedVendorInfo(vendor
      ? { email: vendor.email, phone: vendor.phone, address: vendor.address, city: vendor.city, state: vendor.state }
      : null,
    );
  };

  const additionalCharges = [
    { label: 'Shipping', value: formData.shippingCharges || 0 },
    { label: 'Handling', value: formData.handlingCharges || 0 },
    { label: 'Other',    value: formData.otherCharges    || 0 },
  ];

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(createOrder);
        if (!success) {
          throw new Error('Failed to create purchase order');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/purchases/orders');
      },
      'Creating purchase order...',
      'Purchase order created successfully.',
      'Failed to create purchase order. Please try again.'
    );
  };

  // Cancel handler with unsaved changes confirmation
  const handleCancel = async () => {
    if (!hasChanges) {
      navigate('/purchases/orders');
      return;
    }

    await withConfirmation(
      {
        title: 'Discard Purchase Order',
        message: 'You have unsaved order details. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/purchases/orders');
      }
    );
  };

  // Clear form handler
  const handleClearForm = async () => {
    if (!hasChanges) return;

    await withConfirmation(
      {
        title: 'Clear Form',
        message: 'Are you sure you want to clear all entered data?',
        confirmText: 'Clear',
        variant: 'warning',
      },
      async () => {
        window.location.reload();
        success('Form cleared successfully.');
      }
    );
  };

  const formErrors = getFormErrors();
  const warningErrors = getWarningErrors();

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1
                className="text-2xl font-bold themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Create Purchase Order
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Create a new purchase order
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                type="button"
                onClick={handleClearForm}
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
                title="Clear form"
              >
                Clear
              </button>
            )}
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
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Purchase Order
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Summary - Using reusable component */}
        {showErrorSummary && Object.keys(formErrors).length > 0 && (
          <ErrorSummary
            errors={formErrors}
            variant="error"
            title="Please fix the following errors:"
            onClose={() => setShowErrorSummary(false)}
            maxDisplay={10}
          />
        )}

        {/* Warning Summary - Using reusable component */}
        {showWarningSummary && Object.keys(warningErrors).length > 0 && (
          <ErrorSummary
            errors={warningErrors}
            variant="warning"
            title="Please review the following warnings:"
            onClose={() => setShowWarningSummary(false)}
            maxDisplay={5}
          />
        )}

        {/* ── Form ── */}
        <div
          className="rounded-xl p-6 space-y-6 themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >

          {/* ── Section: Order Information ── */}
          <div>
            <h3
              className="text-lg font-medium mb-4 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              Order Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Vendor SearchableDropdown — full width */}
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Vendor <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <SearchableDropdown
                  options={vendorOptions}
                  value={formData.vendorId ? String(formData.vendorId) : null}
                  onChange={handleVendorSelect}
                  placeholder="Search vendor by name..."
                  triggerPlaceholder="Select a vendor..."
                  showEmptyState
                  emptyStateText="No vendors found"
                  resetSearchOnOpen
                />
                {errors.vendorId && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.vendorId}
                  </p>
                )}

                {/* Auto-filled vendor info card */}
                {selectedVendorInfo && (
                  <div
                    className="mt-3 p-3 rounded-lg flex flex-wrap gap-4 text-sm themed-transition"
                    style={{
                      background: 'var(--primary-light)',
                      border: '1px solid var(--primary)',
                      color: 'var(--foreground-secondary)',
                    }}
                  >
                    {selectedVendorInfo.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        {selectedVendorInfo.email}
                      </span>
                    )}
                    {selectedVendorInfo.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        {selectedVendorInfo.phone}
                      </span>
                    )}
                    {(selectedVendorInfo.address || selectedVendorInfo.city) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                        {[selectedVendorInfo.address, selectedVendorInfo.city, selectedVendorInfo.state]
                          .filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Order Date */}
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Order Date <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => handleChange('orderDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.orderDate ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('orderDate', e, errors)}
                />
                {errors.orderDate && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.orderDate}
                  </p>
                )}
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate || ''}
                  onChange={(e) => handleChange('expectedDeliveryDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.expectedDeliveryDate ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('expectedDeliveryDate', e, errors)}
                />
                {errors.expectedDeliveryDate && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.expectedDeliveryDate}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Status
                </label>
                <SearchableDropdown
                  options={PO_STATUS_OPTIONS}
                  value={formData.status || null}
                  onChange={(opt) => handleChange('status', opt.value)}
                  triggerPlaceholder="Select status"
                  placeholder="Search status..."
                  resetSearchOnOpen
                />
                {errors.status && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.status}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Priority
                </label>
                <SearchableDropdown
                  options={PO_PRIORITY_OPTIONS}
                  value={formData.priority || null}
                  onChange={(opt) => handleChange('priority', opt.value)}
                  triggerPlaceholder="Select priority"
                  placeholder="Search priority..."
                  resetSearchOnOpen
                />
                {errors.priority && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.priority}
                  </p>
                )}
              </div>

              {/* Vendor Address (auto-filled, editable) */}
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Vendor Address
                </label>
                <textarea
                  value={formData.vendorAddress || ''}
                  onChange={(e) => handleChange('vendorAddress', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.vendorAddress ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('vendorAddress', e, errors)}
                  placeholder="Auto-filled from vendor selection, or enter manually"
                />
                {errors.vendorAddress && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.vendorAddress}
                  </p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Currency
                </label>
                <SearchableDropdown
                  options={CURRENCY_OPTIONS}
                  value={formData.currency || 'INR'}
                  onChange={(opt) => handleChange('currency', opt.value)}
                  triggerPlaceholder="Select Currency"
                  placeholder="Search currency..."
                />
                {errors.currency && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.currency}
                  </p>
                )}
              </div>

              {/* Exchange Rate */}
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Exchange Rate
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.exchangeRate || ''}
                  onChange={(e) => handleChange('exchangeRate', parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.exchangeRate ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('exchangeRate', e, errors)}
                  placeholder="1.0000"
                />
                {errors.exchangeRate && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.exchangeRate}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* ── Section: Order Items ── */}
          <div>
            {errors.items && typeof errors.items === 'string' && (
              <div
                className="mb-4 p-3 rounded-lg themed-transition"
                style={{
                  background: 'var(--error-light)',
                  border: '1px solid var(--error)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--error)' }}>
                  {errors.items}
                </p>
              </div>
            )}
            <ItemSelectionTable
              items={formData.items}
              onItemsChange={handleItemsChange}
              errors={errors}
              productSuggestions={PRODUCT_SUGGESTIONS}
              showJewelryFields={false}
              showDescription={true}
              showUnit={true}
              showDiscount={true}
              showTax={true}
              simpleMode={false}
              searchPlaceholder="Search products..."
              addButtonLabel="Add Item"
              title="Order Items"
              showSubtotalSection={true}
              additionalCharges={additionalCharges}
              headerDiscount={0}
              showTotalSection={true}
              autoAddDefaultRow={false}
              addButtonAtBottom={true}
              className="border-0 p-0"
            />
          </div>

          {/* ── Section: Additional Information ── */}
          <div>
            <h3
              className="text-lg font-medium mb-4 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Notes */}
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.notes ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('notes', e, errors)}
                  placeholder="Enter additional notes"
                />
                {errors.notes && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.notes}
                  </p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Terms &amp; Conditions
                </label>
                <textarea
                  value={formData.terms || ''}
                  onChange={(e) => handleChange('terms', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.terms ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('terms', e, errors)}
                  placeholder="Enter terms and conditions"
                />
                {errors.terms && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* Payment Terms */}
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={formData.paymentTerms || ''}
                  onChange={(e) => handleChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.paymentTerms ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('paymentTerms', e, errors)}
                  placeholder="e.g., Net 30 days"
                />
                {errors.paymentTerms && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.paymentTerms}
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>

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

export default PurchaseOrderCreate;