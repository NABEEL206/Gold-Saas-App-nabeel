// src/hooks/vendor/useVendorCreate.ts

import { useState } from 'react';
import type{ VendorFormData } from '../../types/Vendor/VendorType';

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

  const handleChange = (field: keyof VendorFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Vendor name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s\-()+]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.taxId && formData.taxId.length < 5) {
      newErrors.taxId = 'Tax ID must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
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
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: VendorFormData) => Promise<any>) => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(formData);
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
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors
  };
};