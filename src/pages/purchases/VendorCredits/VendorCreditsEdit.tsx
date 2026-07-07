// src/pages/purchases/VendorCredits/VendorCreditsEdit.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Mail, Phone, AlertCircle, Hash } from "lucide-react";
import { useVendorCredits } from "../../../hooks/VendorCredits/useVendorCredits";
import { useVendorCreditsEdit } from "../../../hooks/VendorCredits/useVendorCreditsEdit";
import { useVendor } from "../../../hooks/vendor/useVendor";
import ItemSelectionTable from "../../../components/common/ItemSelectionTable";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
  VENDOR_CREDIT_STATUSES,
  VENDOR_CREDIT_STATUS_LABELS,
} from "../../../types/VendorCredits/VendorCreditsType";
import SearchableDropdown, {
  type DropdownOption,
} from "../../../components/common/Searchabledropdown";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import ErrorSummary from "../../../components/common/ErrorSummary";
import { useToastAndConfirm } from "../../../hooks/ToastConfirmModal/useToastAndConfirm";

// ─── Static option lists ───────────────────────────────────────────────────────
const CREDIT_STATUS_OPTIONS: DropdownOption[] = VENDOR_CREDIT_STATUSES.map(
  (s) => ({ value: s, label: VENDOR_CREDIT_STATUS_LABELS[s] }),
);

// ─── Product suggestions ───────────────────────────────────────────────────────
const PRODUCT_SUGGESTIONS = [
  {
    id: "1",
    name: "Gold Ring 22K",
    code: "GR-001",
    price: 7500,
    unit: "Pcs",
    description: "22K Gold Ring",
  },
  {
    id: "2",
    name: "Gold Chain 22K",
    code: "GC-001",
    price: 4500,
    unit: "Pcs",
    description: "22K Gold Chain",
  },
  {
    id: "3",
    name: "Diamond Ring 18K",
    code: "DR-001",
    price: 8500,
    unit: "Pcs",
    description: "18K Diamond Ring",
  },
  {
    id: "4",
    name: "Gold Bracelet",
    code: "GB-001",
    price: 3800,
    unit: "Pcs",
    description: "Gold Bracelet",
  },
  {
    id: "5",
    name: "Silver Necklace",
    code: "SN-001",
    price: 2800,
    unit: "Pcs",
    description: "Silver Necklace",
  },
  {
    id: "6",
    name: "Machine Parts",
    code: "MAC-001",
    price: 2000,
    unit: "Pcs",
    description: "Industrial Parts",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const VendorCreditsEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCreditById, updateCredit } = useVendorCredits();
  const { vendors } = useVendor();

  const [credit, setCredit] = useState<any>(null);
  const [loadingCredit, setLoadingCredit] = useState(true);
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

  const [vendorOptions, setVendorOptions] = useState<DropdownOption[]>([]);
  const [selectedVendorInfo, setSelectedVendorInfo] = useState<{
    email?: string;
    phone?: string;
    taxId?: string;
  } | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleItemsChange,
    handleSubmit,
    setFormData,
    resetForm,
  } = useVendorCreditsEdit(credit);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loadingCredit && credit && initialSnapshotRef.current === null)
      initialSnapshotRef.current = JSON.stringify(formData);
    if (initialSnapshotRef.current !== null)
      setHasChanges(JSON.stringify(formData) !== initialSnapshotRef.current);
  }, [formData, loadingCredit, credit]);

  useEffect(() => {
    setVendorOptions(
      vendors.map((v) => ({
        value: String(v.id),
        label: v.name,
        group: v.status === "active" ? "Active Vendors" : "Inactive Vendors",
      })),
    );
  }, [vendors]);

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
    const load = async () => {
      if (!id) return;
      setLoadingCredit(true);
      setLoadError(null);
      try {
        const data = await getCreditById(id);
        if (data) {
          setCredit(data);
          setFormData({
            creditDate:
              data.creditDate || new Date().toISOString().split("T")[0],
            billId: data.billId || undefined,
            billNumber: data.billNumber || undefined,
            vendorId: data.vendorId || undefined,
            vendorName: data.vendorName || undefined,
            vendorEmail: data.vendorEmail || undefined,
            vendorPhone: data.vendorPhone || undefined,
            vendorGST: data.vendorGST || undefined,
            amount: data.amount || 0,
            taxAmount: data.taxAmount || 0,
            totalAmount: data.totalAmount || 0,
            reason: data.reason || "return",
            status: data.status || "draft",
            items: data.items || [],
            notes: data.notes || undefined,
            referenceNumber:
              data.referenceNumber || data.creditNumber || undefined,
            usedAmount: data.usedAmount || 0,
            balanceAmount: data.balanceAmount || 0,
            expiryDate: data.expiryDate || undefined,
            currency: "INR",
            exchangeRate: 1,
            attachment: data.attachment || undefined,
          });
        } else {
          setLoadError("Vendor credit not found");
        }
      } catch {
        setLoadError("Error loading vendor credit data");
      } finally {
        setLoadingCredit(false);
      }
    };
    load();
  }, [id, getCreditById, setFormData]);

  useEffect(() => {
    if (formData.vendorId && vendors.length > 0) {
      const v = vendors.find((v) => String(v.id) === String(formData.vendorId));
      if (v)
        setSelectedVendorInfo({
          email: v.email,
          phone: v.phone,
          taxId: v.taxId,
        });
    }
  }, [formData.vendorId, vendors]);

  const handleVendorSelect = (option: DropdownOption) => {
    const v = vendors.find((v) => String(v.id) === option.value);
    handleChange("vendorId", option.value);
    handleChange("vendorName", v?.name ?? option.label);
    handleChange("vendorEmail", v?.email ?? "");
    handleChange("vendorPhone", v?.phone ?? "");
    handleChange("vendorGST", v?.taxId ?? "");
    setSelectedVendorInfo(
      v ? { email: v.email, phone: v.phone, taxId: v.taxId } : null,
    );
  };

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(updateCredit);
        if (!success) throw new Error("Failed to update vendor credit");
        await new Promise((r) => setTimeout(r, 500));
        navigate("/purchases/vendor-credits");
      },
      "Updating vendor credit...",
      "Vendor credit updated successfully.",
      "Failed to update vendor credit.",
    );
  };

  const handleCancel = async () => {
    if (!hasChanges) {
      navigate("/purchases/vendor-credits");
      return;
    }
    await withConfirmation(
      {
        title: "Discard Changes",
        message:
          "You have unsaved changes. Are you sure you want to discard them?",
        confirmText: "Discard",
        variant: "danger",
      },
      async () => navigate("/purchases/vendor-credits"),
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

  const formErrors = getFormErrors();
  const warningErrors = getWarningErrors();

  if (loadingCredit)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading vendor credit details..." />
      </div>
    );

  if (loadError || !credit)
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {loadError || "Vendor credit not found"}
          </p>
          <button
            onClick={() => navigate("/purchases/vendor-credits")}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            Back to Vendor Credits
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
                Edit Vendor Credit
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {credit.creditNumber}
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

        {/* Error & Warning Summaries */}
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

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Credit Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Credit Note# */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Note#
                </label>
                <div
                  className={`flex items-center border rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all bg-white ${errors.referenceNumber ? "border-red-500" : "border-gray-300"}`}
                >
                  <Hash className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={formData.referenceNumber || ""}
                    onChange={(e) =>
                      handleChange("referenceNumber", e.target.value)
                    }
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900"
                    placeholder="CN-000001"
                  />
                </div>
                {errors.referenceNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.referenceNumber}
                  </p>
                )}
              </div>

              {/* Bill Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Number
                </label>
                <input
                  type="text"
                  value={formData.billNumber || ""}
                  onChange={(e) => handleChange("billNumber", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.billNumber ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter bill number"
                />
                {errors.billNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.billNumber}
                  </p>
                )}
              </div>

              {/* Vendor */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={vendorOptions}
                  value={formData.vendorId ? String(formData.vendorId) : null}
                  onChange={handleVendorSelect}
                  placeholder="Search vendor by name..."
                  triggerPlaceholder="Select a vendor..."
                  showEmptyState
                  emptyStateText="No vendors found"
                  resetSearchOnOpen
                />
                {errors.vendorId && (
                  <p className="mt-1 text-sm text-red-500">{errors.vendorId}</p>
                )}
                {selectedVendorInfo && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg flex flex-wrap gap-4 text-sm text-gray-600">
                    {selectedVendorInfo.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-amber-500" />
                        {selectedVendorInfo.email}
                      </span>
                    )}
                    {selectedVendorInfo.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-amber-500" />
                        {selectedVendorInfo.phone}
                      </span>
                    )}
                    {selectedVendorInfo.taxId && (
                      <span className="text-gray-500">
                        GST: {selectedVendorInfo.taxId}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Credit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.creditDate}
                  onChange={(e) => handleChange("creditDate", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.creditDate ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.creditDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.creditDate}
                  </p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={(e) => handleChange("expiryDate", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.expiryDate ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <SearchableDropdown
                  options={CREDIT_STATUS_OPTIONS}
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

              {/* Vendor GST */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor GST
                </label>
                <input
                  type="text"
                  value={formData.vendorGST || ""}
                  onChange={(e) => handleChange("vendorGST", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.vendorGST ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Auto-filled or enter manually"
                />
                {errors.vendorGST && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.vendorGST}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            {errors.items && typeof errors.items === "string" && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.items}</p>
              </div>
            )}
            <ItemSelectionTable
              items={formData.items}
              onItemsChange={handleItemsChange}
              errors={errors}
              productSuggestions={PRODUCT_SUGGESTIONS}
              showJewelryFields={false}
              showDescription={true}
              showUnit={true}
              showDiscount={true}
              showTax={true}
              simpleMode={false}
              searchPlaceholder="Search products..."
              addButtonLabel="Add Item"
              title="Credit Items"
              showSubtotalSection={true}
              showTotalSection={true}
              autoAddDefaultRow={false}
              addButtonAtBottom={true}
              className="border-0 p-0"
            />
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Additional Information
            </h3>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.notes ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter additional notes"
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-500">{errors.notes}</p>
            )}
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

export default VendorCreditsEdit;
