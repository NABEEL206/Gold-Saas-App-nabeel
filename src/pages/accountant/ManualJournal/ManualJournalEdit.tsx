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

// ============================================================
// CONSTANTS - Single source of truth
// ============================================================

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

// Combined blur handler for input fields
const handleInputBlur = (field: string, e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, errors: Record<string, string>) => {
  e.currentTarget.style.borderColor = errors[field] ? 'var(--error)' : 'var(--border)';
  e.currentTarget.style.boxShadow = 'none';
};

// Focus handler for input fields
const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'var(--primary)';
  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
};

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
          <AlertCircle className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--warning)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {loadError || "Manual journal not found"}
          </p>
          <button
            onClick={() => navigate("/accountant/manual-journals")}
            className="mt-4 px-4 py-2 rounded-lg transition-colors themed-transition"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            Back to Manual Journals
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg transition-colors themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1
                className="text-2xl font-bold themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Edit Manual Journal
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {journal.journalNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
                style={{
                  color: 'var(--foreground-secondary)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors themed-transition"
              style={{
                color: 'var(--foreground-secondary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
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

        <div
          className="rounded-xl border overflow-visible themed-transition"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="p-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3
              className="text-lg font-medium mb-4 themed-transition"
              style={{ color: 'var(--foreground)' }}
            >
              Journal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Journal Date <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="date"
                  value={formData.journalDate}
                  onChange={(e) => handleChange("journalDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.journalDate ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('journalDate', e, errors)}
                />
                {errors.journalDate && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.journalDate}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
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
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.status}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Description <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.description ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('description', e, errors)}
                  placeholder="Enter journal description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.description}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Reference Number
                </label>
                <input
                  type="text"
                  value={formData.referenceNumber || ""}
                  onChange={(e) =>
                    handleChange("referenceNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.referenceNumber ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('referenceNumber', e, errors)}
                  placeholder="Enter reference number"
                />
                {errors.referenceNumber && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.referenceNumber}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label
                  className="block text-sm font-medium mb-1 themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Notes
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                  style={{
                    border: `1px solid ${errors.notes ? 'var(--error)' : 'var(--border)'}`,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={(e) => handleInputBlur('notes', e, errors)}
                  placeholder="Enter additional notes"
                />
                {errors.notes && (
                  <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                    {errors.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 overflow-visible">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-medium themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Journal Entries
              </h3>
              <button
                type="button"
                onClick={addEntry}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors themed-transition"
                style={{
                  color: 'var(--primary)',
                  border: '1px solid var(--primary)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Plus className="h-4 w-4" />
                Add Entry
              </button>
            </div>
            {errors.entries && typeof errors.entries === "string" && (
              <div
                className="mb-4 p-3 rounded-lg themed-transition"
                style={{
                  background: 'var(--error-light)',
                  border: '1px solid var(--error)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--error)' }}>
                  {errors.entries}
                </p>
              </div>
            )}
            {errors.balance && (
              <div
                className="mb-4 p-3 rounded-lg themed-transition"
                style={{
                  background: 'var(--error-light)',
                  border: '1px solid var(--error)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--error)' }}>
                  {errors.balance}
                </p>
              </div>
            )}

            <div
              className="border rounded-lg overflow-visible themed-transition"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="border-b rounded-t-lg themed-transition"
                style={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="grid grid-cols-12 gap-3 px-4 py-3">
                  <div className="col-span-4">
                    <span className="text-xs font-medium uppercase tracking-wider themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      Account
                    </span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-xs font-medium uppercase tracking-wider themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      Description
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-medium uppercase tracking-wider themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      Debit (₹)
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-medium uppercase tracking-wider themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      Credit (₹)
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="text-xs font-medium uppercase tracking-wider themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      Action
                    </span>
                  </div>
                </div>
              </div>
              <div className="divide-y overflow-visible" style={{ borderColor: 'var(--border-subtle)' }}>
                {formData.entries.map((entry, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 px-4 py-2 items-center themed-transition hover:bg-surface"
                    style={{ borderColor: 'var(--border-subtle)' }}
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
                        <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
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
                        className="w-full px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 text-sm themed-transition"
                        style={{
                          border: `1px solid ${errors[`entries[${index}].description`] ? 'var(--error)' : 'var(--border)'}`,
                          background: 'var(--background)',
                          color: 'var(--foreground)',
                        }}
                        onFocus={handleInputFocus}
                        onBlur={(e) => handleInputBlur(`entries[${index}].description`, e, errors)}
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
                        className="w-full px-3 py-1.5 rounded-lg text-right focus:outline-none focus:ring-2 text-sm themed-transition"
                        style={{
                          border: `1px solid ${errors[`entries[${index}].amount`] || errors[`entries[${index}].debitAmount`] ? 'var(--error)' : 'var(--border)'}`,
                          background: 'var(--background)',
                          color: 'var(--foreground)',
                        }}
                        onFocus={handleInputFocus}
                        onBlur={(e) => handleInputBlur(`entries[${index}].debitAmount`, e, errors)}
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
                        className="w-full px-3 py-1.5 rounded-lg text-right focus:outline-none focus:ring-2 text-sm themed-transition"
                        style={{
                          border: `1px solid ${errors[`entries[${index}].amount`] || errors[`entries[${index}].creditAmount`] ? 'var(--error)' : 'var(--border)'}`,
                          background: 'var(--background)',
                          color: 'var(--foreground)',
                        }}
                        onFocus={handleInputFocus}
                        onBlur={(e) => handleInputBlur(`entries[${index}].creditAmount`, e, errors)}
                        placeholder="0.00"
                      />
                      {errors[`entries[${index}].amount`] && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>
                          {errors[`entries[${index}].amount`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeEntry(index)}
                        className="p-1.5 rounded-lg transition-colors themed-transition"
                        style={{ color: 'var(--error)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--error-light)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="Remove entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t rounded-b-lg themed-transition" style={{ borderColor: 'var(--border)' }}>
                  <div className="grid grid-cols-12 gap-3 px-4 py-3" style={{ background: 'var(--surface)' }}>
                    <div className="col-span-7 text-right font-medium themed-transition" style={{ color: 'var(--foreground)' }}>
                      Totals
                    </div>
                    <div className="col-span-2 text-right font-medium" style={{ color: 'var(--error)' }}>
                      ₹{formData.totalDebit.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-right font-medium" style={{ color: 'var(--success)' }}>
                      ₹{formData.totalCredit.toFixed(2)}
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                  {formData.totalDebit === formData.totalCredit &&
                    formData.totalDebit > 0 && (
                      <div className="px-4 py-2 text-right rounded-b-lg themed-transition" style={{ background: 'var(--success-light)' }}>
                        <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                          ✓ Journal is balanced
                        </span>
                      </div>
                    )}
                  {formData.totalDebit !== formData.totalCredit &&
                    (formData.totalDebit > 0 || formData.totalCredit > 0) && (
                      <div className="px-4 py-2 text-right rounded-b-lg themed-transition" style={{ background: 'var(--error-light)' }}>
                        <span className="text-sm font-medium" style={{ color: 'var(--error)' }}>
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
              className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 text-sm rounded-lg transition-colors themed-transition"
              style={{
                color: 'var(--primary)',
                border: '1px dashed var(--primary)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
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