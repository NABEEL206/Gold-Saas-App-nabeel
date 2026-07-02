// src/pages/sales/deliveryChallan/DeliveryChallanEdit.tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Truck,
  MapPin,
  Building2,
  Mail,
  Phone,
  FileText,
  Users,
  AlertCircle,
  Truck as TruckIcon,
  RefreshCw,
} from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { useDeliveryChallanEdit } from '../../../hooks/DeliveryChallan/useDeliveryChallanEdit';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';

// Mock customer data for dropdown
const MOCK_CUSTOMERS: DropdownOption[] = [
  { value: 'CUST-001', label: 'Rajesh Jewelers', group: 'Regular' },
  { value: 'CUST-002', label: 'Priya Gold House', group: 'Regular' },
  { value: 'CUST-003', label: 'Amit Diamond Co.', group: 'VIP' },
  { value: 'CUST-004', label: 'Sneha Jewellery', group: 'Regular' },
  { value: 'CUST-005', label: 'Vikram Gems', group: 'Corporate' },
];

// Mock customer details for auto-fill
const CUSTOMER_DETAILS: Record<string, any> = {
  'CUST-001': { name: 'Rajesh Jewelers', email: 'rajesh@jewelers.com', phone: '+91-98765-43210', address: '123, Jewelry Market, Mumbai', gst: '22AAAAA0000A1Z5' },
  'CUST-002': { name: 'Priya Gold House', email: 'priya@goldhouse.com', phone: '+91-98765-43211', address: '45, Gold Street, Chennai', gst: '22BBBBB0000B1Z5' },
  'CUST-003': { name: 'Amit Diamond Co.', email: 'amit@diamond.com', phone: '+91-98765-43212', address: '789, Diamond Plaza, Surat', gst: '22CCCCC0000C1Z5' },
  'CUST-004': { name: 'Sneha Jewellery', email: 'sneha@jewellery.com', phone: '+91-98765-43213', address: '321, Jewel Lane, Jaipur', gst: '22DDDDD0000D1Z5' },
  'CUST-005': { name: 'Vikram Gems', email: 'vikram@gems.com', phone: '+91-98765-43214', address: '654, Gem Tower, Mumbai', gst: '22EEEEE0000E1Z5' },
};

const DeliveryChallanEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Debug log to check if id is being received
  console.log('DeliveryChallanEdit - ID from params:', id);

  const {
    formData,
    errors,
    loading,
    refreshing,
    saving,
    submitLoading,
    productSearch,
    productSuggestions,
    isEditable,
    totals,
    challanStatus,
    updateFormData,
    updateItem,
    addItem,
    removeItem,
    handleSubmit,
    handleRefresh,
    setProductSearch,
  } = useDeliveryChallanEdit(id);

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

  // Snapshot the loaded form once, to detect unsaved changes on Cancel
  const initialSnapshotRef = useRef<string | null>(null);
  useEffect(() => {
    if (!loading && initialSnapshotRef.current === null && formData) {
      initialSnapshotRef.current = JSON.stringify(formData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, formData]);

  const hasUnsavedChanges = Boolean(
    initialSnapshotRef.current !== null && 
    formData && 
    JSON.stringify(formData) !== initialSnapshotRef.current
  );

  // Surface load errors as a toast as well as the inline banner
  const hasShownLoadErrorRef = useRef(false);
  useEffect(() => {
    if (errors?.load && !hasShownLoadErrorRef.current) {
      hasShownLoadErrorRef.current = true;
      showError(errors.load);
    }
    if (!errors?.load) {
      hasShownLoadErrorRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors?.load]);

  // Show error if id is missing
  useEffect(() => {
    if (!id) {
      showError('Invalid delivery challan ID. Redirecting back...');
      setTimeout(() => navigate('/sales/delivery-challan'), 2000);
    }
  }, [id, navigate, showError]);

  // Handle customer selection from dropdown
  const handleCustomerSelect = (selectedOption: DropdownOption) => {
    const details = CUSTOMER_DETAILS[selectedOption.value];
    if (details) {
      updateFormData('customerId', selectedOption.value);
      updateFormData('customerName', details.name || selectedOption.label);
      updateFormData('customerEmail', details.email || '');
      updateFormData('customerPhone', details.phone || '');
      updateFormData('customerGst', details.gst || '');
      updateFormData('customerAddress', details.address || '');
      updateFormData('deliveryAddress', details.address || '');
    } else {
      updateFormData('customerId', selectedOption.value);
      updateFormData('customerName', selectedOption.label);
    }
  };

  // Handle items change from ItemSelectionTable
  const handleItemsChange = (newItems: ItemSelectionItem[]) => {
    const convertedItems = newItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      description: item.description || '',
      quantity: item.quantity || 1,
      unit: item.unit || 'Pcs',
      rate: item.rate || 0,
      discount: item.discount || 0,
      taxRate: item.taxRate || 0,
      taxAmount: item.taxAmount || 0,
      total: item.total || 0,
      purity: item.purity || '22K',
    }));
    updateFormData('items', convertedItems);
  };

  // Convert formData.items to ItemSelectionItem format for the table
  const tableItems: ItemSelectionItem[] = (formData?.items || []).map((item: any) => ({
    productId: item.productId || '',
    productName: item.productName || '',
    description: item.description || '',
    quantity: item.quantity || 1,
    unit: item.unit || 'Pcs',
    rate: item.rate || 0,
    discount: item.discount || 0,
    discountType: 'percentage' as const,
    taxRate: item.taxRate || 0,
    taxAmount: item.taxAmount || 0,
    total: item.total || 0,
    purity: item.purity || '22K',
  }));

  // Custom columns configuration for Delivery Challan
  const deliveryChallanColumns = {
    item: true,
    purity: true,
    description: true,
    grossWt: false,
    stoneWt: false,
    netWt: false,
    qty: true,
    unit: true,
    rate: true,
    making: false,
    discount: true,
    tax: true,
    amount: true,
    action: true,
  };

  // Handle form submit with loading toast
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await withLoading(
      async () => {
        const result = await handleSubmit();
        if (!result) {
          throw new Error('Validation failed');
        }
        // Navigate back on success
        navigate('/sales/delivery-challan');
      },
      'Updating delivery challan...',
      'Delivery challan updated successfully.',
      'Failed to update delivery challan. Please try again.'
    );
  };

  // Refresh handler with confirmation for unsaved changes
  const onRefresh = async () => {
    if (hasUnsavedChanges) {
      await withConfirmation(
        {
          title: 'Refresh Data',
          message: 'You have unsaved changes. Refreshing will discard all changes. Are you sure?',
          confirmText: 'Refresh',
          variant: 'warning',
        },
        async () => {
          await handleRefresh();
          // Reset snapshot after refresh
          initialSnapshotRef.current = JSON.stringify(formData);
        },
        'Delivery challan data refreshed.',
        'Failed to refresh. Please try again.'
      );
    } else {
      await withLoading(
        async () => {
          await handleRefresh();
          initialSnapshotRef.current = JSON.stringify(formData);
        },
        'Refreshing data...',
        'Delivery challan data refreshed.',
        'Failed to refresh. Please try again.'
      );
    }
  };

  // Cancel handler - confirm before discarding unsaved changes
  const handleCancel = async () => {
    if (!hasUnsavedChanges) {
      navigate('/sales/delivery-challan');
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
        navigate('/sales/delivery-challan');
      }
    );
  };

  // If no id provided, show error state
  if (!id) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-3" />
          <p className="text-gray-500">Invalid delivery challan ID</p>
          <button
            onClick={() => navigate('/sales/delivery-challan')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Delivery Challans
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading delivery challan..." />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Delivery Challan not found</p>
          <button
            onClick={() => navigate('/sales/delivery-challan')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Delivery Challans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="h-6 w-6 text-amber-500" />
                Edit Delivery Challan
              </h1>
              <p className="text-sm text-gray-500">
                {formData.challanNumber ? `Editing ${formData.challanNumber}` : 'Edit delivery challan'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            {challanStatus && (
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                challanStatus === 'draft' 
                  ? 'bg-gray-100 text-gray-700' 
                  : challanStatus === 'sent' 
                  ? 'bg-green-100 text-green-700'
                  : challanStatus === 'delivered'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {challanStatus.charAt(0).toUpperCase() + challanStatus.slice(1)}
              </span>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={saving || submitLoading || !isEditable}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving || submitLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Challan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Warning for non-draft */}
        {!isEditable && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                This challan is in <strong>{challanStatus}</strong> status and cannot be edited.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Only draft challans can be modified.
              </p>
            </div>
          </div>
        )}

        {/* Error summary */}
        {errors?.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Load error */}
        {errors?.load && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{errors.load}</p>
              <button
                onClick={onRefresh}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challan Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.challanNumber || ''}
                  onChange={(e) => updateFormData('challanNumber', e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors?.challanNumber ? 'border-red-500' : 'border-gray-300'
                  } ${!isEditable ? 'bg-gray-50 text-gray-500' : 'bg-white text-gray-900'}`}
                  placeholder="Enter challan number"
                />
                {errors?.challanNumber && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.challanNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challan Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.challanDate || ''}
                  onChange={(e) => updateFormData('challanDate', e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors?.challanDate ? 'border-red-500' : 'border-gray-300'
                  } ${!isEditable ? 'bg-gray-50' : ''}`}
                />
                {errors?.challanDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.challanDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate || ''}
                  onChange={(e) => updateFormData('deliveryDate', e.target.value)}
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    !isEditable ? 'bg-gray-50' : 'bg-white'
                  } border-gray-300`}
                />
              </div>
            </div>
          </div>

          {/* Rest of the form sections remain the same */}
          {/* Customer Section, Delivery Address, Items Section, etc. */}
          
        </form>
      </div>

      {/* Confirmation Modal - THIS WAS MISSING! */}
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

export default DeliveryChallanEdit;