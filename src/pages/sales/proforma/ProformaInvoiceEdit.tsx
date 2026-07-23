// src/pages/sales/proforma/ProformaInvoiceEdit.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  Mail,
  Phone,
  Hash,
  Calendar,
  Clock,
  FileText,
  Paperclip,
  Upload,
  X,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { useProformaInvoice } from '../../../hooks/Proforma/useProformaInvoice';
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
import type { ProformaInvoiceFormData } from '../../../types/proforma/ProformaInvoiceType';

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

const ProformaInvoiceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoice, updateInvoiceStatus, deleteInvoice } = useProformaInvoice();

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

  const [formData, setFormData] = useState<ProformaInvoiceFormData | null>(null);
  const [initialFormData, setInitialFormData] = useState<string>('');
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
  });
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ItemSelectionItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions] = useState(MOCK_PRODUCTS);

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
    if (details && formData) {
      setFormData({
        ...formData,
        customerId: selectedOption.value,
        customerName: details.name || selectedOption.label,
        customerEmail: details.email || '',
        customerPhone: details.phone || '',
        customerAddress: details.address || '',
      });
      // Clear customer error when selected
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customerId;
        delete newErrors.customerName;
        return newErrors;
      });
    }
  }, [formData]);

  // Handle items change from ItemSelectionTable
  const handleItemsChange = useCallback((newItems: ItemSelectionItem[]) => {
    setItems(newItems);
    if (formData) {
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
      setFormData({
        ...formData,
        items: proformaItems,
      });
      // Clear items error when items change
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  }, [formData]);

  // Handle product search
  const handleProductSearch = useCallback((search: string) => {
    setProductSearch(search);
  }, []);

  useEffect(() => {
    const loadInvoice = async () => {
      if (id) {
        try {
          const invoice = await getInvoice(id);
          if (invoice) {
            const loaded: ProformaInvoiceFormData = {
              invoiceNumber: invoice.invoiceNumber,
              invoiceDate: invoice.invoiceDate,
              validUntil: invoice.validUntil,
              customerId: invoice.customerId,
              customerName: invoice.customerName,
              customerEmail: invoice.customerEmail,
              customerPhone: invoice.customerPhone,
              customerAddress: invoice.customerAddress,
              items: invoice.items,
              currency: invoice.currency,
              paymentTerms: invoice.paymentTerms,
              deliveryTerms: invoice.deliveryTerms,
              notes: invoice.notes,
              termsAndConditions: invoice.termsAndConditions,
              status: invoice.status,
              discount: invoice.discount || 0,
            };
            setFormData(loaded);
            setInitialFormData(JSON.stringify(loaded));

            // Convert items to ItemSelectionItem format
            if (invoice.items && invoice.items.length > 0) {
              const convertedItems = invoice.items.map((item: any) => ({
                productId: item.productId || `item_${Date.now()}`,
                productName: item.productName || '',
                description: item.description || '',
                quantity: item.quantity || 1,
                unit: 'Pcs',
                rate: item.unitPrice || 0,
                discount: item.discount || 0,
                discountType: 'percentage' as const,
                taxRate: item.taxRate || 0,
                taxAmount: 0,
                total: item.total || 0,
                purity: item.purity || '22K',
                category: item.category || '',
              }));
              setItems(convertedItems);
            }
          } else {
            showError('Proforma invoice not found.');
            navigate('/sales/proforma');
          }
        } catch (err) {
          showError('Failed to load proforma invoice.');
          navigate('/sales/proforma');
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getInvoice, navigate]);

  const hasUnsavedChanges = Boolean(
    formData && initialFormData && JSON.stringify(formData) !== initialFormData
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
      // Clear error for this field when updated
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    // Create a complete form data object with all required fields
    const formDataWithDefaults = {
      customerId: formData?.customerId || '',
      customerName: formData?.customerName || '',
      invoiceDate: formData?.invoiceDate || '',
      validUntil: formData?.validUntil || '',
      items: formData?.items || [],
      ...formData,
    };

    const result = validateProformaForm(formDataWithDefaults, items);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result);
    setValidationErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, items]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }

    setSaving(true);
    try {
      await updateInvoiceStatus(id!, 'draft');
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Updated Proforma Invoice:', {
        id,
        ...formData,
        files,
      });
      success('Proforma invoice updated successfully.');
      navigate('/sales/proforma');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update invoice';
      setValidationErrors(prev => ({ ...prev, submit: message }));
      showError(message);
    } finally {
      setSaving(false);
    }
  }, [formData, id, validateForm, showError, updateInvoiceStatus, success, navigate, files]);

  // Delete handler using confirmation modal
  const handleDelete = useCallback(() => {
    withConfirmation(
      {
        title: 'Delete Proforma Invoice',
        message: 'Are you sure you want to delete this proforma invoice? This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleting(true);
        try {
          await deleteInvoice(id!);
          success('Proforma invoice deleted successfully.');
          navigate('/sales/proforma');
        } catch (err) {
          showError('Failed to delete proforma invoice. Please try again.');
        } finally {
          setDeleting(false);
        }
      }
    );
  }, [id, withConfirmation, deleteInvoice, success, showError, navigate]);

  // Cancel handler - confirm before discarding unsaved changes
  const handleCancel = useCallback(() => {
    if (!hasUnsavedChanges) {
      navigate('/sales/proforma');
      return;
    }

    withConfirmation(
      {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/sales/proforma');
      }
    );
  }, [hasUnsavedChanges, withConfirmation, navigate]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const newFiles = Array.from(fileList);
      const oversizedFiles = newFiles.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setValidationErrors(prev => ({ ...prev, files: 'Some files exceed the 10MB limit' }));
        showError('Some files exceed the 10MB limit.');
        return;
      }
      if (files.length + newFiles.length > 5) {
        setValidationErrors(prev => ({ ...prev, files: 'Maximum 5 files allowed' }));
        showError('Maximum 5 files allowed.');
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, [files, showError]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Check if there are any errors
  const hasErrors = Object.keys(validationErrors).length > 0;

  // Show loading spinner without fullscreen
  if (loadingData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  const isEditable = formData.status === 'draft';

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
                  Edit Proforma Invoice
                </h1>
                <p
                  className="text-sm themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  Editing invoice #{formData.invoiceNumber}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditable && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
                style={{
                  color: 'var(--error)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.background = 'var(--error-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {deleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
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
              onClick={handleSubmit}
              disabled={saving || !isEditable}
              className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!saving && isEditable) {
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
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Warning */}
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
                This invoice is in <strong>{formData.status}</strong> status and cannot be edited.
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--foreground-secondary)' }}>
                Only draft invoices can be modified.
              </p>
            </div>
          </div>
        )}

        {/* Error summary - Submit errors */}
        {validationErrors.submit && (
          <ErrorSummary
            errors={{ submit: validationErrors.submit }}
            title="Form Error:"
            variant="error"
          />
        )}

        {/* Validation Error Summary */}
        {hasErrors && !validationErrors.submit && (
          <ErrorSummary
            errors={validationErrors}
            title="Please fix the following errors:"
            variant="warning"
            maxDisplay={5}
          />
        )}

        <form onSubmit={handleSubmit}>
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
                  disabled={!isEditable}
                />
                {validationErrors.customerName && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {validationErrors.customerName}
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

              {/* Invoice Number */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Proforma # <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div
                  className="flex items-center rounded-lg px-3 py-2.5 themed-transition"
                  style={{
                    border: '1px solid var(--border)',
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                  }}
                >
                  <Hash
                    className="h-4 w-4 mr-2 flex-shrink-0 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="flex-1 outline-none text-sm bg-transparent themed-transition disabled:opacity-60"
                    style={{ color: 'var(--foreground)' }}
                  />
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
                  className={`flex items-center rounded-lg px-3 py-2.5 themed-transition ${
                    validationErrors.invoiceDate ? 'border-red-400' : ''
                  }`}
                  style={{
                    border: `1px solid ${validationErrors.invoiceDate ? 'var(--error)' : 'var(--border)'}`,
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                  }}
                >
                  <Calendar
                    className="h-4 w-4 mr-2 flex-shrink-0 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="flex-1 outline-none text-sm bg-transparent themed-transition disabled:opacity-60"
                    style={{ color: 'var(--foreground)' }}
                  />
                </div>
                {validationErrors.invoiceDate && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {validationErrors.invoiceDate}
                  </p>
                )}
              </div>

              {/* Valid Until */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Expiry Date <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div
                  className={`flex items-center rounded-lg px-3 py-2.5 themed-transition ${
                    validationErrors.validUntil ? 'border-red-400' : ''
                  }`}
                  style={{
                    border: `1px solid ${validationErrors.validUntil ? 'var(--error)' : 'var(--border)'}`,
                    background: isEditable ? 'var(--background)' : 'var(--surface)',
                  }}
                >
                  <Clock
                    className="h-4 w-4 mr-2 flex-shrink-0 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="flex-1 outline-none text-sm bg-transparent themed-transition disabled:opacity-60"
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

          {/* Payment & Delivery Terms */}
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
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
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
                  name="deliveryTerms"
                  value={formData.deliveryTerms}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
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
            className={!isEditable ? 'pointer-events-none opacity-75' : ''}
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
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={!isEditable}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all resize-none themed-transition disabled:opacity-60"
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
              placeholder="Thank you for your business."
            />
          </div>

          {/* Terms & Conditions and Attach Files */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {/* Terms & Conditions */}
            <div
              className="rounded-lg p-5 themed-transition"
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
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleInputChange}
                disabled={!isEditable}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all resize-none themed-transition disabled:opacity-60"
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
                placeholder="Enter the terms and conditions..."
              />
            </div>

            {/* Attach Files */}
            <div
              className="rounded-lg p-5 themed-transition"
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
                  <Paperclip className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                </div>
                <span
                  className="text-sm font-semibold themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Attach Files
                </span>
              </div>

              {isEditable && (
                <div className="flex items-center gap-3">
                  <label
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg transition-all themed-transition"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'var(--primary-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--background)';
                    }}
                  >
                    <Upload className="h-4 w-4" style={{ color: 'var(--foreground-tertiary)' }} />
                    <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                      Upload File
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                  <span className="text-xs themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                    Max 5 files, 10MB each
                  </span>
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg px-3 py-1.5 themed-transition"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" style={{ color: 'var(--foreground-tertiary)' }} />
                        <span className="text-sm themed-transition" style={{ color: 'var(--foreground)' }}>
                          {file.name}
                        </span>
                        <span className="text-xs themed-transition" style={{ color: 'var(--foreground-tertiary)' }}>
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      {isEditable && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 rounded transition-colors themed-transition"
                          style={{ color: 'var(--foreground-tertiary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--error)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--foreground-tertiary)';
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

export default ProformaInvoiceEdit;