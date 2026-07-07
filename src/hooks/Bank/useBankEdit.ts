// src/hooks/Bank/useBankEdit.ts

import { useState, useEffect, useCallback } from 'react';
import type { Bank, BankFormData } from '../../types/Bank/BankTypes';
import { 
  validateBank, 
  validateBankField,
  validateBankBusinessRules 
} from '../../validations/bankValidation';

export const useBankEdit = (bank: Bank | null) => {
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
    country: 'IN',
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

  useEffect(() => {
    if (bank) {
      setFormData({
        bankName: bank.bankName || '',
        accountName: bank.accountName || '',
        accountNumber: bank.accountNumber || '',
        accountType: bank.accountType || 'savings',
        ifscCode: bank.ifscCode || '',
        branchName: bank.branchName || '',
        branchAddress: bank.branchAddress || '',
        city: bank.city || '',
        state: bank.state || '',
        country: bank.country || 'IN',
        pincode: bank.pincode || '',
        contactPerson: bank.contactPerson || '',
        contactPhone: bank.contactPhone || '',
        contactEmail: bank.contactEmail || '',
        openingBalance: bank.openingBalance || 0,
        currentBalance: bank.currentBalance || 0,
        currency: bank.currency || 'INR',
        status: bank.status || 'active',
        notes: bank.notes || ''
      });
    }
  }, [bank]);

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
    if (bank) {
      setFormData({
        bankName: bank.bankName || '', accountName: bank.accountName || '',
        accountNumber: bank.accountNumber || '', accountType: bank.accountType || 'savings',
        ifscCode: bank.ifscCode || '', branchName: bank.branchName || '',
        branchAddress: bank.branchAddress || '', city: bank.city || '',
        state: bank.state || '', country: bank.country || 'IN',
        pincode: bank.pincode || '', contactPerson: bank.contactPerson || '',
        contactPhone: bank.contactPhone || '', contactEmail: bank.contactEmail || '',
        openingBalance: bank.openingBalance || 0, currentBalance: bank.currentBalance || 0,
        currency: bank.currency || 'INR', status: bank.status || 'active', notes: bank.notes || ''
      });
    }
    setErrors({}); setWarnings([]); setIsSubmitting(false);
  }, [bank]);

  const handleSubmit = useCallback(async (
    submitFn: (id: string | number, data: BankFormData) => Promise<any>
  ) => {
    if (!validateForm() || !bank) return false;
    setIsSubmitting(true);
    try { await submitFn(bank.id, formData); return true; }
    catch (error) {
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'Failed to update bank' }));
      return false;
    } finally { setIsSubmitting(false); }
  }, [formData, validateForm, bank]);

  return { formData, errors, warnings, isSubmitting, handleChange, handleSubmit, validateForm, resetForm, setFormData, setErrors, setWarnings };
};