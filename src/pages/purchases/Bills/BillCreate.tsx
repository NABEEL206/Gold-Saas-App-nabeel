// src/pages/purchases/Bills/BillCreate.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useBills } from '../../../hooks/Bill/useBills';
import { useBillCreate } from '../../../hooks/Bill/useBillCreate';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import { BILL_STATUSES, BILL_STATUS_LABELS } from '../../../types/Bill/BillTypes';

const BillCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createBill } = useBills();
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleItemsChange,
    handleSubmit
  } = useBillCreate();

  const onSubmit = async () => {
    const success = await handleSubmit(createBill);
    if (success) {
      navigate('/purchases/bills');
    }
  };

  // Product suggestions for ItemSelectionTable
  const productSuggestions = [
    { id: '1', name: 'Laptop', code: 'LAP-001', price: 45000, unit: 'Pcs' },
    { id: '2', name: 'Monitor', code: 'MON-001', price: 15000, unit: 'Pcs' },
    { id: '3', name: 'Office Chairs', code: 'CHA-001', price: 8500, unit: 'Pcs' },
    { id: '4', name: 'Stationery Supplies', code: 'STA-001', price: 500, unit: 'Set' },
    { id: '5', name: 'Shipping Boxes', code: 'SHIP-001', price: 150, unit: 'Pcs' },
    { id: '6', name: 'Machine Parts', code: 'MAC-001', price: 2000, unit: 'Pcs' },
  ];

  // Additional charges
  const additionalCharges = [
    { label: 'Shipping', value: formData.shippingCharges || 0 },
    { label: 'Handling', value: formData.handlingCharges || 0 },
    { label: 'Other', value: formData.otherCharges || 0 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/purchases/bills')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Bill</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create a new vendor bill</p>
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Bill'}
        </button>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bill Information</h3>
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
              Bill Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.billDate}
              onChange={(e) => handleChange('billDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.billDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.billDate && <p className="mt-1 text-sm text-red-500">{errors.billDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate || ''}
              onChange={(e) => handleChange('dueDate', e.target.value)}
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
              {BILL_STATUSES.map(status => (
                <option key={status} value={status}>
                  {BILL_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Order Number
            </label>
            <input
              type="text"
              value={formData.purchaseOrderNumber || ''}
              onChange={(e) => handleChange('purchaseOrderNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter PO number"
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
            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-4">Bill Items</h3>
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

          {/* Payment Information */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-4">Payment Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.paidAmount || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                handleChange('paidAmount', val);
                const balanceDue = formData.totalAmount - val;
                handleChange('balanceDue', balanceDue);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handleChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cheque">Cheque</option>
              <option value="auto_debit">Auto Debit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={formData.paymentDate || ''}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Terms
            </label>
            <input
              type="text"
              value={formData.paymentTerms || ''}
              onChange={(e) => handleChange('paymentTerms', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="e.g., Net 30 days"
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
        </div>
      </div>
    </div>
  );
};

export default BillCreate;