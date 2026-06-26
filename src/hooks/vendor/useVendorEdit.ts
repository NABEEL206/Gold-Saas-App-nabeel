// src/hooks/vendor/useVendorEdit.ts

import { useState, useEffect } from 'react';
import type{ Vendor, VendorFormData } from '../../types/Vendor/VendorType';

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
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (id: string | number, data: VendorFormData) => Promise<any>) => {
    if (!validateForm() || !vendor) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(vendor.id, formData);
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