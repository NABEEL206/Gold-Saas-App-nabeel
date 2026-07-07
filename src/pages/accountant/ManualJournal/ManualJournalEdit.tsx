// src/pages/accountant/ManualJournal/ManualJournalEdit.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, AlertCircle } from "lucide-react";
import { useManualJournal } from "../../../hooks/ManualJournal/useManualJournal";
import { useManualJournalEdit } from "../../../hooks/ManualJournal/useManualJournalEdit";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
  CHART_OF_ACCOUNTS,
  MANUAL_JOURNAL_STATUSES,
  MANUAL_JOURNAL_STATUS_LABELS,
} from "../../../types/ManualJournal/ManualJournalType";
import SearchableDropdown, {
  type DropdownOption,
} from "../../../components/common/Searchabledropdown";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import ErrorSummary from "../../../components/common/ErrorSummary";
import { useToastAndConfirm } from "../../../hooks/ToastConfirmModal/useToastAndConfirm";

const getAccountOptions = (): DropdownOption[] => {
  return CHART_OF_ACCOUNTS.map((account) => ({
    value: account.id,
    label: account.name,
    group: account.category,
  }));
};

const JOURNAL_STATUS_OPTIONS: DropdownOption[] = MANUAL_JOURNAL_STATUSES.map(
  (s) => ({ value: s, label: MANUAL_JOURNAL_STATUS_LABELS[s] }),
);

const ManualJournalEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getJournalById, updateJournal } = useManualJournal();
  const [journal, setJournal] = useState<any>(null);
  const [loadingJournal, setLoadingJournal] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleEntryChange,
    addEntry,
    removeEntry,
    handleSubmit,
    setFormData,
    resetForm,
  } = useManualJournalEdit(journal);

  const accountOptions = getAccountOptions();

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  useEffect(() => {
    if (!loadingJournal && journal && initialSnapshotRef.current === null)
      initialSnapshotRef.current = JSON.stringify(formData);
    if (initialSnapshotRef.current !== null)
      setHasChanges(JSON.stringify(formData) !== initialSnapshotRef.current);
  }, [formData, loadingJournal, journal]);

  useEffect(() => {
    if (errors.submit) showError(errors.submit);
  }, [errors.submit, showError]);
  useEffect(() => {
    const fe = getFormErrors();
    if (Object.keys(fe).length > 0) setShowErrorSummary(true);
  }, [errors]);
  useEffect(() => {
    if (warnings?.length) warnings.forEach((w) => showWarning(w));
  }, [warnings, showWarning]);

  const getFormErrors = () =>
    Object.entries(errors).reduce(
      (acc, [k, v]) => {
        if (k !== "submit") acc[k] = v;
        return acc;
      },
      {} as Record<string, string>,
    );
  const getWarningErrors = () => {
    if (!warnings?.length) return {};
    return warnings.reduce(
      (acc, w, i) => {
        acc[`warning_${i}`] = w;
        return acc;
      },
      {} as Record<string, string>,
    );
  };

  useEffect(() => {
    const loadJournal = async () => {
      if (!id) {
        showError("Invalid journal ID");
        navigate("/accountant/manual-journals");
        return;
      }
      setLoadingJournal(true);
      setLoadError(null);
      try {
        const data = await getJournalById(id);
        if (data) {
          setJournal(data);
          setFormData({
            journalDate:
              data.journalDate || new Date().toISOString().split("T")[0],
            description: data.description || "",
            entries: data.entries || [],
            totalDebit: data.totalDebit || 0,
            totalCredit: data.totalCredit || 0,
            status: data.status || "draft",
            referenceNumber: data.referenceNumber || undefined,
            notes: data.notes || undefined,
            attachment: data.attachment || undefined,
          });
        } else {
          setLoadError("Manual journal not found");
          showError("Manual journal not found.");
          setTimeout(() => navigate("/accountant/manual-journals"), 2000);
        }
      } catch {
        setLoadError("Error loading manual journal data");
        showError("Failed to load manual journal data.");
      } finally {
        setLoadingJournal(false);
      }
    };
    loadJournal();
  }, [id, getJournalById, setFormData, navigate, showError]);

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(updateJournal);
        if (!success) throw new Error("Failed to update journal entry");
        await new Promise((r) => setTimeout(r, 500));
        navigate("/accountant/manual-journals");
      },
      "Updating journal entry...",
      "Manual journal entry updated successfully.",
      "Failed to update journal entry.",
    );
  };

  const handleCancel = async () => {
    if (!hasChanges) {
      navigate("/accountant/manual-journals");
      return;
    }
    await withConfirmation(
      {
        title: "Discard Changes",
        message: "You have unsaved changes. Discard them?",
        confirmText: "Discard",
        variant: "danger",
      },
      async () => navigate("/accountant/manual-journals"),
    );
  };

  const handleResetForm = async () => {
    if (!hasChanges) return;
    await withConfirmation(
      {
        title: "Reset Form",
        message: "Reset all changes to original values?",
        confirmText: "Reset",
        variant: "warning",
      },
      async () => {
        if (resetForm) resetForm();
        initialSnapshotRef.current = null;
        success("Form reset.");
      },
    );
  };

  const handleAccountSelect = (index: number, option: DropdownOption) => {
    const account = CHART_OF_ACCOUNTS.find((acc) => acc.id === option.value);
    if (account) {
      handleEntryChange(index, "accountId", account.id);
      handleEntryChange(index, "accountName", account.name);
      handleEntryChange(index, "accountCode", account.code);
    }
  };

  const getSelectedValue = (index: number): string | null => {
    return formData.entries[index]?.accountId || null;
  };

  const formErrors = getFormErrors();
  const warningErrors = getWarningErrors();

  if (loadingJournal)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading manual journal details..." />
      </div>
    );
  if (loadError || !journal)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {loadError || "Manual journal not found"}
          </p>
          <button
            onClick={() => navigate("/accountant/manual-journals")}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Back to Manual Journals
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Manual Journal
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {journal.journalNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {showErrorSummary && Object.keys(formErrors).length > 0 && (
          <ErrorSummary
            errors={formErrors}
            variant="error"
            title="Please fix the following errors:"
            onClose={() => setShowErrorSummary(false)}
            maxDisplay={10}
          />
        )}
        {showWarningSummary && Object.keys(warningErrors).length > 0 && (
          <ErrorSummary
            errors={warningErrors}
            variant="warning"
            title="Please review the following warnings:"
            onClose={() => setShowWarningSummary(false)}
            maxDisplay={5}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Journal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Journal Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.journalDate}
                  onChange={(e) => handleChange("journalDate", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.journalDate ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.journalDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.journalDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <SearchableDropdown
                  options={JOURNAL_STATUS_OPTIONS}
                  value={formData.status || null}
                  onChange={(opt) => handleChange("status", opt.value)}
                  triggerPlaceholder="Select status"
                  placeholder="Search status..."
                  resetSearchOnOpen
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-500">{errors.status}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.description ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter journal description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber || ""}
                  onChange={(e) =>
                    handleChange("referenceNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.referenceNumber ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter reference number"
                />
                {errors.referenceNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.referenceNumber}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.notes ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter additional notes"
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 overflow-visible">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Journal Entries
              </h3>
              <button
                type="button"
                onClick={addEntry}
                className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50"
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </button>
            </div>
            {errors.entries && typeof errors.entries === "string" && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.entries}</p>
              </div>
            )}
            {errors.balance && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.balance}</p>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg overflow-visible">
              <div className="bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <div className="grid grid-cols-12 gap-3 px-4 py-3">
                  <div className="col-span-4">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Account
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Description
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Debit (₹)
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Credit (₹)
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      Action
                    </span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 overflow-visible">
                {formData.entries.map((entry, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 px-4 py-2 hover:bg-gray-50 items-center"
                  >
                    <div className="col-span-4 relative">
                      <SearchableDropdown
                        options={accountOptions}
                        value={getSelectedValue(index)}
                        onChange={(option) =>
                          handleAccountSelect(index, option)
                        }
                        placeholder="Search account..."
                        triggerPlaceholder="Select an account"
                        className="w-full max-w-full"
                        resetSearchOnOpen={true}
                        showEmptyState={true}
                        emptyStateText="No matching accounts found"
                        maxListHeight={280}
                      />
                      {errors[`entries[${index}].accountId`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`entries[${index}].accountId`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={entry.description || ""}
                        onChange={(e) =>
                          handleEntryChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        className={`w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm ${errors[`entries[${index}].description`] ? "border-red-500" : "border-gray-300"}`}
                        placeholder="Description"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        value={entry.debitAmount || ""}
                        onChange={(e) =>
                          handleEntryChange(
                            index,
                            "debitAmount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className={`w-full px-3 py-1.5 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm ${errors[`entries[${index}].amount`] || errors[`entries[${index}].debitAmount`] ? "border-red-500" : "border-gray-300"}`}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        value={entry.creditAmount || ""}
                        onChange={(e) =>
                          handleEntryChange(
                            index,
                            "creditAmount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className={`w-full px-3 py-1.5 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm ${errors[`entries[${index}].amount`] || errors[`entries[${index}].creditAmount`] ? "border-red-500" : "border-gray-300"}`}
                        placeholder="0.00"
                      />
                      {errors[`entries[${index}].amount`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`entries[${index}].amount`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeEntry(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Remove entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
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
                  {formData.totalDebit === formData.totalCredit &&
                    formData.totalDebit > 0 && (
                      <div className="bg-green-50 px-4 py-2 text-right rounded-b-lg">
                        <span className="text-sm font-medium text-green-600">
                          ✓ Journal is balanced
                        </span>
                      </div>
                    )}
                  {formData.totalDebit !== formData.totalCredit &&
                    (formData.totalDebit > 0 || formData.totalCredit > 0) && (
                      <div className="bg-red-50 px-4 py-2 text-right rounded-b-lg">
                        <span className="text-sm font-medium text-red-600">
                          ⚠ Unbalanced: Debit ₹{formData.totalDebit.toFixed(2)}{" "}
                          ≠ Credit ₹{formData.totalCredit.toFixed(2)}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={addEntry}
              className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-amber-600 border border-dashed border-amber-300 rounded-lg hover:bg-amber-50"
            >
              <Plus className="h-4 w-4" />
              Add New Entry
            </button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={onModalCancel}
        onConfirm={onModalConfirm}
        title={modalOptions?.title}
        message={modalOptions?.message ?? ""}
        confirmText={modalOptions?.confirmText}
        cancelText={modalOptions?.cancelText}
        variant={modalOptions?.variant}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default ManualJournalEdit;
