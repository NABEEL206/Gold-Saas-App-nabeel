// src/pages/accountant/ChartOfAccounts/ChartOfAccountsCreate.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useChartOfAccounts } from '../../../hooks/ChartOfAccounts/useChartOfAccounts';
import { useChartOfAccountsCreate } from '../../../hooks/ChartOfAccounts/useChartOfAccountsCreate';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
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

  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([]);

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

  // Get parent account options (filter out self and system accounts if needed)
  const parentAccountOptions: DropdownOption[] = accounts
    .filter(a => a.id !== formData.parentAccountId)
    .map(a => ({
      value: String(a.id),
      label: `${a.code} - ${a.name}`
    }));

  const onSubmit = async () => {
    const success = await handleSubmit(createAccount);
    if (success) {
      navigate('/accountant/chart-of-accounts');
    }
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
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/accountant/chart-of-accounts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 mt-0.5">Add a new chart of accounts entry</p>
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Account'}
        </button>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.submit}
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
  );
};

export default ChartOfAccountsCreate;