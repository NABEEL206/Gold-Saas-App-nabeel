// src/pages/purchases/PurchaseOrders/PurchaseOrderEdit.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2, User } from 'lucide-react';
import { usePurchaseOrder } from '../../../hooks/purchaseOrder/usePurchaseOrder';
import { usePurchaseOrderEdit } from '../../../hooks/purchaseOrder/usePurchaseOrderEdit';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { 
  PURCHASE_ORDER_STATUSES, 
  PURCHASE_ORDER_PRIORITIES,
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_PRIORITY_LABELS
} from '../../../types/purchaseOrder/PurchaseOrderType';

const PurchaseOrderEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getOrderById, updateOrder } = usePurchaseOrder();
  const [order, setOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
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
  } = usePurchaseOrderEdit(order);

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
    const loadOrder = async () => {
      if (id) {
        setLoadingOrder(true);
        setLoadError(null);
        try {
          const data = await getOrderById(id);
          if (data) {
            setOrder(data);
            setFormData({
              vendorId: data.vendorId || '',
              vendorName: data.vendorName || '',
              vendorEmail: data.vendorEmail || '',
              vendorPhone: data.vendorPhone || '',
              vendorAddress: data.vendorAddress || '',
              orderDate: data.orderDate || new Date().toISOString().split('T')[0],
              deliveryDate: data.deliveryDate || '',
              expectedDeliveryDate: data.expectedDeliveryDate || '',
              status: data.status || 'draft',
              priority: data.priority || 'medium',
              items: data.items || [],
              subtotal: data.subtotal || 0,
              discountTotal: data.discountTotal || 0,
              taxTotal: data.taxTotal || 0,
              shippingCharges: data.shippingCharges || 0,
              handlingCharges: data.handlingCharges || 0,
              otherCharges: data.otherCharges || 0,
              totalAmount: data.totalAmount || 0,
              currency: data.currency || 'INR',
              exchangeRate: data.exchangeRate || 1,
              notes: data.notes || '',
              terms: data.terms || '',
              shippingAddress: data.shippingAddress || '',
              billingAddress: data.billingAddress || '',
              paymentTerms: data.paymentTerms || '',
              attachment: data.attachment || ''
            });
          } else {
            setLoadError('Purchase order not found');
          }
        } catch (error) {
          console.error('Error loading purchase order:', error);
          setLoadError('Error loading purchase order data');
        } finally {
          setLoadingOrder(false);
        }
      }
    };
    loadOrder();
  }, [id, getOrderById, setFormData]);

  const onSubmit = async () => {
    const success = await handleSubmit(updateOrder);
    if (success) {
      navigate('/purchases/orders');
    }
  };

  // Additional charges
  const additionalCharges = [
    { label: 'Shipping', value: formData.shippingCharges || 0 },
    { label: 'Handling', value: formData.handlingCharges || 0 },
    { label: 'Other', value: formData.otherCharges || 0 },
  ];

  if (loadingOrder) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading purchase order details..." />
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          {loadError || 'Purchase order not found'}
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
            onClick={() => navigate('/purchases/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Purchase Order</h1>
            <p className="text-sm text-gray-500 mt-0.5">{order.poNumber}</p>
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
          {/* ... (reuse the same form layout as Create page) */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
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
              Order Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.orderDate}
              onChange={(e) => handleChange('orderDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.orderDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.orderDate && <p className="mt-1 text-sm text-red-500">{errors.orderDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Delivery Date
            </label>
            <input
              type="date"
              value={formData.expectedDeliveryDate || ''}
              onChange={(e) => handleChange('expectedDeliveryDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
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
              {PURCHASE_ORDER_STATUSES.map(status => (
                <option key={status} value={status}>
                  {PURCHASE_ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {PURCHASE_ORDER_PRIORITIES.map(priority => (
                <option key={priority} value={priority}>
                  {PURCHASE_ORDER_PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Address
            </label>
            <textarea
              value={formData.vendorAddress || ''}
              onChange={(e) => handleChange('vendorAddress', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter vendor address"
            />
          </div>

          {/* Items Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-4">Order Items</h3>
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
              additionalCharges={additionalCharges}
              headerDiscount={0}
              showTotalSection={true}
              autoAddDefaultRow={true}
              addButtonAtBottom={true}
              className="border-0 p-0"
            />
          </div>

          {/* Notes & Terms */}
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms || ''}
              onChange={(e) => handleChange('terms', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter terms and conditions"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Terms
            </label>
            <input
              type="text"
              value={formData.paymentTerms || ''}
              onChange={(e) => handleChange('paymentTerms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter payment terms (e.g., Net 30 days)"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderEdit;