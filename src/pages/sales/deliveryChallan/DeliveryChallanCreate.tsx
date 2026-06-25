// src/pages/sales/deliveryChallan/DeliveryChallanCreate.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
} from 'lucide-react';
import { useDeliveryChallan } from '../../../hooks/DeliveryChallan/useDeliveryChallan';
import { useDeliveryChallanCreate } from '../../../hooks/DeliveryChallan/useDeliveryChallanCreate';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';

const DeliveryChallanCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createChallan } = useDeliveryChallan();
  const {
    formData,
    customerSearch,
    setCustomerSearch,
    customerSuggestions,
    showCustomerDropdown,
    setShowCustomerDropdown,
    selectedCustomer,
    productSearch,
    setProductSearch,
    productSuggestions,
    errors,
    saving,
    totals,
    selectCustomer,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    updateFormData,
  } = useDeliveryChallanCreate();

  const [savingForm, setSavingForm] = useState(false);
  const customerInputRef = useRef<HTMLInputElement>(null);

  // Close customer dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handleSubmit();
      if (data) {
        setSavingForm(true);
        await createChallan(data);
        navigate('/sales/delivery-challan');
      }
    } catch (error) {
      console.error('Error saving delivery challan:', error);
    } finally {
      setSavingForm(false);
    }
  };

  // Handle items change from the reusable component
  const handleItemsChange = (items: ItemSelectionItem[]) => {
    updateFormData('items', items);
  };

  // Handle custom item add
  const handleAddCustomItem = () => {
    addItem();
  };

  // Custom columns configuration for Delivery Challan
  const deliveryChallanColumns = {
    item: true,
    purity: true,
    description: false,
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales/delivery-challan')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="h-6 w-6 text-amber-500" />
                Create Delivery Challan
              </h1>
              <p className="text-sm text-gray-500">Create a new delivery challan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sales/delivery-challan')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFormSubmit}
              disabled={savingForm}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save Challan
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
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
                  value={formData.challanNumber}
                  onChange={(e) => updateFormData('challanNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-900"
                  placeholder="Enter challan number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challan Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.challanDate}
                  onChange={(e) => updateFormData('challanDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.challanDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.challanDate && (
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
                  value={formData.deliveryDate}
                  onChange={(e) => updateFormData('deliveryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Customer Details
            </h2>
            <div className="relative" ref={customerInputRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Customer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Type customer name, email or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.customerId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {showCustomerDropdown && customerSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {customerSuggestions.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => selectCustomer(customer)}
                      className="w-full px-4 py-2 text-left hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.email} | {customer.phone}</p>
                    </button>
                  ))}
                </div>
              )}
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.customerId}
                </p>
              )}
            </div>

            {selectedCustomer && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" /> {selectedCustomer.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4" /> {selectedCustomer.phone}
                  </p>
                </div>
                <div>
                  {selectedCustomer.gst && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <FileText className="h-4 w-4" /> GST: {selectedCustomer.gst}
                    </p>
                  )}
                  {selectedCustomer.address && (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Building2 className="h-4 w-4" /> {selectedCustomer.address}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              Delivery Address
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.deliveryAddress}
                onChange={(e) => updateFormData('deliveryAddress', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter delivery address..."
              />
              {errors.deliveryAddress && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.deliveryAddress}
                </p>
              )}
            </div>
          </div>

          {/* Items Section - Using Reusable Component with custom columns */}
          <ItemSelectionTable
            items={formData.items}
            onItemsChange={handleItemsChange}
            productSuggestions={productSuggestions}
            productSearch={productSearch}
            onProductSearchChange={setProductSearch}
            onAddCustomItem={handleAddCustomItem}
            errors={errors}
            columns={deliveryChallanColumns}
            showPurity={true}
            showDiscount={true}
            showTax={true}
            showUnit={true}
            showSubtotalSection={true}
            showTotalSection={true}
            searchPlaceholder="Search jewelry items..."
            addButtonLabel="Add Item"
            title="Jewelry Items"
            additionalCharges={[]}
            autoAddDefaultRow={true}
            addButtonAtBottom={true}
          />

          {/* Transport Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TruckIcon className="h-5 w-5 text-amber-500" />
              Transport Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transporter Name</label>
                <input
                  type="text"
                  value={formData.transporterName}
                  onChange={(e) => updateFormData('transporterName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter transporter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicleNumber}
                  onChange={(e) => updateFormData('vehicleNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter vehicle number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LR Number</label>
                <input
                  type="text"
                  value={formData.lrNumber}
                  onChange={(e) => updateFormData('lrNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter LR number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LR Date</label>
                <input
                  type="date"
                  value={formData.lrDate}
                  onChange={(e) => updateFormData('lrDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter any notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea
                  value={formData.termsAndConditions}
                  onChange={(e) => updateFormData('termsAndConditions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter terms and conditions..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryChallanCreate;