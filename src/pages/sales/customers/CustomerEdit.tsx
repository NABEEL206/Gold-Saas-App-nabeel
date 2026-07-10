// src/pages/Customer/CustomerEdit.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Loader,
} from 'lucide-react';
import { useCustomers } from '../../../hooks/customer/useCustomers';
import type { CustomerFormData } from '../../../types/customer/CustomerTypes';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

export const CustomerEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer, updateCustomer, loading } = useCustomers();
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

  const [formData, setFormData] = useState<CustomerFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

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

  const countryOptions: DropdownOption[] = [
    { value: 'India', label: 'India' },
    { value: 'USA', label: 'USA' },
    { value: 'UK', label: 'UK' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'UAE', label: 'UAE' },
    { value: 'Singapore', label: 'Singapore' },
  ];

  // Load customer data
  useEffect(() => {
    if (!id) {
      setPageError('No customer ID provided');
      setInitialLoading(false);
      return;
    }

    const loadCustomer = () => {
      const customer = getCustomer(id);
      if (customer) {
        setFormData({
          salutation: customer.salutation || '',
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          displayName: customer.displayName || '',
          customerType: customer.customerType || 'individual',
          email: customer.email || '',
          workPhone: customer.workPhone || '',
          mobileNumber: customer.mobileNumber || '',
          billingAddress: customer.billingAddress || '',
          city: customer.city || '',
          state: customer.state || '',
          pincode: customer.pincode || '',
          country: customer.country || 'India',
          openingBalance: customer.openingBalance || 0,
          creditLimit: customer.creditLimit || 0,
          gstNumber: customer.gstNumber || '',
          panNumber: customer.panNumber || '',
          notes: customer.notes || '',
        });
        setPageError(null);
        setInitialLoading(false);
        return true;
      }
      return false;
    };

    if (!loadCustomer()) {
      const timer = setTimeout(() => {
        if (!loadCustomer()) {
          setPageError('Customer not found');
          setInitialLoading(false);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [id, getCustomer]);

  const validateForm = useCallback((): boolean => {
    if (!formData) return false;
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.displayName.trim()) newErrors.displayName = 'Display Name is required';
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile Number is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST number format';
    }
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const updateCustomerData = useCallback(async () => {
    if (!formData || !id) return;
    
    setSaving(true);
    try {
      const result = await updateCustomer(id, formData);
      if (result.success) {
        success('Customer updated successfully!');
        navigate('/customers', { replace: true });
      } else {
        showError(result.error || 'Failed to update customer. Please try again.');
        setErrors({ submit: result.error || 'Failed to update customer. Please try again.' });
      }
    } catch (err) {
      showError('Failed to update customer. Please try again.');
      setErrors({ submit: 'Failed to update customer. Please try again.' });
    } finally {
      setSaving(false);
    }
  }, [formData, id, updateCustomer, success, showError, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) return;
    
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }
    
    await withConfirmation(
      {
        title: 'Update Customer',
        message: 'Are you sure you want to update this customer?',
        confirmText: 'Update Customer',
        variant: 'primary',
      },
      updateCustomerData,
      undefined,
      'Failed to update customer. Please try again.'
    );
  }, [saving, validateForm, showError, withConfirmation, updateCustomerData]);

  const handleBackClick = useCallback(async () => {
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
    setFormData(prev => prev ? { ...prev, salutation: option.value as CustomerFormData['salutation'] } : null);
  }, []);

  const handleCustomerTypeSelect = useCallback((option: DropdownOption) => {
    setFormData(prev => prev ? { ...prev, customerType: option.value as CustomerFormData['customerType'] } : null);
  }, []);

  const handleCountrySelect = useCallback((option: DropdownOption) => {
    setFormData(prev => prev ? { ...prev, country: option.value as CustomerFormData['country'] } : null);
  }, []);

  const handleInputChange = useCallback((field: keyof CustomerFormData, value: string | number) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const getSelectedSalutation = (): string | null => {
    return formData?.salutation || null;
  };

  const getSelectedCustomerType = (): string | null => {
    return formData?.customerType || null;
  };

  const getSelectedCountry = (): string | null => {
    return formData?.country || null;
  };

  // Loading state
  if (loading || initialLoading) {
    return (
      <div
        className="p-6 min-h-screen flex items-center justify-center themed-transition"
        style={{ background: 'var(--background)' }}
      >
        <div className="text-center">
          <Loader
            className="h-8 w-8 mx-auto mb-3 animate-spin"
            style={{ color: 'var(--primary)' }}
          />
          <p
            className="text-sm themed-transition"
            style={{ color: 'var(--foreground-secondary)' }}
          >
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (pageError) {
    return (
      <div
        className="p-6 min-h-screen themed-transition"
        style={{ background: 'var(--background)' }}
      >
        <div
          className="rounded-lg p-6 text-center max-w-md mx-auto themed-transition"
          style={{
            background: 'var(--error-light)',
            border: '1px solid var(--error)',
          }}
        >
          <AlertCircle
            className="h-12 w-12 mx-auto mb-3"
            style={{ color: 'var(--error)' }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--error)' }}
          >
            Error
          </h3>
          <p className="text-sm" style={{ color: 'var(--error)' }}>
            {pageError}
          </p>
          <button
            onClick={() => navigate('/customers', { replace: true })}
            className="mt-4 px-4 py-2 rounded-lg transition-colors themed-transition"
            style={{
              background: 'var(--error)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Go Back to Customers
          </button>
        </div>
      </div>
    );
  }

  // No form data
  if (!formData) {
    return (
      <div
        className="p-6 min-h-screen themed-transition"
        style={{ background: 'var(--background)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="p-8 rounded-xl shadow-sm text-center themed-transition"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <Loader
              className="h-6 w-6 mx-auto mb-3 animate-spin"
              style={{ color: 'var(--primary)' }}
            />
            <p
              className="text-sm themed-transition"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              Preparing customer form...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBackClick}
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
              Edit Customer
            </h1>
            <p
              className="text-sm mt-0.5 themed-transition"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              Update customer details
            </p>
          </div>
        </div>

        {/* Error summary */}
        {errors.submit && (
          <div
            className="mb-6 p-4 rounded-lg flex items-start gap-3 themed-transition"
            style={{
              background: 'var(--error-light)',
              border: '1px solid var(--error)',
            }}
          >
            <AlertCircle
              className="h-5 w-5 mt-0.5 flex-shrink-0"
              style={{ color: 'var(--error)' }}
            />
            <p className="text-sm" style={{ color: 'var(--error)' }}>
              {errors.submit}
            </p>
          </div>
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
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
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
                      border: errors.lastName ? '1px solid var(--error)' : '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.lastName ? 'var(--error)' : 'var(--border)';
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
                      border: errors.displayName ? '1px solid var(--error)' : '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.displayName ? 'var(--error)' : 'var(--border)';
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
                      border: errors.email ? '1px solid var(--error)' : '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.email ? 'var(--error)' : 'var(--border)';
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
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
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
                      border: errors.mobileNumber ? '1px solid var(--error)' : '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.mobileNumber ? 'var(--error)' : 'var(--border)';
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
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
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
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
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
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
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
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
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
                      maxListHeight={200}
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
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
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
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
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
                      border: errors.gstNumber ? '1px solid var(--error)' : '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.gstNumber ? 'var(--error)' : 'var(--border)';
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
                      border: errors.panNumber ? '1px solid var(--error)' : '1px solid var(--border)',
                      background: 'var(--background)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.panNumber ? 'var(--error)' : 'var(--border)';
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
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                rows={3}
                placeholder="Add any additional notes about the customer..."
              />
            </div>
          </div>

          {/* Actions */}
          <div
            className="px-6 py-4 rounded-b-xl flex items-center justify-end gap-3 themed-transition"
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--surface-hover)',
            }}
          >
            <button
              type="button"
              onClick={handleCancelClick}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
              style={{ color: 'var(--foreground-secondary)' }}
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
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
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
                  <Loader className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Customer
                </>
              )}
            </button>
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