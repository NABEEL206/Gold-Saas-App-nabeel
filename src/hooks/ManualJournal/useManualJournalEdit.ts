// src/hooks/ManualJournal/useManualJournalEdit.ts

import { useState, useEffect } from 'react';
import type{ ManualJournal, ManualJournalFormData } from '../../types/ManualJournal/ManualJournalType';

export const useManualJournalEdit = (journal: ManualJournal | null) => {
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

  useEffect(() => {
    if (journal) {
      setFormData({
        journalDate: journal.journalDate || new Date().toISOString().split('T')[0],
        description: journal.description || '',
        entries: journal.entries || [
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
        totalDebit: journal.totalDebit || 0,
        totalCredit: journal.totalCredit || 0,
        status: journal.status || 'draft',
        referenceNumber: journal.referenceNumber || '',
        notes: journal.notes || '',
        attachment: journal.attachment || ''
      });
    }
  }, [journal]);

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

  const handleEntryChange = (index: number, field: keyof ManualJournalFormData['entries'][number], value: any) => {
    const updatedEntries = [...formData.entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };
    
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

      if (!hasError && formData.totalDebit !== formData.totalCredit) {
        newErrors.balance = `Total debit (₹${formData.totalDebit.toFixed(2)}) must equal total credit (₹${formData.totalCredit.toFixed(2)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    if (journal) {
      setFormData({
        journalDate: journal.journalDate || new Date().toISOString().split('T')[0],
        description: journal.description || '',
        entries: journal.entries || [
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
        totalDebit: journal.totalDebit || 0,
        totalCredit: journal.totalCredit || 0,
        status: journal.status || 'draft',
        referenceNumber: journal.referenceNumber || '',
        notes: journal.notes || '',
        attachment: journal.attachment || ''
      });
    }
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (submitFn: (id: string | number, data: ManualJournalFormData) => Promise<any>) => {
    if (!validateForm() || !journal) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await submitFn(journal.id, formData);
      return true;
    } catch (error) {
      console.error('Error updating manual journal:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update manual journal'
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