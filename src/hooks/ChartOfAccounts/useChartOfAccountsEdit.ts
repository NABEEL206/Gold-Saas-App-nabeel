// src/hooks/ChartOfAccounts/useChartOfAccountsEdit.ts

import { useState, useEffect } from 'react';
import type { ChartOfAccount, ChartOfAccountFormData } from '../../types/ChartOfAccounts/ChartOfAccountsType';

export const useChartOfAccountsEdit = (account: ChartOfAccount | null) => {
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

  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code || '',
        name: account.name || '',
        type: account.type || 'asset',
        category: account.category || '',
        subCategory: account.subCategory || '',
        description: account.description || '',
        parentAccountId: account.parentAccountId || '',
        parentAccountName: account.parentAccountName || '',
        isActive: account.isActive !== undefined ? account.isActive : true,
        isSystemAccount: account.isSystemAccount || false,
        openingBalance: account.openingBalance || 0,
        currentBalance: account.currentBalance || 0
      });
    }
  }, [account]);

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
    if (account) {
      setFormData({
        code: account.code || '',
        name: account.name || '',
        type: account.type || 'asset',
        category: account.category || '',
        subCategory: account.subCategory || '',
        description: account.description || '',
        parentAccountId: account.parentAccountId || '',
        parentAccountName: account.parentAccountName || '',
        isActive: account.isActive !== undefined ? account.isActive : true,
        isSystemAccount: account.isSystemAccount || false,
        openingBalance: account.openingBalance || 0,
        currentBalance: account.currentBalance || 0
      });
    }
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (id: string | number, data: ChartOfAccountFormData) => Promise<any>) => {
    if (!validateForm() || !account) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(account.id, formData);
      return true;
    } catch (error) {
      console.error('Error updating account:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update account'
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