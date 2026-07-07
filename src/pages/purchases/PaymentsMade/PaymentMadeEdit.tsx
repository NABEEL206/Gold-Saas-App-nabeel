// src/pages/purchases/PaymentsMade/PaymentMadeEdit.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Mail, Phone, AlertCircle } from 'lucide-react';
import { usePaymentMade } from '../../../hooks/PaymentMade/usePaymentMade';
import { usePaymentMadeEdit } from '../../../hooks/PaymentMade/usePaymentMadeEdit';
import { useVendor } from '../../../hooks/vendor/useVendor';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { PAYMENT_MADE_STATUSES, PAYMENT_MADE_STATUS_LABELS } from '../../../types/PaymentMade/PaymentMadeType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
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
const PaymentMadeEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPaymentById, updatePayment } = usePaymentMade();
  const { vendors } = useVendor();

  const [payment, setPayment] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
    resetForm,
  } = usePaymentMadeEdit(payment);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loadingPayment && payment && initialSnapshotRef.current === null) {
      initialSnapshotRef.current = JSON.stringify(formData);
    }
    if (initialSnapshotRef.current !== null) {
      setHasChanges(JSON.stringify(formData) !== initialSnapshotRef.current);
    }
  }, [formData, loadingPayment, payment]);

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

  useEffect(() => {
    const load = async () => {
      if (!id) {
        showError('Invalid payment ID');
        navigate('/purchases/payments-made');
        return;
      }
      setLoadingPayment(true);
      setLoadError(null);
      try {
        const data = await getPaymentById(id);
        if (data) {
          setPayment(data);
          setFormData({
            paymentDate:     data.paymentDate     || new Date().toISOString().split('T')[0],
            billId:          data.billId          || undefined,
            billNumber:      data.billNumber      || undefined,
            vendorId:        data.vendorId        || undefined,
            vendorName:      data.vendorName      || undefined,
            vendorEmail:     data.vendorEmail     || undefined,
            amount:          data.amount          || 0,
            paymentMethod:   data.paymentMethod   || 'bank',
            referenceNumber: data.referenceNumber || undefined,
            chequeNumber:    data.chequeNumber    || undefined,
            bankName:        data.bankName        || undefined,
            bankAccount:     data.bankAccount     || undefined,
            notes:           data.notes           || undefined,
            status:          data.status          || 'pending',
            attachment:      data.attachment      || undefined,
            currency:        data.currency        || 'INR',
            exchangeRate:    data.exchangeRate    || 1,
          });
          setShowBankFields(data.paymentMethod === 'bank' || data.paymentMethod === 'auto_debit');
          setShowChequeFields(data.paymentMethod === 'cheque');
        } else {
          setLoadError('Payment not found');
          showError('Payment not found. Redirecting back...');
          setTimeout(() => navigate('/purchases/payments-made'), 2000);
        }
      } catch {
        setLoadError('Error loading payment data');
        showError('Failed to load payment data. Please try again.');
      } finally {
        setLoadingPayment(false);
      }
    };
    load();
  }, [id, getPaymentById, setFormData, navigate, showError]);

  useEffect(() => {
    if (formData.vendorId && vendors.length > 0) {
      const v = vendors.find(v => String(v.id) === String(formData.vendorId));
      if (v) setSelectedVendorInfo({ email: v.email, phone: v.phone });
    }
  }, [formData.vendorId, vendors]);

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
        const success = await handleSubmit(updatePayment);
        if (!success) throw new Error('Failed to update payment');
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/purchases/payments-made');
      },
      'Updating payment...',
      'Payment updated successfully.',
      'Failed to update payment. Please try again.'
    );
  };

  const handleCancel = async () => {
    if (!hasChanges) {
      navigate('/purchases/payments-made');
      return;
    }
    await withConfirmation(
      {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => navigate('/purchases/payments-made')
    );
  };

  const handleResetForm = async () => {
    if (!hasChanges) return;
    await withConfirmation(
      {
        title: 'Reset Form',
        message: 'Are you sure you want to reset all changes to the original values?',
        confirmText: 'Reset',
        variant: 'warning',
      },
      async () => {
        if (resetForm) resetForm();
        initialSnapshotRef.current = null;
        success('Form reset to original values.');
      }
    );
  };

  const formErrors = getFormErrors();
  const warningErrors = getWarningErrors();

  if (loadingPayment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading payment details..." />
      </div>
    );
  }
  
  if (loadError || !payment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
          <p className="text-gray-500">{loadError || 'Payment not found'}</p>
          <button onClick={() => navigate('/purchases/payments-made')} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Edit Payment</h1>
              <p className="text-sm text-gray-500 mt-0.5">{payment.paymentNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button type="button" onClick={handleResetForm} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Reset
              </button>
            )}
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={onSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? <><LoadingSpinner size="sm" />Saving...</> : <><Save className="h-4 w-4" />Save Changes</>}
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

export default PaymentMadeEdit;