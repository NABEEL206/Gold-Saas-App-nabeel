// src/pages/sales/CreditNotes/CreditNoteCreate.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Receipt,
  Users,
  Calendar,
  FileText,
  IndianRupee,
  AlertCircle,
  Send,
} from 'lucide-react';
import { useCreditNote } from '../../../hooks/CreditNote/useCreditNote';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';

// Demo customers
const DEMO_CUSTOMERS = [
  { id: '1', name: 'Rajesh Jewelers', email: 'rajesh@jewelers.com', phone: '+91-98765-43210', gst: '22AAAAA0000A1Z5' },
  { id: '2', name: 'Priya Gold House', email: 'priya@goldhouse.com', phone: '+91-98765-43211', gst: '22BBBBB0000B1Z5' },
  { id: '3', name: 'Suresh Gold Mart', email: 'suresh@goldmart.com', phone: '+91-98765-43212', gst: '22CCCCC0000C1Z5' },
  { id: '4', name: 'Meera Jewel World', email: 'meera@jewelworld.com', phone: '+91-98765-43213', gst: '22DDDDD0000D1Z5' },
];

// Demo invoices
const DEMO_INVOICES = [
  { id: '1', number: 'INV-000001', amount: 29500 },
  { id: '2', number: 'INV-000002', amount: 50445 },
  { id: '3', number: 'INV-000003', amount: 37760 },
  { id: '4', number: 'INV-000004', amount: 12862 },
];

// Demo items
const DEMO_ITEMS = [
  { id: '1', name: 'Gold Ring', code: 'GR-001', purity: '22K', price: 7500, unit: 'Pcs' },
  { id: '2', name: 'Gold Chain', code: 'GC-001', purity: '22K', price: 4500, unit: 'Pcs' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', purity: '22K', price: 3200, unit: 'Pcs' },
  { id: '4', name: 'Diamond Ring', code: 'DR-001', purity: '18K', price: 8500, unit: 'Pcs' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', purity: '22K', price: 3800, unit: 'Pcs' },
];

const CreditNoteCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createCreditNote, loading } = useCreditNote();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerGst: '',
    invoiceId: '',
    invoiceNumber: '',
    creditNoteDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
    status: 'draft' as const,
  });

  const [items, setItems] = useState<ItemSelectionItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions] = useState(DEMO_ITEMS);

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const customer = DEMO_CUSTOMERS.find(c => c.id === id);
    if (customer) {
      setFormData({
        ...formData,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerGst: customer.gst || '',
      });
    }
  };

  const handleInvoiceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const invoice = DEMO_INVOICES.find(inv => inv.id === id);
    if (invoice) {
      setFormData({
        ...formData,
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
      });
    }
  };

  const handleItemsChange = (newItems: ItemSelectionItem[]) => {
    setItems(newItems);
  };

  const handleAddCustomItem = () => {
    const newItem: ItemSelectionItem = {
      productId: `custom_${Date.now()}`,
      productName: '',
      description: '',
      quantity: 1,
      unit: 'Pcs',
      rate: 0,
      discount: 0,
      discountType: 'percentage',
      taxRate: 18,
      taxAmount: 0,
      total: 0,
      purity: '22K',
    };
    setItems([...items, newItem]);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      const baseAmount = (item.quantity || 1) * (item.rate || 0);
      subtotal += baseAmount;
      
      let discountAmount = 0;
      if (item.discountType === 'fixed') {
        discountAmount = item.discount || 0;
      } else {
        discountAmount = baseAmount * ((item.discount || 0) / 100);
      }
      totalDiscount += discountAmount;
      
      const taxableAmount = baseAmount - discountAmount;
      taxAmount += taxableAmount * ((item.taxRate || 18) / 100);
    });

    const total = subtotal - totalDiscount + taxAmount;
    return { subtotal, totalDiscount, taxAmount, total };
  };

  const totals = calculateTotals();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    if (items.length === 0) newErrors.items = 'At least one item is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'sent') => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const data = {
        ...formData,
        items: items.map(item => ({
          ...item,
          total: (item.quantity || 1) * (item.rate || 0)
        })),
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discount: totals.totalDiscount,
        total: totals.total,
        status,
      };
      await createCreditNote(data);
      navigate('/sales/credit-notes');
    } catch (error) {
      console.error('Error creating credit note:', error);
    } finally {
      setSaving(false);
    }
  };

  const creditNoteColumns = {
    item: true,
    purity: true,
    description: true,
    qty: true,
    unit: true,
    rate: true,
    discount: true,
    tax: true,
    amount: true,
    action: true,
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales/credit-notes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="h-6 w-6 text-amber-500" />
                Create Credit Note
              </h1>
              <p className="text-sm text-gray-500">Create a new credit note for customer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sales/credit-notes')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit('draft')}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit('sent')}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
              Create & Send
            </button>
          </div>
        </div>

        <form className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Customer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.customerId}
                  onChange={handleCustomerSelect}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white ${
                    errors.customerId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a customer...</option>
                  {DEMO_CUSTOMERS.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.email}
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.customerId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice (Optional)
                </label>
                <select
                  value={formData.invoiceId}
                  onChange={handleInvoiceSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">Select an invoice...</option>
                  {DEMO_INVOICES.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.number} - ₹{invoice.amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credit Note Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.creditNoteDate}
                  onChange={(e) => setFormData({ ...formData, creditNoteDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white ${
                    errors.reason ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select reason...</option>
                  <option value="Product damaged during shipping">Product damaged during shipping</option>
                  <option value="Quality issue - incorrect purity">Quality issue - incorrect purity</option>
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                  <option value="Wrong item delivered">Wrong item delivered</option>
                  <option value="Price mismatch">Price mismatch</option>
                  <option value="Other">Other</option>
                </select>
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.reason}
                  </p>
                )}
              </div>
            </div>

            {formData.customerName && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <p className="font-medium text-gray-900">{formData.customerName}</p>
                <p className="text-sm text-gray-600">{formData.customerEmail} | {formData.customerPhone}</p>
                {formData.customerGst && (
                  <p className="text-sm text-gray-600">GST: {formData.customerGst}</p>
                )}
              </div>
            )}
          </div>

          {/* Items Section */}
          <ItemSelectionTable
            items={items}
            onItemsChange={handleItemsChange}
            productSuggestions={productSuggestions}
            productSearch={productSearch}
            onProductSearchChange={setProductSearch}
            onAddCustomItem={handleAddCustomItem}
            errors={errors}
            columns={creditNoteColumns}
            showPurity={true}
            showDescription={true}
            showUnit={true}
            showDiscount={true}
            showTax={true}
            showSubtotalSection={true}
            showTotalSection={true}
            searchPlaceholder="Search items..."
            addButtonLabel="Add Item"
            title="Items"
            additionalCharges={[]}
            autoAddDefaultRow={true}
            addButtonAtBottom={true}
          />

          {errors.items && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.items}
            </p>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Notes
            </h2>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter any additional notes..."
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditNoteCreate;