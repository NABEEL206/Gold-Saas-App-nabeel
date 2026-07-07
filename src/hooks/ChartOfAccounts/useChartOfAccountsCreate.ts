// src/hooks/ChartOfAccounts/useChartOfAccountsCreate.ts

import { useState, useCallback } from 'react';
import type { ChartOfAccountFormData } from '../../types/ChartOfAccounts/ChartOfAccountsType';
import { 
  validateChartOfAccount, 
  validateChartOfAccountField,
  validateChartOfAccountBusinessRules 
} from '../../validations/chartOfAccountsValidation';

export const useChartOfAccountsCreate = () => {
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
    setFormData({
      code: '', name: '', type: 'asset', category: '', subCategory: '',
      description: '', parentAccountId: undefined, parentAccountName: undefined,
      isActive: true, isSystemAccount: false, openingBalance: 0, currentBalance: 0
    });
    setErrors({}); setWarnings([]); setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (submitFn: (data: ChartOfAccountFormData) => Promise<any>) => {
    if (!validateForm()) return false;
    setIsSubmitting(true);
    try { await submitFn(formData); resetForm(); return true; }
    catch (error) {
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'Failed to create account' }));
      return false;
    } finally { setIsSubmitting(false); }
  }, [formData, validateForm, resetForm]);

  return { formData, errors, warnings, isSubmitting, handleChange, handleSubmit, validateForm, resetForm, setFormData, setErrors, setWarnings };
};