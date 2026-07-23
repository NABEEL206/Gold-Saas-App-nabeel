// src/pages/purchases/RecurringExpenses/RecurringExpenseEdit.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2, User, Mail, Phone, AlertCircle } from 'lucide-react';
import { useRecurringExpense } from '../../../hooks/RecurringExpense/useRecurringExpense';
import { useRecurringExpenseEdit } from '../../../hooks/RecurringExpense/useRecurringExpenseEdit';
import { useVendor } from '../../../hooks/vendor/useVendor';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { RECURRING_CATEGORIES } from '../../../types/RecurringExpense/RecurringExpenseType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// ============================================================
// CONSTANTS - Single source of truth
// ============================================================

// ─── Static option lists ───────────────────────────────────────────────────────
const CATEGORY_OPTIONS: DropdownOption[] = RECURRING_CATEGORIES.map(c => ({ value: c, label: c }));

const FREQUENCY_OPTIONS: DropdownOption[] = [
  { value: 'daily',       label: 'Daily' },
  { value: 'weekly',      label: 'Weekly' },
  { value: 'monthly',     label: 'Monthly' },
  { value: 'quarterly',   label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'yearly',      label: 'Yearly' },
  { value: 'custom',      label: 'Custom' },
];

const FREQUENCY_UNIT_OPTIONS: DropdownOption[] = [
  { value: 'days',   label: 'Days' },
  { value: 'weeks',  label: 'Weeks' },
  { value: 'months', label: 'Months' },
  { value: 'years',  label: 'Years' },
];

const PAYMENT_METHOD_OPTIONS: DropdownOption[] = [
  { value: 'cash',        label: 'Cash' },
  { value: 'bank',        label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cheque',      label: 'Cheque' },
  { value: 'auto_debit',  label: 'Auto Debit' },
];

const RECURRING_STATUS_OPTIONS: DropdownOption[] = [
  { value: 'active',    label: 'Active' },
  { value: 'paused',    label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

const CURRENCY_OPTIONS: DropdownOption[] = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
];

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

const RecurringExpenseEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getExpenseById, updateExpense } = useRecurringExpense();
  const { vendors } = useVendor();

  const [expense, setExpense] = useState<any>(null);
  const [loadingExpense, setLoadingExpense] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isVendorExpense, setIsVendorExpense] = useState(false);
  const [vendorOptions, setVendorOptions] = useState<DropdownOption[]>([]);
  const [selectedVendorInfo, setSelectedVendorInfo] = useState<{
    email?: string; phone?: string; address?: string;
  } | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  // Use the toast and confirm hook
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

  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
    resetForm,
  } = useRecurringExpenseEdit(expense);

  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loadingExpense && expense && initialSnapshotRef.current === null) {
      initialSnapshotRef.current = JSON.stringify({ formData, isVendorExpense });
    }
    if (initialSnapshotRef.current !== null) {
      setHasChanges(JSON.stringify({ formData, isVendorExpense }) !== initialSnapshotRef.current);
    }
  }, [formData, loadingExpense, expense, isVendorExpense]);

  // Build vendor options
  useEffect(() => {
    setVendorOptions(
      vendors.map(v => ({
        value: String(v.id),
        label: v.name,
        group: v.status === 'active' ? 'Active' : 'Inactive',
      }))
    );
  }, [vendors]);

  // Show error toast for submit errors
  useEffect(() => {
    if (errors.submit) {
      showError(errors.submit);
    }
  }, [errors.submit, showError]);

  // Auto-show error summary when new errors appear
  useEffect(() => {
    const formErrors = getFormErrors();
    if (Object.keys(formErrors).length > 0) {
      setShowErrorSummary(true);
    }
  }, [errors]);

  // Show warnings as toasts
  useEffect(() => {
    if (warnings && warnings.length > 0) {
      warnings.forEach(warning => showWarning(warning));
    }
  }, [warnings, showWarning]);

  // Load recurring expense
  useEffect(() => {
    const load = async () => {
      if (!id) {
        showError('Invalid expense ID');
        navigate('/purchases/recurring-expenses');
        return;
      }
      setLoadingExpense(true);
      setLoadError(null);
      try {
        const data = await getExpenseById(id);
        if (data) {
          setExpense(data);
          setIsVendorExpense(data.isVendorExpense || !!data.vendorId || !!data.vendorName);
          setFormData({
            vendorId: data.vendorId || undefined,
            vendorName: data.vendorName || undefined,
            category: data.category || '',
            subCategory: data.subCategory || undefined,
            amount: data.amount || 0,
            taxAmount: data.taxAmount || 0,
            totalAmount: data.totalAmount || 0,
            startDate: data.startDate || new Date().toISOString().split('T')[0],
            endDate: data.endDate || undefined,
            description: data.description || undefined,
            frequency: data.frequency || 'monthly',
            frequencyInterval: data.frequencyInterval || 1,
            frequencyUnit: data.frequencyUnit || 'months',
            paymentMethod: data.paymentMethod || 'bank',
            paymentStatus: data.paymentStatus || 'active',
            referenceNumber: data.referenceNumber || undefined,
            notes: data.notes || undefined,
            isVendorExpense: data.isVendorExpense || false,
            attachment: data.attachment || undefined,
            currency: data.currency || 'INR',
            exchangeRate: data.exchangeRate || 1,
            totalOccurrences: data.totalOccurrences || 12,
          });
        } else {
          setLoadError('Recurring expense not found');
          showError('Recurring expense not found. Redirecting back...');
          setTimeout(() => navigate('/purchases/recurring-expenses'), 2000);
        }
      } catch {
        setLoadError('Error loading recurring expense data');
        showError('Failed to load recurring expense data. Please try again.');
      } finally {
        setLoadingExpense(false);
      }
    };
    load();
  }, [id, getExpenseById, setFormData, navigate, showError]);

  // Restore vendor info card when vendor list loads
  useEffect(() => {
    if (formData.vendorId && vendors.length > 0) {
      const v = vendors.find(v => String(v.id) === String(formData.vendorId));
      if (v) setSelectedVendorInfo({ email: v.email, phone: v.phone, address: v.address });
    }
  }, [formData.vendorId, vendors]);

  // Filter out submit error from form errors for display
  const getFormErrors = () => {
    return Object.entries(errors).reduce((acc, [key, value]) => {
      if (key !== 'submit') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
  };

  // Convert warnings array to errors object for ErrorSummary
  const getWarningErrors = () => {
    if (!warnings || warnings.length === 0) return {};
    return warnings.reduce((acc, warning, index) => {
      acc[`warning_${index}`] = warning;
      return acc;
    }, {} as Record<string, string>);
  };

  const handleVendorSelect = (option: DropdownOption) => {
    const vendor = vendors.find(v => String(v.id) === option.value);
    handleChange('vendorId', option.value);
    handleChange('vendorName', vendor?.name ?? option.label);
    setSelectedVendorInfo(vendor
      ? { email: vendor.email, phone: vendor.phone, address: vendor.address }
      : null,
    );
  };

  const clearVendor = () => {
    handleChange('vendorId', '');
    handleChange('vendorName', '');
    setSelectedVendorInfo(null);
  };

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(updateExpense, isVendorExpense);
        if (!success) {
          throw new Error('Failed to update recurring expense');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/purchases/recurring-expenses');
      },
      'Updating recurring expense...',
      'Recurring expense updated successfully.',
      'Failed to update recurring expense. Please try again.'
    );
  };

  // Cancel handler with unsaved changes confirmation
  const handleCancel = async () => {
    if (!hasChanges) {
      navigate('/purchases/recurring-expenses');
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
        navigate('/purchases/recurring-expenses');
      }
    );
  };

  // Reset form handler
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
        if (resetForm) {
          resetForm();
        }
        initialSnapshotRef.current = null;
        success('Form reset to original values.');
      }
    );
  };

  const formErrors = getFormErrors();
  const warningErrors = getWarningErrors();

  if (loadingExpense) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading recurring expense details..." />
      </div>
    );
  }
  
  if (loadError || !expense) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--warning)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {loadError || 'Recurring expense not found'}
          </p>
          <button
            onClick={() => navigate('/purchases/recurring-expenses')}
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
            Back to Recurring Expenses
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
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
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
                Edit Recurring Expense
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {expense.recurringNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                type="button"
                onClick={handleResetForm}
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
                title="Reset changes"
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
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Summary - Using reusable component */}
        {showErrorSummary && Object.keys(formErrors).length > 0 && (
          <ErrorSummary
            errors={formErrors}
            variant="error"
            title="Please fix the following errors:"
            onClose={() => setShowErrorSummary(false)}
            maxDisplay={10}
          />
        )}

        {/* Warning Summary - Using reusable component */}
        {showWarningSummary && Object.keys(warningErrors).length > 0 && (
          <ErrorSummary
            errors={warningErrors}
            variant="warning"
            title="Please review the following warnings:"
            onClose={() => setShowWarningSummary(false)}
            maxDisplay={5}
          />
        )}

        {/* ── Form ── */}
        <div
          className="rounded-xl p-6 themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <h3
                className="text-lg font-medium mb-4 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Basic Information
              </h3>
            </div>

            {/* ── Expense type toggle ── */}
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Expense Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setIsVendorExpense(false); clearVendor(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors themed-transition`}
                  style={{
                    borderColor: !isVendorExpense ? 'var(--primary)' : 'var(--border)',
                    background: !isVendorExpense ? 'var(--primary-light)' : 'var(--card)',
                    color: !isVendorExpense ? 'var(--primary)' : 'var(--foreground-secondary)',
                  }}
                >
                  <User className="h-4 w-4" />
                  General Expense
                </button>
                <button
                  type="button"
                  onClick={() => setIsVendorExpense(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors themed-transition`}
                  style={{
                    borderColor: isVendorExpense ? 'var(--primary)' : 'var(--border)',
                    background: isVendorExpense ? 'var(--primary-light)' : 'var(--card)',
                    color: isVendorExpense ? 'var(--primary)' : 'var(--foreground-secondary)',
                  }}
                >
                  <Building2 className="h-4 w-4" />
                  Vendor Expense
                </button>
              </div>
            </div>

            {/* ── Vendor dropdown ── */}
            {isVendorExpense && (
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-1.5 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Vendor <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <SearchableDropdown
                  options={vendorOptions}
                  value={formData.vendorId != null ? String(formData.vendorId) : null}
                  onChange={handleVendorSelect}
                  placeholder="Search vendor by name..."
                  triggerPlaceholder="Select a vendor..."
                  showEmptyState
                  emptyStateText="No vendors found"
                  resetSearchOnOpen
                />
                {errors.vendorId && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.vendorId}
                  </p>
                )}
                {selectedVendorInfo && (
                  <div
                    className="mt-3 p-3 rounded-lg flex flex-wrap gap-4 text-sm themed-transition"
                    style={{
                      background: 'var(--primary-light)',
                      border: '1px solid var(--primary)',
                      color: 'var(--foreground-secondary)',
                    }}
                  >
                    {selectedVendorInfo.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                        {selectedVendorInfo.email}
                      </span>
                    )}
                    {selectedVendorInfo.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" style={{ color: 'var(--primary)' }} />
                        {selectedVendorInfo.phone}
                      </span>
                    )}
                    {selectedVendorInfo.address && (
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        {selectedVendorInfo.address}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Category */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Category <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <SearchableDropdown
                options={CATEGORY_OPTIONS}
                value={formData.category || null}
                onChange={(opt) => handleChange('category', opt.value)}
                triggerPlaceholder="Select Category"
                placeholder="Search category..."
              />
              {errors.category && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.category}
                </p>
              )}
            </div>

            {/* Sub Category */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Sub Category
              </label>
              <input
                type="text"
                value={formData.subCategory || ''}
                onChange={(e) => handleChange('subCategory', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.subCategory ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('subCategory', e, errors)}
                placeholder="Enter sub category"
              />
              {errors.subCategory && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.subCategory}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Amount <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.amount ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('amount', e, errors)}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Tax Amount */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Tax Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.taxAmount || ''}
                onChange={(e) => handleChange('taxAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.taxAmount ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('taxAmount', e, errors)}
                placeholder="0.00"
              />
              {errors.taxAmount && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.taxAmount}
                </p>
              )}
            </div>

            {/* Total Amount */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Total Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.totalAmount || ''}
                onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.totalAmount ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('totalAmount', e, errors)}
                placeholder="0.00"
              />
              {errors.totalAmount && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.totalAmount}
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Currency
              </label>
              <SearchableDropdown
                options={CURRENCY_OPTIONS}
                value={formData.currency || 'INR'}
                onChange={(opt) => handleChange('currency', opt.value)}
                triggerPlaceholder="Select Currency"
                placeholder="Search currency..."
              />
              {errors.currency && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.currency}
                </p>
              )}
            </div>

            {/* Exchange Rate */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Exchange Rate
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.exchangeRate || ''}
                onChange={(e) => handleChange('exchangeRate', parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.exchangeRate ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('exchangeRate', e, errors)}
                placeholder="1.0000"
              />
              {errors.exchangeRate && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.exchangeRate}
                </p>
              )}
            </div>

            {/* Frequency */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Frequency <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <SearchableDropdown
                options={FREQUENCY_OPTIONS}
                value={formData.frequency || null}
                onChange={(opt) => handleChange('frequency', opt.value)}
                triggerPlaceholder="Select Frequency"
                placeholder="Search frequency..."
              />
              {errors.frequency && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.frequency}
                </p>
              )}
            </div>

            {/* Custom Frequency Fields */}
            {formData.frequency === 'custom' && (
              <>
                <div>
                  <label
                    className="block text-sm font-medium mb-1 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Interval <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.frequencyInterval || ''}
                    onChange={(e) => handleChange('frequencyInterval', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `1px solid ${errors.frequencyInterval ? 'var(--error)' : 'var(--border)'}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={handleInputFocus}
                    onBlur={(e) => handleInputBlur('frequencyInterval', e, errors)}
                    placeholder="Every"
                    min="1"
                  />
                  {errors.frequencyInterval && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                      {errors.frequencyInterval}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Unit <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <SearchableDropdown
                    options={FREQUENCY_UNIT_OPTIONS}
                    value={formData.frequencyUnit || 'months'}
                    onChange={(opt) => handleChange('frequencyUnit', opt.value)}
                    triggerPlaceholder="Select Unit"
                    placeholder="Search unit..."
                  />
                  {errors.frequencyUnit && (
                    <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                      {errors.frequencyUnit}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Total Occurrences */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Total Occurrences
              </label>
              <input
                type="number"
                value={formData.totalOccurrences || ''}
                onChange={(e) => handleChange('totalOccurrences', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.totalOccurrences ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('totalOccurrences', e, errors)}
                placeholder="Number of occurrences"
                min="1"
              />
              {errors.totalOccurrences && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.totalOccurrences}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Start Date <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.startDate ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('startDate', e, errors)}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.endDate ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('endDate', e, errors)}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.endDate}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.description ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('description', e, errors)}
                placeholder="Enter description"
              />
              {errors.description && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* ── Payment Information ── */}
            <div className="md:col-span-2">
              <h3
                className="text-lg font-medium mb-4 mt-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Payment Information
              </h3>
            </div>

            {/* Payment Method */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Payment Method <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <SearchableDropdown
                options={PAYMENT_METHOD_OPTIONS}
                value={formData.paymentMethod || null}
                onChange={(opt) => handleChange('paymentMethod', opt.value)}
                triggerPlaceholder="Select Payment Method"
                placeholder="Search method..."
              />
              {errors.paymentMethod && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.paymentMethod}
                </p>
              )}
            </div>

            {/* Recurring Status */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Status <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <SearchableDropdown
                options={RECURRING_STATUS_OPTIONS}
                value={formData.paymentStatus || null}
                onChange={(opt) => handleChange('paymentStatus', opt.value)}
                triggerPlaceholder="Select Status"
                placeholder="Search status..."
              />
              {errors.paymentStatus && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.paymentStatus}
                </p>
              )}
            </div>

            {/* Reference Number */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Reference Number
              </label>
              <input
                type="text"
                value={formData.referenceNumber || ''}
                onChange={(e) => handleChange('referenceNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.referenceNumber ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('referenceNumber', e, errors)}
                placeholder="Enter reference number"
              />
              {errors.referenceNumber && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.referenceNumber}
                </p>
              )}
            </div>

            {/* Notes */}
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

export default RecurringExpenseEdit;