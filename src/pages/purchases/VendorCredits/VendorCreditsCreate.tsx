// src/pages/purchases/VendorCredits/VendorCreditsCreate.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Mail, Phone, Hash } from 'lucide-react';
import { useVendorCredits } from '../../../hooks/VendorCredits/useVendorCredits';
import { useVendorCreditsCreate } from '../../../hooks/VendorCredits/useVendorCreditsCreate';
import { useVendor } from '../../../hooks/vendor/useVendor';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import {
  VENDOR_CREDIT_STATUSES,
  VENDOR_CREDIT_STATUS_LABELS,
} from '../../../types/VendorCredits/VendorCreditsType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorSummary from '../../../components/common/ErrorSummary';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// ─── Static option lists ───────────────────────────────────────────────────────
const CREDIT_STATUS_OPTIONS: DropdownOption[] = VENDOR_CREDIT_STATUSES.map(s => ({
  value: s,
  label: VENDOR_CREDIT_STATUS_LABELS[s],
}));

// ─── Product suggestions ───────────────────────────────────────────────────────
const PRODUCT_SUGGESTIONS = [
  { id: '1', name: 'Gold Ring 22K',    code: 'GR-001',  price: 7500,  unit: 'Pcs', description: '22K Gold Ring' },
  { id: '2', name: 'Gold Chain 22K',   code: 'GC-001',  price: 4500,  unit: 'Pcs', description: '22K Gold Chain' },
  { id: '3', name: 'Diamond Ring 18K', code: 'DR-001',  price: 8500,  unit: 'Pcs', description: '18K Diamond Ring' },
  { id: '4', name: 'Gold Bracelet',    code: 'GB-001',  price: 3800,  unit: 'Pcs', description: 'Gold Bracelet' },
  { id: '5', name: 'Silver Necklace',  code: 'SN-001',  price: 2800,  unit: 'Pcs', description: 'Silver Necklace' },
  { id: '6', name: 'Machine Parts',    code: 'MAC-001', price: 2000,  unit: 'Pcs', description: 'Industrial Parts' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const VendorCreditsCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createCredit } = useVendorCredits();
  const { vendors } = useVendor();
  const {
    formData,
    errors,
    warnings,
    isSubmitting,
    handleChange,
    handleItemsChange,
    handleSubmit,
  } = useVendorCreditsCreate();

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
    email?: string; phone?: string; taxId?: string;
  } | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(true);
  const [showWarningSummary, setShowWarningSummary] = useState(true);

  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentState = JSON.stringify(formData);
    if (initialSnapshotRef.current === null) initialSnapshotRef.current = currentState;
    setHasChanges(currentState !== initialSnapshotRef.current);
  }, [formData]);

  useEffect(() => {
    setVendorOptions(
      vendors.map(v => ({
        value: String(v.id),
        label: v.name,
        group: v.status === 'active' ? 'Active Vendors' : 'Inactive Vendors',
      }))
    );
  }, [vendors]);

  useEffect(() => {
    if (errors.submit) showError(errors.submit);
  }, [errors.submit, showError]);

  useEffect(() => {
    const formErrs = getFormErrors();
    if (Object.keys(formErrs).length > 0) setShowErrorSummary(true);
  }, [errors]);

  useEffect(() => {
    if (warnings && warnings.length > 0) {
      warnings.forEach(w => showWarning(w));
    }
  }, [warnings, showWarning]);

  const getFormErrors = () => {
    return Object.entries(errors).reduce((acc, [key, value]) => {
      if (key !== 'submit') acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
  };

  const getWarningErrors = () => {
    if (!warnings || warnings.length === 0) return {};
    return warnings.reduce((acc, w, i) => {
      acc[`warning_${i}`] = w;
      return acc;
    }, {} as Record<string, string>);
  };

  const handleVendorSelect = (option: DropdownOption) => {
    const v = vendors.find(v => String(v.id) === option.value);
    handleChange('vendorId', option.value);
    handleChange('vendorName', v?.name ?? option.label);
    handleChange('vendorEmail', v?.email ?? '');
    handleChange('vendorPhone', v?.phone ?? '');
    handleChange('vendorGST', v?.taxId ?? '');
    setSelectedVendorInfo(v ? { email: v.email, phone: v.phone, taxId: v.taxId } : null);
  };

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(createCredit);
        if (!success) throw new Error('Failed to create vendor credit');
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/purchases/vendor-credits');
      },
      'Creating vendor credit...',
      'Vendor credit created successfully.',
      'Failed to create vendor credit. Please try again.'
    );
  };

  const handleCancel = async () => {
    if (!hasChanges) {
      navigate('/purchases/vendor-credits');
      return;
    }
    await withConfirmation(
      {
        title: 'Discard Vendor Credit',
        message: 'You have unsaved credit details. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => navigate('/purchases/vendor-credits')
    );
  };

  const formErrors = getFormErrors();
  const warningErrors = getWarningErrors();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Go back">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Vendor Credit</h1>
              <p className="text-sm text-gray-500 mt-0.5">Create a new vendor credit note</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={onSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? <><LoadingSpinner size="sm" />Saving...</> : <><Save className="h-4 w-4" />Save Credit</>}
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

        {/* ── Form ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">

          {/* ── Section: Credit Information ── */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Credit Note# */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credit Note#</label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all bg-white">
                  <Hash className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={formData.referenceNumber || ''}
                    onChange={(e) => handleChange('referenceNumber', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900"
                    placeholder="CN-000001"
                  />
                </div>
                {errors.referenceNumber && <p className="mt-1 text-sm text-red-500">{errors.referenceNumber}</p>}
              </div>

              {/* Bill Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                <input type="text" value={formData.billNumber || ''} onChange={(e) => handleChange('billNumber', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.billNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter bill number" />
                {errors.billNumber && <p className="mt-1 text-sm text-red-500">{errors.billNumber}</p>}
              </div>

              {/* Vendor dropdown — full width */}
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
                {errors.vendorId && <p className="mt-1 text-sm text-red-500">{errors.vendorId}</p>}
                {selectedVendorInfo && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg flex flex-wrap gap-4 text-sm text-gray-600">
                    {selectedVendorInfo.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-amber-500" />{selectedVendorInfo.email}</span>}
                    {selectedVendorInfo.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-amber-500" />{selectedVendorInfo.phone}</span>}
                    {selectedVendorInfo.taxId && <span className="text-gray-500">GST: {selectedVendorInfo.taxId}</span>}
                  </div>
                )}
              </div>

              {/* Credit Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Date <span className="text-red-500">*</span>
                </label>
                <input type="date" value={formData.creditDate} onChange={(e) => handleChange('creditDate', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.creditDate ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.creditDate && <p className="mt-1 text-sm text-red-500">{errors.creditDate}</p>}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input type="date" value={formData.expiryDate || ''} onChange={(e) => handleChange('expiryDate', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.expiryDate && <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <SearchableDropdown options={CREDIT_STATUS_OPTIONS} value={formData.status || null} onChange={(opt) => handleChange('status', opt.value)} triggerPlaceholder="Select status" placeholder="Search status..." resetSearchOnOpen />
                {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
              </div>

              {/* Vendor GST */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor GST</label>
                <input type="text" value={formData.vendorGST || ''} onChange={(e) => handleChange('vendorGST', e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.vendorGST ? 'border-red-500' : 'border-gray-300'}`} placeholder="Auto-filled or enter manually" />
                {errors.vendorGST && <p className="mt-1 text-sm text-red-500">{errors.vendorGST}</p>}
              </div>

            </div>
          </div>

          {/* ── Section: Credit Items ── */}
          <div>
            {errors.items && typeof errors.items === 'string' && (
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

          {/* ── Section: Additional Information ── */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.notes ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter additional notes"
            />
            {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes}</p>}
          </div>

        </div>
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default VendorCreditsCreate;