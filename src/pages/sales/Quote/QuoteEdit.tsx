// src/pages/Sales/QuoteEdit.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Plus,
  Trash2,
  Calculator,
  Percent,
  IndianRupee,
  FileText,
  AlertCircle,
  Search,
  X,
  Building2,
  Hash,
  Scale,
  Gem,
  Sparkles,
} from 'lucide-react';
import { useQuotes } from '../../../hooks/Quote/Quote/useQuotes';
import type { QuoteFormData, QuoteItemFormData, CustomerSuggestion, ItemSuggestion } from '../../../types/Quote/QuoteTypes';

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

export const QuoteEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuote, updateQuote, getCustomers, getItems, loading } = useQuotes();

  const [formData, setFormData] = useState<QuoteFormData | null>(null);
  const [originalQuote, setOriginalQuote] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSuggestion | null>(null);

  const [itemSearch, setItemSearch] = useState('');
  const [itemSuggestions, setItemSuggestions] = useState<ItemSuggestion[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load quote data
  useEffect(() => {
    if (id) {
      const quote = getQuote(id);
      if (quote) {
        setOriginalQuote(quote);
        setFormData({
          customerId: quote.customerId,
          date: quote.date,
          validUntil: quote.validUntil,
          items: quote.items.map((item: any) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            category: item.category,
            purity: item.purity,
            weight: item.weight,
            makingCharges: item.makingCharges,
            wastagePercentage: item.wastagePercentage,
            stoneCharges: item.stoneCharges,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discount: item.discount,
            description: item.description || '',
          })),
          discount: quote.discount || 0,
          discountType: quote.discountType || 'fixed',
          shippingCharge: quote.shippingCharge || 0,
          otherCharges: quote.otherCharges || 0,
          notes: quote.notes || '',
          termsAndConditions: quote.termsAndConditions || '',
        });
        setCustomerSearch(quote.customerName);
        setSelectedCustomer({
          id: quote.customerId,
          name: quote.customerName,
          email: quote.customerEmail,
          phone: quote.customerPhone,
          gst: quote.customerGst || '',
          address: quote.customerAddress || '',
        });
      } else {
        setError('Quote not found');
      }
    }
  }, [id, getQuote]);

  // Search customers
  useEffect(() => {
    if (customerSearch.length > 1 && !selectedCustomer) {
      getCustomers(customerSearch).then(setCustomerSuggestions);
      setShowCustomerDropdown(true);
    } else {
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
    }
  }, [customerSearch, getCustomers, selectedCustomer]);

  // Search items
  useEffect(() => {
    if (itemSearch.length > 1) {
      getItems(itemSearch).then(setItemSuggestions);
      setShowItemDropdown(true);
    } else {
      setItemSuggestions([]);
      setShowItemDropdown(false);
    }
  }, [itemSearch, getItems]);

  const selectCustomer = (customer: CustomerSuggestion) => {
    setSelectedCustomer(customer);
    setFormData(prev => prev ? { ...prev, customerId: customer.id } : null);
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
  };

  const addItem = (item: ItemSuggestion) => {
    if (!formData) return;
    const newItem: QuoteItemFormData = {
      itemId: item.id,
      itemName: item.name,
      category: item.category || 'Others',
      purity: item.purity || '22K',
      weight: 0,
      makingCharges: 0,
      wastagePercentage: 0,
      stoneCharges: 0,
      quantity: 1,
      unitPrice: item.price || 0,
      taxRate: 3,
      discount: 0,
      description: '',
    };
    setFormData(prev => ({
      ...prev!,
      items: [...prev!.items, newItem]
    }));
    setItemSearch('');
    setShowItemDropdown(false);
  };

  const removeItem = (index: number) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      items: prev!.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof QuoteItemFormData, value: any) => {
    if (!formData) return;
    setFormData(prev => ({
      ...prev!,
      items: prev!.items.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  const calculateTotals = () => {
    if (!formData) return { subtotal: 0, totalTax: 0, discountAmount: 0, total: 0 };
    
    let subtotal = 0;
    let totalTax = 0;
    
    formData.items.forEach(item => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      totalTax += itemTotal * (item.taxRate / 100);
    });

    const discountAmount = formData.discountType === 'percentage' 
      ? (subtotal * formData.discount / 100)
      : formData.discount;

    const total = subtotal + totalTax + formData.shippingCharge + formData.otherCharges - discountAmount;
    
    return { subtotal, totalTax, discountAmount, total };
  };

  const totals = calculateTotals();

  const validateForm = (): boolean => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    
    formData.items.forEach((item, index) => {
      if (item.weight <= 0) newErrors[`item_${index}_weight`] = 'Weight is required';
      if (item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity is required';
      if (item.unitPrice <= 0) newErrors[`item_${index}_unitPrice`] = 'Price is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !validateForm()) return;
    
    setSaving(true);
    try {
      await updateQuote(id!, formData);
      navigate('/sales/quotes');
    } catch (error) {
      setErrors({ submit: 'Failed to update quote. Please try again.' });
    } finally {
      setSaving(false);
    }
  };


  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Quote Not Found</h3>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => navigate('/sales/quotes')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sales/quotes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Gem className="h-6 w-6 text-amber-500" />
                Edit Quote
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {originalQuote?.quoteNo} - Update quote details
              </p>
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
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Quote
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer & Quote Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onFocus={() => customerSearch.length > 1 && setShowCustomerDropdown(true)}
                    className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.customerId ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Search customer..."
                  />
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerSearch('');
                        setFormData(prev => prev ? { ...prev, customerId: '' } : null);
                      }}
                      className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
                {showCustomerDropdown && customerSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {customerSuggestions.map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full px-4 py-2 text-left hover:bg-amber-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email} | {customer.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
                {errors.customerId && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerId}</p>
                )}
                {selectedCustomer && (
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">{selectedCustomer.name}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {selectedCustomer.email}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {selectedCustomer.phone}
                      </span>
                      {selectedCustomer.gst && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> GST: {selectedCustomer.gst}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData?.date || ''}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, date: e.target.value } : null)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                )}
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={formData?.validUntil || ''}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, validUntil: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-500" />
                Items
              </h2>
              <div className="relative">
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-64 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Search items..."
                />
                {showItemDropdown && itemSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {itemSuggestions.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addItem(item)}
                        className="w-full px-4 py-2 text-left hover:bg-amber-50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.code} | {item.category} | {item.purity}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {errors.items && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.items}</p>
              </div>
            )}

            {formData && formData.items.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No items added yet</p>
                <p className="text-sm text-gray-400">Search and add jewelry items</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purity</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Weight (g)</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Making</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Wastage</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formData && formData.items.map((item, index) => {
                      const itemTotal = item.quantity * item.unitPrice;
                      const makingTotal = item.makingCharges * item.quantity;
                      const wastageTotal = (itemTotal * item.wastagePercentage / 100);
                      const total = itemTotal + makingTotal + wastageTotal + (item.stoneCharges * item.quantity);
                      
                      return (
                        <tr key={index}>
                          <td className="px-3 py-2">
                            <div>
                              <p className="font-medium text-gray-900">{item.itemName}</p>
                              <p className="text-xs text-gray-500">{item.category}</p>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={item.purity}
                              onChange={(e) => updateItem(index, 'purity', e.target.value)}
                              className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                              {PURITY_OPTIONS.map(p => (
                                <option key={p.value} value={p.value}>{p.value}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.weight}
                              onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                              className={`w-20 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                errors[`item_${index}_weight`] ? 'border-red-500' : 'border-gray-200'
                              }`}
                              step="0.01"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className={`w-16 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-200'
                              }`}
                              min="1"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className={`w-24 px-2 py-1 border rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                errors[`item_${index}_unitPrice`] ? 'border-red-500' : 'border-gray-200'
                              }`}
                              step="0.01"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.makingCharges}
                              onChange={(e) => updateItem(index, 'makingCharges', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                              step="0.01"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={item.wastagePercentage}
                              onChange={(e) => updateItem(index, 'wastagePercentage', parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                              step="0.01"
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            ₹{total.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Charges & Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notes & Terms */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData?.notes || ''}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  placeholder="Add any notes about this quote..."
                />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Terms & Conditions
                </label>
                <textarea
                  value={formData?.termsAndConditions || ''}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, termsAndConditions: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={2}
                  placeholder="Add terms and conditions..."
                />
              </div>
            </div>

            {/* Totals Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Summary
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">₹{totals.totalTax.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2 justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={formData?.discountType ?? 'fixed'}
                      onChange={(e) => setFormData(prev => prev ? { ...prev, discountType: e.target.value as 'percentage' | 'fixed' } : null)}
                      className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="fixed">₹</option>
                      <option value="percentage">%</option>
                    </select>
                    <input
                      type="number"
                      value={formData?.discount ?? 0}
                      onChange={(e) => setFormData(prev => prev ? { ...prev, discount: parseFloat(e.target.value) || 0 } : null)}
                      className="w-20 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <input
                    type="number"
                    value={formData?.shippingCharge ?? 0}
                    onChange={(e) => setFormData(prev => prev ? { ...prev, shippingCharge: parseFloat(e.target.value) || 0 } : null)}
                    className="w-24 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                    step="0.01"
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Other Charges</span>
                  <input
                    type="number"
                    value={formData?.otherCharges ?? 0}
                    onChange={(e) => setFormData(prev => prev ? { ...prev, otherCharges: parseFloat(e.target.value) || 0 } : null)}
                    className="w-24 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-amber-500"
                    step="0.01"
                  />
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-amber-600">₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};