// src/pages/purchases/Expenses/ExpenseCreate.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, User, Mail, Phone, Plus, X } from 'lucide-react';
import { useExpense } from '../../../hooks/Expense/useExpense';
import { useExpenseCreate } from '../../../hooks/Expense/useExpenseCreate';
import { useVendor } from '../../../hooks/vendor/useVendor';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../../../types/Expense/ExpenseType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { 
  validateExpenseForm, 
  formatValidationErrors,
  hasValidationErrors,
  getErrorCount
} from '../../../validations/expense.validation';

// ─── Static option lists ───────────────────────────────────────────────────────
const EXPENSE_CATEGORY_OPTIONS: DropdownOption[] = EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }));
const PAYMENT_METHOD_OPTIONS: DropdownOption[] = PAYMENT_METHODS.map(m => ({
  value: m,
  label: m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
}));
const PAYMENT_STATUS_OPTIONS: DropdownOption[] = PAYMENT_STATUSES.map(s => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}));

// ─── Expense Account Options ──────────────────────────────────────────────────
const EXPENSE_ACCOUNT_OPTIONS: DropdownOption[] = [
  { value: 'travel', label: 'Travel Expenses' },
  { value: 'office_supplies', label: 'Office Supplies' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'rent', label: 'Rent' },
  { value: 'salaries', label: 'Salaries & Wages' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'software', label: 'Software & Subscriptions' },
  { value: 'equipment', label: 'Equipment & Machinery' },
  { value: 'maintenance', label: 'Maintenance & Repairs' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'legal', label: 'Legal & Professional' },
  { value: 'consulting', label: 'Consulting Services' },
  { value: 'training', label: 'Training & Development' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'communication', label: 'Communication' },
  { value: 'other', label: 'Other Expenses' }
];

const ExpenseCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createExpense, validationErrors: apiValidationErrors } = useExpense();
  const { vendors } = useVendor();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    validateForm,
    clearErrors,
    setErrors,
  } = useExpenseCreate();

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

  const [isVendorExpense, setIsVendorExpense] = useState(false);
  const [vendorOptions, setVendorOptions] = useState<DropdownOption[]>([]);
  const [selectedVendorInfo, setSelectedVendorInfo] = useState<{
    email?: string; phone?: string; address?: string;
  } | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [isManualCategory, setIsManualCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentState = JSON.stringify({ formData, isVendorExpense });
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = currentState;
    }
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData, isVendorExpense]);

  // Build vendor dropdown options from the hook's vendor list
  useEffect(() => {
    const opts: DropdownOption[] = vendors.map(v => ({
      value: String(v.id),
      label: v.name,
      group: v.status === 'active' ? 'Active' : 'Inactive',
    }));
    setVendorOptions(opts);
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
      // Format API validation errors
      const formattedErrors: Record<string, string> = {};
      Object.entries(apiValidationErrors).forEach(([key, value]) => {
        if (value) {
          formattedErrors[key] = value;
        }
      });
      
      // Merge with existing errors
      setErrors(prev => ({
        ...prev,
        ...formattedErrors
      }));
      
      setShowErrorSummary(true);
      showError('Please check the form for errors.');
    }
  }, [apiValidationErrors, setErrors, showError]);

  // Handle vendor selection — auto-fill name, id, email, phone
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
        const result = await handleSubmit(createExpense);
        if (!result) {
          throw new Error('Failed to create expense');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        success('Expense created successfully.');
        navigate('/purchases/expenses');
      },
      'Creating expense...',
      'Expense created successfully.',
      'Failed to create expense. Please try again.'
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
        title: 'Discard Expense',
        message: 'You have unsaved expense details. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/purchases/expenses');
      }
    );
  };

  // Clear form handler
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
        // Reset form by reloading the page
        window.location.reload();
        success('Form cleared successfully.');
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
    // Validate the field on blur if it has a value
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Expense</h1>
              <p className="text-sm text-gray-500 mt-0.5">Add a new expense to your records</p>
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
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Expense
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Summary - No count displayed */}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Section heading */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            </div>

            {/* ── Expense type toggle ── */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Expense Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { 
                    setIsVendorExpense(false); 
                    handleChange('isVendorExpense', false); 
                    clearVendor(); 
                    clearErrors();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    !isVendorExpense
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    isVendorExpense
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Vendor Expense
                </button>
              </div>
            </div>

            {/* ── Vendor dropdown (only for vendor expense) ── */}
            {isVendorExpense && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={vendorOptions}
                  value={typeof formData.vendorId === 'number' ? String(formData.vendorId) : formData.vendorId || null}
                  onChange={handleVendorSelect}
                  placeholder="Search vendor by name..."
                  triggerPlaceholder="Select a vendor..."
                  showEmptyState
                  emptyStateText="No vendors found"
                  resetSearchOnOpen
                />
                {errors.vendorId && (
                  <p className="mt-1 text-sm text-red-500">{errors.vendorId}</p>
                )}

                {/* Auto-filled vendor info card */}
                {selectedVendorInfo && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg flex flex-wrap gap-4 text-sm text-gray-600">
                    {selectedVendorInfo.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-amber-500" />
                        {selectedVendorInfo.email}
                      </span>
                    )}
                    {selectedVendorInfo.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-amber-500" />
                        {selectedVendorInfo.phone}
                      </span>
                    )}
                    {selectedVendorInfo.address && (
                      <span className="text-gray-500">{selectedVendorInfo.address}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Category with Manual Entry Option */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
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
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                        className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleManualCategory}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Cancel manual entry"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
              <input
                type="text"
                value={formData.subCategory || ''}
                onChange={(e) => handleChange('subCategory', e.target.value)}
                onBlur={() => handleFieldBlur('subCategory')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.subCategory ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter sub category"
              />
              {errors.subCategory && <p className="mt-1 text-sm text-red-500">{errors.subCategory}</p>}
            </div>

            {/* Expense Account */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <p className="mt-1 text-sm text-red-500">{errors.expenseAccount}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Select the account this expense should be recorded against</p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                onBlur={() => handleFieldBlur('amount')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* Tax Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.taxAmount || ''}
                onChange={(e) => handleChange('taxAmount', parseFloat(e.target.value) || 0)}
                onBlur={() => handleFieldBlur('taxAmount')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.taxAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.taxAmount && <p className="mt-1 text-sm text-red-500">{errors.taxAmount}</p>}
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalAmount || ''}
                onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value) || 0)}
                onBlur={() => handleFieldBlur('totalAmount')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.totalAmount && <p className="mt-1 text-sm text-red-500">{errors.totalAmount}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                onBlur={() => handleFieldBlur('date')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                onBlur={() => handleFieldBlur('dueDate')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={() => handleFieldBlur('description')}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter description"
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            {/* ── Payment Information ── */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-2">Payment Information</h3>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={PAYMENT_METHOD_OPTIONS}
                value={formData.paymentMethod || null}
                onChange={(opt) => handleChange('paymentMethod', opt.value)}
                triggerPlaceholder="Select Payment Method"
                placeholder="Search method..."
              />
              {errors.paymentMethod && <p className="mt-1 text-sm text-red-500">{errors.paymentMethod}</p>}
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={PAYMENT_STATUS_OPTIONS}
                value={formData.paymentStatus || null}
                onChange={(opt) => handleChange('paymentStatus', opt.value)}
                triggerPlaceholder="Select Payment Status"
                placeholder="Search status..."
              />
              {errors.paymentStatus && <p className="mt-1 text-sm text-red-500">{errors.paymentStatus}</p>}
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <input
                type="text"
                value={formData.referenceNumber || ''}
                onChange={(e) => handleChange('referenceNumber', e.target.value)}
                onBlur={() => handleFieldBlur('referenceNumber')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.referenceNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter reference number"
              />
              {errors.referenceNumber && <p className="mt-1 text-sm text-red-500">{errors.referenceNumber}</p>}
            </div>

            {/* Receipt Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <input
                type="text"
                value={formData.receiptNumber || ''}
                onChange={(e) => handleChange('receiptNumber', e.target.value)}
                onBlur={() => handleFieldBlur('receiptNumber')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.receiptNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter receipt number"
              />
              {errors.receiptNumber && <p className="mt-1 text-sm text-red-500">{errors.receiptNumber}</p>}
            </div>

            {/* Bill Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
              <input
                type="text"
                value={formData.billNumber || ''}
                onChange={(e) => handleChange('billNumber', e.target.value)}
                onBlur={() => handleFieldBlur('billNumber')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.billNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter bill number"
              />
              {errors.billNumber && <p className="mt-1 text-sm text-red-500">{errors.billNumber}</p>}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                onBlur={() => handleFieldBlur('notes')}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter additional notes"
              />
              {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes}</p>}
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

export default ExpenseCreate;