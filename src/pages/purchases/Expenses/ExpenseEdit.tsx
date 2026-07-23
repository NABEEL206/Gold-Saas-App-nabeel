// src/pages/purchases/Expenses/ExpenseEdit.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2, User, Mail, Phone, AlertCircle, Plus, X } from 'lucide-react';
import { useExpense } from '../../../hooks/Expense/useExpense';
import { useExpenseEdit } from '../../../hooks/Expense/useExpenseEdit';
import { useVendor } from '../../../hooks/vendor/useVendor';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { 
  EXPENSE_CATEGORIES, 
  EXPENSE_ACCOUNTS,
  PAYMENT_METHODS, 
  PAYMENT_STATUSES 
} from '../../../types/Expense/ExpenseType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { 
  validateExpenseForm, 
  formatValidationErrors,
  hasValidationErrors,
  getErrorCount
} from '../../../validations/expense.validation';

// ============================================================
// CONSTANTS - Single source of truth
// ============================================================

// ─── Static option lists ───────────────────────────────────────────────────────
const EXPENSE_CATEGORY_OPTIONS: DropdownOption[] = EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }));
const EXPENSE_ACCOUNT_OPTIONS: DropdownOption[] = EXPENSE_ACCOUNTS.map(a => ({ value: a, label: a }));
const PAYMENT_METHOD_OPTIONS: DropdownOption[] = PAYMENT_METHODS.map(m => ({
  value: m,
  label: m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
}));
const PAYMENT_STATUS_OPTIONS: DropdownOption[] = PAYMENT_STATUSES.map(s => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}));

const ExpenseEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getExpenseById, updateExpense, validationErrors: apiValidationErrors } = useExpense();
  const { vendors } = useVendor();

  const [expense, setExpense] = useState<any>(null);
  const [loadingExpense, setLoadingExpense] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isVendorExpense, setIsVendorExpense] = useState(false);
  const [vendorOptions, setVendorOptions] = useState<DropdownOption[]>([]);
  const [selectedVendorInfo, setSelectedVendorInfo] = useState<{
    email?: string; phone?: string; address?: string;
  } | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [isManualCategory, setIsManualCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

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

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
    resetForm,
    clearErrors,
    validateForm,
    setErrors,
  } = useExpenseEdit(expense);

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

  // Build vendor dropdown options
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

  // Handle API validation errors
  useEffect(() => {
    if (Object.keys(apiValidationErrors).length > 0) {
      const formattedErrors: Record<string, string> = {};
      Object.entries(apiValidationErrors).forEach(([key, value]) => {
        if (value) {
          formattedErrors[key] = value;
        }
      });
      
      setErrors(prev => ({
        ...prev,
        ...formattedErrors
      }));
      
      setShowErrorSummary(true);
      showError('Please check the form for errors.');
    }
  }, [apiValidationErrors, setErrors, showError]);

  // Load expense
  useEffect(() => {
    const load = async () => {
      if (!id) {
        showError('Invalid expense ID');
        navigate('/purchases/expenses');
        return;
      }
      setLoadingExpense(true);
      setLoadError(null);
      try {
        const data = await getExpenseById(id);
        if (data) {
          setExpense(data);
          setIsVendorExpense(!!data.vendorId || !!data.vendorName);
          setFormData({
            vendorId: data.vendorId || '',
            vendorName: data.vendorName || '',
            category: data.category || '',
            subCategory: data.subCategory || '',
            expenseAccount: data.expenseAccount || '',
            amount: data.amount || 0,
            taxAmount: data.taxAmount || 0,
            totalAmount: data.totalAmount || 0,
            date: data.date || new Date().toISOString().split('T')[0],
            dueDate: data.dueDate || '',
            description: data.description || '',
            paymentMethod: data.paymentMethod || 'bank',
            paymentStatus: data.paymentStatus || 'unpaid',
            referenceNumber: data.referenceNumber || '',
            attachment: data.attachment || '',
            notes: data.notes || '',
            receiptNumber: data.receiptNumber || '',
            billNumber: data.billNumber || '',
            currency: data.currency || 'INR',
            exchangeRate: data.exchangeRate || 1,
            isVendorExpense: !!data.vendorId || !!data.vendorName,
          });
        } else {
          setLoadError('Expense not found');
          showError('Expense not found. Redirecting back...');
          setTimeout(() => navigate('/purchases/expenses'), 2000);
        }
      } catch (err) {
        setLoadError('Error loading expense data');
        showError('Failed to load expense data. Please try again.');
      } finally {
        setLoadingExpense(false);
      }
    };
    load();
  }, [id, getExpenseById, setFormData, navigate, showError]);

  // Restore vendor info card when vendor list loads and formData has a vendorId
  useEffect(() => {
    if (formData.vendorId && vendors.length > 0) {
      const v = vendors.find(v => String(v.id) === String(formData.vendorId));
      if (v) setSelectedVendorInfo({ email: v.email, phone: v.phone, address: v.address });
    }
  }, [formData.vendorId, vendors]);

  // Check if category is custom (not in the predefined list)
  useEffect(() => {
    if (formData.category && !EXPENSE_CATEGORIES.includes(formData.category)) {
      setIsManualCategory(true);
      setCustomCategory(formData.category);
    }
  }, [formData.category]);

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

  // Handle category selection or manual entry
  const handleCategorySelect = (option: DropdownOption) => {
    handleChange('category', option.value);
    setIsManualCategory(false);
    setCustomCategory('');
  };

  const handleManualCategoryAdd = () => {
    if (customCategory.trim()) {
      handleChange('category', customCategory.trim());
      setIsManualCategory(false);
      setCustomCategory('');
    }
  };

  const toggleManualCategory = () => {
    setIsManualCategory(!isManualCategory);
    if (!isManualCategory) {
      handleChange('category', '');
    } else {
      setCustomCategory(formData.category || '');
    }
  };

  const onSubmit = async () => {
    // Validate before submitting
    const isValid = validateForm();
    if (!isValid) {
      setShowErrorSummary(true);
      showError('Please fix the errors before submitting.');
      return;
    }

    await withLoading(
      async () => {
        const result = await handleSubmit(updateExpense);
        if (!result) {
          throw new Error('Failed to update expense');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        success('Expense updated successfully.');
        navigate('/purchases/expenses');
      },
      'Updating expense...',
      'Expense updated successfully.',
      'Failed to update expense. Please try again.'
    );
  };

  // Cancel handler with unsaved changes confirmation
  const handleCancel = async () => {
    if (!hasChanges) {
      navigate('/purchases/expenses');
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
        navigate('/purchases/expenses');
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
        resetForm();
        clearErrors();
        initialSnapshotRef.current = null;
        setShowErrorSummary(false);
        success('Form reset to original values.');
      }
    );
  };

  // Get filter errors (exclude submit error)
  const getFilteredErrors = () => {
    const filtered: Record<string, string> = {};
    Object.entries(errors).forEach(([key, value]) => {
      if (key !== 'submit' && value) {
        filtered[key] = value;
      }
    });
    return filtered;
  };

  const filteredErrors = getFilteredErrors();
  const hasErrors = Object.keys(filteredErrors).length > 0;

  // Handle field blur for validation
  const handleFieldBlur = (field: string) => {
    if (formData[field as keyof typeof formData]) {
      const validationResult = validateExpenseForm(formData);
      if (validationResult.errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: validationResult.errors[field] || ''
        }));
        setShowErrorSummary(true);
      }
    }
  };

  // Combined blur handler for input fields
  const handleInputBlur = (field: string, e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleFieldBlur(field);
    e.currentTarget.style.borderColor = errors[field] ? 'var(--error)' : 'var(--border)';
    e.currentTarget.style.boxShadow = 'none';
  };

  // Focus handler for input fields
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--primary)';
    e.currentTarget.style.boxShadow = 'var(--focus-ring)';
  };

  if (loadingExpense) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading expense details..." />
      </div>
    );
  }
  
  if (loadError || !expense) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--warning)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {loadError || 'Expense not found'}
          </p>
          <button
            onClick={() => navigate('/purchases/expenses')}
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
            Back to Expenses
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
                Edit Expense
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {expense.expenseNumber}
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

        {/* Error Summary */}
        {(showErrorSummary || hasErrors) && hasErrors && (
          <ErrorSummary
            errors={filteredErrors}
            title="Please fix the following errors:"
            variant="warning"
            onClose={() => {
              setShowErrorSummary(false);
              clearErrors();
            }}
            showIcon={true}
            showBadge={false}
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
                  onClick={() => { 
                    setIsVendorExpense(false); 
                    handleChange('isVendorExpense', false); 
                    clearVendor(); 
                    clearErrors();
                  }}
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
                  onClick={() => { 
                    setIsVendorExpense(true); 
                    handleChange('isVendorExpense', true); 
                    clearErrors();
                  }}
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
                  value={formData.vendorId ? String(formData.vendorId) : null}
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

            {/* Category with Manual Entry Option */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Category <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              
              {!isManualCategory ? (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <SearchableDropdown
                      options={EXPENSE_CATEGORY_OPTIONS}
                      value={formData.category || null}
                      onChange={handleCategorySelect}
                      triggerPlaceholder="Select Category"
                      placeholder="Search category..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={toggleManualCategory}
                    className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm themed-transition"
                    style={{
                      background: 'var(--surface)',
                      color: 'var(--foreground-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface)';
                    }}
                    title="Add custom category"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category..."
                        className="flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                        style={{
                          border: '1px solid var(--border)',
                          background: 'var(--background)',
                          color: 'var(--foreground)',
                        }}
                        onFocus={handleInputFocus}
                        onBlur={(e) => handleInputBlur('category', e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleManualCategoryAdd();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleManualCategoryAdd}
                        className="px-3 py-2 rounded-lg transition-colors themed-transition"
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
                        Update
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleManualCategory}
                    className="px-3 py-2 rounded-lg transition-colors themed-transition"
                    style={{
                      background: 'var(--surface)',
                      color: 'var(--foreground-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface)';
                    }}
                    title="Cancel manual entry"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
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
                onBlur={(e) => handleInputBlur('subCategory', e)}
                placeholder="Enter sub category"
              />
              {errors.subCategory && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.subCategory}
                </p>
              )}
            </div>

            {/* Expense Account */}
            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Expense Account
              </label>
              <SearchableDropdown
                options={EXPENSE_ACCOUNT_OPTIONS}
                value={formData.expenseAccount || null}
                onChange={(opt) => handleChange('expenseAccount', opt.value)}
                triggerPlaceholder="Select expense account..."
                placeholder="Search expense account..."
                showEmptyState
                emptyStateText="No accounts found"
              />
              {errors.expenseAccount && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.expenseAccount}
                </p>
              )}
              <p
                className="mt-1 text-xs themed-transition"
                style={{ color: 'var(--foreground-tertiary)' }}
              >
                Select the account this expense should be recorded against
              </p>
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
                onBlur={(e) => handleInputBlur('amount', e)}
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
                onBlur={(e) => handleInputBlur('taxAmount', e)}
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
                onBlur={(e) => handleInputBlur('totalAmount', e)}
                placeholder="0.00"
              />
              {errors.totalAmount && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.totalAmount}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Date <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.date ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('date', e)}
              />
              {errors.date && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.date}
                </p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.dueDate ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('dueDate', e)}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.dueDate}
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
                onBlur={(e) => handleInputBlur('description', e)}
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

            {/* Payment Status */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Payment Status <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <SearchableDropdown
                options={PAYMENT_STATUS_OPTIONS}
                value={formData.paymentStatus || null}
                onChange={(opt) => handleChange('paymentStatus', opt.value)}
                triggerPlaceholder="Select Payment Status"
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
                onBlur={(e) => handleInputBlur('referenceNumber', e)}
                placeholder="Enter reference number"
              />
              {errors.referenceNumber && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.referenceNumber}
                </p>
              )}
            </div>

            {/* Receipt Number */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Receipt Number
              </label>
              <input
                type="text"
                value={formData.receiptNumber || ''}
                onChange={(e) => handleChange('receiptNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.receiptNumber ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('receiptNumber', e)}
                placeholder="Enter receipt number"
              />
              {errors.receiptNumber && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.receiptNumber}
                </p>
              )}
            </div>

            {/* Bill Number */}
            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Bill Number
              </label>
              <input
                type="text"
                value={formData.billNumber || ''}
                onChange={(e) => handleChange('billNumber', e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.billNumber ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('billNumber', e)}
                placeholder="Enter bill number"
              />
              {errors.billNumber && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.billNumber}
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
                onBlur={(e) => handleInputBlur('notes', e)}
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

export default ExpenseEdit;