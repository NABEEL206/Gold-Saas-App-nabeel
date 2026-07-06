// src/pages/Customer/CustomerCreate.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Mail,
  Phone,
  MapPin,
  User,
  Building2,
  CreditCard,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useCustomers } from '../../../hooks/customer/useCustomers';
import type { CustomerFormData } from '../../../types/customer/CustomerTypes';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import ErrorSummary from '../../../components/common/ErrorSummary';
import {
  validateCustomerForm,
  formatValidationErrors,
  hasValidationErrors,
  getErrorCount,
} from '../../../validations/customer.validation';

import countryList from 'react-select-country-list';

export const CustomerCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createCustomer, loading } = useCustomers();
  const {
    success,
    error: showError,
    confirm,
    withConfirmation,
    isOpen,
    options,
    isLoading,
    handleConfirm,
    handleCancel,
  } = useToastAndConfirm();

  const [formData, setFormData] = useState<CustomerFormData>({
    salutation: '',
    firstName: '',
    lastName: '',
    displayName: '',
    customerType: 'individual',
    email: '',
    workPhone: '',
    mobileNumber: '',
    billingAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: 'IN',
    openingBalance: 0,
    creditLimit: 0,
    gstNumber: '',
    panNumber: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Get country list from react-select-country-list
  const countryData = useMemo(() => countryList().getData(), []);

  // Convert to dropdown options format
  const countryOptions: DropdownOption[] = useMemo(() => {
    return countryData.map((country) => ({
      value: country.value,
      label: country.label,
    }));
  }, [countryData]);

  // Dropdown options
  const salutationOptions: DropdownOption[] = [
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Dr.', label: 'Dr.' },
    { value: 'Prof.', label: 'Prof.' },
  ];

  const customerTypeOptions: DropdownOption[] = [
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' },
    { value: 'government', label: 'Government' },
    { value: 'non-profit', label: 'Non-Profit' },
  ];

  // Auto-generate display name
  useEffect(() => {
    if (formData.firstName || formData.lastName) {
      const display = `${formData.firstName} ${formData.lastName}`.trim();
      if (display) {
        setFormData(prev => ({ ...prev, displayName: display }));
      }
    }
  }, [formData.firstName, formData.lastName]);

  const validateForm = useCallback((): boolean => {
    const validationErrors = validateCustomerForm(formData);
    const formattedErrors = formatValidationErrors(validationErrors);
    setErrors(formattedErrors);
    return !hasValidationErrors(validationErrors);
  }, [formData]);

  const saveCustomer = useCallback(async () => {
    setSaving(true);
    try {
      const result = await createCustomer(formData);
      if (result.success) {
        success('Customer created successfully!');
        navigate('/customers', { replace: true });
      } else {
        showError(result.error || 'Failed to create customer. Please try again.');
        setErrors({ submit: result.error || 'Failed to create customer. Please try again.' });
      }
    } catch (err) {
      showError('Failed to create customer. Please try again.');
      setErrors({ submit: 'Failed to create customer. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [formData, createCustomer, success, showError, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) return;
    
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }
    
    await withConfirmation(
      {
        title: 'Create Customer',
        message: 'Are you sure you want to create this customer?',
        confirmText: 'Create Customer',
        variant: 'primary',
      },
      saveCustomer,
      undefined,
      'Failed to create customer. Please try again.'
    );
  }, [saving, validateForm, showError, withConfirmation, saveCustomer]);

  const handleCancelClick = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Discard Changes',
      message: 'Are you sure you want to discard all changes? This action cannot be undone.',
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      variant: 'warning',
    });
    
    if (confirmed) {
      navigate('/customers', { replace: true });
    }
  }, [confirm, navigate]);

  const handleSalutationSelect = useCallback((option: DropdownOption) => {
    setFormData(prev => ({ ...prev, salutation: option.value as CustomerFormData['salutation'] }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.salutation;
      return newErrors;
    });
  }, []);

  const handleCustomerTypeSelect = useCallback((option: DropdownOption) => {
    setFormData(prev => ({ ...prev, customerType: option.value as CustomerFormData['customerType'] }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.customerType;
      return newErrors;
    });
  }, []);

  const handleCountrySelect = useCallback((option: DropdownOption) => {
    setFormData(prev => ({ ...prev, country: option.value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.country;
      return newErrors;
    });
  }, []);

  const handleInputChange = useCallback((field: keyof CustomerFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const getSelectedSalutation = (): string | null => {
    return formData.salutation || null;
  };

  const getSelectedCustomerType = (): string | null => {
    return formData.customerType || null;
  };

  const getSelectedCountry = (): string | null => {
    return formData.country || null;
  };

  // Check if there are any errors
  const hasErrors = Object.keys(errors).length > 0;
  const errorCount = getErrorCount(errors);

  // Get country label for display

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        {/* Header with Save button on right */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancelClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Customer</h1>
              <p className="text-sm text-gray-500 mt-0.5">Add a new customer to your database</p>
            </div>
          </div>
          
          {/* Save Button - Top Right */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Customer
              </>
            )}
          </button>
        </div>

        {/* Error summary - Submit errors */}
        {errors.submit && (
          <ErrorSummary
            errors={{ submit: errors.submit }}
            title="Form Error:"
            variant="error"
          />
        )}

        {/* Validation Error Summary */}
        {hasErrors && !errors.submit && (
          <ErrorSummary
            errors={errors}
            title="Please fix the following errors:"
            variant="warning"
            maxDisplay={5}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Salutation
                  </label>
                  <SearchableDropdown
                    options={salutationOptions}
                    value={getSelectedSalutation()}
                    onChange={handleSalutationSelect}
                    placeholder="Search salutation..."
                    triggerPlaceholder="Select"
                    className="w-full max-w-full"
                    resetSearchOnOpen={true}
                    showEmptyState={true}
                    emptyStateText="No salutations found"
                    maxListHeight={200}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Customer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Customer Type <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={customerTypeOptions}
                    value={getSelectedCustomerType()}
                    onChange={handleCustomerTypeSelect}
                    placeholder="Search type..."
                    triggerPlaceholder="Select customer type"
                    className="w-full max-w-full"
                    resetSearchOnOpen={true}
                    showEmptyState={true}
                    emptyStateText="No types found"
                    maxListHeight={200}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.displayName ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter display name"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-xs text-red-500">{errors.displayName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="customer@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Work Phone
                  </label>
                  <input
                    type="text"
                    value={formData.workPhone}
                    onChange={(e) => handleInputChange('workPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="022-1234567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.mobileNumber ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="9876543210"
                  />
                  {errors.mobileNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.mobileNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Billing Address
                  </label>
                  <textarea
                    value={formData.billingAddress}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={2}
                    placeholder="Enter billing address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country
                    </label>
                    <SearchableDropdown
                      options={countryOptions}
                      value={getSelectedCountry()}
                      onChange={handleCountrySelect}
                      placeholder="Search country..."
                      triggerPlaceholder="Select country"
                      className="w-full max-w-full"
                      resetSearchOnOpen={true}
                      showEmptyState={true}
                      emptyStateText="No countries found"
                      maxListHeight={250}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & Tax Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Financial & Tax Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => handleInputChange('openingBalance', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Credit Limit
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => handleInputChange('creditLimit', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.gstNumber ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="22AAAAA0000A1Z1"
                  />
                  {errors.gstNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.gstNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.panNumber ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="ABCDE1234F"
                  />
                  {errors.panNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.panNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </h2>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={3}
                placeholder="Add any additional notes about the customer..."
              />
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options?.title}
        message={options?.message || ''}
        confirmText={options?.confirmText}
        cancelText={options?.cancelText}
        isLoading={isLoading}
        variant={options?.variant}
      />
    </div>
  );
};

export default CustomerCreate;