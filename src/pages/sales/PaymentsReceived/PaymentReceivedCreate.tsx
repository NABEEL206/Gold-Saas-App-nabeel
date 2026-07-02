// src/pages/sales/PaymentReceived/PaymentReceivedCreate.tsx
import React, { useState, useRef, useEffect } from 'react';
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
import type { DropdownOption } from '../../../components/common/Searchabledropdown';

// Demo customers as DropdownOption[]
const DEMO_CUSTOMERS: DropdownOption[] = [
  { value: '1', label: 'Rajesh Jewelers', group: 'Regular' },
  { value: '2', label: 'Priya Gold House', group: 'Regular' },
  { value: '3', label: 'Suresh Gold Mart', group: 'VIP' },
  { value: '4', label: 'Meera Jewel World', group: 'Regular' },
];

// Customer details mapping
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

// Invoice details mapping
const INVOICE_DETAILS: Record<string, any> = {
  '1': { number: 'INV-000001', amount: 29500 },
  '2': { number: 'INV-000002', amount: 50445 },
  '3': { number: 'INV-000003', amount: 37760 },
  '4': { number: 'INV-000004', amount: 12862 },
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
  const handleCustomerSelect = (selectedOption: DropdownOption) => {
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
    if (errors.customerId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customerId;
        return newErrors;
      });
    }
  };

  // Handle invoice selection from dropdown
  const handleInvoiceSelect = (selectedOption: DropdownOption) => {
    const details = INVOICE_DETAILS[selectedOption.value];
    if (details) {
      setFormData(prev => ({
        ...prev,
        invoiceId: selectedOption.value,
        invoiceNumber: details.number,
        amount: details.amount,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    
    // Additional validations based on payment method
    if (formData.paymentMethod === 'cheque') {
      if (!formData.chequeNumber) newErrors.chequeNumber = 'Cheque number is required';
      if (!formData.chequeDate) newErrors.chequeDate = 'Cheque date is required';
    }
    if (formData.paymentMethod === 'bank_transfer' && !formData.referenceNumber) {
      newErrors.referenceNumber = 'Reference number is required for bank transfer';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError('Please fix the validation errors before submitting.');
      return;
    }
    
    await withLoading(
      async () => {
        await createPayment(formData);
        // Small delay to show success before navigation
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/sales/payments-received');
      },
      'Recording payment...',
      `Payment of ₹${formData.amount.toLocaleString()} recorded successfully.`,
      'Failed to record payment. Please try again.'
    );
  };

  // Cancel handler with unsaved changes confirmation
  const handleCancel = async () => {
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
  };

  // Clear form handler with confirmation
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
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
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
                Record Payment
              </h1>
              <p className="text-sm text-gray-500">Record a new customer payment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                type="button"
                onClick={handleClearForm}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Clear form"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
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
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Customer Details
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Customer <span className="text-red-500">*</span>
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
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.customerId}
                </p>
              )}
            </div>

            {formData.customerName && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="font-medium text-gray-900">{formData.customerName}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.customerEmail} {formData.customerPhone && `| ${formData.customerPhone}`}
                </p>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-500" />
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
                      if (errors.amount) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.amount;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.amount}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => {
                      setFormData({ ...formData, paymentMethod: e.target.value as any });
                      if (errors.paymentMethod) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.paymentMethod;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white ${
                      errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="upi">UPI</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.paymentMethod}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                  {formData.paymentMethod === 'bank_transfer' && <span className="text-red-500"> *</span>}
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, referenceNumber: e.target.value });
                      if (errors.referenceNumber) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.referenceNumber;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.referenceNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter reference number"
                  />
                </div>
                {errors.referenceNumber && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.referenceNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cheque Number
                  {formData.paymentMethod === 'cheque' && <span className="text-red-500"> *</span>}
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.chequeNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, chequeNumber: e.target.value });
                      if (errors.chequeNumber) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.chequeNumber;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.chequeNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter cheque number"
                  />
                </div>
                {errors.chequeNumber && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.chequeNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cheque Date
                  {formData.paymentMethod === 'cheque' && <span className="text-red-500"> *</span>}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.chequeDate}
                    onChange={(e) => {
                      setFormData({ ...formData, chequeDate: e.target.value });
                      if (errors.chequeDate) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.chequeDate;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.chequeDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.chequeDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.chequeDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber-500" />
              Status
            </h2>
            <div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Notes
            </h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter any notes..."
            />
          </div>
        </form>
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

export default PaymentReceivedCreate;