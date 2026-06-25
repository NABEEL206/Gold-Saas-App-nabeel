// src/pages/sales/deliveryChallan/DeliveryChallanEdit.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Save,
  Truck,
  MapPin,
  Building2,
  Mail,
  Phone,
  FileText,
  Package,
  Users,
  AlertCircle,
  Truck as TruckIcon,
  RefreshCw,
} from 'lucide-react';
import { useDeliveryChallan } from '../../../hooks/DeliveryChallan/useDeliveryChallan';
import { useDeliveryChallanCreate } from '../../../hooks/DeliveryChallan/useDeliveryChallanCreate';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const DeliveryChallanEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getChallan, updateChallan, loading: submitLoading } = useDeliveryChallan();
  const [loading, setLoading] = useState(true);
  const [challanData, setChallanData] = useState<any>(null);

  // Load existing challan data
  useEffect(() => {
    const loadChallan = async () => {
      if (id) {
        try {
          const data = await getChallan(id);
          setChallanData(data);
          setLoading(false);
        } catch (error) {
          console.error('Error loading challan:', error);
          navigate('/sales/delivery-challan');
        }
      }
    };
    loadChallan();
  }, [id, getChallan, navigate]);

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
    showProductDropdown,
    setShowProductDropdown,
    errors,
    saving,
    totals,
    selectCustomer,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    updateFormData,
  } = useDeliveryChallanCreate(challanData);

  const [savingForm, setSavingForm] = useState(false);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
      if (productInputRef.current && !productInputRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const data = await handleSubmit();
      if (data) {
        setSavingForm(true);
        await updateChallan(id, data);
        navigate('/sales/delivery-challan');
      }
    } catch (error) {
      console.error('Error updating delivery challan:', error);
    } finally {
      setSavingForm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading delivery challan..." />
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
              onClick={() => navigate('/sales/delivery-challan')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Truck className="h-6 w-6 text-amber-500" />
                Edit Delivery Challan
              </h1>
              <p className="text-sm text-gray-500">Update delivery challan #{formData.challanNumber}</p>
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
              disabled={savingForm || submitLoading}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {savingForm || submitLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Update Challan
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  disabled
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

          {/* Items Section - Same as Create Page */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              Items
            </h2>
            
            {/* Add Item */}
            <div className="relative mb-4" ref={productInputRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              {showProductDropdown && productSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {productSuggestions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addItem(product)}
                      className="w-full px-4 py-2 text-left hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.code} | {product.category} | ₹{product.price}</p>
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => addItem()}
                className="mt-2 px-4 py-2 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Custom Item
              </button>
            </div>

            {errors.items && (
              <p className="mb-4 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.items}
              </p>
            )}

            {/* Items Table */}
            {formData.items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Disc %</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tax %</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => updateItem(index, 'productName', e.target.value)}
                            className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              errors[`item_${index}_productName`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Product name"
                          />
                          {item.purity && (
                            <span className="text-xs text-amber-600">{item.purity}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                            placeholder="Description"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className={`w-20 px-2 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.unit || 'Pcs'}
                            onChange={(e) => updateItem(index, 'unit', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="Pcs">Pcs</option>
                            <option value="Kg">Kg</option>
                            <option value="Gm">Gm</option>
                            <option value="Mtr">Mtr</option>
                            <option value="Set">Set</option>
                            <option value="Pair">Pair</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                            className={`w-24 px-2 py-1 border rounded text-right focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              errors[`item_${index}_rate`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.taxRate}
                            onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ₹{item.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-right font-medium">Subtotal</td>
                      <td className="px-4 py-2 text-right font-medium">₹{totals.subtotal.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-right font-medium">Tax</td>
                      <td className="px-4 py-2 text-right font-medium">₹{totals.totalTax.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-right font-medium text-red-600">Discount</td>
                      <td className="px-4 py-2 text-right font-medium text-red-600">-₹{totals.discountAmount.toFixed(2)}</td>
                      <td></td>
                    </tr>
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={7} className="px-4 py-3 text-right font-bold text-lg">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-lg text-amber-600">₹{totals.total.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Discount & Charges */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Discount & Charges</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => updateFormData('discount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="0"
                    step="0.01"
                  />
                  <select
                    value={formData.discountType}
                    onChange={(e) => updateFormData('discountType', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Charge</label>
                <input
                  type="number"
                  value={formData.shippingCharge}
                  onChange={(e) => updateFormData('shippingCharge', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Charges</label>
                <input
                  type="number"
                  value={formData.otherCharges}
                  onChange={(e) => updateFormData('otherCharges', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

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

          {/* Payment Terms */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Terms</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Net 7">Net 7</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="COD">COD</option>
                <option value="Advance">Advance</option>
              </select>
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

export default DeliveryChallanEdit;