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

  // Helper function to get input border color - ALWAYS check errors state
  const getInputBorderColor = (fieldName: string): string => {
    return errors[fieldName] ? 'var(--error)' : 'var(--border)';
  };

  // Helper function to get input border width
  const getInputBorderWidth = (fieldName: string): string => {
    return errors[fieldName] ? '2px' : '1px';
  };

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="w-full">
        {/* Header with Save button on right */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancelClick}
              className="p-2 rounded-lg transition-colors themed-transition"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft
                className="h-5 w-5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              />
            </button>
            <div>
              <h1
                className="text-2xl font-bold themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Create Customer
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Add a new customer to your database
              </p>
            </div>
          </div>
          
          {/* Save Button - Top Right */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition shadow-sm"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'var(--primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
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
        <form
          onSubmit={handleSubmit}
          className="rounded-xl shadow-sm themed-transition"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <User className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
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
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('firstName')} solid ${getInputBorderColor('firstName')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('firstName');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('firstName');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Last Name <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('lastName')} solid ${getInputBorderColor('lastName')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('lastName');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('lastName');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <Building2 className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                Customer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Customer Type <span style={{ color: 'var(--error)' }}>*</span>
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
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Display Name <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('displayName')} solid ${getInputBorderColor('displayName')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('displayName');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('displayName');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Enter display name"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                      {errors.displayName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <Mail className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Mail className="h-4 w-4 inline mr-1" style={{ color: 'var(--foreground-tertiary)' }} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('email')} solid ${getInputBorderColor('email')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('email');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('email');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="customer@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Phone className="h-4 w-4 inline mr-1" style={{ color: 'var(--foreground-tertiary)' }} />
                    Work Phone
                  </label>
                  <input
                    type="text"
                    value={formData.workPhone}
                    onChange={(e) => handleInputChange('workPhone', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('workPhone')} solid ${getInputBorderColor('workPhone')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('workPhone');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('workPhone');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="022-1234567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Phone className="h-4 w-4 inline mr-1" style={{ color: 'var(--foreground-tertiary)' }} />
                    Mobile Number <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('mobileNumber')} solid ${getInputBorderColor('mobileNumber')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('mobileNumber');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('mobileNumber');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="9876543210"
                  />
                  {errors.mobileNumber && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <MapPin className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Billing Address
                  </label>
                  <textarea
                    value={formData.billingAddress}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none themed-transition"
                    style={{
                      border: `${getInputBorderWidth('billingAddress')} solid ${getInputBorderColor('billingAddress')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('billingAddress');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('billingAddress');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    rows={2}
                    placeholder="Enter billing address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5 themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                      style={{
                        border: `${getInputBorderWidth('city')} solid ${getInputBorderColor('city')}`,
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = getInputBorderColor('city');
                        e.currentTarget.style.borderWidth = getInputBorderWidth('city');
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5 themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                      style={{
                        border: `${getInputBorderWidth('state')} solid ${getInputBorderColor('state')}`,
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = getInputBorderColor('state');
                        e.currentTarget.style.borderWidth = getInputBorderWidth('state');
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Enter state"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5 themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                      style={{
                        border: `${getInputBorderWidth('pincode')} solid ${getInputBorderColor('pincode')}`,
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = getInputBorderColor('pincode');
                        e.currentTarget.style.borderWidth = getInputBorderWidth('pincode');
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5 themed-transition"
                      style={{ color: 'var(--foreground)' }}
                    >
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
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <CreditCard className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                Financial & Tax Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Opening Balance
                  </label>
                  <input
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => handleInputChange('openingBalance', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('openingBalance')} solid ${getInputBorderColor('openingBalance')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('openingBalance');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('openingBalance');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Credit Limit
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit}
                    onChange={(e) => handleInputChange('creditLimit', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('creditLimit')} solid ${getInputBorderColor('creditLimit')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('creditLimit');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('creditLimit');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('gstNumber')} solid ${getInputBorderColor('gstNumber')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('gstNumber');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('gstNumber');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="22AAAAA0000A1Z1"
                  />
                  {errors.gstNumber && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                      {errors.gstNumber}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5 themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
                    style={{
                      border: `${getInputBorderWidth('panNumber')} solid ${getInputBorderColor('panNumber')}`,
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = getInputBorderColor('panNumber');
                      e.currentTarget.style.borderWidth = getInputBorderWidth('panNumber');
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="ABCDE1234F"
                  />
                  {errors.panNumber && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                      {errors.panNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                <FileText className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                Notes
              </h2>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none themed-transition"
                style={{
                  border: `${getInputBorderWidth('notes')} solid ${getInputBorderColor('notes')}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = getInputBorderColor('notes');
                  e.currentTarget.style.borderWidth = getInputBorderWidth('notes');
                  e.currentTarget.style.boxShadow = 'none';
                }}
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