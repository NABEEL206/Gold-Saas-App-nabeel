// src/pages/sales/proforma/ProformaInvoiceCreate.tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Hash,
  Calendar,
  Clock,
  Receipt,
  Pencil,
} from 'lucide-react';
import { useProformaInvoiceCreate } from '../../../hooks/Proforma/useProformaInvoiceCreate';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import ErrorSummary from '../../../components/common/ErrorSummary';
import {
  validateProformaForm,
  formatValidationErrors,
  type ValidationResult,
} from '../../../validations/proforma.validation';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';

// Mock customer data for dropdown
const MOCK_CUSTOMERS: DropdownOption[] = [
  { value: 'CUST-001', label: 'Rajesh Kumar', group: 'Regular' },
  { value: 'CUST-002', label: 'Priya Sharma', group: 'Regular' },
  { value: 'CUST-003', label: 'Amit Patel', group: 'VIP' },
  { value: 'CUST-004', label: 'Sneha Reddy', group: 'Regular' },
  { value: 'CUST-005', label: 'Vikram Singh', group: 'VIP' },
  { value: 'CUST-006', label: 'Meera Iyer', group: 'Regular' },
  { value: 'CUST-007', label: 'Arjun Nair', group: 'Corporate' },
  { value: 'CUST-008', label: 'Kavya Menon', group: 'Corporate' },
  { value: 'CUST-009', label: 'Rahul Gupta', group: 'Regular' },
  { value: 'CUST-010', label: 'Ananya Desai', group: 'VIP' },
];

// Mock product suggestions
const MOCK_PRODUCTS = [
  { id: '1', name: 'Gold Ring', code: 'GR-001', category: 'Ring', purity: '22K', price: 7500, description: '22K Gold Ring with diamond', unit: 'Pcs' },
  { id: '2', name: 'Gold Chain', code: 'GC-001', category: 'Chain', purity: '22K', price: 4500, description: '22K Gold Chain with pendant', unit: 'Pcs' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', category: 'Earring', purity: '22K', price: 3200, description: '22K Gold Earrings with pearl', unit: 'Pair' },
  { id: '4', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', purity: '18K', price: 8500, description: '18K Diamond Ring with 0.5ct diamond', unit: 'Pcs' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', category: 'Bracelet', purity: '22K', price: 3800, description: '22K Gold Bracelet with diamonds', unit: 'Pcs' },
  { id: '6', name: 'Silver Necklace', code: 'SN-001', category: 'Necklace', purity: '18K', price: 2800, description: '18K Silver Necklace with chain', unit: 'Pcs' },
];

// Default columns configuration for ItemSelectionTable used in Proforma
const proformaColumns: any[] = [
  { key: 'productName', label: 'Product' },
  { key: 'description', label: 'Description' },
  { key: 'quantity', label: 'Qty' },
  { key: 'unit', label: 'Unit' },
  { key: 'rate', label: 'Rate' },
  { key: 'discount', label: 'Discount' },
  { key: 'taxRate', label: 'Tax' },
  { key: 'total', label: 'Total' },
];

const ProformaInvoiceCreate: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    updateFormData,
    errors: hookErrors,
    saving,
    files,
    totals,
    handleFileUpload,
    removeFile,
    handleSubmit: handleSubmitHook,
  } = useProformaInvoiceCreate();

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

  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions] = useState(MOCK_PRODUCTS);
  const [items, setItems] = useState<ItemSelectionItem[]>([]);
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
    const customerDetails: Record<string, any> = {
      'CUST-001': { name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '9876543210', address: '123 Main St, Mumbai', gst: 'GSTIN001' },
      'CUST-002': { name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543211', address: '456 Park Ave, Delhi', gst: 'GSTIN002' },
      'CUST-003': { name: 'Amit Patel', email: 'amit@email.com', phone: '9876543212', address: '789 Lake Rd, Bangalore', gst: 'GSTIN003' },
      'CUST-004': { name: 'Sneha Reddy', email: 'sneha@email.com', phone: '9876543213', address: '321 Hill St, Hyderabad', gst: 'GSTIN004' },
      'CUST-005': { name: 'Vikram Singh', email: 'vikram@email.com', phone: '9876543214', address: '654 Forest Ln, Chennai', gst: 'GSTIN005' },
      'CUST-006': { name: 'Meera Iyer', email: 'meera@email.com', phone: '9876543215', address: '987 River Rd, Kolkata', gst: 'GSTIN006' },
      'CUST-007': { name: 'Arjun Nair', email: 'arjun@email.com', phone: '9876543216', address: '147 Beach Ave, Kochi', gst: 'GSTIN007' },
      'CUST-008': { name: 'Kavya Menon', email: 'kavya@email.com', phone: '9876543217', address: '258 Hillcrest, Pune', gst: 'GSTIN008' },
      'CUST-009': { name: 'Rahul Gupta', email: 'rahul@email.com', phone: '9876543218', address: '369 Garden St, Jaipur', gst: 'GSTIN009' },
      'CUST-010': { name: 'Ananya Desai', email: 'ananya@email.com', phone: '9876543219', address: '741 Lakeview, Ahmedabad', gst: 'GSTIN010' },
    };

    const details = customerDetails[selectedOption.value] || null;
    if (details) {
      updateFormData('customerId', selectedOption.value);
      updateFormData('customerName', details.name || selectedOption.label);
      updateFormData('customerEmail', details.email || '');
      updateFormData('customerPhone', details.phone || '');
      updateFormData('customerAddress', details.address || '');
      updateFormData('customerGst', details.gst || '');
    } else {
      updateFormData('customerId', selectedOption.value);
      updateFormData('customerName', selectedOption.label);
    }
    // Clear customer error when selected
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.customerId;
      return newErrors;
    });
  }, [updateFormData]);

  // Handle items change from ItemSelectionTable
  const handleItemsChange = useCallback((newItems: ItemSelectionItem[]) => {
    setItems(newItems);
    // Map ItemSelectionItem to ProformaInvoiceItem format
    const proformaItems = newItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.rate || 0,
      discount: item.discount || 0,
      taxRate: item.taxRate || 0,
      total: item.total || 0,
      purity: item.purity || '',
      category: item.category || '',
    }));
    updateFormData('items', proformaItems);
    // Clear items error when items change
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.items;
      return newErrors;
    });
  }, [updateFormData]);

  // Handle product search
  const handleProductSearch = useCallback((search: string) => {
    setProductSearch(search);
  }, []);

  const validateForm = useCallback((): boolean => {
    const result = validateProformaForm(formData, items);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result);
    setValidationErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, items]);

  // Cancel handler - confirm before discarding unsaved changes
  const handleCancel = useCallback(() => {
    if (!hasUnsavedChanges) {
      navigate('/sales/proforma');
      return;
    }

    withConfirmation(
      {
        title: 'Discard Proforma Invoice',
        message: 'You have unsaved changes. Are you sure you want to discard this proforma invoice?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/sales/proforma');
      }
    );
  }, [hasUnsavedChanges, withConfirmation, navigate]);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }
    
    try {
      const result = await handleSubmitHook(navigate);
      if (result) {
        success('Proforma invoice created successfully.');
        navigate('/sales/proforma');
      } else {
        showError('Please fix the errors in the form and try again.');
      }
    } catch (err) {
      showError('Failed to create proforma invoice. Please try again.');
    }
  }, [validateForm, showError, handleSubmitHook, navigate, success]);

  // Check if there are any errors
  const hasErrors = Object.keys(validationErrors).length > 0 || Object.keys(hookErrors).length > 0;

  return (
    <div
      className="min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--primary)' }}
              >
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl font-semibold themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Create Proforma Invoice
                </h1>
                <p
                  className="text-sm themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  Create a new proforma invoice for your customer
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
              disabled={saving}
              className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Proforma
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

        <form onSubmit={onSubmit}>
          {/* Customer & Invoice Details */}
          <div
            className="rounded-lg p-5 mb-4 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Customer Name - Using SearchableDropdown */}
              <div className="lg:col-span-1">
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Customer <span style={{ color: 'var(--error)' }}>*</span>
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
                {formData.customerName && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                    {formData.customerEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {formData.customerEmail}
                      </span>
                    )}
                    {formData.customerPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {formData.customerPhone}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Invoice # - Auto-generated with edit option */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Proforma # <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div
                  className="flex items-center rounded-lg px-3 py-2.5 transition-all themed-transition"
                  style={{
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
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
                  <Hash
                    className="h-4 w-4 mr-2 flex-shrink-0 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="text"
                    value={formData.invoiceNumber || 'PI-000001'}
                    onChange={(e) => updateFormData('invoiceNumber', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <span
                    className="text-xs flex items-center gap-1 ml-2 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  >
                    <Pencil className="h-3 w-3" />
                    Editable
                  </span>
                </div>
              </div>

              {/* Invoice Date */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Invoice Date <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div
                  className={`flex items-center rounded-lg px-3 py-2.5 transition-all themed-transition ${
                    validationErrors.invoiceDate ? 'border-red-400' : ''
                  }`}
                  style={{
                    border: `1px solid ${validationErrors.invoiceDate ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                  }}
                  onFocus={(e) => {
                    if (!validationErrors.invoiceDate) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!validationErrors.invoiceDate) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <Calendar
                    className="h-4 w-4 mr-2 flex-shrink-0 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => updateFormData('invoiceDate', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  />
                </div>
                {validationErrors.invoiceDate && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {validationErrors.invoiceDate}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Expiry Date <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div
                  className={`flex items-center rounded-lg px-3 py-2.5 transition-all themed-transition ${
                    validationErrors.validUntil ? 'border-red-400' : ''
                  }`}
                  style={{
                    border: `1px solid ${validationErrors.validUntil ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                  }}
                  onFocus={(e) => {
                    if (!validationErrors.validUntil) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!validationErrors.validUntil) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <Clock
                    className="h-4 w-4 mr-2 flex-shrink-0 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => updateFormData('validUntil', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  />
                </div>
                {validationErrors.validUntil && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {validationErrors.validUntil}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 - Payment Terms & Delivery Terms */}
          <div
            className="rounded-lg p-5 mb-4 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Payment Terms
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
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
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Delivery Terms
                </label>
                <select
                  value={formData.deliveryTerms}
                  onChange={(e) => updateFormData('deliveryTerms', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
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
                  <option value="FOB Shipping Point">FOB Shipping Point</option>
                  <option value="FOB Destination">FOB Destination</option>
                  <option value="CIF">CIF</option>
                  <option value="DDP">DDP</option>
                  <option value="Ex-Works">Ex-Works</option>
                </select>
              </div>
            </div>
          </div>

          {/* Item Selection Table - Pass validation errors */}
          <ItemSelectionTable
            items={items}
            onItemsChange={handleItemsChange}
            productSuggestions={productSuggestions}
            productSearch={productSearch}
            onProductSearchChange={handleProductSearch}
            showJewelryFields={true}
            showDescription={true}
            showUnit={true}
            showDiscount={true}
            showTax={true}
            showMakingCharges={false}
            showWeightFields={false}
            showPurity={true}
            columns={proformaColumns}
            showSubtotalSection={true}
            showTotalSection={true}
            searchPlaceholder="Search jewelry items..."
            addButtonLabel="Add Item"
            title="Proforma Items"
            additionalCharges={[]}
            autoAddDefaultRow={false}
            addButtonAtBottom={true}
            errors={validationErrors}
          />
          {validationErrors.items && (
            <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
              {validationErrors.items}
            </p>
          )}

          {/* Customer Notes */}
          <div
            className="rounded-lg p-5 mt-4 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'var(--primary-light)',
                }}
              >
                <FileText className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              </div>
              <span
                className="text-sm font-semibold themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Customer Notes
              </span>
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all resize-none themed-transition"
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
              placeholder="Thank you for your business."
            />
          </div>

          {/* Terms & Conditions */}
          <div
            className="rounded-lg p-5 mt-4 themed-transition"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'var(--primary-light)',
                }}
              >
                <FileText className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              </div>
              <span
                className="text-sm font-semibold themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Terms & Conditions
              </span>
            </div>
            <textarea
              value={formData.termsAndConditions}
              onChange={(e) => updateFormData('termsAndConditions', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all resize-none themed-transition"
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
              placeholder="Enter the terms and conditions..."
            />
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

export default ProformaInvoiceCreate;