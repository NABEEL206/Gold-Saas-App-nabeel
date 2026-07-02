// src/pages/purchases/VendorCredits/VendorCreditsEdit.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Mail, Phone } from 'lucide-react';
import { useVendorCredits } from '../../../hooks/VendorCredits/useVendorCredits';
import { useVendorCreditsEdit } from '../../../hooks/VendorCredits/useVendorCreditsEdit';
import { useVendor } from '../../../hooks/vendor/useVendor';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import {
  VENDOR_CREDIT_STATUSES,
  VENDOR_CREDIT_STATUS_LABELS,
  VENDOR_CREDIT_REASONS,
  VENDOR_CREDIT_REASON_LABELS,
} from '../../../types/VendorCredits/VendorCreditsType';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';

// ─── Static option lists ───────────────────────────────────────────────────────
const CREDIT_STATUS_OPTIONS: DropdownOption[] = VENDOR_CREDIT_STATUSES.map(s => ({
  value: s,
  label: VENDOR_CREDIT_STATUS_LABELS[s],
}));

const CREDIT_REASON_OPTIONS: DropdownOption[] = VENDOR_CREDIT_REASONS.map(r => ({
  value: r,
  label: VENDOR_CREDIT_REASON_LABELS[r],
}));

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
const VendorCreditsEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCreditById, updateCredit } = useVendorCredits();
  const { vendors } = useVendor();

  const [credit, setCredit]               = useState<any>(null);
  const [loadingCredit, setLoadingCredit] = useState(true);
  const [loadError, setLoadError]         = useState<string | null>(null);

  const [vendorOptions, setVendorOptions]           = useState<DropdownOption[]>([]);
  const [selectedVendorInfo, setSelectedVendorInfo] = useState<{
    email?: string; phone?: string; taxId?: string;
  } | null>(null);

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleItemsChange,
    handleSubmit,
    setFormData,
  } = useVendorCreditsEdit(credit);

  // Build vendor options
  useEffect(() => {
    setVendorOptions(
      vendors.map(v => ({
        value: String(v.id),
        label: v.name,
        group: v.status === 'active' ? 'Active Vendors' : 'Inactive Vendors',
      }))
    );
  }, [vendors]);

  // Load credit
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
            creditDate:      data.creditDate      || new Date().toISOString().split('T')[0],
            billId:          data.billId          || '',
            billNumber:      data.billNumber      || '',
            vendorId:        data.vendorId        || '',
            vendorName:      data.vendorName      || '',
            vendorEmail:     data.vendorEmail     || '',
            vendorPhone:     data.vendorPhone     || '',
            vendorGST:       data.vendorGST       || '',
            amount:          data.amount          || 0,
            taxAmount:       data.taxAmount       || 0,
            totalAmount:     data.totalAmount     || 0,
            reason:          data.reason          || 'return',
            status:          data.status          || 'draft',
            items:           data.items           || [],
            notes:           data.notes           || '',
            referenceNumber: data.referenceNumber || '',
            usedAmount:      data.usedAmount      || 0,
            balanceAmount:   data.balanceAmount   || 0,
            expiryDate:      data.expiryDate      || '',
            currency:        data.currency        || 'INR',
            exchangeRate:    data.exchangeRate    || 1,
            attachment:      data.attachment      || '',
          });
        } else {
          setLoadError('Vendor credit not found');
        }
      } catch {
        setLoadError('Error loading vendor credit data');
      } finally {
        setLoadingCredit(false);
      }
    };
    load();
  }, [id, getCreditById, setFormData]);

  // Restore vendor info card after load
  useEffect(() => {
    if (formData.vendorId && vendors.length > 0) {
      const v = vendors.find(v => String(v.id) === String(formData.vendorId));
      if (v) setSelectedVendorInfo({ email: v.email, phone: v.phone, taxId: v.taxId });
    }
  }, [formData.vendorId, vendors]);

  const handleVendorSelect = (option: DropdownOption) => {
    const v = vendors.find(v => String(v.id) === option.value);
    handleChange('vendorId',    option.value);
    handleChange('vendorName',  v?.name  ?? option.label);
    handleChange('vendorEmail', v?.email ?? '');
    handleChange('vendorPhone', v?.phone ?? '');
    handleChange('vendorGST',   v?.taxId ?? '');
    setSelectedVendorInfo(v ? { email: v.email, phone: v.phone, taxId: v.taxId } : null);
  };

  const onSubmit = async () => {
    const success = await handleSubmit(updateCredit);
    if (success) navigate('/purchases/vendor-credits');
  };

  if (loadingCredit) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading vendor credit details..." />
      </div>
    );
  }
  if (loadError || !credit) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          {loadError || 'Vendor credit not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/purchases/vendor-credits')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Vendor Credit</h1>
            <p className="text-sm text-gray-500 mt-0.5">{credit.creditNumber}</p>
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* ── Form ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">

        {/* ── Section: Credit Information ── */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                  {selectedVendorInfo.taxId && (
                    <span className="text-gray-500">GST: {selectedVendorInfo.taxId}</span>
                  )}
                </div>
              )}
            </div>

            {/* Bill Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
              <input
                type="text"
                value={formData.billNumber || ''}
                onChange={(e) => handleChange('billNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter bill number"
              />
            </div>

            {/* Bill ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill ID</label>
              <input
                type="text"
                value={formData.billId || ''}
                onChange={(e) => handleChange('billId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter bill ID"
              />
            </div>

            {/* Credit Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.creditDate}
                onChange={(e) => handleChange('creditDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.creditDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.creditDate && <p className="mt-1 text-sm text-red-500">{errors.creditDate}</p>}
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate || ''}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={CREDIT_REASON_OPTIONS}
                value={formData.reason || null}
                onChange={(opt) => handleChange('reason', opt.value)}
                triggerPlaceholder="Select reason"
                placeholder="Search reason..."
                resetSearchOnOpen
              />
              {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <SearchableDropdown
                options={CREDIT_STATUS_OPTIONS}
                value={formData.status || null}
                onChange={(opt) => handleChange('status', opt.value)}
                triggerPlaceholder="Select status"
                placeholder="Search status..."
                resetSearchOnOpen
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
              <input
                type="text"
                value={formData.referenceNumber || ''}
                onChange={(e) => handleChange('referenceNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter reference number"
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

          </div>
        </div>

        {/* ── Section: Credit Items ── */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Items</h3>
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
            additionalCharges={[]}
            headerDiscount={0}
            showTotalSection={true}
            autoAddDefaultRow={true}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Enter additional notes"
          />
        </div>

      </div>
    </div>
  );
};

export default VendorCreditsEdit;
