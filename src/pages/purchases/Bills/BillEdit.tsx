// src/pages/purchases/Bills/BillEdit.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import { useBills } from '../../../hooks/Bill/useBills';
import { useBillEdit } from '../../../hooks/Bill/useBillEdit';
import { useVendor } from '../../../hooks/vendor/useVendor';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { BILL_STATUSES, BILL_STATUS_LABELS } from '../../../types/Bill/BillTypes';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// ─── Static option lists ───────────────────────────────────────────────────────
const BILL_STATUS_OPTIONS: DropdownOption[] = BILL_STATUSES.map(s => ({
  value: s,
  label: BILL_STATUS_LABELS[s],
}));

const PAYMENT_METHOD_OPTIONS: DropdownOption[] = [
  { value: 'cash',        label: 'Cash' },
  { value: 'bank',        label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cheque',      label: 'Cheque' },
  { value: 'auto_debit',  label: 'Auto Debit' },
];

// ─── Product suggestions ───────────────────────────────────────────────────────
const PRODUCT_SUGGESTIONS = [
  { id: '1', name: 'Gold Ring 22K',    code: 'GR-001',  price: 7500,  unit: 'Pcs' },
  { id: '2', name: 'Gold Chain 22K',   code: 'GC-001',  price: 4500,  unit: 'Pcs' },
  { id: '3', name: 'Diamond Ring 18K', code: 'DR-001',  price: 8500,  unit: 'Pcs' },
  { id: '4', name: 'Gold Bracelet',    code: 'GB-001',  price: 3800,  unit: 'Pcs' },
  { id: '5', name: 'Silver Necklace',  code: 'SN-001',  price: 2800,  unit: 'Pcs' },
  { id: '6', name: 'Machine Parts',    code: 'MAC-001', price: 2000,  unit: 'Pcs' },
];

// ─── Component ────────────────────────────────────────────────────────────────
const BillEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getBillById, updateBill } = useBills();
  const { vendors } = useVendor();

  const [bill, setBill] = useState<any>(null);
  const [loadingBill, setLoadingBill] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Use the toast and confirm hook
  const {
    success,
    error: showError,
    warning,
    withConfirmation,
    withLoading,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  // Vendor dropdown state
  const [vendorOptions, setVendorOptions] = useState<DropdownOption[]>([]);
  const [selectedVendorInfo, setSelectedVendorInfo] = useState<{
    email?: string; phone?: string; address?: string;
    city?: string; state?: string; taxId?: string;
  } | null>(null);

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleItemsChange,
    handleSubmit,
    setFormData,
    resetForm,
  } = useBillEdit(bill);

  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loadingBill && bill && initialSnapshotRef.current === null) {
      initialSnapshotRef.current = JSON.stringify(formData);
    }
    if (initialSnapshotRef.current !== null) {
      setHasChanges(JSON.stringify(formData) !== initialSnapshotRef.current);
    }
  }, [formData, loadingBill, bill]);

  // Build dropdown options
  useEffect(() => {
    setVendorOptions(
      vendors.map(v => ({
        value: String(v.id),
        label: v.name,
        group: v.status === 'active' ? 'Active Vendors' : 'Inactive Vendors',
      }))
    );
  }, [vendors]);

  // Show error toast for submit errors
  useEffect(() => {
    if (errors.submit) {
      showError(errors.submit);
    }
  }, [errors.submit, showError]);

  // Load bill data
  useEffect(() => {
    const load = async () => {
      if (!id) {
        showError('Invalid bill ID');
        navigate('/purchases/bills');
        return;
      }
      setLoadingBill(true);
      setLoadError(null);
      try {
        const data = await getBillById(id);
        if (data) {
          setBill(data);
          setFormData({
            billDate:            data.billDate            || new Date().toISOString().split('T')[0],
            dueDate:             data.dueDate             || '',
            vendorId:            data.vendorId            || '',
            vendorName:          data.vendorName          || '',
            vendorEmail:         data.vendorEmail         || '',
            vendorPhone:         data.vendorPhone         || '',
            vendorAddress:       data.vendorAddress       || '',
            vendorGST:           data.vendorGST           || '',
            purchaseOrderNumber: data.purchaseOrderNumber || '',
            status:              data.status              || 'draft',
            items:               data.items               || [],
            subtotal:            data.subtotal            || 0,
            discountTotal:       data.discountTotal       || 0,
            taxTotal:            data.taxTotal            || 0,
            shippingCharges:     data.shippingCharges     || 0,
            handlingCharges:     data.handlingCharges     || 0,
            otherCharges:        data.otherCharges        || 0,
            totalAmount:         data.totalAmount         || 0,
            paidAmount:          data.paidAmount          || 0,
            balanceDue:          data.balanceDue          || 0,
            currency:            data.currency            || 'INR',
            exchangeRate:        data.exchangeRate        || 1,
            notes:               data.notes               || '',
            terms:               data.terms               || '',
            attachment:          data.attachment          || '',
            paymentTerms:        data.paymentTerms        || '',
            paymentDate:         data.paymentDate         || '',
            paymentMethod:       data.paymentMethod       || 'bank',
          });
        } else {
          setLoadError('Bill not found');
          showError('Bill not found. Redirecting back...');
          setTimeout(() => navigate('/purchases/bills'), 2000);
        }
      } catch {
        setLoadError('Error loading bill data');
        showError('Failed to load bill data. Please try again.');
      } finally {
        setLoadingBill(false);
      }
    };
    load();
  }, [id, getBillById, setFormData, navigate, showError]);

  // Restore vendor info card once vendors load and we have a vendorId
  useEffect(() => {
    if (formData.vendorId && vendors.length > 0) {
      const v = vendors.find(v => String(v.id) === String(formData.vendorId));
      if (v) {
        setSelectedVendorInfo({
          email: v.email, phone: v.phone,
          address: v.address, city: v.city, state: v.state,
          taxId: v.taxId,
        });
      }
    }
  }, [formData.vendorId, vendors]);

  // Select vendor → auto-fill all fields
  const handleVendorSelect = (option: DropdownOption) => {
    const v = vendors.find(v => String(v.id) === option.value);
    handleChange('vendorId',      option.value);
    handleChange('vendorName',    v?.name  ?? option.label);
    handleChange('vendorEmail',   v?.email ?? '');
    handleChange('vendorPhone',   v?.phone ?? '');
    handleChange('vendorGST',     v?.taxId ?? '');
    const addr = [v?.address, v?.city, v?.state, v?.country].filter(Boolean).join(', ');
    handleChange('vendorAddress', addr);
    setSelectedVendorInfo(v
      ? { email: v.email, phone: v.phone, address: v.address, city: v.city, state: v.state, taxId: v.taxId }
      : null,
    );
  };

  const additionalCharges = [
    { label: 'Shipping', value: formData.shippingCharges || 0 },
    { label: 'Handling', value: formData.handlingCharges || 0 },
    { label: 'Other',    value: formData.otherCharges    || 0 },
  ];

  const onSubmit = async () => {
    await withLoading(
      async () => {
        const success = await handleSubmit(updateBill);
        if (!success) {
          throw new Error('Failed to update bill');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate('/purchases/bills');
      },
      'Updating bill...',
      'Bill updated successfully.',
      'Failed to update bill. Please try again.'
    );
  };

  // Cancel handler with unsaved changes confirmation
  const handleCancel = async () => {
    if (!hasChanges) {
      navigate('/purchases/bills');
      return;
    }

    await withConfirmation(
      {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/purchases/bills');
      }
    );
  };

  // Reset form handler
  const handleResetForm = async () => {
    if (!hasChanges) return;

    await withConfirmation(
      {
        title: 'Reset Form',
        message: 'Are you sure you want to reset all changes to the original values?',
        confirmText: 'Reset',
        variant: 'warning',
      },
      async () => {
        if (resetForm) {
          resetForm();
        }
        initialSnapshotRef.current = null;
        success('Form reset to original values.');
      }
    );
  };

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (loadingBill) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading bill details..." />
      </div>
    );
  }
  
  if (loadError || !bill) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
          <p className="text-gray-500">{loadError || 'Bill not found'}</p>
          <button
            onClick={() => navigate('/purchases/bills')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Bills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Bill</h1>
              <p className="text-sm text-gray-500 mt-0.5">{bill.billNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Reset changes"
              >
                Reset
              </button>
            )}
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
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && Object.keys(errors).some(key => key !== 'submit') && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {Object.entries(errors)
                  .filter(([key]) => key !== 'submit')
                  .map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Form ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* ── Section: Bill Information ── */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor SearchableDropdown — full width */}
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
                        <Mail className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        {selectedVendorInfo.email}
                      </span>
                    )}
                    {selectedVendorInfo.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        {selectedVendorInfo.phone}
                      </span>
                    )}
                    {(selectedVendorInfo.address || selectedVendorInfo.city) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        {[selectedVendorInfo.address, selectedVendorInfo.city, selectedVendorInfo.state]
                          .filter(Boolean).join(', ')}
                      </span>
                    )}
                    {selectedVendorInfo.taxId && (
                      <span className="text-gray-500">GST: {selectedVendorInfo.taxId}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Bill Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => handleChange('billDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.billDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.billDate && <p className="mt-1 text-sm text-red-500">{errors.billDate}</p>}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <SearchableDropdown
                  options={BILL_STATUS_OPTIONS}
                  value={formData.status || null}
                  onChange={(opt) => handleChange('status', opt.value)}
                  triggerPlaceholder="Select status"
                  placeholder="Search status..."
                  resetSearchOnOpen
                />
              </div>

              {/* PO Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Order Number
                </label>
                <input
                  type="text"
                  value={formData.purchaseOrderNumber || ''}
                  onChange={(e) => handleChange('purchaseOrderNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter PO number"
                />
              </div>

              {/* Vendor GST (auto-filled, editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor GST</label>
                <input
                  type="text"
                  value={formData.vendorGST || ''}
                  onChange={(e) => handleChange('vendorGST', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Auto-filled or enter manually"
                />
              </div>

              {/* Vendor Address (auto-filled, editable) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Address</label>
                <textarea
                  value={formData.vendorAddress || ''}
                  onChange={(e) => handleChange('vendorAddress', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Auto-filled from vendor selection, or enter manually"
                />
              </div>
            </div>
          </div>

          {/* ── Section: Bill Items ── */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Items</h3>
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
              title=""
              showSubtotalSection={true}
              additionalCharges={additionalCharges}
              headerDiscount={0}
              showTotalSection={true}
              autoAddDefaultRow={true}
              addButtonAtBottom={true}
              className="border-0 p-0"
            />
          </div>

          {/* ── Section: Payment Information ── */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.paidAmount || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    handleChange('paidAmount', val);
                    handleChange('balanceDue', formData.totalAmount - val);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0.00"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <SearchableDropdown
                  options={PAYMENT_METHOD_OPTIONS}
                  value={formData.paymentMethod || null}
                  onChange={(opt) => handleChange('paymentMethod', opt.value)}
                  triggerPlaceholder="Select payment method"
                  placeholder="Search method..."
                  resetSearchOnOpen
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={formData.paymentDate || ''}
                  onChange={(e) => handleChange('paymentDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={formData.paymentTerms || ''}
                  onChange={(e) => handleChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Net 30 days"
                />
              </div>
            </div>
          </div>

          {/* ── Section: Additional Information ── */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter additional notes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Terms &amp; Conditions
                </label>
                <textarea
                  value={formData.terms || ''}
                  onChange={(e) => handleChange('terms', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter terms and conditions"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={onModalCancel}
        onConfirm={onModalConfirm}
        title={modalOptions?.title}
        message={modalOptions?.message ?? ''}
        confirmText={modalOptions?.confirmText}
        cancelText={modalOptions?.cancelText}
        variant={modalOptions?.variant}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default BillEdit;