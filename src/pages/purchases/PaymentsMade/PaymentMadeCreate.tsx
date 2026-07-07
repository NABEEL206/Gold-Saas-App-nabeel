// src/pages/purchases/PaymentsMade/PaymentMadeCreate.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Mail, Phone } from 'lucide-react';
import { usePaymentMade } from '../../../hooks/PaymentMade/usePaymentMade';
import { usePaymentMadeCreate } from '../../../hooks/PaymentMade/usePaymentMadeCreate';
import { useVendor } from '../../../hooks/vendor/useVendor';
import { PAYMENT_MADE_STATUSES, PAYMENT_MADE_STATUS_LABELS } from '../../../types/PaymentMade/PaymentMadeType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// ─── Static option lists ───────────────────────────────────────────────────────
const PAYMENT_METHOD_OPTIONS: DropdownOption[] = [
  { value: 'cash',        label: 'Cash' },
  { value: 'bank',        label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cheque',      label: 'Cheque' },
  { value: 'auto_debit',  label: 'Auto Debit' },
];

const PAYMENT_STATUS_OPTIONS: DropdownOption[] = PAYMENT_MADE_STATUSES.map(s => ({
  value: s,
  label: PAYMENT_MADE_STATUS_LABELS[s],
}));

const CURRENCY_OPTIONS: DropdownOption[] = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const PaymentMadeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createPayment } = usePaymentMade();
  const { vendors } = useVendor();
  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = usePaymentMadeCreate();

  const {
    success,
    error: showError,
    warning: showWarning,
    withConfirmation,
    withLoading,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const [vendorOptions, setVendorOptions] = useState<DropdownOption[]>([]);
  const [selectedVendorInfo, setSelectedVendorInfo] = useState<{
    email?: string; phone?: string;
  } | null>(null);
  const [showBankFields, setShowBankFields] = useState(false);
  const [showChequeFields, setShowChequeFields] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentState = JSON.stringify(formData);
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = currentState;
    }
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData]);

  useEffect(() => {
    setVendorOptions(
      vendors.map(v => ({
        value: String(v.id),
        label: v.name,
        group: v.status === 'active' ? 'Active Vendors' : 'Inactive Vendors',
      }))
    );
  }, [vendors]);

  useEffect(() => {
    if (errors.submit) showError(errors.submit);
  }, [errors.submit, showError]);

  useEffect(() => {
    const formErrs = getFormErrors();
    if (Object.keys(formErrs).length > 0) setShowErrorSummary(true);
  }, [errors]);

  useEffect(() => {
    if (warnings && warnings.length > 0) {
      warnings.forEach(w => showWarning(w));
    }
  }, [warnings, showWarning]);

  const getFormErrors = () => {
    return Object.entries(errors).reduce((acc, [key, value]) => {
      if (key !== 'submit') acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  };

  const getWarningErrors = () => {
    if (!warnings || warnings.length === 0) return {};
    return warnings.reduce((acc, w, i) => {
      acc[`warning_${i}`] = w;
      return acc;
    }, {} as Record<string, string>);
  };

  const handleVendorSelect = (option: DropdownOption) => {
    const v = vendors.find(v => String(v.id) === option.value);
    handleChange('vendorId', option.value);
    handleChange('vendorName', v?.name ?? option.label);
    handleChange('vendorEmail', v?.email ?? '');
    setSelectedVendorInfo(v ? { email: v.email, phone: v.phone } : null);
  };

  const handlePaymentMethodChange = (method: string) => {
    handleChange('paymentMethod', method);
    setShowBankFields(method === 'bank' || method === 'auto_debit');
    setShowChequeFields(method === 'cheque');
    // Clear bank/cheque fields when switching methods
    if (method !== 'bank' && method !== 'auto_debit') {
      handleChange('bankName', '');
      handleChange('bankAccount', '');
    }
    if (method !== 'cheque') {
      handleChange('chequeNumber', '');
    }
  };

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(createPayment);
        if (!success) throw new Error('Failed to create payment');
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/purchases/payments-made');
      },
      'Creating payment...',
      'Payment created successfully.',
      'Failed to create payment. Please try again.'
    );
  };

  const handleCancel = async () => {
    if (!hasChanges) {
      navigate('/purchases/payments-made');
      return;
    }
    await withConfirmation(
      {
        title: 'Discard Payment',
        message: 'You have unsaved payment details. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => navigate('/purchases/payments-made')
    );
  };

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
        window.location.reload();
        success('Form cleared successfully.');
      }
    );
  };

  const formErrors = getFormErrors();
  const warningErrors = getWarningErrors();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Payment</h1>
              <p className="text-sm text-gray-500 mt-0.5">Record a new vendor payment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button type="button" onClick={handleClearForm} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Clear
              </button>
            )}
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={onSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? <><LoadingSpinner size="sm" />Saving...</> : <><Save className="h-4 w-4" />Save Payment</>}
            </button>
          </div>
        </div>

        {/* Error Summary */}
        {showErrorSummary && Object.keys(formErrors).length > 0 && (
          <ErrorSummary errors={formErrors} variant="error" title="Please fix the following errors:" onClose={() => setShowErrorSummary(false)} maxDisplay={10} />
        )}

        {/* Warning Summary */}
        {showWarningSummary && Object.keys(warningErrors).length > 0 && (
          <ErrorSummary errors={warningErrors} variant="warning" title="Please review the following warnings:" onClose={() => setShowWarningSummary(false)} maxDisplay={5} />
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor <span className="text-red-500">*</span></label>
                <SearchableDropdown options={vendorOptions} value={formData.vendorId ? String(formData.vendorId) : null} onChange={handleVendorSelect} placeholder="Search vendor by name..." triggerPlaceholder="Select a vendor..." showEmptyState emptyStateText="No vendors found" resetSearchOnOpen />
                {errors.vendorId && <p className="mt-1 text-sm text-red-500">{errors.vendorId}</p>}
                {selectedVendorInfo && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg flex flex-wrap gap-4 text-sm text-gray-600">
                    {selectedVendorInfo.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-amber-500" />{selectedVendorInfo.email}</span>}
                    {selectedVendorInfo.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-amber-500" />{selectedVendorInfo.phone}</span>}
                  </div>
                )}
              </div>

              {/* Bill Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                <input type="text" value={formData.billNumber || ''} onChange={(e) => handleChange('billNumber', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.billNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter bill number" />
                {errors.billNumber && <p className="mt-1 text-sm text-red-500">{errors.billNumber}</p>}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" value={formData.amount || ''} onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" />
                {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date <span className="text-red-500">*</span></label>
                <input type="date" value={formData.paymentDate} onChange={(e) => handleChange('paymentDate', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.paymentDate ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.paymentDate && <p className="mt-1 text-sm text-red-500">{errors.paymentDate}</p>}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
                <SearchableDropdown options={PAYMENT_METHOD_OPTIONS} value={formData.paymentMethod || null} onChange={(opt) => handlePaymentMethodChange(opt.value)} triggerPlaceholder="Select payment method" placeholder="Search method..." resetSearchOnOpen />
                {errors.paymentMethod && <p className="mt-1 text-sm text-red-500">{errors.paymentMethod}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                <SearchableDropdown options={PAYMENT_STATUS_OPTIONS} value={formData.status || null} onChange={(opt) => handleChange('status', opt.value)} triggerPlaceholder="Select status" placeholder="Search status..." resetSearchOnOpen />
                {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input type="text" value={formData.referenceNumber || ''} onChange={(e) => handleChange('referenceNumber', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.referenceNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter reference number" />
                {errors.referenceNumber && <p className="mt-1 text-sm text-red-500">{errors.referenceNumber}</p>}
              </div>

              {/* Bank fields */}
              {showBankFields && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.bankName || ''} onChange={(e) => handleChange('bankName', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.bankName ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter bank name" />
                    {errors.bankName && <p className="mt-1 text-sm text-red-500">{errors.bankName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.bankAccount || ''} onChange={(e) => handleChange('bankAccount', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.bankAccount ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter bank account number" />
                    {errors.bankAccount && <p className="mt-1 text-sm text-red-500">{errors.bankAccount}</p>}
                  </div>
                </>
              )}

              {/* Cheque fields */}
              {showChequeFields && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.chequeNumber || ''} onChange={(e) => handleChange('chequeNumber', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.chequeNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter cheque number" />
                  {errors.chequeNumber && <p className="mt-1 text-sm text-red-500">{errors.chequeNumber}</p>}
                </div>
              )}

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <SearchableDropdown options={CURRENCY_OPTIONS} value={formData.currency || 'INR'} onChange={(opt) => handleChange('currency', opt.value)} triggerPlaceholder="Select Currency" placeholder="Search currency..." />
                {errors.currency && <p className="mt-1 text-sm text-red-500">{errors.currency}</p>}
              </div>

              {/* Exchange Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Rate</label>
                <input type="number" step="0.0001" value={formData.exchangeRate || ''} onChange={(e) => handleChange('exchangeRate', parseFloat(e.target.value) || 1)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.exchangeRate ? 'border-red-500' : 'border-gray-300'}`} placeholder="1.0000" />
                {errors.exchangeRate && <p className="mt-1 text-sm text-red-500">{errors.exchangeRate}</p>}
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} rows={3} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.notes ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter additional notes" />
                {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default PaymentMadeCreate;