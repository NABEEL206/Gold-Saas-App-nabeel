// src/pages/sales/deliveryChallan/DeliveryChallanCreate.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useDeliveryChallan } from '../../../hooks/DeliveryChallan/useDeliveryChallan';
import { useDeliveryChallanCreate } from '../../../hooks/DeliveryChallan/useDeliveryChallanCreate';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import ErrorSummary from '../../../components/common/ErrorSummary';
import {
  validateDeliveryChallanForm,
  formatValidationErrors,
  type ValidationResult,
} from '../../../validations/deliveryChallan.validation';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';

// ============================================================
// MOCK DATA - Can be moved to a separate config file
// ============================================================

// Customer data - Single source of truth
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

const DeliveryChallanCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createChallan } = useDeliveryChallan();
  const {
    formData,
    productSearch,
    setProductSearch,
    productSuggestions,
    errors: hookErrors,
    saving,
    totals,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    updateFormData,
  } = useDeliveryChallanCreate();

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

  const [savingForm, setSavingForm] = useState(false);
  const [items, setItems] = useState<ItemSelectionItem[]>(formData.items || []);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
  });

  // Whether the user has entered anything worth confirming before discarding
  const hasUnsavedChanges = Boolean(
    formData.customerId || items.length > 0 || formData.notes || formData.termsAndConditions
  );

  // Handle customer selection from dropdown
  const handleCustomerSelect = useCallback((selectedOption: DropdownOption) => {
    const details = CUSTOMER_DETAILS[selectedOption.value] || null;
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
    updateFormData('items', newItems);
    // Clear items error when items change
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.items;
      return newErrors;
    });
  }, [updateFormData]);

  // Handle custom item add
  const handleAddCustomItem = useCallback(() => {
    addItem();
    // Clear items error when adding an item
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.items;
      return newErrors;
    });
  }, [addItem]);

  const validateForm = useCallback((): boolean => {
    const result = validateDeliveryChallanForm(formData, items);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result);
    setValidationErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, items]);

  // Cancel handler - confirm before discarding unsaved changes
  const handleCancel = useCallback(() => {
    if (!hasUnsavedChanges) {
      navigate('/sales/delivery-challan');
      return;
    }

    withConfirmation(
      {
        title: 'Discard Delivery Challan',
        message: 'You have unsaved changes. Are you sure you want to discard this delivery challan?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/sales/delivery-challan');
      }
    );
  }, [hasUnsavedChanges, withConfirmation, navigate]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }
    
    try {
      const data = await handleSubmit();
      if (data) {
        setSavingForm(true);
        await createChallan(data);
        success('Delivery challan created successfully.');
        navigate('/sales/delivery-challan');
      } else {
        showError('Please fix the errors in the form and try again.');
      }
    } catch (error) {
      showError('Failed to create delivery challan. Please try again.');
    } finally {
      setSavingForm(false);
    }
  }, [validateForm, showError, handleSubmit, createChallan, success, navigate]);

  // Check if there are any errors
  const hasErrors = Object.keys(validationErrors).length > 0 || Object.keys(hookErrors).length > 0;

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
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1
                className="text-2xl font-semibold flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <Truck className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                Create Delivery Challan
              </h1>
              <p
                className="text-sm themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Create a new delivery challan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
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
              onClick={handleFormSubmit}
              disabled={savingForm}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!savingForm) {
                  e.currentTarget.style.background = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
            >
              {savingForm ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Challan
                </>
              )}
            </button>
          </div>
        </div>

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

        <form onSubmit={handleFormSubmit} className="space-y-6">
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
                  value={formData.challanNumber}
                  onChange={(e) => updateFormData('challanNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${validationErrors.challanNumber ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--focus-ring)';
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
                  value={formData.challanDate}
                  onChange={(e) => updateFormData('challanDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${validationErrors.challanDate ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = 'var(--focus-ring)';
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
                  value={formData.deliveryDate}
                  onChange={(e) => updateFormData('deliveryDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                value={formData.deliveryAddress}
                onChange={(e) => updateFormData('deliveryAddress', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${validationErrors.deliveryAddress ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
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
                  value={formData.transporterName}
                  onChange={(e) => updateFormData('transporterName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                  value={formData.vehicleNumber}
                  onChange={(e) => updateFormData('vehicleNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                  value={formData.lrNumber}
                  onChange={(e) => updateFormData('lrNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                  value={formData.lrDate}
                  onChange={(e) => updateFormData('lrDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                value={formData.paymentTerms}
                onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                  value={formData.termsAndConditions}
                  onChange={(e) => updateFormData('termsAndConditions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                  placeholder="Enter terms and conditions..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {savingForm && (
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

export default DeliveryChallanCreate;