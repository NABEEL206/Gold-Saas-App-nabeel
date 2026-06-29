// src/pages/purchases/VendorCredits/VendorCreditsEdit.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useVendorCredits } from '../../../hooks/VendorCredits/useVendorCredits';
import { useVendorCreditsEdit } from '../../../hooks/VendorCredits/useVendorCreditsEdit';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { 
  VENDOR_CREDIT_STATUSES, 
  VENDOR_CREDIT_STATUS_LABELS,
  VENDOR_CREDIT_REASONS,
  VENDOR_CREDIT_REASON_LABELS
} from '../../../types/VendorCredits/VendorCreditsType';

const VendorCreditsEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCreditById, updateCredit } = useVendorCredits();
  const [credit, setCredit] = useState<any>(null);
  const [loadingCredit, setLoadingCredit] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleItemsChange,
    handleSubmit,
    setFormData,
    resetForm
  } = useVendorCreditsEdit(credit);

  // Product suggestions
  const productSuggestions = [
    { id: '1', name: 'Laptop', code: 'LAP-001', price: 45000, unit: 'Pcs' },
    { id: '2', name: 'Monitor', code: 'MON-001', price: 15000, unit: 'Pcs' },
    { id: '3', name: 'Office Chairs', code: 'CHA-001', price: 8500, unit: 'Pcs' },
    { id: '4', name: 'Stationery Supplies', code: 'STA-001', price: 500, unit: 'Set' },
    { id: '5', name: 'Shipping Boxes', code: 'SHIP-001', price: 150, unit: 'Pcs' },
    { id: '6', name: 'Machine Parts', code: 'MAC-001', price: 2000, unit: 'Pcs' },
  ];

  useEffect(() => {
    const loadCredit = async () => {
      if (id) {
        setLoadingCredit(true);
        setLoadError(null);
        try {
          const data = await getCreditById(id);
          if (data) {
            setCredit(data);
            setFormData({
              creditDate: data.creditDate || new Date().toISOString().split('T')[0],
              billId: data.billId || '',
              billNumber: data.billNumber || '',
              vendorId: data.vendorId || '',
              vendorName: data.vendorName || '',
              vendorEmail: data.vendorEmail || '',
              vendorPhone: data.vendorPhone || '',
              vendorGST: data.vendorGST || '',
              amount: data.amount || 0,
              taxAmount: data.taxAmount || 0,
              totalAmount: data.totalAmount || 0,
              reason: data.reason || 'return',
              status: data.status || 'draft',
              items: data.items || [],
              notes: data.notes || '',
              referenceNumber: data.referenceNumber || '',
              usedAmount: data.usedAmount || 0,
              balanceAmount: data.balanceAmount || 0,
              expiryDate: data.expiryDate || '',
              currency: data.currency || 'INR',
              exchangeRate: data.exchangeRate || 1,
              attachment: data.attachment || ''
            });
          } else {
            setLoadError('Vendor credit not found');
          }
        } catch (error) {
          console.error('Error loading vendor credit:', error);
          setLoadError('Error loading vendor credit data');
        } finally {
          setLoadingCredit(false);
        }
      }
    };
    loadCredit();
  }, [id, getCreditById, setFormData]);

  const onSubmit = async () => {
    const success = await handleSubmit(updateCredit);
    if (success) {
      navigate('/purchases/vendor-credits');
    }
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
      {/* Header */}
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

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Form - Same as Create with pre-populated data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Same fields as Create page with values from formData */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Credit Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.vendorName || ''}
              onChange={(e) => handleChange('vendorName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.vendorId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter vendor name"
            />
            {errors.vendorId && <p className="mt-1 text-sm text-red-500">{errors.vendorId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor ID
            </label>
            <input
              type="text"
              value={formData.vendorId || ''}
              onChange={(e) => handleChange('vendorId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter vendor ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Email
            </label>
            <input
              type="email"
              value={formData.vendorEmail || ''}
              onChange={(e) => handleChange('vendorEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter vendor email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Phone
            </label>
            <input
              type="text"
              value={formData.vendorPhone || ''}
              onChange={(e) => handleChange('vendorPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter vendor phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill Number
            </label>
            <input
              type="text"
              value={formData.billNumber || ''}
              onChange={(e) => handleChange('billNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter bill number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill ID
            </label>
            <input
              type="text"
              value={formData.billId || ''}
              onChange={(e) => handleChange('billId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter bill ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.creditDate}
              onChange={(e) => handleChange('creditDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.creditDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.creditDate && <p className="mt-1 text-sm text-red-500">{errors.creditDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={formData.expiryDate || ''}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {VENDOR_CREDIT_REASONS.map(reason => (
                <option key={reason} value={reason}>
                  {VENDOR_CREDIT_REASON_LABELS[reason]}
                </option>
              ))}
            </select>
            {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
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
              {VENDOR_CREDIT_STATUSES.map(status => (
                <option key={status} value={status}>
                  {VENDOR_CREDIT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
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
              Vendor GST
            </label>
            <input
              type="text"
              value={formData.vendorGST || ''}
              onChange={(e) => handleChange('vendorGST', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter vendor GST number"
            />
          </div>

          {/* Items Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-4">Credit Items</h3>
            <ItemSelectionTable
              items={formData.items}
              onItemsChange={handleItemsChange}
              errors={errors}
              productSuggestions={productSuggestions}
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

          {/* Notes */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-4">Additional Information</h3>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter additional notes"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCreditsEdit;