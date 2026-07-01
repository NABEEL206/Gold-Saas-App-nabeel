// src/hooks/ChartOfAccounts/useChartOfAccountsCreate.ts

import { useState } from 'react';
import type { ChartOfAccountFormData } from '../../types/ChartOfAccounts/ChartOfAccountsType';

export const useChartOfAccountsCreate = () => {
  const [formData, setFormData] = useState<ChartOfAccountFormData>({
    code: '',
    name: '',
    type: 'asset',
    category: '',
    subCategory: '',
    description: '',
    parentAccountId: '',
    parentAccountName: '',
    isActive: true,
    isSystemAccount: false,
    openingBalance: 0,
    currentBalance: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ChartOfAccountFormData, value: any) => {
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

    if (!formData.code.trim()) {
      newErrors.code = 'Account code is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Account type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'asset',
      category: '',
      subCategory: '',
      description: '',
      parentAccountId: '',
      parentAccountName: '',
      isActive: true,
      isSystemAccount: false,
      openingBalance: 0,
      currentBalance: 0
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: ChartOfAccountFormData) => Promise<any>) => {
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
        submit: error instanceof Error ? error.message : 'Failed to create account'
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