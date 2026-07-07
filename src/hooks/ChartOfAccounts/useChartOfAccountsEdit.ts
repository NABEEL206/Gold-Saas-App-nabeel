// src/hooks/ChartOfAccounts/useChartOfAccountsEdit.ts

import { useState, useEffect, useCallback } from 'react';
import type { ChartOfAccount, ChartOfAccountFormData } from '../../types/ChartOfAccounts/ChartOfAccountsType';
import { 
  validateChartOfAccount, 
  validateChartOfAccountField,
  validateChartOfAccountBusinessRules 
} from '../../validations/chartOfAccountsValidation';

export const useChartOfAccountsEdit = (account: ChartOfAccount | null) => {
  const [formData, setFormData] = useState<ChartOfAccountFormData>({
    code: '',
    name: '',
    type: 'asset',
    category: '',
    subCategory: '',
    description: '',
    parentAccountId: undefined,
    parentAccountName: undefined,
    isActive: true,
    isSystemAccount: false,
    openingBalance: 0,
    currentBalance: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
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
        parentAccountId: account.parentAccountId || undefined,
        parentAccountName: account.parentAccountName || undefined,
        isActive: account.isActive !== undefined ? account.isActive : true,
        isSystemAccount: account.isSystemAccount || false,
        openingBalance: account.openingBalance || 0,
        currentBalance: account.currentBalance || 0
      });
    }
  }, [account]);

  const handleChange = useCallback((field: keyof ChartOfAccountFormData, value: any) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      const fieldError = validateChartOfAccountField(field, value, newFormData);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[field] = fieldError;
        else delete newErrors[field];
        return newErrors;
      });
      return newFormData;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const { isValid, errors: validationErrors } = validateChartOfAccount(formData);
    setErrors(validationErrors);
    if (isValid) setWarnings(validateChartOfAccountBusinessRules(formData));
    else setWarnings([]);
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    if (account) {
      setFormData({
        code: account.code || '',
        name: account.name || '',
        type: account.type || 'asset',
        category: account.category || '',
        subCategory: account.subCategory || '',
        description: account.description || '',
        parentAccountId: account.parentAccountId || undefined,
        parentAccountName: account.parentAccountName || undefined,
        isActive: account.isActive !== undefined ? account.isActive : true,
        isSystemAccount: account.isSystemAccount || false,
        openingBalance: account.openingBalance || 0,
        currentBalance: account.currentBalance || 0
      });
    }
    setErrors({}); setWarnings([]); setIsSubmitting(false);
  }, [account]);

  const handleSubmit = useCallback(async (
    submitFn: (id: string | number, data: ChartOfAccountFormData) => Promise<any>
  ) => {
    if (!validateForm() || !account) return false;
    setIsSubmitting(true);
    try { await submitFn(account.id, formData); return true; }
    catch (error) {
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'Failed to update account' }));
      return false;
    } finally { setIsSubmitting(false); }
  }, [formData, validateForm, account]);

  return { formData, errors, warnings, isSubmitting, handleChange, handleSubmit, validateForm, resetForm, setFormData, setErrors, setWarnings };
};