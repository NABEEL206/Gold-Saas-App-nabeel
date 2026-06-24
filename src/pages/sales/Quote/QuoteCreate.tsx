// src/pages/sales/Quote/QuoteCreate.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Hash,
  IndianRupee,
  Package,
  Gem,
} from 'lucide-react';
import { useQuotes } from '../../../hooks/Quote/useQuotes';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const QuoteCreate: React.FC = () => {
  const navigate = useNavigate();
  const { loading } = useQuotes();
  const [saving, setSaving] = useState(false);

  // Basic form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerGst: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    termsAndConditions: '',
  });

  const [items, setItems] = useState([
    {
      id: '1',
      itemName: '',
      category: '',
      purity: '',
      weight: 0,
      quantity: 1,
      unitPrice: 0,
      makingCharges: 0,
      wastagePercentage: 0,
      stoneCharges: 0,
    },
  ]);

  const handleSubmit = async (status: 'draft' | 'sent') => {
    setSaving(true);
    try {
      // Calculate totals
      const calculatedItems = items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice + 
               item.makingCharges * item.quantity + 
               (item.quantity * item.unitPrice * item.wastagePercentage / 100) +
               item.stoneCharges * item.quantity
      }));

      const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.18; // 18% GST
      const total = subtotal + tax;

      const quoteData = {
        ...formData,
        items: calculatedItems,
        subtotal,
        tax,
        discount: 0,
        discountType: 'percentage' as const,
        shippingCharge: 0,
        otherCharges: 0,
        roundOff: 0,
        total,
        status,
        customerId: 'CUST-' + Date.now(),
      };

      await createQuote(quoteData);
      navigate('/sales/quotes');
    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Failed to create quote');
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: String(Date.now()),
        itemName: '',
        category: '',
        purity: '',
        weight: 0,
        quantity: 1,
        unitPrice: 0,
        makingCharges: 0,
        wastagePercentage: 0,
        stoneCharges: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
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
                Create New Quote
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Create a new jewelry quote for a customer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('sent')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
              Create & Send
            </button>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-amber-500" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="customer@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                GST Number
              </label>
              <input
                type="text"
                value={formData.customerGst}
                onChange={(e) => setFormData({ ...formData, customerGst: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="GSTIN"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Customer address"
              />
            </div>
          </div>
        </div>

        {/* Quote Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-500" />
            Quote Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Valid Until
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              Items
            </h3>
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purity</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Weight</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Making</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Wastage %</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stone</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Item name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Category"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.purity}
                        onChange={(e) => updateItem(index, 'purity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="22K"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.makingCharges}
                        onChange={(e) => updateItem(index, 'makingCharges', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.wastagePercentage}
                        onChange={(e) => updateItem(index, 'wastagePercentage', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={item.stoneCharges}
                        onChange={(e) => updateItem(index, 'stoneCharges', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes</h4>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Terms & Conditions</h4>
            <textarea
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Terms and conditions..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/sales/quotes')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('sent')}
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
              Create & Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteCreate;

function createQuote(quoteData: { items: { total: number; id: string; itemName: string; category: string; purity: string; weight: number; quantity: number; unitPrice: number; makingCharges: number; wastagePercentage: number; stoneCharges: number; }[]; subtotal: number; tax: number; discount: number; discountType: "percentage"; shippingCharge: number; otherCharges: number; roundOff: number; total: number; status: "draft" | "sent"; customerId: string; customerName: string; customerEmail: string; customerPhone: string; customerAddress: string; customerGst: string; date: string; validUntil: string; notes: string; termsAndConditions: string; }) {
  throw new Error('Function not implemented.');
}
