// src/utils/validation/manualJournalValidation.ts

import type { ManualJournalFormData, ManualJournalEntry } from '../types/ManualJournal/ManualJournalType';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates a single journal entry
 */
export const validateJournalEntry = (
  entry: ManualJournalEntry,
  index: number
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const prefix = `entries[${index}]`;

  // Account validation
  if (!entry.accountId || entry.accountId.trim() === '') {
    errors[`${prefix}.accountId`] = 'Account is required';
  }

  // Amount validation - either debit or credit must be > 0
  if ((!entry.debitAmount || entry.debitAmount === 0) && (!entry.creditAmount || entry.creditAmount === 0)) {
    errors[`${prefix}.amount`] = 'Either debit or credit amount is required';
  }

  // Cannot have both debit and credit
  if (entry.debitAmount > 0 && entry.creditAmount > 0) {
    errors[`${prefix}.amount`] = 'Cannot have both debit and credit amounts in the same entry';
  }

  // Debit amount validation
  if (entry.debitAmount !== undefined && entry.debitAmount !== null) {
    if (isNaN(entry.debitAmount)) {
      errors[`${prefix}.debitAmount`] = 'Invalid debit amount';
    } else if (entry.debitAmount < 0) {
      errors[`${prefix}.debitAmount`] = 'Debit amount cannot be negative';
    } else if (entry.debitAmount > 999999999) {
      errors[`${prefix}.debitAmount`] = 'Debit amount is too large';
    }
  }

  // Credit amount validation
  if (entry.creditAmount !== undefined && entry.creditAmount !== null) {
    if (isNaN(entry.creditAmount)) {
      errors[`${prefix}.creditAmount`] = 'Invalid credit amount';
    } else if (entry.creditAmount < 0) {
      errors[`${prefix}.creditAmount`] = 'Credit amount cannot be negative';
    } else if (entry.creditAmount > 999999999) {
      errors[`${prefix}.creditAmount`] = 'Credit amount is too large';
    }
  }

  // Description validation (optional)
  if (entry.description && entry.description.length > 200) {
    errors[`${prefix}.description`] = 'Description must be less than 200 characters';
  }

  return errors;
};

/**
 * Validates all journal entries
 */
export const validateJournalEntries = (
  entries: ManualJournalEntry[]
): Record<string, string> => {
  let allErrors: Record<string, string> = {};

  if (!entries || entries.length < 2) {
    allErrors['entries'] = 'At least 2 entries are required (one debit and one credit)';
    return allErrors;
  }

  entries.forEach((entry, index) => {
    const entryErrors = validateJournalEntry(entry, index);
    allErrors = { ...allErrors, ...entryErrors };
  });

  // Check if totals balance (only if no individual entry errors)
  const hasEntryErrors = Object.keys(allErrors).some(key => key !== 'entries' && key !== 'balance');
  if (!hasEntryErrors) {
    const totalDebit = entries.reduce((sum, e) => sum + (e.debitAmount || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (e.creditAmount || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      allErrors['balance'] = `Total debit (₹${totalDebit.toFixed(2)}) must equal total credit (₹${totalCredit.toFixed(2)})`;
    }
  }

  return allErrors;
};

/**
 * Validates the complete manual journal form data
 */
export const validateManualJournal = (
  formData: ManualJournalFormData
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Journal date validation
  if (!formData.journalDate) {
    errors.journalDate = 'Journal date is required';
  } else {
    const journalDate = new Date(formData.journalDate);
    if (isNaN(journalDate.getTime())) {
      errors.journalDate = 'Please enter a valid journal date';
    }
  }

  // Description validation
  if (!formData.description || formData.description.trim() === '') {
    errors.description = 'Description is required';
  } else if (formData.description.length < 5) {
    errors.description = 'Description must be at least 5 characters';
  } else if (formData.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  // Status validation
  if (!formData.status) {
    errors.status = 'Status is required';
  } else {
    const validStatuses = ['draft', 'pending', 'posted', 'cancelled'];
    if (!validStatuses.includes(formData.status)) {
      errors.status = 'Please select a valid status';
    }
  }

  // Entries validation
  if (!formData.entries || formData.entries.length < 2) {
    errors.entries = 'At least 2 entries are required (one debit and one credit)';
  } else {
    const entryErrors = validateJournalEntries(formData.entries);
    Object.assign(errors, entryErrors);
  }

  // Reference number validation (optional)
  if (formData.referenceNumber && formData.referenceNumber.length > 50) {
    errors.referenceNumber = 'Reference number must be less than 50 characters';
  }

  // Notes validation (optional)
  if (formData.notes && formData.notes.length > 1000) {
    errors.notes = 'Notes must be less than 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates a specific field of manual journal form
 */
export const validateManualJournalField = (
  field: string,
  value: any,
  formData?: ManualJournalFormData
): string | null => {
  // Handle nested entry fields
  if (field.startsWith('entries[')) {
    const match = field.match(/entries\[(\d+)\]\.(.+)/);
    if (match && formData?.entries) {
      const index = parseInt(match[1]);
      const entryField = match[2];
      const entry = formData.entries[index];
      
      if (entry) {
        const updatedEntry = { ...entry, [entryField]: value };
        const errors = validateJournalEntry(updatedEntry, index);
        return errors[field] || null;
      }
    }
    return null;
  }

  switch (field) {
    case 'journalDate':
      if (!value) return 'Journal date is required';
      if (isNaN(new Date(value).getTime())) return 'Please enter a valid date';
      break;

    case 'description':
      if (!value || value.trim() === '') return 'Description is required';
      if (value.length < 5) return 'Description must be at least 5 characters';
      if (value.length > 500) return 'Description must be less than 500 characters';
      break;

    case 'status':
      if (!value) return 'Status is required';
      break;

    case 'referenceNumber':
      if (value && value.length > 50) return 'Must be less than 50 characters';
      break;

    case 'notes':
      if (value && value.length > 1000) return 'Must be less than 1000 characters';
      break;
  }

  return null;
};

/**
 * Validate business logic rules for manual journals
 */
export const validateManualJournalBusinessRules = (
  formData: ManualJournalFormData
): string[] => {
  const warnings: string[] = [];

  // Warn for future date journals
  if (formData.journalDate) {
    const journalDate = new Date(formData.journalDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (journalDate > today) {
      warnings.push('Journal date is in the future');
    }
  }

  // Warn for posting directly
  if (formData.status === 'posted') {
    warnings.push('Journal will be posted immediately - ensure all entries are correct');
  }

  // Warn for large amounts
  if (formData.totalDebit > 10000000) {
    warnings.push('Total amount exceeds 10,000,000 - please verify');
  }

  // Warn for many entries
  if (formData.entries && formData.entries.length > 20) {
    warnings.push('Journal has more than 20 entries - please verify all are necessary');
  }

  // Check if all entries are balanced
  if (formData.totalDebit === formData.totalCredit && formData.totalDebit > 0) {
    // This is good, no warning needed
  } else if (formData.totalDebit !== formData.totalCredit) {
    warnings.push('Journal is not balanced - debits must equal credits');
  }

  return warnings;
};