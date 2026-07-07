// src/pages/sales/CreditNotes/CreditNoteCreate.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Receipt,
  Users,
  Calendar,
  FileText,
  AlertCircle,
  Send,
  Plus,
} from 'lucide-react';
import { useCreditNote } from '../../../hooks/CreditNote/useCreditNote';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import ErrorSummary from '../../../components/common/ErrorSummary';
import {
  validateCreditNoteForm,
  formatValidationErrors,
  type ValidationResult,
} from '../../../validations/creditNote.validation';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';

// ─── Static data ──────────────────────────────────────────────────────────────

const DEMO_CUSTOMERS = [
  { id: '1', name: 'Rajesh Jewelers',  email: 'rajesh@jewelers.com', phone: '+91-98765-43210', gst: '22AAAAA0000A1Z5' },
  { id: '2', name: 'Priya Gold House', email: 'priya@goldhouse.com',  phone: '+91-98765-43211', gst: '22BBBBB0000B1Z5' },
  { id: '3', name: 'Suresh Gold Mart', email: 'suresh@goldmart.com',  phone: '+91-98765-43212', gst: '22CCCCC0000C1Z5' },
  { id: '4', name: 'Meera Jewel World',email: 'meera@jewelworld.com', phone: '+91-98765-43213', gst: '22DDDDD0000D1Z5' },
];

const DEMO_INVOICES = [
  { id: '1', number: 'INV-000001', amount: 29500 },
  { id: '2', number: 'INV-000002', amount: 50445 },
  { id: '3', number: 'INV-000003', amount: 37760 },
  { id: '4', number: 'INV-000004', amount: 12862 },
];

const DEMO_ITEMS = [
  { id: '1', name: 'Gold Ring',     code: 'GR-001', purity: '22K', price: 7500, unit: 'Pcs' },
  { id: '2', name: 'Gold Chain',    code: 'GC-001', purity: '22K', price: 4500, unit: 'Pcs' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', purity: '22K', price: 3200, unit: 'Pcs' },
  { id: '4', name: 'Diamond Ring',  code: 'DR-001', purity: '18K', price: 8500, unit: 'Pcs' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', purity: '22K', price: 3800, unit: 'Pcs' },
];

// ─── Dropdown option lists ────────────────────────────────────────────────────

const CUSTOMER_OPTIONS: DropdownOption[] = DEMO_CUSTOMERS.map(c => ({
  value: c.id,
  label: c.name,
  group: 'Customers',
}));

const INVOICE_OPTIONS: DropdownOption[] = DEMO_INVOICES.map(inv => ({
  value: inv.id,
  label: `${inv.number} — ₹${inv.amount.toLocaleString()}`,
  group: 'Invoices',
}));

// ─── Component ────────────────────────────────────────────────────────────────

const CreditNoteCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createCreditNote, loading } = useCreditNote();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
  });

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

  const [formData, setFormData] = useState({
    customerId:     '',
    customerName:   '',
    customerEmail:  '',
    customerPhone:  '',
    customerGst:    '',
    invoiceId:      '',
    invoiceNumber:  '',
    creditNoteDate: new Date().toISOString().split('T')[0],
    reason:         '',
    notes:          '',
    status: 'draft' as const,
  });

  const [items, setItems]                   = useState<ItemSelectionItem[]>([]);
  const [productSearch, setProductSearch]   = useState('');
  const [productSuggestions]                = useState(DEMO_ITEMS);
  const [isCustomReason, setIsCustomReason] = useState(false);
  const [customReason, setCustomReason]     = useState('');

  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentState = JSON.stringify({ formData, items });
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = currentState;
    }
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData, items]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCustomerSelect = useCallback((option: DropdownOption) => {
    const customer = DEMO_CUSTOMERS.find(c => c.id === option.value);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId:    customer.id,
        customerName:  customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerGst:   customer.gst,
      }));
      // clear error
      setErrors(prev => { const e = { ...prev }; delete e.customerId; return e; });
    }
  }, []);

  const handleInvoiceSelect = useCallback((option: DropdownOption) => {
    const invoice = DEMO_INVOICES.find(inv => inv.id === option.value);
    if (invoice) {
      setFormData(prev => ({
        ...prev,
        invoiceId:     invoice.id,
        invoiceNumber: invoice.number,
      }));
    }
  }, []);

  // ── Reason Handlers ────────────────────────────────────────────────────────

  const handleReasonSelect = useCallback((option: DropdownOption) => {
    setIsCustomReason(false);
    setCustomReason('');
    setFormData(prev => ({ ...prev, reason: option.value }));
    setErrors(prev => { const e = { ...prev }; delete e.reason; return e; });
  }, []);

  const handleCustomReasonToggle = useCallback(() => {
    setIsCustomReason(true);
    setFormData(prev => ({ ...prev, reason: '' }));
    setErrors(prev => { const e = { ...prev }; delete e.reason; return e; });
  }, []);

  const handleCustomReasonChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomReason(value);
    setFormData(prev => ({ ...prev, reason: value }));
    if (value.trim()) {
      setErrors(prev => { const e = { ...prev }; delete e.reason; return e; });
    }
  }, []);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  }, []);

  const handleItemsChange = useCallback((newItems: ItemSelectionItem[]) => {
    setItems(newItems);
    setErrors(prev => { const e = { ...prev }; delete e.items; return e; });
  }, []);

  const handleAddCustomItem = useCallback(() => {
    setItems(prev => [
      ...prev,
      {
        productId:    `custom_${Date.now()}`,
        productName:  '',
        description:  '',
        quantity:     1,
        unit:         'Pcs',
        rate:         0,
        discount:     0,
        discountType: 'percentage',
        taxRate:      18,
        taxAmount:    0,
        total:        0,
        purity:       '22K',
      },
    ]);
    setErrors(prev => { const e = { ...prev }; delete e.items; return e; });
  }, []);

  // ── Totals ───────────────────────────────────────────────────────────────────

  const calculateTotals = useCallback(() => {
    let subtotal = 0, taxAmount = 0, totalDiscount = 0;
    items.forEach(item => {
      const base = (item.quantity || 1) * (item.rate || 0);
      subtotal += base;
      const disc = item.discountType === 'fixed'
        ? (item.discount || 0)
        : base * ((item.discount || 0) / 100);
      totalDiscount += disc;
      taxAmount += (base - disc) * ((item.taxRate || 18) / 100);
    });
    return { subtotal, totalDiscount, taxAmount, total: subtotal - totalDiscount + taxAmount };
  }, [items]);

  const totals = calculateTotals();

  // ── Submit ───────────────────────────────────────────────────────────────────

  const validateForm = useCallback((): boolean => {
    const result = validateCreditNoteForm(formData, items);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result);
    setErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, items]);

  const handleSubmit = useCallback(async (status: 'draft' | 'sent') => {
    if (!validateForm()) {
      showError('Please fix the validation errors before submitting.');
      return;
    }

    const actionLabel = status === 'draft' ? 'Saving draft' : 'Creating and sending';
    
    await withLoading(
      async () => {
        await createCreditNote({
          ...formData,
          items: items.map(item => ({
            ...item,
            total: (item.quantity || 1) * (item.rate || 0),
          })),
          subtotal:   totals.subtotal,
          taxAmount:  totals.taxAmount,
          discount:   totals.totalDiscount,
          total:      totals.total,
          status,
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/sales/credit-notes');
      },
      `${actionLabel} credit note...`,
      status === 'draft' 
        ? 'Credit note saved as draft successfully.' 
        : 'Credit note created and sent successfully.',
      'Failed to create credit note. Please try again.'
    );
  }, [formData, items, totals, validateForm, showError, withLoading, createCreditNote, navigate]);

  // Cancel handler with unsaved changes confirmation
  const handleCancel = useCallback(async () => {
    if (!hasChanges) {
      navigate('/sales/credit-notes');
      return;
    }

    await withConfirmation(
      {
        title: 'Discard Credit Note',
        message: 'You have unsaved changes. Are you sure you want to discard this credit note?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/sales/credit-notes');
      }
    );
  }, [hasChanges, withConfirmation, navigate]);

  // Clear form handler
  const handleClearForm = useCallback(async () => {
    if (!hasChanges) return;

    await withConfirmation(
      {
        title: 'Clear Form',
        message: 'Are you sure you want to clear all entered data?',
        confirmText: 'Clear',
        variant: 'warning',
      },
      async () => {
        setFormData({
          customerId:     '',
          customerName:   '',
          customerEmail:  '',
          customerPhone:  '',
          customerGst:    '',
          invoiceId:      '',
          invoiceNumber:  '',
          creditNoteDate: new Date().toISOString().split('T')[0],
          reason:         '',
          notes:          '',
          status: 'draft' as const,
        });
        setItems([]);
        setErrors({});
        setValidationResult({
          isValid: true,
          errors: {},
          itemErrors: [],
        });
        initialSnapshotRef.current = null;
        setIsCustomReason(false);
        setCustomReason('');
        success('Form cleared successfully.');
      }
    );
  }, [hasChanges, withConfirmation, success]);

  // ── Columns config ───────────────────────────────────────────────────────────

  const creditNoteColumns = [
    { key: 'item', label: 'Item' },
    { key: 'purity', label: 'Purity' },
    { key: 'description', label: 'Description' },
    { key: 'qty', label: 'Qty' },
    { key: 'unit', label: 'Unit' },
    { key: 'rate', label: 'Rate' },
    { key: 'discount', label: 'Discount' },
    { key: 'tax', label: 'Tax' },
    { key: 'amount', label: 'Amount' },
    { key: 'action', label: 'Action' },
  ];

  // Check if there are any errors
  const hasErrors = Object.keys(errors).length > 0;

  // ── Predefined reason options ──────────────────────────────────────────────

  const REASON_OPTIONS: DropdownOption[] = [
    { value: 'Product damaged during shipping',       label: 'Product damaged during shipping' },
    { value: 'Quality issue - incorrect purity',      label: 'Quality issue — incorrect purity' },
    { value: 'Customer requested cancellation',       label: 'Customer requested cancellation' },
    { value: 'Wrong item delivered',                  label: 'Wrong item delivered' },
    { value: 'Price mismatch',                        label: 'Price mismatch' },
    { value: 'Other',                                 label: 'Other' },
  ];

  // ── Loading guard ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="h-6 w-6 text-amber-500" />
                Create Credit Note
              </h1>
              <p className="text-sm text-gray-500">Create a new credit note for customer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                type="button"
                onClick={handleClearForm}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('sent')}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create & Send
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Summary */}
        {hasErrors && (
          <ErrorSummary
            errors={errors}
            title="Please fix the following errors:"
            variant="warning"
            maxDisplay={5}
          />
        )}

        <form className="space-y-6">

          {/* ── Customer Details ── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Customer Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={CUSTOMER_OPTIONS}
                  value={formData.customerId || null}
                  onChange={handleCustomerSelect}
                  placeholder="Search customer..."
                  triggerPlaceholder="Select a customer..."
                  showEmptyState
                  emptyStateText="No customers found"
                  resetSearchOnOpen
                />
                {errors.customerId && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerId}</p>
                )}
              </div>

              {/* Invoice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invoice (Optional)
                </label>
                <SearchableDropdown
                  options={INVOICE_OPTIONS}
                  value={formData.invoiceId || null}
                  onChange={handleInvoiceSelect}
                  placeholder="Search invoice..."
                  triggerPlaceholder="Select an invoice..."
                  showEmptyState
                  emptyStateText="No invoices found"
                  resetSearchOnOpen
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Credit Note Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.creditNoteDate}
                  onChange={(e) => handleInputChange('creditNoteDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.creditNoteDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.creditNoteDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.creditNoteDate}</p>
                )}
              </div>

              {/* Reason - With Manual Entry Option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason <span className="text-red-500">*</span>
                </label>
                
                {/* Toggle between dropdown and manual entry */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomReason(false);
                      setFormData(prev => ({ ...prev, reason: '' }));
                      setErrors(prev => { const e = { ...prev }; delete e.reason; return e; });
                    }}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      !isCustomReason 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Select from list
                  </button>
                  <button
                    type="button"
                    onClick={handleCustomReasonToggle}
                    className={`px-3 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                      isCustomReason 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Plus className="h-3 w-3" />
                    Custom reason
                  </button>
                </div>

                {/* Dropdown or Manual Input */}
                {!isCustomReason ? (
                  <SearchableDropdown
                    options={REASON_OPTIONS}
                    value={formData.reason || null}
                    onChange={handleReasonSelect}
                    placeholder="Search reason..."
                    triggerPlaceholder="Select reason..."
                    showEmptyState
                    emptyStateText="No matching reasons"
                    resetSearchOnOpen
                  />
                ) : (
                  <input
                    type="text"
                    value={customReason}
                    onChange={handleCustomReasonChange}
                    placeholder="Enter custom reason..."
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.reason ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                )}
                
                {errors.reason && (
                  <p className="mt-1 text-xs text-red-500">{errors.reason}</p>
                )}
              </div>
            </div>

            {/* Customer info card */}
            {formData.customerName && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="font-medium text-gray-900">{formData.customerName}</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  {formData.customerEmail} | {formData.customerPhone}
                </p>
                {formData.customerGst && (
                  <p className="text-sm text-gray-500 mt-0.5">GST: {formData.customerGst}</p>
                )}
              </div>
            )}
          </div>

          {/* ── Items ── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <ItemSelectionTable
              items={items}
              onItemsChange={handleItemsChange}
              productSuggestions={productSuggestions}
              productSearch={productSearch}
              onProductSearchChange={setProductSearch}
              onAddCustomItem={handleAddCustomItem}
              errors={errors}
              columns={creditNoteColumns}
              showPurity
              showDescription
              showUnit
              showDiscount
              showTax
              showSubtotalSection
              showTotalSection
              searchPlaceholder="Search items..."
              addButtonLabel="Add Item"
              title="Items"
              additionalCharges={[]}
              autoAddDefaultRow={false}
              addButtonAtBottom
            />
            {errors.items && (
              <p className="mt-1 text-xs text-red-500">{errors.items}</p>
            )}
          </div>

          {/* ── Notes ── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Notes
            </h2>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder="Enter any additional notes..."
            />
          </div>

        </form>
      </div>

      {/* Saving Overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
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

export default CreditNoteCreate;