// src/hooks/Bank/useBankCreate.ts

import { useState } from 'react';
import type{ BankFormData } from '../../types/Bank/BankTypes';

export const useBankCreate = () => {
  const [formData, setFormData] = useState<BankFormData>({
    bankName: '',
    accountName: '',
    accountNumber: '',
    accountType: 'savings',
    ifscCode: '',
    branchName: '',
    branchAddress: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    openingBalance: 0,
    currentBalance: 0,
    currency: 'INR',
    status: 'active',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof BankFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountName.trim()) {
      newErrors.accountName = 'Account name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountName: '',
      accountNumber: '',
      accountType: 'savings',
      ifscCode: '',
      branchName: '',
      branchAddress: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      openingBalance: 0,
      currentBalance: 0,
      currency: 'INR',
      status: 'active',
      notes: ''
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: BankFormData) => Promise<any>) => {
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
        submit: error instanceof Error ? error.message : 'Failed to create bank'
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