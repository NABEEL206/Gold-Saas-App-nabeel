// src/pages/accountant/ChartOfAccounts/ChartOfAccountsCreate.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useChartOfAccounts } from "../../../hooks/ChartOfAccounts/useChartOfAccounts";
import { useChartOfAccountsCreate } from "../../../hooks/ChartOfAccounts/useChartOfAccountsCreate";
import SearchableDropdown, {
  type DropdownOption,
} from "../../../components/common/Searchabledropdown";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorSummary from "../../../components/common/ErrorSummary";
import { useToastAndConfirm } from "../../../hooks/ToastConfirmModal/useToastAndConfirm";
import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_CATEGORIES,
} from "../../../types/ChartOfAccounts/ChartOfAccountsType";

const typeOptions: DropdownOption[] = ACCOUNT_TYPES.map((type) => ({
  value: type,
  label: ACCOUNT_TYPE_LABELS[type],
}));

const ChartOfAccountsCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createAccount, accounts } = useChartOfAccounts();
  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useChartOfAccountsCreate();

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

  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([]);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentState = JSON.stringify(formData);
    if (initialSnapshotRef.current === null)
      initialSnapshotRef.current = currentState;
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData]);

  useEffect(() => {
    const categories = ACCOUNT_CATEGORIES[formData.type] || [];
    setCategoryOptions(categories.map((cat) => ({ value: cat, label: cat })));
    if (!categories.includes(formData.category)) handleChange("category", "");
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
    .filter((a) => String(a.id) !== String(formData.parentAccountId))
    .map((a) => ({ value: String(a.id), label: `${a.code} - ${a.name}` }));

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(createAccount);
        if (!success) throw new Error("Failed to create account");
        await new Promise((resolve) => setTimeout(resolve, 500));
        navigate("/accountant/chart-of-accounts");
      },
      "Creating account...",
      `Account "${formData.name}" created successfully.`,
      "Failed to create account. Please try again.",
    );
  };

  const handleCancel = async () => {
    if (!hasChanges) {
      navigate("/accountant/chart-of-accounts");
      return;
    }
    await withConfirmation(
      {
        title: "Discard Account",
        message:
          "You have unsaved account details. Are you sure you want to discard them?",
        confirmText: "Discard",
        variant: "danger",
      },
      async () => navigate("/accountant/chart-of-accounts"),
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create Account
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Add a new chart of accounts entry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Account
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Summary */}
        {showErrorSummary && Object.keys(formErrors).length > 0 && (
          <ErrorSummary
            errors={formErrors}
            variant="error"
            title="Please fix the following errors:"
            onClose={() => setShowErrorSummary(false)}
            maxDisplay={10}
          />
        )}

        {/* Warning Summary */}
        {showWarningSummary && Object.keys(warningErrors).length > 0 && (
          <ErrorSummary
            errors={warningErrors}
            variant="warning"
            title="Please review the following warnings:"
            onClose={() => setShowWarningSummary(false)}
            maxDisplay={5}
          />
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.code ? "border-red-500" : "border-gray-300"}`}
                placeholder="e.g., 1000"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-500">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter account name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type <span className="text-red-500">*</span>
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
                <p className="mt-1 text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
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
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub Category
              </label>
              <input
                type="text"
                value={formData.subCategory || ""}
                onChange={(e) => handleChange("subCategory", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.subCategory ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter sub category"
              />
              {errors.subCategory && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.subCategory}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <p className="mt-1 text-sm text-red-500">
                  {errors.parentAccountId}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.description ? "border-red-500" : "border-gray-300"}`}
                placeholder="Enter account description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.openingBalance ? "border-red-500" : "border-gray-300"}`}
                placeholder="0.00"
              />
              {errors.openingBalance && (
                <p className="mt-1 text-sm text-red-500">
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
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
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
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
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

export default ChartOfAccountsCreate;
