// src/pages/accountant/ManualJournal/ManualJournalCreate.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useManualJournal } from '../../../hooks/ManualJournal/useManualJournal';
import { useManualJournalCreate } from '../../../hooks/ManualJournal/useManualJournalCreate';
import { CHART_OF_ACCOUNTS, MANUAL_JOURNAL_STATUSES, MANUAL_JOURNAL_STATUS_LABELS } from '../../../types/ManualJournal/ManualJournalType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';

// Convert chart of accounts to dropdown options with groups
const getAccountOptions = (): DropdownOption[] => {
  return CHART_OF_ACCOUNTS.map(account => ({
    value: account.id,
    label: account.name,
    group: account.category
  }));
};

const ManualJournalCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createJournal } = useManualJournal();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleEntryChange,
    addEntry,
    removeEntry,
    handleSubmit
  } = useManualJournalCreate();

  const accountOptions = getAccountOptions();

  const onSubmit = async () => {
    const success = await handleSubmit(createJournal);
    if (success) {
      navigate('/accountant/manual-journals');
    }
  };

  // Handle account selection from dropdown
  const handleAccountSelect = (index: number, option: DropdownOption) => {
    const account = CHART_OF_ACCOUNTS.find(acc => acc.id === option.value);
    if (account) {
      handleEntryChange(index, 'accountId', account.id);
      handleEntryChange(index, 'accountName', account.name);
      handleEntryChange(index, 'accountCode', account.code);
    }
  };

  // Get selected value for dropdown
  const getSelectedValue = (index: number): string | null => {
    const entry = formData.entries[index];
    return entry?.accountId || null;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/accountant/manual-journals')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Manual Journal</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create a new manual journal entry</p>
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Journal'}
        </button>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Card Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
        {/* Journal Information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Journal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Journal Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.journalDate}
                onChange={(e) => handleChange('journalDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                  errors.journalDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.journalDate && <p className="mt-1 text-sm text-red-500">{errors.journalDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {MANUAL_JOURNAL_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {MANUAL_JOURNAL_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter journal description"
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.referenceNumber || ''}
                onChange={(e) => handleChange('referenceNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter reference number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter additional notes"
              />
            </div>
          </div>
        </div>

        {/* Journal Entries */}
        <div className="p-6 overflow-visible">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Journal Entries</h3>
            <button
              type="button"
              onClick={addEntry}
              className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </button>
          </div>

          {errors.entries && (
            <p className="mb-4 text-sm text-red-500">{errors.entries}</p>
          )}
          {errors.balance && (
            <p className="mb-4 text-sm text-red-500">{errors.balance}</p>
          )}

          {/* Table - overflow-visible for dropdown */}
          <div className="border border-gray-200 rounded-lg overflow-visible">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <div className="grid grid-cols-12 gap-3 px-4 py-3">
                <div className="col-span-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account</span>
                </div>
                <div className="col-span-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Debit (INR)</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Credit (INR)</span>
                </div>
                <div className="col-span-1 text-center">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Action</span>
                </div>
              </div>
            </div>

            {/* Table Body - overflow-visible for dropdown */}
            <div className="divide-y divide-gray-100 overflow-visible">
              {formData.entries.map((entry, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 px-4 py-2 hover:bg-gray-50 items-center">
                  {/* Account Column with SearchableDropdown */}
                  <div className="col-span-4 relative">
                    <SearchableDropdown
                      options={accountOptions}
                      value={getSelectedValue(index)}
                      onChange={(option) => handleAccountSelect(index, option)}
                      placeholder="Search account..."
                      triggerPlaceholder="Select an account"
                      className="w-full max-w-full"
                      resetSearchOnOpen={true}
                      showEmptyState={true}
                      emptyStateText="No matching accounts found"
                      maxListHeight={280}
                    />
                    {errors[`entry_${index}_accountId`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`entry_${index}_accountId`]}</p>
                    )}
                  </div>

                  {/* Description Column */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={entry.description || ''}
                      onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                      placeholder="Description"
                    />
                  </div>

                  {/* Debit Column */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={entry.debitAmount || ''}
                      onChange={(e) => handleEntryChange(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-1.5 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm ${
                        errors[`entry_${index}_amount`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Credit Column */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      value={entry.creditAmount || ''}
                      onChange={(e) => handleEntryChange(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-1.5 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm ${
                        errors[`entry_${index}_amount`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    {errors[`entry_${index}_amount`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`entry_${index}_amount`]}</p>
                    )}
                  </div>

                  {/* Action Column */}
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Totals Row */}
              <div className="bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="grid grid-cols-12 gap-3 px-4 py-3">
                  <div className="col-span-7 text-right font-medium text-gray-700">
                    Totals
                  </div>
                  <div className="col-span-2 text-right font-medium text-red-600">
                    ₹{formData.totalDebit.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right font-medium text-green-600">
                    ₹{formData.totalCredit.toFixed(2)}
                  </div>
                  <div className="col-span-1"></div>
                </div>
                {formData.totalDebit === formData.totalCredit && formData.totalDebit > 0 && (
                  <div className="bg-green-50 px-4 py-2 text-right rounded-b-lg">
                    <span className="text-sm font-medium text-green-600">✓ Journal is balanced</span>
                  </div>
                )}
                {formData.totalDebit !== formData.totalCredit && formData.totalDebit > 0 && (
                  <div className="bg-red-50 px-4 py-2 text-right rounded-b-lg">
                    <span className="text-sm font-medium text-red-600">
                      ⚠ Unbalanced: Debit ₹{formData.totalDebit.toFixed(2)} ≠ Credit ₹{formData.totalCredit.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Entry Button Below Table */}
          <button
            type="button"
            onClick={addEntry}
            className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-amber-600 border border-dashed border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualJournalCreate;