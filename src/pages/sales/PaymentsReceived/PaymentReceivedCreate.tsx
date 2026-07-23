// src/pages/sales/PaymentReceived/PaymentReceivedCreate.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Receipt,
  Users,
  Calendar,
  Hash,
  IndianRupee,
  Banknote,
  Landmark,
  CreditCard,
  Wallet,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { usePaymentReceived } from '../../../hooks/PaymentReceived/usePaymentReceived';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import ErrorSummary from '../../../components/common/ErrorSummary';
import {
  validatePaymentReceivedForm,
  formatValidationErrors,
} from '../../../validations/paymentReceived.validation';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';

// ============================================================
// CONSTANTS - Single source of truth
// ============================================================

// Demo customers as DropdownOption[]
const DEMO_CUSTOMERS: DropdownOption[] = [
  { value: '1', label: 'Rajesh Jewelers', group: 'Regular' },
  { value: '2', label: 'Priya Gold House', group: 'Regular' },
  { value: '3', label: 'Suresh Gold Mart', group: 'VIP' },
  { value: '4', label: 'Meera Jewel World', group: 'Regular' },
];

// Customer details mapping - Single source of truth
const CUSTOMER_DETAILS: Record<string, any> = {
  '1': { name: 'Rajesh Jewelers', email: 'rajesh@jewelers.com', phone: '+91-98765-43210' },
  '2': { name: 'Priya Gold House', email: 'priya@goldhouse.com', phone: '+91-98765-43211' },
  '3': { name: 'Suresh Gold Mart', email: 'suresh@goldmart.com', phone: '+91-98765-43212' },
  '4': { name: 'Meera Jewel World', email: 'meera@jewelworld.com', phone: '+91-98765-43213' },
};

// Demo invoices as DropdownOption[]
const DEMO_INVOICES: DropdownOption[] = [
  { value: '1', label: 'INV-000001 - ₹29,500', group: 'Pending' },
  { value: '2', label: 'INV-000002 - ₹50,445', group: 'Pending' },
  { value: '3', label: 'INV-000003 - ₹37,760', group: 'Completed' },
  { value: '4', label: 'INV-000004 - ₹12,862', group: 'Pending' },
];

// Invoice details mapping - Single source of truth
const INVOICE_DETAILS: Record<string, any> = {
  '1': { number: 'INV-000001', amount: 29500 },
  '2': { number: 'INV-000002', amount: 50445 },
  '3': { number: 'INV-000003', amount: 37760 },
  '4': { number: 'INV-000004', amount: 12862 },
};

// Payment method options
const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Landmark },
  { value: 'cheque', label: 'Cheque', icon: FileText },
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Wallet },
  { value: 'other', label: 'Other', icon: Receipt },
];

// Payment status options
const PAYMENT_STATUSES = [
  { value: 'completed', label: 'Completed', color: 'var(--success)' },
  { value: 'pending', label: 'Pending', color: 'var(--warning)' },
  { value: 'failed', label: 'Failed', color: 'var(--error)' },
  { value: 'refunded', label: 'Refunded', color: 'var(--info)' },
];

type PaymentMethod = 'cash' | 'bank_transfer' | 'cheque' | 'credit_card' | 'upi' | 'other';
type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded';

interface PaymentFormData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  bankName: string;
  chequeNumber: string;
  chequeDate: string;
  notes: string;
  status: PaymentStatus;
}

const PaymentReceivedCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createPayment, loading } = usePaymentReceived();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const [formData, setFormData] = useState<PaymentFormData>({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    invoiceId: '',
    invoiceNumber: '',
    amount: 0,
    paymentMethod: 'cash',
    referenceNumber: '',
    bankName: '',
    chequeNumber: '',
    chequeDate: '',
    notes: '',
    status: 'completed',
  });

  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = JSON.stringify(formData);
    }
    setHasChanges(JSON.stringify(formData) !== initialSnapshotRef.current);
  }, [formData]);

  // Handle customer selection from dropdown
  const handleCustomerSelect = useCallback((selectedOption: DropdownOption) => {
    const details = CUSTOMER_DETAILS[selectedOption.value];
    if (details) {
      setFormData(prev => ({
        ...prev,
        customerId: selectedOption.value,
        customerName: details.name,
        customerEmail: details.email,
        customerPhone: details.phone,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customerId: selectedOption.value,
        customerName: selectedOption.label,
      }));
    }
    // Clear customer error if exists
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.customerId;
      return newErrors;
    });
  }, []);

  // Handle invoice selection from dropdown
  const handleInvoiceSelect = useCallback((selectedOption: DropdownOption) => {
    const details = INVOICE_DETAILS[selectedOption.value];
    if (details) {
      setFormData(prev => ({
        ...prev,
        invoiceId: selectedOption.value,
        invoiceNumber: details.number,
        amount: details.amount,
      }));
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const result = validatePaymentReceivedForm(formData);
    const formattedErrors = formatValidationErrors(result.errors);
    setErrors(formattedErrors);
    return result.isValid;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when updated
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError('Please fix the validation errors before submitting.');
      return;
    }
    
    await withLoading(
      async () => {
        await createPayment(formData);
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/sales/payments-received');
      },
      'Recording payment...',
      `Payment of ₹${formData.amount.toLocaleString()} recorded successfully.`,
      'Failed to record payment. Please try again.'
    );
  }, [formData, validateForm, showError, withLoading, createPayment, navigate]);

  // Cancel handler with unsaved changes confirmation
  const handleCancel = useCallback(async () => {
    if (!hasChanges) {
      navigate('/sales/payments-received');
      return;
    }

    await withConfirmation(
      {
        title: 'Discard Payment',
        message: 'You have unsaved payment details. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/sales/payments-received');
      }
    );
  }, [hasChanges, withConfirmation, navigate]);

  // Clear form handler with confirmation
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
          customerId: '',
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          invoiceId: '',
          invoiceNumber: '',
          amount: 0,
          paymentMethod: 'cash' as const,
          referenceNumber: '',
          bankName: '',
          chequeNumber: '',
          chequeDate: '',
          notes: '',
          status: 'completed' as const,
        });
        setErrors({});
        initialSnapshotRef.current = null;
        success('Form cleared successfully.');
      }
    );
  }, [hasChanges, withConfirmation, success]);

  // Check if there are any errors
  const hasErrors = Object.keys(errors).length > 0;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-3xl mx-auto">
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
                <Receipt className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                Record Payment
              </h1>
              <p
                className="text-sm themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Record a new customer payment
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
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
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
                  Record Payment
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
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
                options={DEMO_CUSTOMERS}
                value={formData.customerId}
                onChange={handleCustomerSelect}
                placeholder="Search customer by name..."
                triggerPlaceholder="Select or search customer..."
                className="w-full max-w-full"
                showEmptyState={true}
                emptyStateText="No customers found"
                resetSearchOnOpen={true}
              />
              {errors.customerId && (
                <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                  {errors.customerId}
                </p>
              )}
            </div>

            {formData.customerName && (
              <div
                className="mt-4 p-4 rounded-lg themed-transition"
                style={{
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                }}
              >
                <p
                  className="font-medium themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  {formData.customerName}
                </p>
                <p
                  className="text-sm mt-1 themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  {formData.customerEmail} {formData.customerPhone && `| ${formData.customerPhone}`}
                </p>
              </div>
            )}
          </div>

          {/* Payment Details */}
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
              <Receipt className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Invoice (Optional)
                </label>
                <SearchableDropdown
                  options={DEMO_INVOICES}
                  value={formData.invoiceId}
                  onChange={handleInvoiceSelect}
                  placeholder="Search invoice by number..."
                  triggerPlaceholder="Select or search invoice..."
                  className="w-full max-w-full"
                  showEmptyState={true}
                  emptyStateText="No invoices found"
                  resetSearchOnOpen={true}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Amount <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div className="relative">
                  <IndianRupee
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `1px solid ${errors.amount ? 'var(--error)' : 'var(--border)'}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.amount ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {errors.amount}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Payment Method <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <div className="relative">
                  <Banknote
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                    className="w-full pl-9 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 appearance-none themed-transition"
                    style={{
                      border: `1px solid ${errors.paymentMethod ? 'var(--error)' : 'var(--border)'}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.paymentMethod ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {errors.paymentMethod}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Reference Number
                  {formData.paymentMethod === 'bank_transfer' && (
                    <span style={{ color: 'var(--error)' }}> *</span>
                  )}
                </label>
                <div className="relative">
                  <Hash
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `1px solid ${errors.referenceNumber ? 'var(--error)' : 'var(--border)'}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.referenceNumber ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter reference number"
                  />
                </div>
                {errors.referenceNumber && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {errors.referenceNumber}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Bank Name
                </label>
                <div className="relative">
                  <Landmark
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Cheque Number
                  {formData.paymentMethod === 'cheque' && (
                    <span style={{ color: 'var(--error)' }}> *</span>
                  )}
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="text"
                    value={formData.chequeNumber}
                    onChange={(e) => handleInputChange('chequeNumber', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `1px solid ${errors.chequeNumber ? 'var(--error)' : 'var(--border)'}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.chequeNumber ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter cheque number"
                  />
                </div>
                {errors.chequeNumber && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {errors.chequeNumber}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Cheque Date
                  {formData.paymentMethod === 'cheque' && (
                    <span style={{ color: 'var(--error)' }}> *</span>
                  )}
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 themed-transition"
                    style={{ color: 'var(--foreground-tertiary)' }}
                  />
                  <input
                    type="date"
                    value={formData.chequeDate}
                    onChange={(e) => handleInputChange('chequeDate', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `1px solid ${errors.chequeDate ? 'var(--error)' : 'var(--border)'}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.chequeDate ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                {errors.chequeDate && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                    {errors.chequeDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
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
              <CheckCircle className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              Status
            </h2>
            <div>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as any)}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
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
                {PAYMENT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
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
              Notes
            </h2>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
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

export default PaymentReceivedCreate;