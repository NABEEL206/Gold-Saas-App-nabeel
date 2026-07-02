// src/pages/accountant/ChartOfAccounts/ChartOfAccountsCreate.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useChartOfAccounts } from '../../../hooks/ChartOfAccounts/useChartOfAccounts';
import { useChartOfAccountsCreate } from '../../../hooks/ChartOfAccounts/useChartOfAccountsCreate';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { 
  ACCOUNT_TYPES, 
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_CATEGORIES
} from '../../../types/ChartOfAccounts/ChartOfAccountsType';

// Convert types to dropdown options
const typeOptions: DropdownOption[] = ACCOUNT_TYPES.map(type => ({
  value: type,
  label: ACCOUNT_TYPE_LABELS[type]
}));

const ChartOfAccountsCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createAccount, accounts } = useChartOfAccounts();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
  } = useChartOfAccountsCreate();

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

  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([]);

  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentState = JSON.stringify(formData);
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = currentState;
    }
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData]);

  // Update categories when type changes
  useEffect(() => {
    const categories = ACCOUNT_CATEGORIES[formData.type] || [];
    setCategoryOptions(categories.map(cat => ({
      value: cat,
      label: cat
    })));
    // Reset category when type changes
    if (!categories.includes(formData.category)) {
      handleChange('category', '');
    }
  }, [formData.type]);

  // Show error toast for submit errors
  useEffect(() => {
    if (errors.submit) {
      showError(errors.submit);
    }
  }, [errors.submit, showError]);

  // Get parent account options (filter out self and system accounts if needed)
  const parentAccountOptions: DropdownOption[] = accounts
    .filter(a => a.id !== formData.parentAccountId)
    .map(a => ({
      value: String(a.id),
      label: `${a.code} - ${a.name}`
    }));

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(createAccount);
        if (!success) {
          throw new Error('Failed to create account');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/accountant/chart-of-accounts');
      },
      'Creating account...',
      `Account "${formData.name}" created successfully.`,
      'Failed to create account. Please try again.'
    );
  };

  // Cancel handler with unsaved changes confirmation
  const handleCancel = async () => {
    if (!hasChanges) {
      navigate('/accountant/chart-of-accounts');
      return;
    }

    await withConfirmation(
      {
        title: 'Discard Account',
        message: 'You have unsaved account details. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/accountant/chart-of-accounts');
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
        window.location.reload();
        success('Form cleared successfully.');
      }
    );
  };

  // Handle type selection
  const handleTypeSelect = (option: DropdownOption) => {
    handleChange('type', option.value);
  };

  // Handle category selection
  const handleCategorySelect = (option: DropdownOption) => {
    handleChange('category', option.value);
  };

  // Handle parent account selection
  const handleParentSelect = (option: DropdownOption) => {
    const parent = accounts.find(a => String(a.id) === option.value);
    handleChange('parentAccountId', option.value);
    handleChange('parentAccountName', parent?.name || '');
  };

  // Get selected values
  const getSelectedType = (): string | null => {
    return formData.type || null;
  };

  const getSelectedCategory = (): string | null => {
    return formData.category || null;
  };

  const getSelectedParent = (): string | null => {
    return formData.parentAccountId ? String(formData.parentAccountId) : null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
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
              <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
              <p className="text-sm text-gray-500 mt-0.5">Add a new chart of accounts entry</p>
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
                  Save Account
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && Object.keys(errors).some(key => key !== 'submit') && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {Object.entries(errors)
                  .filter(([key]) => key !== 'submit')
                  .map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 1000"
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter account name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={typeOptions}
                value={getSelectedType()}
                onChange={handleTypeSelect}
                placeholder="Search type..."
                triggerPlaceholder="Select account type"
                className="w-full max-w-full"
                resetSearchOnOpen={true}
                showEmptyState={true}
                emptyStateText="No matching types found"
                maxListHeight={200}
              />
              {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={categoryOptions}
                value={getSelectedCategory()}
                onChange={handleCategorySelect}
                placeholder="Search category..."
                triggerPlaceholder="Select category"
                className="w-full max-w-full"
                resetSearchOnOpen={true}
                showEmptyState={true}
                emptyStateText="No matching categories found"
                maxListHeight={200}
              />
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Category
              </label>
              <input
                type="text"
                value={formData.subCategory || ''}
                onChange={(e) => handleChange('subCategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter sub category"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Account
              </label>
              <SearchableDropdown
                options={parentAccountOptions}
                value={getSelectedParent()}
                onChange={handleParentSelect}
                placeholder="Search parent account..."
                triggerPlaceholder="Select parent account"
                className="w-full max-w-full"
                resetSearchOnOpen={true}
                showEmptyState={true}
                emptyStateText="No parent accounts found"
                maxListHeight={200}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter account description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.openingBalance || ''}
                onChange={(e) => handleChange('openingBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isSystemAccount}
                  onChange={(e) => handleChange('isSystemAccount', e.target.checked)}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">System Account</label>
              </div>
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

export default ChartOfAccountsCreate;