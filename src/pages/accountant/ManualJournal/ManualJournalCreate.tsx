// src/pages/accountant/ManualJournal/ManualJournalCreate.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useManualJournal } from '../../../hooks/ManualJournal/useManualJournal';
import { useManualJournalCreate } from '../../../hooks/ManualJournal/useManualJournalCreate';
import { CHART_OF_ACCOUNTS, MANUAL_JOURNAL_STATUSES, MANUAL_JOURNAL_STATUS_LABELS } from '../../../types/ManualJournal/ManualJournalType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// Convert chart of accounts to dropdown options with groups
const getAccountOptions = (): DropdownOption[] => {
  return CHART_OF_ACCOUNTS.map(account => ({
    value: account.id,
    label: account.name,
    group: account.category
  }));
};

const JOURNAL_STATUS_OPTIONS: DropdownOption[] = MANUAL_JOURNAL_STATUSES.map(s => ({
  value: s,
  label: MANUAL_JOURNAL_STATUS_LABELS[s],
}));

const ManualJournalCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createJournal } = useManualJournal();
  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleEntryChange,
    addEntry,
    removeEntry,
    handleSubmit
  } = useManualJournalCreate();

  const {
    success,
    error: showError,
    warning: showWarning,
    withConfirmation,
    withLoading,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const accountOptions = getAccountOptions();

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  useEffect(() => {
    const currentState = JSON.stringify(formData);
    if (initialSnapshotRef.current === null) initialSnapshotRef.current = currentState;
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData]);

  useEffect(() => {
    if (errors.submit) showError(errors.submit);
  }, [errors.submit, showError]);

  useEffect(() => {
    const fe = getFormErrors();
    if (Object.keys(fe).length > 0) setShowErrorSummary(true);
  }, [errors]);

  useEffect(() => {
    if (warnings?.length) warnings.forEach(w => showWarning(w));
  }, [warnings, showWarning]);

  const getFormErrors = () =>
    Object.entries(errors).reduce((acc, [k, v]) => {
      if (k !== 'submit') acc[k] = v;
      return acc;
    }, {} as Record<string, string>);

  const getWarningErrors = () => {
    if (!warnings?.length) return {};
    return warnings.reduce((acc, w, i) => { acc[`warning_${i}`] = w; return acc; }, {} as Record<string, string>);
  };

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(createJournal);
        if (!success) throw new Error('Failed to create journal entry');
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/accountant/manual-journals');
      },
      'Creating journal entry...',
      'Manual journal entry created successfully.',
      'Failed to create journal entry. Please try again.'
    );
  };

  const handleCancel = async () => {
    if (!hasChanges) { navigate('/accountant/manual-journals'); return; }
    await withConfirmation(
      { title: 'Discard Journal Entry', message: 'You have unsaved journal details. Are you sure you want to discard them?', confirmText: 'Discard', variant: 'danger' },
      async () => navigate('/accountant/manual-journals')
    );
  };

  const handleClearForm = async () => {
    if (!hasChanges) return;
    await withConfirmation(
      { title: 'Clear Form', message: 'Are you sure you want to clear all entered data?', confirmText: 'Clear', variant: 'warning' },
      async () => { window.location.reload(); success('Form cleared successfully.'); }
    );
  };

  const handleAccountSelect = (index: number, option: DropdownOption) => {
    const account = CHART_OF_ACCOUNTS.find(acc => acc.id === option.value);
    if (account) {
      handleEntryChange(index, 'accountId', account.id);
      handleEntryChange(index, 'accountName', account.name);
      handleEntryChange(index, 'accountCode', account.code);
    }
  };

  const getSelectedValue = (index: number): string | null => {
    const entry = formData.entries[index];
    return entry?.accountId || null;
  };

  const formErrors = getFormErrors();
  const warningErrors = getWarningErrors();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Go back">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Manual Journal</h1>
              <p className="text-sm text-gray-500 mt-0.5">Create a new manual journal entry</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button type="button" onClick={handleClearForm} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Clear form">Clear</button>
            )}
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={onSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? <><LoadingSpinner size="sm" />Saving...</> : <><Save className="h-4 w-4" />Save Journal</>}
            </button>
          </div>
        </div>

        {/* Error Summary */}
        {showErrorSummary && Object.keys(formErrors).length > 0 && (
          <ErrorSummary errors={formErrors} variant="error" title="Please fix the following errors:" onClose={() => setShowErrorSummary(false)} maxDisplay={10} />
        )}

        {/* Warning Summary */}
        {showWarningSummary && Object.keys(warningErrors).length > 0 && (
          <ErrorSummary errors={warningErrors} variant="warning" title="Please review the following warnings:" onClose={() => setShowWarningSummary(false)} maxDisplay={5} />
        )}

        {/* Card Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
          {/* Journal Information */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Journal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Journal Date <span className="text-red-500">*</span></label>
                <input type="date" value={formData.journalDate} onChange={(e) => handleChange('journalDate', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.journalDate ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.journalDate && <p className="mt-1 text-sm text-red-500">{errors.journalDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <SearchableDropdown options={JOURNAL_STATUS_OPTIONS} value={formData.status || null} onChange={(opt) => handleChange('status', opt.value)} triggerPlaceholder="Select status" placeholder="Search status..." resetSearchOnOpen />
                {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <input type="text" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter journal description" />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input type="text" value={formData.referenceNumber || ''} onChange={(e) => handleChange('referenceNumber', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.referenceNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter reference number" />
                {errors.referenceNumber && <p className="mt-1 text-sm text-red-500">{errors.referenceNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} rows={2} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.notes ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter additional notes" />
                {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes}</p>}
              </div>
            </div>
          </div>

          {/* Journal Entries */}
          <div className="p-6 overflow-visible">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Journal Entries</h3>
              <button type="button" onClick={addEntry} className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors">
                <Plus className="h-4 w-4" />Add Entry
              </button>
            </div>

            {errors.entries && typeof errors.entries === 'string' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{errors.entries}</p></div>
            )}
            {errors.balance && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{errors.balance}</p></div>
            )}

            <div className="border border-gray-200 rounded-lg overflow-visible">
              <div className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <div className="grid grid-cols-12 gap-3 px-4 py-3">
                  <div className="col-span-4"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account</span></div>
                  <div className="col-span-3"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</span></div>
                  <div className="col-span-2 text-right"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Debit (₹)</span></div>
                  <div className="col-span-2 text-right"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Credit (₹)</span></div>
                  <div className="col-span-1 text-center"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Action</span></div>
                </div>
              </div>

              <div className="divide-y divide-gray-100 overflow-visible">
                {formData.entries.map((entry, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 px-4 py-2 hover:bg-gray-50 items-center">
                    <div className="col-span-4 relative">
                      <SearchableDropdown
                        options={accountOptions} value={getSelectedValue(index)}
                        onChange={(option) => handleAccountSelect(index, option)}
                        placeholder="Search account..." triggerPlaceholder="Select an account"
                        className="w-full max-w-full" resetSearchOnOpen={true}
                        showEmptyState={true} emptyStateText="No matching accounts found" maxListHeight={280}
                      />
                      {errors[`entries[${index}].accountId`] && (
                        <p className="mt-1 text-xs text-red-500">{errors[`entries[${index}].accountId`]}</p>
                      )}
                    </div>
                    <div className="col-span-3">
                      <input type="text" value={entry.description || ''} onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                        className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm ${errors[`entries[${index}].description`] ? 'border-red-500' : 'border-gray-300'}`} placeholder="Description" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" step="0.01" value={entry.debitAmount || ''}
                        onChange={(e) => handleEntryChange(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm ${errors[`entries[${index}].amount`] || errors[`entries[${index}].debitAmount`] ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" step="0.01" value={entry.creditAmount || ''}
                        onChange={(e) => handleEntryChange(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-1.5 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm ${errors[`entries[${index}].amount`] || errors[`entries[${index}].creditAmount`] ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" />
                      {(errors[`entries[${index}].amount`]) && (
                        <p className="mt-1 text-xs text-red-500">{errors[`entries[${index}].amount`]}</p>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      <button type="button" onClick={() => removeEntry(index)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove entry">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="grid grid-cols-12 gap-3 px-4 py-3">
                    <div className="col-span-7 text-right font-medium text-gray-700">Totals</div>
                    <div className="col-span-2 text-right font-medium text-red-600">₹{formData.totalDebit.toFixed(2)}</div>
                    <div className="col-span-2 text-right font-medium text-green-600">₹{formData.totalCredit.toFixed(2)}</div>
                    <div className="col-span-1"></div>
                  </div>
                  {formData.totalDebit === formData.totalCredit && formData.totalDebit > 0 && (
                    <div className="bg-green-50 px-4 py-2 text-right rounded-b-lg">
                      <span className="text-sm font-medium text-green-600">✓ Journal is balanced</span>
                    </div>
                  )}
                  {formData.totalDebit !== formData.totalCredit && (formData.totalDebit > 0 || formData.totalCredit > 0) && (
                    <div className="bg-red-50 px-4 py-2 text-right rounded-b-lg">
                      <span className="text-sm font-medium text-red-600">⚠ Unbalanced: Debit ₹{formData.totalDebit.toFixed(2)} ≠ Credit ₹{formData.totalCredit.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="button" onClick={addEntry} className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-amber-600 border border-dashed border-amber-300 rounded-lg hover:bg-amber-50 transition-colors">
              <Plus className="h-4 w-4" />Add New Entry
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default ManualJournalCreate;