// src/pages/sales/invoice/InvoiceEdit.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  RotateCcw,
} from 'lucide-react';
import { useInvoices } from '../../../hooks/Invoices/useInvoices';
import { useInvoiceCreate } from '../../../hooks/Invoices/useInvoiceCreate';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import { OldGoldTable, type OldGoldItem } from '../../../components/common/OldGoldTable';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import {
  calculateInvoiceTotals,
  formatCurrency,
  calculateItemTotals,
} from '../../../utils/Invoice/calculations';
import {
  validateInvoiceForm,
  formatValidationErrors,
  type ValidationResult,
} from '../../../validations/invoice.validation';
import ErrorSummary from '../../../components/common/ErrorSummary';
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

// Customer details mapping
const customerDetailsMap: Record<string, any> = {
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

export const InvoiceEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getInvoice, updateInvoice } = useInvoices();
  const {
    formData,
    updateFormData,
    errors: formErrors,
    validateForm: validateFormHook,
    validationResult: hookValidationResult,
  } = useInvoiceCreate();
  
  const {
    success,
    error: showError,
    confirm,
    withConfirmation,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [items, setItems] = useState<ItemSelectionItem[]>([]);
  const [oldGoldItems, setOldGoldItems] = useState<OldGoldItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showOldGold, setShowOldGold] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
    oldGoldErrors: [],
  });

  // Calculate totals using the utility
  const totals = React.useMemo(() => {
    return calculateInvoiceTotals(
      items,
      oldGoldItems,
      formData.additionalCharges || [],
      formData.discount || 0,
      formData.discountType || 'percentage'
    );
  }, [items, oldGoldItems, formData.additionalCharges, formData.discount, formData.discountType]);

  // Calculate individual item details for display
  const itemDetails = React.useMemo(() => {
    return items.map((item) => ({
      ...item,
      calculation: calculateItemTotals(item),
    }));
  }, [items]);

  // Get old gold total for display
  const oldGoldTotal = React.useMemo(() => {
    return oldGoldItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [oldGoldItems]);

  // Handle customer selection from dropdown
  const handleCustomerSelect = useCallback((selectedOption: DropdownOption) => {
    const details = customerDetailsMap[selectedOption.value] || null;
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
  }, [updateFormData]);

  // Handle items change from ItemSelectionTable
  const handleItemsChange = useCallback((newItems: ItemSelectionItem[]) => {
    setItems(newItems);
    updateFormData('items', newItems);
  }, [updateFormData]);

  // Handle product search
  const handleProductSearch = useCallback((search: string) => {
    setProductSearch(search);
  }, []);

  // Handle Old Gold items change
  const handleOldGoldItemsChange = useCallback((newItems: OldGoldItem[]) => {
    setOldGoldItems(newItems);
    updateFormData('oldGoldItems', newItems);
  }, [updateFormData]);

  // Toggle Old Gold section
  const toggleOldGold = useCallback(() => {
    setShowOldGold(!showOldGold);
  }, [showOldGold]);

  // Validate all items using the new validation
  const validateAllItems = useCallback(() => {
    const result = validateInvoiceForm(formData, items, oldGoldItems);
    setValidationResult(result);
    
    // Format errors for display
    const formattedErrors = formatValidationErrors(result);
    setValidationErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, items, oldGoldItems]);

  // Combined validation
  const validateForm = useCallback(() => {
    const isFormValid = validateFormHook();
    const isItemsValid = validateAllItems();
    return isFormValid && isItemsValid;
  }, [validateFormHook, validateAllItems]);

  // Load invoice data
  useEffect(() => {
    if (id) {
      loadInvoice(id);
    }
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    setLoading(true);
    setPageError(null);
    try {
      const data = await getInvoice(invoiceId) as any;
      // Populate form data from invoice
      updateFormData('customerId', data.customerId || '');
      updateFormData('customerName', data.customerName || '');
      updateFormData('customerEmail', data.customerEmail || '');
      updateFormData('customerPhone', data.customerPhone || '');
      updateFormData('customerAddress', data.customerAddress || '');
      updateFormData('customerGst', data.customerGst || '');
      updateFormData('invoiceNo', data.invoiceNo || '');
      updateFormData('date', data.date || '');
      updateFormData('dueDate', data.dueDate || '');
      updateFormData('discount', data.discount || 0);
      updateFormData('discountType', data.discountType || 'fixed');
      updateFormData('shippingCharge', data.shippingCharge || 0);
      updateFormData('otherCharges', data.otherCharges || 0);
      updateFormData('notes', data.notes || '');
      updateFormData('termsAndConditions', data.termsAndConditions || '');
      updateFormData('paymentTerms', data.paymentTerms || 'Net 15');
      updateFormData('additionalCharges', data.additionalCharges || []);
      
      // Set items
      if (data.items && data.items.length > 0) {
        setItems(data.items);
        updateFormData('items', data.items);
      }

      // Set old gold items
      if (data.oldGoldItems && data.oldGoldItems.length > 0) {
        setOldGoldItems(data.oldGoldItems);
        updateFormData('oldGoldItems', data.oldGoldItems);
        setShowOldGold(true);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      setPageError('Invoice not found');
    } finally {
      setLoading(false);
    }
  };

  // Update invoice function
  const updateInvoiceData = useCallback(async () => {
    if (!id) return null;
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return null;
    }

    setIsSaving(true);
    try {
      const invoiceData = {
        ...formData,
        items,
        oldGoldItems,
        // Use calculated totals from utility
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        taxAmount: totals.taxAmount,
        oldGoldTotal: totals.oldGoldTotal,
        grandTotal: totals.grandTotal,
        total: totals.netTotal,
        // Include item-level calculations
        itemDetails,
      };

      const result = await updateInvoice(id, invoiceData);
      success('Invoice updated successfully!');
      return result;
    } catch (err) {
      showError('Failed to update invoice. Please try again.');
      setSubmitError('Failed to update invoice. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [id, formData, items, oldGoldItems, totals, itemDetails, validateForm, showError, updateInvoice, success]);

  // Submit handler with confirmation
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }

    let result: any = null;
    await withConfirmation(
      {
        title: 'Update Invoice',
        message: 'Are you sure you want to update this invoice?',
        confirmText: 'Update Invoice',
        variant: 'primary',
      },
      async () => {
        result = await updateInvoiceData();
      }
    );

    if (result) {
      navigate('/sales/invoices', { replace: true });
    }
  }, [id, validateForm, showError, withConfirmation, updateInvoiceData, navigate]);

  // Cancel handler with confirmation
  const handleCancelClick = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Discard Changes',
      message: 'Are you sure you want to discard all changes? This action cannot be undone.',
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      variant: 'warning',
    });
    
    if (confirmed) {
      navigate('/sales/invoices', { replace: true });
    }
  }, [confirm, navigate]);

  // Get total item count
  const totalItems = items.length;

  // Check if there are any errors
  const hasErrors = Object.keys(validationErrors).length > 0;

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading invoice..." />
      </div>
    );
  }

  // Error state
  if (pageError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Invoice Not Found</h3>
          <p className="text-sm text-red-600">{pageError}</p>
          <button
            onClick={() => navigate('/sales/invoices', { replace: true })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancelClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Edit Invoice</h1>
                <p className="text-sm text-gray-500">Update invoice details</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSaving}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Invoice
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error summary - Form level errors */}
        {(formErrors.submit || submitError) && (
          <ErrorSummary
            errors={{ submit: formErrors.submit || submitError || '' }}
            title="Form Error:"
            variant="error"
          />
        )}

        {/* Validation Error Summary */}
        {hasErrors && !formErrors.submit && (
          <ErrorSummary
            errors={validationErrors}
            title="Please fix the following errors:"
            variant="warning"
            maxDisplay={5}
          />
        )}

        <form onSubmit={onSubmit}>
          {/* Customer & Invoice Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Customer Name */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer <span className="text-red-500">*</span>
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
                {formErrors.customerId && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.customerId}</p>
                )}
                {formData.customerName && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
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

              {/* Invoice # - Read-only in edit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invoice#
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50">
                  <Hash className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={formData.invoiceNo || 'INV-000005'}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-600 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all ${
                  formErrors.date ? 'border-red-400' : 'border-gray-300'
                }`}>
                  <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900"
                  />
                </div>
                {formErrors.date && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.date}</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Due Date
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all">
                  <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateFormData('dueDate', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Terms
                </label>
                <select
                  value={formData.paymentTerms || 'Net 15'}
                  onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-white"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
              <div className="flex items-end justify-end">
                <button
                  type="button"
                  onClick={toggleOldGold}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showOldGold 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                      : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-dashed border-amber-300'
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                  {showOldGold ? 'Hide Old Gold Exchange' : 'Add Old Gold Exchange'}
                  {oldGoldItems.length > 0 && !showOldGold && (
                    <span className="ml-1 px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs">
                      {oldGoldItems.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Item Selection Table - Pass validation errors */}
          <ItemSelectionTable
            items={items}
            onItemsChange={handleItemsChange}
            productSuggestions={MOCK_PRODUCTS}
            productSearch={productSearch}
            onProductSearchChange={handleProductSearch}
            showJewelryFields={true}
            showDescription={true}
            showUnit={false}
            showDiscount={false}
            showTax={true}
            showMakingCharges={true}
            showWeightFields={true}
            showPurity={true}
            showHSN={true}
            showSubtotalSection={true}
            showTotalSection={true}
            searchPlaceholder="Search jewelry items..."
            addButtonLabel="Add Item"
            title="Invoice Items"
            additionalCharges={formData.additionalCharges || []}
            autoAddDefaultRow={false}
            addButtonAtBottom={true}
            errors={validationErrors}
          />

          {/* Old Gold Exchange Section - Pass validation errors */}
          {showOldGold && (
            <div className="mt-4">
              <OldGoldTable
                items={oldGoldItems}
                onItemsChange={handleOldGoldItemsChange}
                showHSN={true}
                title="Old Gold Exchange"
                errors={validationErrors}
              />
            </div>
          )}

          {/* Old Gold Total Summary (when collapsed) */}
          {!showOldGold && oldGoldItems.length > 0 && (
            <div className="mt-2 mb-4 flex justify-end">
              <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                <RotateCcw className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-700">
                  Old Gold Exchange: <span className="font-bold">{formatCurrency(oldGoldTotal)}</span>
                </span>
                <span className="text-xs text-amber-500">({oldGoldItems.length} items)</span>
                <button
                  onClick={toggleOldGold}
                  className="text-xs text-amber-600 hover:text-amber-800 underline"
                >
                  Show
                </button>
              </div>
            </div>
          )}

          {/* Customer Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Customer Notes</span>
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all resize-none text-gray-900"
              placeholder="Thank you for your business."
            />
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Terms & Conditions</span>
            </div>
            <textarea
              value={formData.termsAndConditions}
              onChange={(e) => updateFormData('termsAndConditions', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all resize-none text-gray-900"
              placeholder="Enter the terms and conditions..."
            />
          </div>

          {/* Grand Total Display */}
          {items.length > 0 && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-medium text-green-600">-{formatCurrency(totals.totalDiscount)}</span>
                    </div>
                  )}
                  {totals.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span className="font-medium">{formatCurrency(totals.taxAmount)}</span>
                    </div>
                  )}
                  {totals.oldGoldTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600">Old Gold Exchange</span>
                      <span className="font-medium text-amber-600">-{formatCurrency(totals.oldGoldTotal)}</span>
                    </div>
                  )}
                  {formData.additionalCharges && formData.additionalCharges.length > 0 && (
                    formData.additionalCharges.map((charge: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-500">{charge.label}</span>
                        <span className="font-medium">+{formatCurrency(charge.value || 0)}</span>
                      </div>
                    ))
                  )}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-base font-bold">
                      <span className="text-gray-800">Grand Total</span>
                      <span className="text-amber-600">{formatCurrency(totals.netTotal)}</span>
                    </div>
                  </div>
                  {/* Item count */}
                  <div className="text-xs text-gray-400 text-right">
                    Total Items: {totalItems} | Old Gold Items: {oldGoldItems.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

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

export default InvoiceEdit;