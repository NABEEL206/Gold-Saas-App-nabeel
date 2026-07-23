// src/pages/accountant/ChartOfAccounts/ChartOfAccountsEdit.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { useChartOfAccounts } from "../../../hooks/ChartOfAccounts/useChartOfAccounts";
import { useChartOfAccountsEdit } from "../../../hooks/ChartOfAccounts/useChartOfAccountsEdit";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import SearchableDropdown, {
  type DropdownOption,
} from "../../../components/common/Searchabledropdown";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import ErrorSummary from "../../../components/common/ErrorSummary";
import { useToastAndConfirm } from "../../../hooks/ToastConfirmModal/useToastAndConfirm";
import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_CATEGORIES,
} from "../../../types/ChartOfAccounts/ChartOfAccountsType";

// ============================================================
// CONSTANTS - Single source of truth
// ============================================================

const typeOptions: DropdownOption[] = ACCOUNT_TYPES.map((type) => ({
  value: type,
  label: ACCOUNT_TYPE_LABELS[type],
}));

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

const ChartOfAccountsEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getAccountById, updateAccount, accounts } = useChartOfAccounts();
  const [account, setAccount] = useState<any>(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([]);

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
    handleSubmit,
    setFormData,
    resetForm,
  } = useChartOfAccountsEdit(account);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  useEffect(() => {
    if (!loadingAccount && account && initialSnapshotRef.current === null)
      initialSnapshotRef.current = JSON.stringify(formData);
    if (initialSnapshotRef.current !== null)
      setHasChanges(JSON.stringify(formData) !== initialSnapshotRef.current);
  }, [formData, loadingAccount, account]);

  useEffect(() => {
    const categories = ACCOUNT_CATEGORIES[formData.type] || [];
    setCategoryOptions(categories.map((cat) => ({ value: cat, label: cat })));
  }, [formData.type]);

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

  const parentAccountOptions: DropdownOption[] = accounts
    .filter((a) => String(a.id) !== String(id))
    .map((a) => ({ value: String(a.id), label: `${a.code} - ${a.name}` }));

  useEffect(() => {
    const loadAccount = async () => {
      if (!id) {
        showError("Invalid account ID");
        navigate("/accountant/chart-of-accounts");
        return;
      }
      setLoadingAccount(true);
      setLoadError(null);
      try {
        const data = await getAccountById(id);
        if (data) {
          setAccount(data);
          setFormData({
            code: data.code || "",
            name: data.name || "",
            type: data.type || "asset",
            category: data.category || "",
            subCategory: data.subCategory || "",
            description: data.description || "",
            parentAccountId: data.parentAccountId || undefined,
            parentAccountName: data.parentAccountName || undefined,
            isActive: data.isActive !== undefined ? data.isActive : true,
            isSystemAccount: data.isSystemAccount || false,
            openingBalance: data.openingBalance || 0,
            currentBalance: data.currentBalance || 0,
          });
          setCategoryOptions(
            (ACCOUNT_CATEGORIES[data.type] || []).map((cat) => ({
              value: cat,
              label: cat,
            })),
          );
        } else {
          setLoadError("Account not found");
          showError("Account not found.");
          setTimeout(() => navigate("/accountant/chart-of-accounts"), 2000);
        }
      } catch {
        setLoadError("Error loading account data");
        showError("Failed to load account data.");
      } finally {
        setLoadingAccount(false);
      }
    };
    loadAccount();
  }, [id, getAccountById, setFormData, navigate, showError]);

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(updateAccount);
        if (!success) throw new Error("Failed to update account");
        await new Promise((r) => setTimeout(r, 500));
        navigate("/accountant/chart-of-accounts");
      },
      "Updating account...",
      `Account "${formData.name}" updated successfully.`,
      "Failed to update account.",
    );
  };

  const handleCancel = async () => {
    if (!hasChanges) {
      navigate("/accountant/chart-of-accounts");
      return;
    }
    await withConfirmation(
      {
        title: "Discard Changes",
        message: "You have unsaved changes. Discard them?",
        confirmText: "Discard",
        variant: "danger",
      },
      async () => navigate("/accountant/chart-of-accounts"),
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

  const handleTypeSelect = (option: DropdownOption) =>
    handleChange("type", option.value);
  const handleCategorySelect = (option: DropdownOption) =>
    handleChange("category", option.value);
  const handleParentSelect = (option: DropdownOption) => {
    const parent = accounts.find((a) => String(a.id) === option.value);
    handleChange("parentAccountId", option.value);
    handleChange("parentAccountName", parent?.name || "");
  };

  const getSelectedType = (): string | null => formData.type || null;
  const getSelectedCategory = (): string | null => formData.category || null;
  const getSelectedParent = (): string | null =>
    formData.parentAccountId ? String(formData.parentAccountId) : null;

  const formErrors = getFormErrors();
  const warningErrors = getWarningErrors();

  if (loadingAccount)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading account details..." />
      </div>
    );
  if (loadError || !account)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--warning)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {loadError || "Account not found"}
          </p>
          <button
            onClick={() => navigate("/accountant/chart-of-accounts")}
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
            Back to Chart of Accounts
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      <div className="max-w-5xl mx-auto">
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
                Edit Account
              </h1>
              <p
                className="text-sm mt-0.5 themed-transition"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                {account.code} - {account.name}
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
          className="rounded-xl p-6 themed-transition"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3
                className="text-lg font-medium mb-4 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Account Information
              </h3>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Account Code <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.code ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('code', e, errors)}
                placeholder="e.g., 1000"
              />
              {errors.code && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.code}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Account Name <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.name ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('name', e, errors)}
                placeholder="Enter account name"
              />
              {errors.name && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Account Type <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <SearchableDropdown
                options={typeOptions}
                value={getSelectedType()}
                onChange={handleTypeSelect}
                placeholder="Search type..."
                triggerPlaceholder="Select account type"
                className="w-full max-w-full"
                resetSearchOnOpen={true}
                showEmptyState={true}
                emptyStateText="No matching types found"
                maxListHeight={200}
              />
              {errors.type && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.type}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Category <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <SearchableDropdown
                options={categoryOptions}
                value={getSelectedCategory()}
                onChange={handleCategorySelect}
                placeholder="Search category..."
                triggerPlaceholder="Select category"
                className="w-full max-w-full"
                resetSearchOnOpen={true}
                showEmptyState={true}
                emptyStateText="No matching categories found"
                maxListHeight={200}
              />
              {errors.category && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Sub Category
              </label>
              <input
                type="text"
                value={formData.subCategory || ""}
                onChange={(e) => handleChange("subCategory", e.target.value)}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.subCategory ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('subCategory', e, errors)}
                placeholder="Enter sub category"
              />
              {errors.subCategory && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.subCategory}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Parent Account
              </label>
              <SearchableDropdown
                options={parentAccountOptions}
                value={getSelectedParent()}
                onChange={handleParentSelect}
                placeholder="Search parent account..."
                triggerPlaceholder="Select parent account"
                className="w-full max-w-full"
                resetSearchOnOpen={true}
                showEmptyState={true}
                emptyStateText="No parent accounts found"
                maxListHeight={200}
              />
              {errors.parentAccountId && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.parentAccountId}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                className="block text-sm font-medium mb-1 themed-transition"
                style={{ color: 'var(--foreground)' }}
              >
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.description ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('description', e, errors)}
                placeholder="Enter account description"
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
                Opening Balance
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.openingBalance || ""}
                onChange={(e) =>
                  handleChange(
                    "openingBalance",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 themed-transition"
                style={{
                  border: `1px solid ${errors.openingBalance ? 'var(--error)' : 'var(--border)'}`,
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                onFocus={handleInputFocus}
                onBlur={(e) => handleInputBlur('openingBalance', e, errors)}
                placeholder="0.00"
              />
              {errors.openingBalance && (
                <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
                  {errors.openingBalance}
                </p>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4 rounded themed-transition"
                  style={{
                    accentColor: 'var(--primary)',
                    borderColor: 'var(--border)',
                  }}
                />
                <label
                  className="text-sm font-medium themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  Active
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isSystemAccount}
                  onChange={(e) =>
                    handleChange("isSystemAccount", e.target.checked)
                  }
                  className="h-4 w-4 rounded themed-transition"
                  style={{
                    accentColor: 'var(--primary)',
                    borderColor: 'var(--border)',
                  }}
                />
                <label
                  className="text-sm font-medium themed-transition"
                  style={{ color: 'var(--foreground)' }}
                >
                  System Account
                </label>
              </div>
            </div>
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

export default ChartOfAccountsEdit;