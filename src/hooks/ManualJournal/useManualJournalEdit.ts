// src/hooks/ManualJournal/useManualJournalEdit.ts

import { useState, useEffect, useCallback } from 'react';
import type { ManualJournal, ManualJournalFormData, ManualJournalEntry } from '../../types/ManualJournal/ManualJournalType';
import { 
  validateManualJournal, 
  validateManualJournalField,
  validateManualJournalBusinessRules 
} from '../../validations/manualJournalValidation';

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
    referenceNumber: undefined,
    notes: undefined,
    attachment: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (journal) {
      setFormData({
        journalDate: journal.journalDate || new Date().toISOString().split('T')[0],
        description: journal.description || '',
        entries: journal.entries && journal.entries.length >= 2 
          ? journal.entries 
          : [
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
        referenceNumber: journal.referenceNumber || undefined,
        notes: journal.notes || undefined,
        attachment: journal.attachment || undefined
      });
    }
  }, [journal]);

  const handleChange = useCallback((field: keyof ManualJournalFormData, value: any) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };

      // Real-time field validation
      const fieldError = validateManualJournalField(field, value, newFormData);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (fieldError) {
          newErrors[field] = fieldError;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });

      return newFormData;
    });
  }, []);

  const handleEntryChange = useCallback((index: number, field: keyof ManualJournalEntry, value: any) => {
    setFormData(prev => {
      const updatedEntries = [...prev.entries];
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

      const newFormData = {
        ...prev,
        entries: updatedEntries,
        totalDebit,
        totalCredit
      };
      
      // Validate the changed entry field
      const fieldKey = `entries[${index}].${field}`;
      const fieldError = validateManualJournalField(fieldKey, value, newFormData);
      
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        
        // Update or clear the specific field error
        if (fieldError) {
          newErrors[fieldKey] = fieldError;
        } else {
          delete newErrors[fieldKey];
        }
        
        // Clear related amount error if amounts are being set
        if (field === 'debitAmount' || field === 'creditAmount') {
          // Check if both debit and credit are now valid
          const entry = updatedEntries[index];
          if (entry.debitAmount > 0 || entry.creditAmount > 0) {
            delete newErrors[`entries[${index}].amount`];
          }
        }
        
        // Clear balance error if totals now match
        if (totalDebit === totalCredit && totalDebit > 0) {
          delete newErrors['balance'];
        }
        
        // Clear entries error if we have at least 2 entries
        if (updatedEntries.length >= 2) {
          delete newErrors['entries'];
        }
        
        return newErrors;
      });

      return newFormData;
    });
  }, []);

  const addEntry = useCallback(() => {
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
    
    // Clear entries error if it exists
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.entries;
      return newErrors;
    });
  }, []);

  const removeEntry = useCallback((index: number) => {
    setFormData(prev => {
      if (prev.entries.length <= 2) {
        setErrors(prevErrs => ({
          ...prevErrs,
          entries: 'Minimum 2 entries required'
        }));
        return prev;
      }

      const updatedEntries = prev.entries.filter((_, i) => i !== index);
      
      // Recalculate totals
      let totalDebit = 0;
      let totalCredit = 0;
      updatedEntries.forEach(entry => {
        totalDebit += entry.debitAmount || 0;
        totalCredit += entry.creditAmount || 0;
      });

      // Clear errors related to the removed entry and update balance
      setErrors(prevErrs => {
        const newErrors = { ...prevErrs };
        
        // Remove errors for the deleted entry
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith(`entries[${index}]`)) {
            delete newErrors[key];
          }
        });
        
        // Clear entries error
        delete newErrors.entries;
        
        // Update balance error
        if (totalDebit === totalCredit && totalDebit > 0) {
          delete newErrors['balance'];
        }
        
        return newErrors;
      });

      return {
        ...prev,
        entries: updatedEntries,
        totalDebit,
        totalCredit
      };
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const { isValid, errors: validationErrors } = validateManualJournal(formData);
    setErrors(validationErrors);
    
    // Check business rules for warnings
    if (isValid) {
      const businessWarnings = validateManualJournalBusinessRules(formData);
      setWarnings(businessWarnings);
    } else {
      setWarnings([]);
    }
    
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    if (journal) {
      setFormData({
        journalDate: journal.journalDate || new Date().toISOString().split('T')[0],
        description: journal.description || '',
        entries: journal.entries && journal.entries.length >= 2 
          ? journal.entries 
          : [
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
        referenceNumber: journal.referenceNumber || undefined,
        notes: journal.notes || undefined,
        attachment: journal.attachment || undefined
      });
    }
    setErrors({});
    setWarnings([]);
    setIsSubmitting(false);
  }, [journal]);

  const handleSubmit = useCallback(async (
    submitFn: (id: string | number, data: ManualJournalFormData) => Promise<any>
  ) => {
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
  }, [formData, validateForm, journal]);

  return {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleEntryChange,
    addEntry,
    removeEntry,
    handleSubmit,
    validateForm,
    resetForm,
    setFormData,
    setErrors,
    setWarnings
  };
};