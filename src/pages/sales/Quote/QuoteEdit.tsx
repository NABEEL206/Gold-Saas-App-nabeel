// src/pages/sales/Quote/QuoteEdit.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, User, Mail, Phone, MapPin,
  Building2, Calendar, Package, Gem, AlertCircle,
  FileText,
} from 'lucide-react';
import { useQuotes } from '../../../hooks/Quote/useQuotes';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import ErrorSummary from '../../../components/common/ErrorSummary';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import {
  validateQuoteForm,
  formatValidationErrors,
  getErrorCount,
  hasValidationErrors,
  type ValidationResult,
} from '../../../validations/quote.validation';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Rajesh Jewelers', email: 'rajesh@jewelers.com', phone: '+91-98765-43210', address: '123 Jewel Street, Mumbai' },
  { id: '2', name: 'Priya Gold House', email: 'priya@goldhouse.com', phone: '+91-98765-43211', address: '456 Gold Road, Delhi' },
  { id: '3', name: 'Suresh Gold Mart', email: 'suresh@goldmart.com', phone: '+91-98765-43212', address: '789 Diamond Avenue, Bangalore' },
  { id: '4', name: 'Meera Jewel World', email: 'meera@jewelworld.com', phone: '+91-98765-43213', address: '321 Pearl Street, Chennai' },
];

const customerOptions: DropdownOption[] = MOCK_CUSTOMERS.map(customer => ({
  value: customer.id,
  label: customer.name,
  group: 'Customers'
}));

// Mock product suggestions for jewelry items
const MOCK_PRODUCTS = [
  { id: '1', name: 'Gold Ring', code: 'GR-001', category: 'Ring', purity: '22K', price: 7500, description: '22K Gold Ring with diamond' },
  { id: '2', name: 'Gold Chain', code: 'GC-001', category: 'Chain', purity: '22K', price: 4500, description: '22K Gold Chain with pendant' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', category: 'Earring', purity: '22K', price: 3200, description: '22K Gold Earrings with pearl' },
  { id: '4', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', purity: '18K', price: 8500, description: '18K Diamond Ring with 0.5ct diamond' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', category: 'Bracelet', purity: '22K', price: 3800, description: '22K Gold Bracelet with diamonds' },
  { id: '6', name: 'Silver Necklace', code: 'SN-001', category: 'Necklace', purity: '18K', price: 2800, description: '18K Silver Necklace with chain' },
];

const QuoteEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuote, updateQuote, loading } = useQuotes();
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

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
  });
  const [items, setItems] = useState<ItemSelectionItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState(MOCK_PRODUCTS);

  useEffect(() => {
    if (id) {
      const found = getQuote(id);
      if (found) {
        setFormData(found);
        // Convert items to ItemSelectionItem format
        if (found.items) {
          setItems(found.items.map((item: any) => ({
            id: item.id,
            productId: item.itemId || item.id,
            productName: item.itemName,
            description: item.description || '',
            quantity: item.quantity || 1,
            unit: item.unit || 'Pcs',
            rate: item.unitPrice || item.rate || 0,
            discount: item.discount || 0,
            discountType: item.discountType || 'percentage',
            taxRate: item.taxRate || 18,
            taxAmount: item.taxAmount || 0,
            total: item.total || 0,
            purity: item.purity || '22K',
            grossWt: item.grossWt || 0,
            netWt: item.netWt || 0,
            makingCharges: item.makingCharges || 0,
            hsn: item.hsn || '',
            category: item.category || '',
            weight: item.weight || 0,
            wastagePercentage: item.wastagePercentage || 0,
            stoneCharges: item.stoneCharges || 0,
          })));
        }
      } else {
        setPageError('Quote not found');
      }
    }
  }, [id, getQuote]);

  const handleCustomerSelect = useCallback((option: DropdownOption) => {
    const customer = MOCK_CUSTOMERS.find(c => c.id === option.value);
    if (customer && formData) {
      setFormData({
        ...formData,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email || '',
        customerPhone: customer.phone || '',
        customerAddress: customer.address || '',
      });
      // Clear customer error when selected
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customerId;
        return newErrors;
      });
    }
  }, [formData]);

  const handleProductSearch = useCallback((search: string) => {
    setProductSearch(search);
    if (search.length > 0) {
      const filtered = MOCK_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      );
      setProductSuggestions(filtered);
    } else {
      setProductSuggestions(MOCK_PRODUCTS);
    }
  }, []);

  const handleItemsChange = useCallback((newItems: ItemSelectionItem[]) => {
    setItems(newItems);
    // Clear items error when items change
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.items;
      return newErrors;
    });
  }, []);

  const handleAddCustomItem = useCallback(() => {
    const newItem: ItemSelectionItem = {
      productId: `custom_${Date.now()}`,
      productName: '',
      description: '',
      quantity: 1,
      unit: 'Pcs',
      rate: 0,
      discount: 0,
      discountType: 'percentage',
      taxRate: 18,
      taxAmount: 0,
      total: 0,
      purity: '22K',
      weight: 0,
      makingCharges: 0,
      wastagePercentage: 0,
      stoneCharges: 0,
    };
    setItems(prev => [...prev, newItem]);
    // Clear items error when adding an item
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.items;
      return newErrors;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const result = validateQuoteForm(formData, items);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result);
    setValidationErrors(formattedErrors);
    
    return result.isValid;
  }, [formData, items]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error for this field when updated
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const updateQuoteData = useCallback(async (status: 'draft' | 'sent') => {
    if (!formData) return;
    
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        ...formData,
        items: items.map(item => ({
          id: item.id,
          itemId: item.productId,
          itemName: item.productName,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit: item.unit || 'Pcs',
          unitPrice: item.rate || 0,
          rate: item.rate || 0,
          discount: item.discount || 0,
          discountType: item.discountType || 'percentage',
          taxRate: item.taxRate || 18,
          taxAmount: item.taxAmount || 0,
          total: item.total || 0,
          purity: item.purity || '22K',
          grossWt: item.grossWt || 0,
          netWt: item.netWt || 0,
          makingCharges: item.makingCharges || 0,
          hsn: item.hsn || '',
          category: item.category || '',
          weight: item.weight || 0,
          wastagePercentage: item.wastagePercentage || 0,
          stoneCharges: item.stoneCharges || 0,
        })),
        status,
      };

      const result = await updateQuote(formData.id, updatedData);
      if (result.success) {
        success(`Quote ${status === 'draft' ? 'updated as draft' : 'updated and sent'} successfully!`);
        navigate('/sales/quotes', { replace: true });
      } else {
        showError(result.error || 'Failed to update quote');
        setValidationErrors(prev => ({ ...prev, submit: result.error || 'Failed to update quote' }));
      }
    } catch (err) {
      showError('Failed to update quote. Please try again.');
      setValidationErrors(prev => ({ ...prev, submit: 'Failed to update quote. Please try again.' }));
    } finally {
      setSaving(false);
    }
  }, [formData, items, validateForm, updateQuote, success, showError, navigate]);

  const handleSubmit = useCallback(async (status: 'draft' | 'sent') => {
    if (!validateForm()) {
      const errorCount = getErrorCount(validationResult);
      showError(`Please fix ${errorCount} error(s) before saving.`);
      return;
    }

    const actionLabel = status === 'draft' ? 'Update Draft' : 'Update & Send';
    await withConfirmation(
      {
        title: status === 'draft' ? 'Update Quote Draft' : 'Update & Send Quote',
        message: status === 'draft'
          ? 'Are you sure you want to update this quote as draft?'
          : 'Are you sure you want to update and send this quote to the customer?',
        confirmText: actionLabel,
        variant: 'primary',
      },
      () => updateQuoteData(status)
    );
  }, [validateForm, showError, withConfirmation, updateQuoteData, validationResult]);

  const handleCancelClick = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Discard Changes',
      message: 'Are you sure you want to discard all changes? This action cannot be undone.',
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      variant: 'warning',
    });
    if (confirmed) navigate('/sales/quotes', { replace: true });
  }, [confirm, navigate]);

  const quoteColumns = {
    item: true, purity: true, description: true, grossWt: false,
    stoneWt: false, netWt: false, qty: true, unit: true, rate: true,
    making: true, discount: true, tax: true, amount: true, action: true,
  };

  // Check if there are any errors
  const hasErrors = Object.keys(validationErrors).length > 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading quote..." />
      </div>
    );
  }

  if (pageError || !formData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Quote Not Found</h3>
          <p className="text-sm text-red-600">{pageError || 'Quote does not exist'}</p>
          <button
            onClick={() => navigate('/sales/quotes', { replace: true })}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancelClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Gem className="h-6 w-6 text-amber-500" />
                Edit Quote: {formData.quoteNo}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Update quote details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />Update Draft
            </button>
            <button
              onClick={() => handleSubmit('sent')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}Update & Send
            </button>
          </div>
        </div>

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

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-amber-500" />Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name *</label>
              <SearchableDropdown
                options={customerOptions}
                value={formData.customerId || null}
                onChange={handleCustomerSelect}
                placeholder="Search customer..."
                triggerPlaceholder="Select a customer"
                className="w-full max-w-full"
                resetSearchOnOpen={true}
                showEmptyState={true}
                emptyStateText="No customers found"
                maxListHeight={280}
              />
              {validationErrors.customerId && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.customerId}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="customer@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  validationErrors.customerPhone ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter phone number"
              />
              {validationErrors.customerPhone && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.customerPhone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">GST Number</label>
              <input
                type="text"
                value={formData.customerGst || ''}
                onChange={(e) => handleInputChange('customerGst', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="GSTIN"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input
                type="text"
                value={formData.customerAddress || ''}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Customer address"
              />
            </div>
          </div>
        </div>

        {/* Quote Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-500" />Quote Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                type="date"
                value={formData.date.split('T')[0]}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Valid Until</label>
              <input
                type="date"
                value={formData.validUntil.split('T')[0]}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <ItemSelectionTable
          items={items}
          onItemsChange={handleItemsChange}
          productSuggestions={productSuggestions}
          productSearch={productSearch}
          onProductSearchChange={handleProductSearch}
          onAddCustomItem={handleAddCustomItem}
          showJewelryFields={true}
          showDescription={true}
          showUnit={true}
          showDiscount={true}
          showTax={true}
          showMakingCharges={true}
          showWeightFields={false}
          showPurity={true}
          showSubtotalSection={true}
          showTotalSection={true}
          searchPlaceholder="Search jewelry items..."
          addButtonLabel="Add Item"
          title="Quote Items"
          additionalCharges={[]}
          autoAddDefaultRow={false}
          addButtonAtBottom={true}
          errors={validationErrors}
        />
        {validationErrors.items && (
          <p className="mt-1 text-xs text-red-500">{validationErrors.items}</p>
        )}

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />Notes
            </h4>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />Terms & Conditions
            </h4>
            <textarea
              value={formData.termsAndConditions || ''}
              onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Terms and conditions..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Update Draft
            </button>
            <button
              onClick={() => handleSubmit('sent')}
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
              Update & Send
            </button>
          </div>
        </div>
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

export default QuoteEdit;