// src/pages/Sales/QuoteCreate.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  Search,
  X,
  Hash,
  Gem,
  ChevronDown,
  Upload,
  Paperclip,
  Calendar,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { useQuoteCreate } from '../../../hooks/Quote/Quote/useQuoteCreate';

// Purity options for gold/jewelry
const PURITY_OPTIONS = [
  { value: '24K', label: '24K (99.9%)' },
  { value: '22K', label: '22K (91.6%)' },
  { value: '18K', label: '18K (75%)' },
  { value: '14K', label: '14K (58.5%)' },
  { value: '10K', label: '10K (41.7%)' },
];

const CATEGORY_OPTIONS = [
  'Chain', 'Bracelet', 'Ring', 'Earring', 'Necklace', 'Pendant', 'Bangle', 'Brooch', 'Others'
];

// Tax options
const TAX_OPTIONS = [
  { value: 'gst_0', label: 'GST 0%' },
  { value: 'gst_5', label: 'GST 5%' },
  { value: 'gst_12', label: 'GST 12%' },
  { value: 'gst_18', label: 'GST 18%' },
  { value: 'gst_28', label: 'GST 28%' },
];

export const QuoteCreate: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    customerSearch,
    setCustomerSearch,
    customerSuggestions,
    showCustomerDropdown,
    setShowCustomerDropdown,
    selectedCustomer,
    itemSearch,
    setItemSearch,
    itemSuggestions,
    showItemDropdown,
    setShowItemDropdown,
    errors,
    saving,
    selectedTax,
    setSelectedTax,
    files,
    totals,
    selectCustomer,
    addItem,
    removeItem,
    updateItem,
    handleSubmit,
    handleFileUpload,
    removeFile,
    updateFormData,
  } = useQuoteCreate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header - Removed Diamond Icon */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales/quotes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Create Quote</h1>
              <p className="text-sm text-gray-500">Create a new jewelry quote for your customer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/sales/quotes')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(navigate)}
              disabled={saving}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Quote
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error summary */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(navigate); }}>
          {/* Customer & Quote Details - Row 1 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div 
                    className={`flex items-center border rounded-lg px-3 py-2.5 cursor-pointer hover:border-amber-400 transition-colors ${
                      errors.customerId ? 'border-red-400' : 'border-gray-300'
                    } ${showCustomerDropdown ? 'border-amber-400' : ''}`}
                    onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                  >
                    <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="Select or add a customer"
                      className="flex-1 outline-none text-sm bg-transparent min-w-[120px] text-gray-900 placeholder:text-gray-400"
                      onFocus={() => customerSearch.length > 1 && setShowCustomerDropdown(true)}
                    />
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${showCustomerDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {showCustomerDropdown && customerSuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {customerSuggestions.map(customer => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => selectCustomer(customer)}
                          className="w-full px-4 py-3 text-left hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                              <p className="text-xs text-gray-500">{customer.email}</p>
                            </div>
                            <span className="text-xs text-gray-400">{customer.phone}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.customerId && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerId}</p>
                )}
                {selectedCustomer && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedCustomer.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedCustomer.phone}</span>
                  </div>
                )}
              </div>

              {/* Quote# */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quote# <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-gray-50">
                  <Hash className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value="QT-000004"
                    className="flex-1 outline-none text-sm bg-transparent text-gray-600 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                </div>
              </div>

              {/* Reference# */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reference#
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all">
                  <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Reference number"
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Quote Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quote Date <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all ${
                  errors.date ? 'border-red-400' : 'border-gray-300'
                }`}>
                  <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 - Expiry Date & Subject */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expiry Date
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all">
                  <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => updateFormData('validUntil', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all">
                  <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Let your customer know what this Quote is for"
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
            {/* Item Table Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">Item Table</h3>
              </div>
            </div>

            {errors.items && (
              <div className="p-3 bg-red-50 border-b border-red-200">
                <p className="text-sm text-red-600">{errors.items}</p>
              </div>
            )}

            {/* Table Header */}
            <div className="grid grid-cols-10 gap-2 px-5 py-2.5 bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div className="col-span-4 text-left">ITEM DETAILS</div>
              <div className="col-span-1 text-center">QUANTITY</div>
              <div className="col-span-1 text-center">RATE</div>
              <div className="col-span-1 text-center">DISCOUNT</div>
              <div className="col-span-2 text-center">AMOUNT</div>
              <div className="col-span-1 text-center">ACTION</div>
            </div>

            {/* Items */}
            {formData.items.length === 0 ? (
              <div className="px-5 py-3 border-b border-gray-100">
                <div className="relative">
                  <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-amber-400 transition-all">
                    <Gem className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Type or click to select an item."
                      className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400"
                      onFocus={() => itemSearch.length > 1 && setShowItemDropdown(true)}
                    />
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                  {showItemDropdown && itemSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {itemSuggestions.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addItem(item)}
                          className="w-full px-4 py-2.5 text-left hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.code} | {item.category}</p>
                            </div>
                            <span className="text-xs font-medium text-amber-600">{item.purity}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {formData.items.map((item, index) => {
                  const itemTotal = item.quantity * item.unitPrice;
                  const discountAmount = itemTotal * (item.discount / 100);
                  const amount = itemTotal - discountAmount;
                  
                  return (
                    <div key={index} className="grid grid-cols-10 gap-2 px-5 py-2 items-center hover:bg-gray-50 transition-colors">
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Gem className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                              placeholder="Item name"
                              className="w-full px-2 py-1 border-0 border-b border-gray-200 focus:border-amber-400 focus:ring-0 text-sm outline-none bg-transparent font-medium text-gray-900"
                            />
                            <div className="flex items-center gap-2 mt-0.5">
                              <select
                                value={item.purity}
                                onChange={(e) => updateItem(index, 'purity', e.target.value)}
                                className="text-xs border-0 text-amber-600 font-medium bg-transparent focus:ring-0 outline-none"
                              >
                                {PURITY_OPTIONS.map(p => (
                                  <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                              </select>
                              <span className="text-gray-300">|</span>
                              <select
                                value={item.category}
                                onChange={(e) => updateItem(index, 'category', e.target.value)}
                                className="text-xs border-0 text-gray-500 bg-transparent focus:ring-0 outline-none"
                              >
                                {CATEGORY_OPTIONS.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className={`w-full text-center px-2 py-1 border-0 border-b border-gray-200 focus:border-amber-400 focus:ring-0 text-sm outline-none bg-transparent text-gray-900 ${
                            errors[`item_${index}_quantity`] ? 'border-red-400' : ''
                          }`}
                          min="1"
                          step="1"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className={`w-full text-center px-2 py-1 border-0 border-b border-gray-200 focus:border-amber-400 focus:ring-0 text-sm outline-none bg-transparent text-gray-900 ${
                            errors[`item_${index}_unitPrice`] ? 'border-red-400' : ''
                          }`}
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-1 justify-center">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-full text-center px-2 py-1 border-0 border-b border-gray-200 focus:border-amber-400 focus:ring-0 text-sm outline-none bg-transparent text-gray-900"
                            step="0.01"
                            min="0"
                            max="100"
                          />
                          <span className="text-xs text-gray-400 font-medium">%</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-semibold text-gray-900">
                        ₹{amount.toFixed(2)}
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center px-5 py-3 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => addItem()}
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1.5 px-3 py-1.5 hover:bg-amber-50 rounded-lg transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Row</span>
              </button>
            </div>
          </div>

          {/* Sub Total, Taxes & Customer Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Sub Total & Taxes */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Sub Total</span>
                    <span className="font-semibold text-gray-900">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Select a Tax</span>
                    <select 
                      value={selectedTax}
                      onChange={(e) => setSelectedTax(e.target.value)}
                      className="text-sm border-0 bg-transparent focus:ring-0 outline-none text-gray-600 font-medium"
                    >
                      <option value="">Select a Tax</option>
                      {TAX_OPTIONS.map(tax => (
                        <option key={tax.value} value={tax.value}>{tax.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-gray-600">Adjustment</span>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => updateFormData('discount', parseFloat(e.target.value) || 0)}
                      className="w-32 text-right px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-amber-400 transition-all text-gray-900"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end">
                  <div className="text-sm text-gray-500 mb-1">Total (₹)</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{totals.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Customer Notes</span>
              </div>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all resize-none text-gray-900"
                placeholder="Looking forward for your business."
              />
            </div>
          </div>

          {/* Terms & Conditions and Attach Files */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Terms & Conditions */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Terms & Conditions</span>
              </div>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => updateFormData('termsAndConditions', e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all resize-none text-gray-900"
                placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
              />
            </div>

            {/* Attach Files - Compact */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Paperclip className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Attach Files</span>
              </div>
              
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all">
                  <Upload className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Upload File</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
                <span className="text-xs text-gray-400">Max 5 files, 10MB each</span>
              </div>

              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700 truncate max-w-[150px]">{file.name}</span>
                        <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};