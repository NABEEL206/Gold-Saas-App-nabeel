// src/hooks/ManualJournal/useManualJournalCreate.ts

import { useState, useCallback } from 'react';
import type { ManualJournalFormData, ManualJournalEntry } from '../../types/ManualJournal/ManualJournalType';
import { 
  validateManualJournal, 
  validateManualJournalField,
  validateManualJournalBusinessRules 
} from '../../validations/manualJournalValidation';

export const useManualJournalCreate = () => {
  const [formData, setFormData] = useState<ManualJournalFormData>({
    journalDate: new Date().toISOString().split('T')[0],
    description: '',
    entries: [
      { accountId: '', accountName: '', accountCode: '', debitAmount: 0, creditAmount: 0, description: '' },
      { accountId: '', accountName: '', accountCode: '', debitAmount: 0, creditAmount: 0, description: '' }
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

  const handleChange = useCallback((field: keyof ManualJournalFormData, value: any) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      const fieldError = validateManualJournalField(field, value, newFormData);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[field] = fieldError;
        else delete newErrors[field];
        return newErrors;
      });
      return newFormData;
    });
  }, []);

  const handleEntryChange = useCallback((index: number, field: keyof ManualJournalEntry, value: any) => {
    setFormData(prev => {
      const updatedEntries = [...prev.entries];
      updatedEntries[index] = { ...updatedEntries[index], [field]: value };
      
      let totalDebit = 0, totalCredit = 0;
      updatedEntries.forEach(entry => {
        totalDebit += entry.debitAmount || 0;
        totalCredit += entry.creditAmount || 0;
      });

      const newFormData = { ...prev, entries: updatedEntries, totalDebit, totalCredit };
      
      // Validate the changed entry field
      const fieldKey = `entries[${index}].${field}`;
      const fieldError = validateManualJournalField(fieldKey, value, newFormData);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        if (fieldError) newErrors[fieldKey] = fieldError;
        else delete newErrors[fieldKey];
        // Clear balance error if totals match
        if (totalDebit === totalCredit && totalDebit > 0) delete newErrors['balance'];
        return newErrors;
      });

      return newFormData;
    });
  }, []);

  const addEntry = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      entries: [...prev.entries, { accountId: '', accountName: '', accountCode: '', debitAmount: 0, creditAmount: 0, description: '' }]
    }));
    setErrors(prev => { const n = { ...prev }; delete n.entries; return n; });
  }, []);

  const removeEntry = useCallback((index: number) => {
    setFormData(prev => {
      if (prev.entries.length <= 2) {
        setErrors(prevErrs => ({ ...prevErrs, entries: 'Minimum 2 entries required' }));
        return prev;
      }
      const updatedEntries = prev.entries.filter((_, i) => i !== index);
      let totalDebit = 0, totalCredit = 0;
      updatedEntries.forEach(entry => { totalDebit += entry.debitAmount || 0; totalCredit += entry.creditAmount || 0; });
      
      setErrors(prevErrs => {
        const newErrors = { ...prevErrs };
        delete newErrors.entries;
        if (totalDebit === totalCredit && totalDebit > 0) delete newErrors['balance'];
        return newErrors;
      });
      
      return { ...prev, entries: updatedEntries, totalDebit, totalCredit };
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const { isValid, errors: validationErrors } = validateManualJournal(formData);
    setErrors(validationErrors);
    if (isValid) setWarnings(validateManualJournalBusinessRules(formData));
    else setWarnings([]);
    return isValid;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      journalDate: new Date().toISOString().split('T')[0], description: '',
      entries: [
        { accountId: '', accountName: '', accountCode: '', debitAmount: 0, creditAmount: 0, description: '' },
        { accountId: '', accountName: '', accountCode: '', debitAmount: 0, creditAmount: 0, description: '' }
      ],
      totalDebit: 0, totalCredit: 0, status: 'draft', referenceNumber: undefined, notes: undefined, attachment: undefined
    });
    setErrors({}); setWarnings([]); setIsSubmitting(false);
  }, []);

  const handleSubmit = useCallback(async (submitFn: (data: ManualJournalFormData) => Promise<any>) => {
    if (!validateForm()) return false;
    setIsSubmitting(true);
    try { await submitFn(formData); resetForm(); return true; }
    catch (error) {
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'Failed to create manual journal' }));
      return false;
    } finally { setIsSubmitting(false); }
  }, [formData, validateForm, resetForm]);

  return { formData, errors, warnings, isSubmitting, handleChange, handleEntryChange, addEntry, removeEntry, handleSubmit, validateForm, resetForm, setFormData, setErrors, setWarnings };
};