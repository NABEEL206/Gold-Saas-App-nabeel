// src/pages/sales/Quote/QuoteCreate.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, User, Mail, Phone, MapPin,
  Building2, Calendar, FileText, Gem, AlertCircle,
} from 'lucide-react';
import { useQuotes } from '../../../hooks/Quote/useQuotes';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import ErrorSummary from '../../../components/common/ErrorSummary';
import {
  validateQuoteForm,
  formatValidationErrors,
  getErrorCount,
  hasValidationErrors,
  type ValidationResult,
} from '../../../validations/quote.validation';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';

// Mock product suggestions for jewelry items
const MOCK_PRODUCTS = [
  { id: '1', name: 'Gold Ring', code: 'GR-001', category: 'Ring', purity: '22K', price: 7500, description: '22K Gold Ring with diamond' },
  { id: '2', name: 'Gold Chain', code: 'GC-001', category: 'Chain', purity: '22K', price: 4500, description: '22K Gold Chain with pendant' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', category: 'Earring', purity: '22K', price: 3200, description: '22K Gold Earrings with pearl' },
  { id: '4', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', purity: '18K', price: 8500, description: '18K Diamond Ring with 0.5ct diamond' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', category: 'Bracelet', purity: '22K', price: 3800, description: '22K Gold Bracelet with diamonds' },
  { id: '6', name: 'Silver Necklace', code: 'SN-001', category: 'Necklace', purity: '18K', price: 2800, description: '18K Silver Necklace with chain' },
];

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

const QuoteCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createQuote, loading } = useQuotes();
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
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState(MOCK_PRODUCTS);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    itemErrors: [],
  });

  const [formData, setFormData] = useState({
    customerId: null as string | null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerGst: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    termsAndConditions: '',
  });

  const [items, setItems] = useState<ItemSelectionItem[]>([]);

  const handleCustomerSelect = useCallback((selectedOption: DropdownOption) => {
    const details = customerDetailsMap[selectedOption.value] || null;
    if (details) {
      setFormData(prev => ({
        ...prev,
        customerId: selectedOption.value,
        customerName: details.name || selectedOption.label,
        customerEmail: details.email || '',
        customerPhone: details.phone || '',
        customerAddress: details.address || '',
        customerGst: details.gst || '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customerId: selectedOption.value,
        customerName: selectedOption.label,
      }));
    }
    // Clear customer error when selected
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.customerId;
      return newErrors;
    });
  }, []);

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

  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let taxAmount = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const baseAmount = (item.quantity || 1) * (item.rate || 0);
      const makingCharge = (item.makingCharges || 0) * (item.quantity || 1);
      const wastageAmount = baseAmount * ((item.wastagePercentage || 0) / 100);
      const stoneCharge = (item.stoneCharges || 0) * (item.quantity || 1);
      const itemSubtotal = baseAmount + makingCharge + wastageAmount + stoneCharge;
      subtotal += itemSubtotal;

      let discountAmount = 0;
      if (item.discountType === 'fixed') {
        discountAmount = item.discount || 0;
      } else {
        discountAmount = itemSubtotal * ((item.discount || 0) / 100);
      }
      totalDiscount += discountAmount;

      const taxableAmount = itemSubtotal - discountAmount;
      taxAmount += taxableAmount * ((item.taxRate || 18) / 100);
    });

    const total = subtotal - totalDiscount + taxAmount;
    return { subtotal, totalDiscount, taxAmount, total };
  }, [items]);

  const totals = calculateTotals();

  const saveQuote = useCallback(async (status: 'draft' | 'sent') => {
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }

    setSaving(true);
    try {
      const quoteData = {
        ...formData,
        items: items.map(item => ({
          ...item,
          total: (item.quantity || 1) * (item.rate || 0) +
                 (item.makingCharges || 0) * (item.quantity || 1) +
                 ((item.quantity || 1) * (item.rate || 0) * (item.wastagePercentage || 0) / 100) +
                 (item.stoneCharges || 0) * (item.quantity || 1)
        })),
        subtotal: totals.subtotal,
        tax: totals.taxAmount,
        discount: totals.totalDiscount,
        discountType: 'percentage' as const,
        shippingCharge: 0,
        otherCharges: 0,
        roundOff: 0,
        total: totals.total,
        status,
        customerId: formData.customerId || 'CUST-' + Date.now(),
      };

      const result = await createQuote(quoteData);
      if (result.success) {
        success(`Quote ${status === 'draft' ? 'saved as draft' : 'created and sent'} successfully!`);
        navigate('/sales/quotes', { replace: true });
      } else {
        showError(result.error || 'Failed to create quote');
        setValidationErrors(prev => ({ ...prev, submit: result.error || 'Failed to create quote' }));
      }
    } catch (err) {
      showError('Failed to create quote. Please try again.');
      setValidationErrors(prev => ({ ...prev, submit: 'Failed to create quote. Please try again.' }));
    } finally {
      setSaving(false);
    }
  }, [formData, items, totals, validateForm, createQuote, success, showError, navigate]);

  const handleSubmit = useCallback(async (status: 'draft' | 'sent') => {
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }

    const actionLabel = status === 'draft' ? 'Save as Draft' : 'Create & Send';
    await withConfirmation(
      {
        title: status === 'draft' ? 'Save Quote as Draft' : 'Create & Send Quote',
        message: status === 'draft'
          ? 'Are you sure you want to save this quote as draft?'
          : 'Are you sure you want to create and send this quote to the customer?',
        confirmText: actionLabel,
        variant: 'primary',
      },
      () => saveQuote(status)
    );
  }, [validateForm, showError, withConfirmation, saveQuote]);

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

  // Handle input change with error clearing
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

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
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancelClick}
              className="p-2 rounded-lg transition-colors themed-transition"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft
                className="h-5 w-5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              />
            </button>
            <div>
              <h1
                className="text-2xl font-bold flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <Gem className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                Create New Quote
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Create a new jewelry quote for a customer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
              }}
            >
              <Save className="h-4 w-4" />Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('sent')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 themed-transition"
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
              {saving ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}Create & Send
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
        <div
          className="rounded-xl p-6 mb-6 themed-transition"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            <User className="h-4 w-4" style={{ color: 'var(--gold)' }} />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-1.5 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Customer Name *
              </label>
              <SearchableDropdown
                options={MOCK_CUSTOMERS}
                value={formData.customerId}
                onChange={handleCustomerSelect}
                placeholder="Search customer by name..."
                triggerPlaceholder="Select or search customer..."
                className="w-full max-w-full"
                showEmptyState={true}
                emptyStateText="No customers found. Type to search."
                resetSearchOnOpen={true}
              />
              {validationErrors.customerId && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                  {validationErrors.customerId}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Email
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
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
                placeholder="customer@email.com"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Phone *
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: validationErrors.customerPhone ? '1px solid var(--error)' : '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = validationErrors.customerPhone ? 'var(--error)' : 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter phone number"
              />
              {validationErrors.customerPhone && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                  {validationErrors.customerPhone}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                GST Number
              </label>
              <input
                type="text"
                value={formData.customerGst}
                onChange={(e) => handleInputChange('customerGst', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
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
                placeholder="GSTIN"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Address
              </label>
              <input
                type="text"
                value={formData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
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
                placeholder="Customer address"
              />
            </div>
          </div>
        </div>

        {/* Quote Details */}
        <div
          className="rounded-xl p-6 mb-6 themed-transition"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center gap-2 themed-transition"
            style={{ color: 'var(--foreground)' }}
          >
            <Calendar className="h-4 w-4" style={{ color: 'var(--gold)' }} />
            Quote Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: validationErrors.date ? '1px solid var(--error)' : '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = validationErrors.date ? 'var(--error)' : 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {validationErrors.date && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                  {validationErrors.date}
                </p>
              )}
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Valid Until
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleInputChange('validUntil', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
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
          <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
            {validationErrors.items}
          </p>
        )}

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div
            className="rounded-xl p-6 themed-transition"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h4
              className="text-sm font-semibold mb-3 flex items-center gap-2 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              <FileText className="h-4 w-4" style={{ color: 'var(--gold)' }} />
              Notes
            </h4>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none themed-transition"
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
              placeholder="Any additional notes..."
            />
          </div>
          <div
            className="rounded-xl p-6 themed-transition"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h4
              className="text-sm font-semibold mb-3 flex items-center gap-2 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              <FileText className="h-4 w-4" style={{ color: 'var(--gold)' }} />
              Terms & Conditions
            </h4>
            <textarea
              value={formData.termsAndConditions}
              onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none themed-transition"
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
              placeholder="Terms and conditions..."
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 themed-transition"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 text-sm transition-colors themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--foreground-secondary)';
            }}
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)';
              }}
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('sent')}
              disabled={saving}
              className="px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 themed-transition"
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
              {saving ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
              Create & Send
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

export default QuoteCreate;