// src/hooks/vendor/useVendorCreate.ts
import { useState, useCallback } from 'react';
import type { VendorFormData } from '../../types/Vendor/VendorType';
import {
  validateVendorForm,
  formatValidationErrors,
  type VendorValidationErrors,
} from '../../validations/vendor.validation';

export const useVendorCreate = () => {
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
    setFormData({
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
    setErrors({});
    setValidationResult({
      isValid: true,
      errors: {},
    });
    setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (submitFn: (data: VendorFormData) => Promise<any>) => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      const result = await submitFn(formData);
      resetForm();
      return true;
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to create vendor'
      }));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, resetForm]);

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