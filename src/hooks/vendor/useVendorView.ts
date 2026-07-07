// src/hooks/vendor/useVendorView.ts

import { useState, useEffect, useMemo } from 'react';
import type { Vendor } from '../../types/Vendor/VendorType';
import { validateVendorForm, formatValidationErrors, hasValidationErrors, getErrorCount } from '../../validations/vendor.validation';

export const useVendorView = (vendor: Vendor | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValidated, setIsValidated] = useState(false);

  // Validate vendor data when it changes
  useEffect(() => {
    if (vendor) {
      const validationResult = validateVendorForm(vendor as any);
      if (!validationResult.isValid) {
        const formattedErrors = formatValidationErrors(validationResult.errors);
        setValidationErrors(formattedErrors);
        setIsValidated(false);
      } else {
        setValidationErrors({});
        setIsValidated(true);
      }
    } else {
      setValidationErrors({});
      setIsValidated(false);
    }
  }, [vendor]);

  // Get full name for display
  const getDisplayName = useMemo((): string => {
    if (!vendor) return 'N/A';
    return vendor.name || 'Unnamed Vendor';
  }, [vendor]);

  // Get company info
  const getCompanyInfo = useMemo((): string => {
    if (!vendor) return '';
    return vendor.company || '';
  }, [vendor]);

  // Get contact info
  const getContactInfo = useMemo(() => {
    if (!vendor) return { email: '', phone: '' };
    return {
      email: vendor.email || vendor.contactEmail || '',
      phone: vendor.phone || vendor.contactPhone || ''
    };
  }, [vendor]);

  // Get full address
  const getFullAddress = useMemo((): string => {
    if (!vendor) return '';
    const parts = [
      vendor.address,
      vendor.city,
      vendor.state,
      vendor.zipCode,
      vendor.country
    ].filter(Boolean);
    return parts.join(', ');
  }, [vendor]);

  // Get status badge color
  const getStatusColor = useMemo((): string => {
    if (!vendor) return 'bg-gray-100 text-gray-800';
    switch (vendor.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, [vendor]);

  // Get status label
  const getStatusLabel = useMemo((): string => {
    if (!vendor) return 'Unknown';
    return vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : 'Unknown';
  }, [vendor]);

  // Check if vendor has complete information
  const isComplete = useMemo((): boolean => {
    if (!vendor) return false;
    return !!(vendor.name && vendor.email && vendor.phone && vendor.address);
  }, [vendor]);

  // Check if vendor data is valid
  const isValid = useMemo((): boolean => {
    return isValidated && Object.keys(validationErrors).length === 0;
  }, [isValidated, validationErrors]);

  // Get validation error count
  const getValidationErrorCount = useMemo((): number => {
    return Object.keys(validationErrors).length;
  }, [validationErrors]);

  // Get validation summary
  const getValidationSummary = useMemo((): string => {
    const count = getValidationErrorCount;
    if (count === 0) return 'Vendor data is valid';
    return `Vendor has ${count} validation issue${count > 1 ? 's' : ''}`;
  }, [getValidationErrorCount]);

  // Get summary statistics with validation status
  const getSummary = useMemo(() => {
    if (!vendor) return null;
    return {
      name: vendor.name,
      company: vendor.company,
      email: vendor.email,
      phone: vendor.phone,
      status: vendor.status,
      address: getFullAddress,
      contactPerson: vendor.contactPerson,
      taxId: vendor.taxId,
      website: vendor.website,
      isValid: isValid,
      validationErrors: validationErrors,
      validationSummary: getValidationSummary
    };
  }, [vendor, getFullAddress, isValid, validationErrors, getValidationSummary]);

  // Helper to clear validation errors
  const clearValidationErrors = () => {
    setValidationErrors({});
    setIsValidated(false);
  };

  // Helper to revalidate vendor data
  const revalidateVendor = (vendorData: Vendor) => {
    const validationResult = validateVendorForm(vendorData as any);
    if (!validationResult.isValid) {
      const formattedErrors = formatValidationErrors(validationResult.errors);
      setValidationErrors(formattedErrors);
      setIsValidated(false);
      return false;
    } else {
      setValidationErrors({});
      setIsValidated(true);
      return true;
    }
  };

  return {
    isLoading,
    error,
    validationErrors,
    isValid,
    isValidated,
    getValidationErrorCount,
    getValidationSummary,
    getDisplayName,
    getCompanyInfo,
    getContactInfo,
    getFullAddress,
    getStatusColor,
    getStatusLabel,
    isComplete,
    getSummary,
    setIsLoading,
    setError,
    clearValidationErrors,
    revalidateVendor
  };
};