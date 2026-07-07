// src/hooks/Bank/useBankCreate.ts

import { useState, useCallback } from 'react';
import type { BankFormData } from '../../types/Bank/BankTypes';
import { 
  validateBank, 
  validateBankField,
  validateBankBusinessRules 
} from '../../validations/bankValidation';

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
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof BankFormData, value: any) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      const fieldError = validateBankField(field, value, newFormData);
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
    const { isValid, errors: validationErrors } = validateBank(formData);
    setErrors(validationErrors);
    if (isValid) setWarnings(validateBankBusinessRules(formData));
    else setWarnings([]);
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      bankName: '', accountName: '', accountNumber: '', accountType: 'savings',
      ifscCode: '', branchName: '', branchAddress: '', city: '', state: '',
      country: 'India', pincode: '', contactPerson: '', contactPhone: '',
      contactEmail: '', openingBalance: 0, currentBalance: 0,
      currency: 'INR', status: 'active', notes: ''
    });
    setErrors({}); setWarnings([]); setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (submitFn: (data: BankFormData) => Promise<any>) => {
    if (!validateForm()) return false;
    setIsSubmitting(true);
    try { await submitFn(formData); resetForm(); return true; }
    catch (error) {
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'Failed to create bank' }));
      return false;
    } finally { setIsSubmitting(false); }
  }, [formData, validateForm, resetForm]);

  return { formData, errors, warnings, isSubmitting, handleChange, handleSubmit, validateForm, resetForm, setFormData, setErrors, setWarnings };
};