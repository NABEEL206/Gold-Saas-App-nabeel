// src/pages/banking/Banks/BankCreate.tsx
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import countryList from 'react-select-country-list';
import { useBank } from '../../hooks/Bank/useBank';
import { useBankCreate } from '../../hooks/Bank/useBankCreate';
import { 
  BANK_ACCOUNT_TYPES, 
  BANK_ACCOUNT_TYPE_LABELS,
  BANK_STATUSES,
  BANK_STATUS_LABELS
} from '../../types/Bank/BankTypes';
import SearchableDropdown, { type DropdownOption } from '../../components/common/Searchabledropdown';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorSummary from '../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../hooks/ToastConfirmModal/useToastAndConfirm';

// ============================================================
// CONSTANTS - Single source of truth
// ============================================================

const ACCOUNT_TYPE_OPTIONS: DropdownOption[] = BANK_ACCOUNT_TYPES.map(t => ({
  value: t,
  label: BANK_ACCOUNT_TYPE_LABELS[t],
}));
const BANK_STATUS_OPTIONS: DropdownOption[] = BANK_STATUSES.map(s => ({
  value: s,
  label: BANK_STATUS_LABELS[s],
}));

// Combined blur handler for input fields
const handleInputBlur = (field: string, e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, errors: Record<string, string>) => {
  e.currentTarget.style.borderColor = errors[field] ? 'var(--error)' : 'var(--border)';
  e.currentTarget.style.boxShadow = 'none';
};

// Focus handler for input fields
const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--primary)';
  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
};

const BankCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createBank } = useBank();
  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleSubmit
  } = useBankCreate();

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

  // Country options from library
  const countryOptions: DropdownOption[] = useMemo(() => {
    return countryList().getData().map((c) => ({
      value: c.value,
      label: c.label,
    }));
  }, []);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  useEffect(() => {
    const currentState = JSON.stringify(formData);
    if (initialSnapshotRef.current === null) initialSnapshotRef.current = currentState;
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData]);

  useEffect(() => {
    if (errors.submit) showError(errors.submit);
  }, [errors.submit, showError]);

  useEffect(() => {
    const fe = getFormErrors();
    if (Object.keys(fe).length > 0) setShowErrorSummary(true);
  }, [errors]);

  useEffect(() => {
    if (warnings?.length) warnings.forEach(w => showWarning(w));
  }, [warnings, showWarning]);

  const getFormErrors = () =>
    Object.entries(errors).reduce((acc, [k, v]) => {
      if (k !== 'submit') acc[k] = v;
      return acc;
    }, {} as Record<string, string>);

  const getWarningErrors = () => {
    if (!warnings?.length) return {};
    return warnings.reduce((acc, w, i) => { acc[`warning_${i}`] = w; return acc; }, {} as Record<string, string>);
  };

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(createBank);
        if (!success) throw new Error('Failed to create bank');
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/banking/banks');
      },
      'Creating bank...',
      `Bank "${formData.bankName}" created successfully.`,
      'Failed to create bank. Please try again.'
    );
  };

  const handleCancel = async () => {
    if (!hasChanges) { navigate('/banking/banks'); return; }
    await withConfirmation(
      { 
        title: 'Discard Bank', 
        message: 'You have unsaved bank details. Are you sure you want to discard them?', 
        confirmText: 'Discard', 
        variant: 'danger' 
      },
      async () => navigate('/banking/banks')
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
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1
                className="text-2xl font-bold themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Create Bank
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Add a new bank account
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
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
            >
              {isSubmitting ? (
                <><LoadingSpinner size="sm" />Saving...</>
              ) : (
                <><Save className="h-4 w-4" />Save Bank</>
              )}
            </button>
          </div>
        </div>

        {/* Error Summary */}
        {showErrorSummary && Object.keys(formErrors).length > 0 && (
          <ErrorSummary
            errors={formErrors}
            variant="error"
            title="Please fix the following errors:"
            onClose={() => setShowErrorSummary(false)}
            maxDisplay={10}
          />
        )}

        {/* Warning Summary */}
        {showWarningSummary && Object.keys(warningErrors).length > 0 && (
          <ErrorSummary
            errors={warningErrors}
            variant="warning"
            title="Please review the following warnings:"
            onClose={() => setShowWarningSummary(false)}
            maxDisplay={5}
          />
        )}

        {/* Form */}
        <div
          className="rounded-xl p-6 themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Details */}
            <div className="md:col-span-2">
              <h3
                className="text-lg font-medium mb-4 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Bank Details
              </h3>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Bank Name <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.bankName ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('bankName', e, errors)}
                placeholder="Enter bank name"
              />
              {errors.bankName && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.bankName}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Account Name <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => handleChange('accountName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.accountName ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('accountName', e, errors)}
                placeholder="Enter account holder name"
              />
              {errors.accountName && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.accountName}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Account Number <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.accountNumber ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('accountNumber', e, errors)}
                placeholder="Enter account number"
              />
              {errors.accountNumber && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.accountNumber}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Account Type
              </label>
              <SearchableDropdown
                options={ACCOUNT_TYPE_OPTIONS}
                value={formData.accountType || null}
                onChange={(opt) => handleChange('accountType', opt.value)}
                triggerPlaceholder="Select account type"
                placeholder="Search type..."
                resetSearchOnOpen
              />
              {errors.accountType && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.accountType}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                IFSC Code <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.ifscCode ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('ifscCode', e, errors)}
                placeholder="Enter IFSC code"
              />
              {errors.ifscCode && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.ifscCode}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Branch Name <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.branchName}
                onChange={(e) => handleChange('branchName', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.branchName ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('branchName', e, errors)}
                placeholder="Enter branch name"
              />
              {errors.branchName && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.branchName}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Branch Address
              </label>
              <input
                type="text"
                value={formData.branchAddress || ''}
                onChange={(e) => handleChange('branchAddress', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.branchAddress ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('branchAddress', e, errors)}
                placeholder="Enter branch address"
              />
              {errors.branchAddress && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.branchAddress}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                City
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.city ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('city', e, errors)}
                placeholder="Enter city"
              />
              {errors.city && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                State
              </label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.state ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('state', e, errors)}
                placeholder="Enter state"
              />
              {errors.state && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.state}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode || ''}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.pincode ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('pincode', e, errors)}
                placeholder="Enter pincode"
              />
              {errors.pincode && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.pincode}
                </p>
              )}
            </div>

            {/* Country - Searchable Dropdown */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Country
              </label>
              <SearchableDropdown
                options={countryOptions}
                value={formData.country || 'IN'}
                onChange={(opt) => handleChange('country', opt.value)}
                triggerPlaceholder="Select country"
                placeholder="Search country..."
                resetSearchOnOpen
              />
              {errors.country && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.country}
                </p>
              )}
            </div>

            {/* Financial Details */}
            <div className="md:col-span-2">
              <h3
                className="text-lg font-medium mb-4 mt-4 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Financial Details
              </h3>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Opening Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.openingBalance || ''}
                onChange={(e) => handleChange('openingBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.openingBalance ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('openingBalance', e, errors)}
                placeholder="0.00"
              />
              {errors.openingBalance && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.openingBalance}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Current Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentBalance || ''}
                onChange={(e) => handleChange('currentBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.currentBalance ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('currentBalance', e, errors)}
                placeholder="0.00"
              />
              {errors.currentBalance && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.currentBalance}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Currency
              </label>
              <input
                type="text"
                value={formData.currency || 'INR'}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.currency ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('currency', e, errors)}
                placeholder="INR"
              />
              {errors.currency && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.currency}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Status
              </label>
              <SearchableDropdown
                options={BANK_STATUS_OPTIONS}
                value={formData.status || null}
                onChange={(opt) => handleChange('status', opt.value)}
                triggerPlaceholder="Select status"
                placeholder="Search status..."
                resetSearchOnOpen
              />
              {errors.status && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.status}
                </p>
              )}
            </div>

            {/* Contact Details */}
            <div className="md:col-span-2">
              <h3
                className="text-lg font-medium mb-4 mt-4 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Contact Details
              </h3>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson || ''}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.contactPerson ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('contactPerson', e, errors)}
                placeholder="Enter contact person name"
              />
              {errors.contactPerson && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.contactPerson}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.contactPhone ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('contactPhone', e, errors)}
                placeholder="Enter contact phone"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.contactPhone}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.contactEmail ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('contactEmail', e, errors)}
                placeholder="Enter contact email"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.contactEmail}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.notes ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('notes', e, errors)}
                placeholder="Enter additional notes"
              />
              {errors.notes && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

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

export default BankCreate;