// src/hooks/Bank/useBankEdit.ts

import { useState, useEffect } from 'react';
import type{ Bank, BankFormData } from '../../types/Bank/BankTypes';

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
        country: bank.country || 'India',
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
        country: bank.country || 'India',
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
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (id: string | number, data: BankFormData) => Promise<any>) => {
    if (!validateForm() || !bank) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(bank.id, formData);
      return true;
    } catch (error) {
      console.error('Error updating bank:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update bank'
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