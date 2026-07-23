// src/pages/sales/PaymentsReceived/PaymentReceivedEdit.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  FileText,
  AlertCircle,
  CheckCircle,
  Trash2,
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
import type { PaymentReceived } from '../../../types/paymentReceived/PaymentReceivedTypes';

// ============================================================
// CONSTANTS - Single source of truth (shared with Create page)
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
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Other' },
];

// Payment status options
const PAYMENT_STATUSES = [
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

// Dummy payment data for loading fallback - Single source of truth
const DUMMY_PAYMENTS: Record<string, PaymentReceived> = {
  '1': {
    id: '1',
    paymentNumber: 'PAY-2024-001',
    paymentDate: new Date().toISOString().split('T')[0],
    customerId: '1',
    customerName: 'Rajesh Jewelers',
    customerEmail: 'rajesh@jewelers.com',
    customerPhone: '+91-98765-43210',
    invoiceId: '1',
    invoiceNumber: 'INV-000001',
    amount: 29500,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'BT-2024-001',
    bankName: 'HDFC Bank',
    chequeNumber: '',
    chequeDate: '',
    notes: 'Payment received for invoice INV-000001 via bank transfer',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  '2': {
    id: '2',
    paymentNumber: 'PAY-2024-002',
    paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '2',
    customerName: 'Priya Gold House',
    customerEmail: 'priya@goldhouse.com',
    customerPhone: '+91-98765-43211',
    invoiceId: '2',
    invoiceNumber: 'INV-000002',
    amount: 50445,
    paymentMethod: 'upi',
    referenceNumber: 'UPI-2024-002',
    bankName: '',
    chequeNumber: '',
    chequeDate: '',
    notes: 'Payment received via UPI',
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  '3': {
    id: '3',
    paymentNumber: 'PAY-2024-003',
    paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerId: '3',
    customerName: 'Suresh Gold Mart',
    customerEmail: 'suresh@goldmart.com',
    customerPhone: '+91-98765-43212',
    invoiceId: '3',
    invoiceNumber: 'INV-000003',
    amount: 37760,
    paymentMethod: 'cheque',
    referenceNumber: 'CHQ-2024-003',
    bankName: 'SBI Bank',
    chequeNumber: '123456',
    chequeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Cheque payment received. Pending clearance.',
    status: 'pending',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  '4': {
    id: '4',
    paymentNumber: 'PAY-2024-004',
    paymentDate: new Date().toISOString().split('T')[0],
    customerId: '4',
    customerName: 'Meera Jewel World',
    customerEmail: 'meera@jewelworld.com',
    customerPhone: '+91-98765-43213',
    invoiceId: '4',
    invoiceNumber: 'INV-000004',
    amount: 12862,
    paymentMethod: 'cash',
    referenceNumber: '',
    bankName: '',
    chequeNumber: '',
    chequeDate: '',
    notes: 'Cash payment received at store',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

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

// Helper function to get dummy payment
const getDummyPayment = (id: string): PaymentReceived | null => {
  return DUMMY_PAYMENTS[id] || null;
};

const PaymentReceivedEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPayment, updatePayment, deletePayment, loading: hookLoading } = usePaymentReceived();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalPayment, setOriginalPayment] = useState<PaymentReceived | null>(null);

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

  // Load payment data
  useEffect(() => {
    if (id) {
      loadPayment(id);
    } else {
      showError('Invalid payment ID');
      navigate('/sales/payments-received');
    }
  }, [id]);

  const loadPayment = async (paymentId: string) => {
    setLoading(true);
    try {
      const data = await getPayment(paymentId) as PaymentReceived;
      if (data) {
        setOriginalPayment(data);
        setFormData({
          customerId: data.customerId || '',
          customerName: data.customerName || '',
          customerEmail: data.customerEmail || '',
          customerPhone: data.customerPhone || '',
          invoiceId: data.invoiceId || '',
          invoiceNumber: data.invoiceNumber || '',
          amount: data.amount || 0,
          paymentMethod: data.paymentMethod as PaymentMethod || 'cash',
          referenceNumber: data.referenceNumber || '',
          bankName: data.bankName || '',
          chequeNumber: data.chequeNumber || '',
          chequeDate: data.chequeDate || '',
          notes: data.notes || '',
          status: data.status as PaymentStatus || 'completed',
        });
        setTimeout(() => {
          initialSnapshotRef.current = JSON.stringify(formData);
          setHasChanges(false);
        }, 0);
      } else {
        const dummyData = getDummyPayment(paymentId);
        if (dummyData) {
          setOriginalPayment(dummyData);
          setFormData({
            customerId: dummyData.customerId || '',
            customerName: dummyData.customerName || '',
            customerEmail: dummyData.customerEmail || '',
            customerPhone: dummyData.customerPhone || '',
            invoiceId: dummyData.invoiceId || '',
            invoiceNumber: dummyData.invoiceNumber || '',
            amount: dummyData.amount || 0,
            paymentMethod: dummyData.paymentMethod as PaymentMethod || 'cash',
            referenceNumber: dummyData.referenceNumber || '',
            bankName: dummyData.bankName || '',
            chequeNumber: dummyData.chequeNumber || '',
            chequeDate: dummyData.chequeDate || '',
            notes: dummyData.notes || '',
            status: dummyData.status as PaymentStatus || 'completed',
          });
          setTimeout(() => {
            initialSnapshotRef.current = JSON.stringify(formData);
            setHasChanges(false);
          }, 0);
          warning('Loaded demo data for editing. Some features may be limited.');
        } else {
          showError('Payment not found');
          navigate('/sales/payments-received');
        }
      }
    } catch (error) {
      console.error('Error loading payment:', error);
      const dummyData = getDummyPayment(paymentId);
      if (dummyData) {
        setOriginalPayment(dummyData);
        setFormData({
          customerId: dummyData.customerId || '',
          customerName: dummyData.customerName || '',
          customerEmail: dummyData.customerEmail || '',
          customerPhone: dummyData.customerPhone || '',
          invoiceId: dummyData.invoiceId || '',
          invoiceNumber: dummyData.invoiceNumber || '',
          amount: dummyData.amount || 0,
          paymentMethod: dummyData.paymentMethod as PaymentMethod || 'cash',
          referenceNumber: dummyData.referenceNumber || '',
          bankName: dummyData.bankName || '',
          chequeNumber: dummyData.chequeNumber || '',
          chequeDate: dummyData.chequeDate || '',
          notes: dummyData.notes || '',
          status: dummyData.status as PaymentStatus || 'completed',
        });
        setTimeout(() => {
          initialSnapshotRef.current = JSON.stringify(formData);
          setHasChanges(false);
        }, 0);
        showError('Failed to load payment details. Loaded demo data instead.');
      } else {
        showError('Failed to load payment details.');
        navigate('/sales/payments-received');
      }
    } finally {
      setLoading(false);
    }
  };

  // Track changes
  useEffect(() => {
    if (initialSnapshotRef.current !== null && !loading) {
      const currentSnapshot = JSON.stringify(formData);
      setHasChanges(currentSnapshot !== initialSnapshotRef.current);
    }
  }, [formData, loading]);

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

  const handleInputChange = useCallback((field: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when updated
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const result = validatePaymentReceivedForm(formData);
    const formattedErrors = formatValidationErrors(result.errors);
    setErrors(formattedErrors);
    return result.isValid;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError('Please fix the validation errors before submitting.');
      return;
    }
    
    if (!id) {
      showError('Invalid payment ID');
      return;
    }

    await withLoading(
      async () => {
        await updatePayment(id, formData);
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/sales/payments-received/${id}/view`);
      },
      'Updating payment...',
      `Payment of ₹${formData.amount.toLocaleString()} updated successfully.`,
      'Failed to update payment. Please try again.'
    );
  }, [formData, id, validateForm, showError, withLoading, updatePayment, navigate]);

  // Cancel handler with unsaved changes confirmation
  const handleCancel = useCallback(async () => {
    if (!hasChanges) {
      navigate(`/sales/payments-received/${id}/view`);
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
        navigate(`/sales/payments-received/${id}/view`);
      }
    );
  }, [hasChanges, withConfirmation, navigate, id]);

  // Reset form to original state
  const handleReset = useCallback(async () => {
    if (!hasChanges) {
      warning('No changes to reset.');
      return;
    }

    await withConfirmation(
      {
        title: 'Reset Form',
        message: 'Are you sure you want to reset all changes to the original payment data?',
        confirmText: 'Reset',
        variant: 'warning',
      },
      async () => {
        if (originalPayment) {
          setFormData({
            customerId: originalPayment.customerId || '',
            customerName: originalPayment.customerName || '',
            customerEmail: originalPayment.customerEmail || '',
            customerPhone: originalPayment.customerPhone || '',
            invoiceId: originalPayment.invoiceId || '',
            invoiceNumber: originalPayment.invoiceNumber || '',
            amount: originalPayment.amount || 0,
            paymentMethod: originalPayment.paymentMethod as PaymentMethod || 'cash',
            referenceNumber: originalPayment.referenceNumber || '',
            bankName: originalPayment.bankName || '',
            chequeNumber: originalPayment.chequeNumber || '',
            chequeDate: originalPayment.chequeDate || '',
            notes: originalPayment.notes || '',
            status: originalPayment.status as PaymentStatus || 'completed',
          });
          setErrors({});
          initialSnapshotRef.current = JSON.stringify(formData);
          setHasChanges(false);
          success('Form reset to original payment data.');
        }
      }
    );
  }, [hasChanges, withConfirmation, originalPayment, formData, warning, success]);

  // Delete payment handler
  const handleDelete = useCallback(async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Payment',
        message: 'Are you sure you want to delete this payment? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deletePayment(id);
            navigate('/sales/payments-received');
          },
          'Deleting payment...',
          'Payment deleted successfully.',
          'Failed to delete payment. Please try again.'
        );
      }
    );
  }, [id, withConfirmation, withLoading, deletePayment, navigate]);

  // Check if there are any errors
  const hasErrors = Object.keys(errors).length > 0;

  // Check if editable
  const isEditable = originalPayment?.status === 'pending';

  if (loading || hookLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!originalPayment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            Payment not found
          </p>
          <button
            onClick={() => navigate('/sales/payments-received')}
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
            Back to Payments
          </button>
        </div>
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
                Edit Payment
              </h1>
              <p
                className="text-sm themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Editing {originalPayment.paymentNumber} - {originalPayment.customerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isEditable && (
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs themed-transition"
                style={{
                  background: 'var(--warning-light)',
                  border: '1px solid var(--warning)',
                  color: 'var(--warning)',
                }}
              >
                <AlertCircle className="h-4 w-4" />
                <span>Read-only: Payment not pending</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 themed-transition"
              style={{
                color: 'var(--error)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--error-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Delete payment"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
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
                Reset
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
              disabled={saving || !isEditable || !hasChanges}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!saving && isEditable && hasChanges) {
                  e.currentTarget.style.background = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
              title={!isEditable ? 'Only pending payments can be edited' : ''}
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

        {/* Read-only warning */}
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
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Payment is not in pending status
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--foreground-secondary)' }}>
                Only pending payments can be edited. This payment is currently marked as <strong>{originalPayment.status}</strong>.
              </p>
            </div>
          </div>
        )}

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
                disabled={!isEditable}
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
                  Payment Number
                </label>
                <div
                  className="w-full px-4 py-2 rounded-lg themed-transition"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  {originalPayment.paymentNumber}
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Payment Date
                </label>
                <div
                  className="w-full px-4 py-2 rounded-lg themed-transition"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                >
                  {new Date(originalPayment.paymentDate).toLocaleDateString()}
                </div>
              </div>
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
                  disabled={!isEditable}
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
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                    style={{
                      border: `1px solid ${errors.amount ? 'var(--error)' : 'var(--border)'}`,
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
                      e.currentTarget.style.borderColor = errors.amount ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    disabled={!isEditable}
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
                    className="w-full pl-9 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 appearance-none themed-transition disabled:opacity-60"
                    style={{
                      border: `1px solid ${errors.paymentMethod ? 'var(--error)' : 'var(--border)'}`,
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
                      e.currentTarget.style.borderColor = errors.paymentMethod ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    disabled={!isEditable}
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
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                    style={{
                      border: `1px solid ${errors.referenceNumber ? 'var(--error)' : 'var(--border)'}`,
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
                      e.currentTarget.style.borderColor = errors.referenceNumber ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter reference number"
                    disabled={!isEditable}
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
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
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
                    placeholder="Enter bank name"
                    disabled={!isEditable}
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
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                    style={{
                      border: `1px solid ${errors.chequeNumber ? 'var(--error)' : 'var(--border)'}`,
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
                      e.currentTarget.style.borderColor = errors.chequeNumber ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter cheque number"
                    disabled={!isEditable}
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
                    className="w-full pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
                    style={{
                      border: `1px solid ${errors.chequeDate ? 'var(--error)' : 'var(--border)'}`,
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
                      e.currentTarget.style.borderColor = errors.chequeDate ? 'var(--error)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    disabled={!isEditable}
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
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition disabled:opacity-60"
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
                disabled={!isEditable}
              >
                {PAYMENT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              {!isEditable && (
                <p className="mt-1 text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
                  Status cannot be changed for non-pending payments
                </p>
              )}
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
              disabled={!isEditable}
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

export default PaymentReceivedEdit;