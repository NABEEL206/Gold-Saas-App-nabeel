// src/hooks/ManualJournal/useManualJournalCreate.ts

import { useState } from 'react';
import type{ ManualJournalFormData, ManualJournalEntry } from '../../types/ManualJournal/ManualJournalType';

export const useManualJournalCreate = () => {
  const [formData, setFormData] = useState<ManualJournalFormData>({
    journalDate: new Date().toISOString().split('T')[0],
    description: '',
    entries: [
      {
        accountId: '',
        accountName: '',
        accountCode: '',
        debitAmount: 0,
        creditAmount: 0,
        description: ''
      },
      {
        accountId: '',
        accountName: '',
        accountCode: '',
        debitAmount: 0,
        creditAmount: 0,
        description: ''
      }
    ],
    totalDebit: 0,
    totalCredit: 0,
    status: 'draft',
    referenceNumber: '',
    notes: '',
    attachment: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ManualJournalFormData, value: any) => {
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

  const handleEntryChange = (index: number, field: keyof ManualJournalEntry, value: any) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };
    
    // Calculate totals
    let totalDebit = 0;
    let totalCredit = 0;
    updatedEntries.forEach(entry => {
      totalDebit += entry.debitAmount || 0;
      totalCredit += entry.creditAmount || 0;
    });

    setFormData(prev => ({
      ...prev,
      entries: updatedEntries,
      totalDebit,
      totalCredit
    }));

    // Clear entry-specific errors
    if (errors[`entry_${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`entry_${index}_${field}`];
        return newErrors;
      });
    }
  };

  const addEntry = () => {
    setFormData(prev => ({
      ...prev,
      entries: [
        ...prev.entries,
        {
          accountId: '',
          accountName: '',
          accountCode: '',
          debitAmount: 0,
          creditAmount: 0,
          description: ''
        }
      ]
    }));
  };

  const removeEntry = (index: number) => {
    if (formData.entries.length <= 2) {
      setErrors(prev => ({
        ...prev,
        entries: 'Minimum 2 entries required'
      }));
      return;
    }

    const updatedEntries = formData.entries.filter((_, i) => i !== index);
    
    // Recalculate totals
    let totalDebit = 0;
    let totalCredit = 0;
    updatedEntries.forEach(entry => {
      totalDebit += entry.debitAmount || 0;
      totalCredit += entry.creditAmount || 0;
    });

    setFormData(prev => ({
      ...prev,
      entries: updatedEntries,
      totalDebit,
      totalCredit
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.journalDate) {
      newErrors.journalDate = 'Journal date is required';
    }

    if (formData.entries.length < 2) {
      newErrors.entries = 'At least 2 entries are required';
    } else {
      let hasError = false;
      formData.entries.forEach((entry, index) => {
        if (!entry.accountId) {
          newErrors[`entry_${index}_accountId`] = 'Account is required';
          hasError = true;
        }
        if (entry.debitAmount === 0 && entry.creditAmount === 0) {
          newErrors[`entry_${index}_amount`] = 'Either debit or credit amount is required';
          hasError = true;
        }
        if (entry.debitAmount > 0 && entry.creditAmount > 0) {
          newErrors[`entry_${index}_amount`] = 'Cannot have both debit and credit amounts';
          hasError = true;
        }
      });

      // Check if totals balance
      if (!hasError && formData.totalDebit !== formData.totalCredit) {
        newErrors.balance = `Total debit (₹${formData.totalDebit.toFixed(2)}) must equal total credit (₹${formData.totalCredit.toFixed(2)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      journalDate: new Date().toISOString().split('T')[0],
      description: '',
      entries: [
        {
          accountId: '',
          accountName: '',
          accountCode: '',
          debitAmount: 0,
          creditAmount: 0,
          description: ''
        },
        {
          accountId: '',
          accountName: '',
          accountCode: '',
          debitAmount: 0,
          creditAmount: 0,
          description: ''
        }
      ],
      totalDebit: 0,
      totalCredit: 0,
      status: 'draft',
      referenceNumber: '',
      notes: '',
      attachment: ''
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (data: ManualJournalFormData) => Promise<any>) => {
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
        submit: error instanceof Error ? error.message : 'Failed to create manual journal'
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
    handleEntryChange,
    addEntry,
    removeEntry,
    handleSubmit,
    resetForm,
    setFormData,
    setErrors
  };
};