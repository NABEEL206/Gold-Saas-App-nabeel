// src/hooks/vendor/useVendorEdit.ts
import { useState, useEffect, useCallback } from 'react';
import type { Vendor, VendorFormData } from '../../types/Vendor/VendorType';
import {
  validateVendorForm,
  formatValidationErrors,
  type VendorValidationErrors,
} from '../../validations/vendor.validation';

export const useVendorEdit = (vendor: Vendor | null) => {
  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    taxId: '',
    website: '',
    notes: '',
    status: 'active',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: VendorValidationErrors;
  }>({
    isValid: true,
    errors: {},
  });

  // Load vendor data when vendor prop changes
  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        company: vendor.company || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        country: vendor.country || '',
        zipCode: vendor.zipCode || '',
        taxId: vendor.taxId || '',
        website: vendor.website || '',
        notes: vendor.notes || '',
        status: vendor.status || 'active',
        contactPerson: vendor.contactPerson || '',
        contactEmail: vendor.contactEmail || '',
        contactPhone: vendor.contactPhone || ''
      });
    }
  }, [vendor]);

  const handleChange = useCallback((field: keyof VendorFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field if it exists
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const result = validateVendorForm(formData);
    setValidationResult(result);
    
    const formattedErrors = formatValidationErrors(result.errors);
    setErrors(formattedErrors);
    
    return result.isValid;
  }, [formData]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setValidationResult({
      isValid: true,
      errors: {},
    });
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const resetForm = useCallback(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        company: vendor.company || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        country: vendor.country || '',
        zipCode: vendor.zipCode || '',
        taxId: vendor.taxId || '',
        website: vendor.website || '',
        notes: vendor.notes || '',
        status: vendor.status || 'active',
        contactPerson: vendor.contactPerson || '',
        contactEmail: vendor.contactEmail || '',
        contactPhone: vendor.contactPhone || ''
      });
    }
    setErrors({});
    setValidationResult({
      isValid: true,
      errors: {},
    });
    setIsSubmitting(false);
  }, [vendor]);

  const handleSubmit = useCallback(async (submitFn: (id: string | number, data: VendorFormData) => Promise<any>) => {
    if (!validateForm() || !vendor) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(vendor.id, formData);
      clearErrors();
      return true;
    } catch (error) {
      console.error('Error updating vendor:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update vendor'
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, vendor, validateForm, clearErrors]);

  const updateFormData = useCallback((field: keyof VendorFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    validationResult,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors,
    validateForm,
    clearErrors,
    clearFieldError,
    updateFormData,
  };
};