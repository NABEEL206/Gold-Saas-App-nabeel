// src/pages/sales/Quote/QuoteCreate.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  FileText,
  Gem,
} from 'lucide-react';
import { useQuotes } from '../../../hooks/Quote/useQuotes';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';

// Mock product suggestions for jewelry items
const MOCK_PRODUCTS = [
  { id: '1', name: 'Gold Ring', code: 'GR-001', category: 'Ring', purity: '22K', price: 7500, description: '22K Gold Ring with diamond' },
  { id: '2', name: 'Gold Chain', code: 'GC-001', category: 'Chain', purity: '22K', price: 4500, description: '22K Gold Chain with pendant' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', category: 'Earring', purity: '22K', price: 3200, description: '22K Gold Earrings with pearl' },
  { id: '4', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', purity: '18K', price: 8500, description: '18K Diamond Ring with 0.5ct diamond' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', category: 'Bracelet', purity: '22K', price: 3800, description: '22K Gold Bracelet with diamonds' },
  { id: '6', name: 'Silver Necklace', code: 'SN-001', category: 'Necklace', purity: '18K', price: 2800, description: '18K Silver Necklace with chain' },
];

// Mock customer data for dropdown - these will appear in the customer name dropdown
const MOCK_CUSTOMERS: DropdownOption[] = [
  { value: 'CUST-001', label: 'Rajesh Kumar', group: 'Regular' },
  { value: 'CUST-002', label: 'Priya Sharma', group: 'Regular' },
  { value: 'CUST-003', label: 'Amit Patel', group: 'VIP' },
  { value: 'CUST-004', label: 'Sneha Reddy', group: 'Regular' },
  { value: 'CUST-005', label: 'Vikram Singh', group: 'VIP' },
  { value: 'CUST-006', label: 'Meera Iyer', group: 'Regular' },
  { value: 'CUST-007', label: 'Arjun Nair', group: 'Corporate' },
  { value: 'CUST-008', label: 'Kavya Menon', group: 'Corporate' },
  { value: 'CUST-009', label: 'Rahul Gupta', group: 'Regular' },
  { value: 'CUST-010', label: 'Ananya Desai', group: 'VIP' },
];

const QuoteCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createQuote, loading } = useQuotes();
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState(MOCK_PRODUCTS);

  // Basic form state
  const [formData, setFormData] = useState({
    customerId: null as string | null,
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

  // Items state for ItemSelectionTable
  const [items, setItems] = useState<ItemSelectionItem[]>([]);

  // Handle customer selection from dropdown
  const handleCustomerSelect = (selectedOption: DropdownOption) => {
    // In a real app, you would fetch customer details from API
    // For demo, we'll simulate loading customer data
    const customerDetails: Record<string, any> = {
      'CUST-001': { name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '9876543210', address: '123 Main St, Mumbai', gst: 'GSTIN001' },
      'CUST-002': { name: 'Priya Sharma', email: 'priya@email.com', phone: '9876543211', address: '456 Park Ave, Delhi', gst: 'GSTIN002' },
      'CUST-003': { name: 'Amit Patel', email: 'amit@email.com', phone: '9876543212', address: '789 Lake Rd, Bangalore', gst: 'GSTIN003' },
      'CUST-004': { name: 'Sneha Reddy', email: 'sneha@email.com', phone: '9876543213', address: '321 Hill St, Hyderabad', gst: 'GSTIN004' },
      'CUST-005': { name: 'Vikram Singh', email: 'vikram@email.com', phone: '9876543214', address: '654 Forest Ln, Chennai', gst: 'GSTIN005' },
      'CUST-006': { name: 'Meera Iyer', email: 'meera@email.com', phone: '9876543215', address: '987 River Rd, Kolkata', gst: 'GSTIN006' },
      'CUST-007': { name: 'Arjun Nair', email: 'arjun@email.com', phone: '9876543216', address: '147 Beach Ave, Kochi', gst: 'GSTIN007' },
      'CUST-008': { name: 'Kavya Menon', email: 'kavya@email.com', phone: '9876543217', address: '258 Hillcrest, Pune', gst: 'GSTIN008' },
      'CUST-009': { name: 'Rahul Gupta', email: 'rahul@email.com', phone: '9876543218', address: '369 Garden St, Jaipur', gst: 'GSTIN009' },
      'CUST-010': { name: 'Ananya Desai', email: 'ananya@email.com', phone: '9876543219', address: '741 Lakeview, Ahmedabad', gst: 'GSTIN010' },
    };

    const details = customerDetails[selectedOption.value] || null;
    if (details) {
      setFormData(prev => ({
        ...prev,
        customerId: selectedOption.value,
        customerName: details.name || selectedOption.label,
        customerEmail: details.email || '',
        customerPhone: details.phone || '',
        customerAddress: details.address || '',
        customerGst: details.gst || '',
      }));
    } else {
      // If no details found, just set the name from label
      setFormData(prev => ({
        ...prev,
        customerId: selectedOption.value,
        customerName: selectedOption.label,
      }));
    }
  };

  // Handle product search
  const handleProductSearch = (search: string) => {
    setProductSearch(search);
    if (search.length > 0) {
      const filtered = MOCK_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      );
      setProductSuggestions(filtered);
    } else {
      setProductSuggestions(MOCK_PRODUCTS);
    }
  };

  // Handle items change from ItemSelectionTable
  const handleItemsChange = (newItems: ItemSelectionItem[]) => {
    setItems(newItems);
  };

  // Handle custom item add
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
      weight: 0,
      makingCharges: 0,
      wastagePercentage: 0,
      stoneCharges: 0,
    };
    setItems([...items, newItem]);
  };

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let totalDiscount = 0;

    items.forEach(item => {
      // Calculate item total with making charges, wastage, and stone charges
      const baseAmount = (item.quantity || 1) * (item.rate || 0);
      const makingCharge = (item.makingCharges || 0) * (item.quantity || 1);
      const wastageAmount = baseAmount * ((item.wastagePercentage || 0) / 100);
      const stoneCharge = (item.stoneCharges || 0) * (item.quantity || 1);
      const itemSubtotal = baseAmount + makingCharge + wastageAmount + stoneCharge;
      
      subtotal += itemSubtotal;
      
      // Calculate discount
      let discountAmount = 0;
      if (item.discountType === 'fixed') {
        discountAmount = item.discount || 0;
      } else {
        discountAmount = itemSubtotal * ((item.discount || 0) / 100);
      }
      totalDiscount += discountAmount;
      
      // Calculate tax (18% GST)
      const taxableAmount = itemSubtotal - discountAmount;
      taxAmount += taxableAmount * ((item.taxRate || 18) / 100);
    });

    const total = subtotal - totalDiscount + taxAmount;
    return { subtotal, totalDiscount, taxAmount, total };
  };

  const totals = calculateTotals();

  const handleSubmit = async (status: 'draft' | 'sent') => {
    setSaving(true);
    try {
      const quoteData = {
        ...formData,
        items: items.map(item => ({
          ...item,
          total: (item.quantity || 1) * (item.rate || 0) + 
                 (item.makingCharges || 0) * (item.quantity || 1) + 
                 ((item.quantity || 1) * (item.rate || 0) * (item.wastagePercentage || 0) / 100) +
                 (item.stoneCharges || 0) * (item.quantity || 1)
        })),
        subtotal: totals.subtotal,
        tax: totals.taxAmount,
        discount: totals.totalDiscount,
        discountType: 'percentage' as const,
        shippingCharge: 0,
        otherCharges: 0,
        roundOff: 0,
        total: totals.total,
        status,
        customerId: formData.customerId || 'CUST-' + Date.now(),
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

  // Custom columns configuration for Quote
  const quoteColumns = {
    item: true,
    purity: true,
    description: true,
    grossWt: false,
    stoneWt: false,
    netWt: false,
    qty: true,
    unit: true,
    rate: true,
    making: true,
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
            {/* Customer Name - Now using SearchableDropdown */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Customer Name *
              </label>
              <SearchableDropdown
                options={MOCK_CUSTOMERS}
                value={formData.customerId}
                onChange={handleCustomerSelect}
                placeholder="Search customer by name..."
                triggerPlaceholder="Select or search customer..."
                className="w-full max-w-full"
                showEmptyState={true}
                emptyStateText="No customers found. Type to search."
                resetSearchOnOpen={true}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Start typing to search existing customers or select from the list
              </p>
            </div>

            {/* Email */}
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

            {/* Phone */}
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
                required
              />
            </div>

            {/* GST Number */}
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

            {/* Address */}
            <div>
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

        {/* Items Section - Using ItemSelectionTable */}
        <ItemSelectionTable
          items={items}
          onItemsChange={handleItemsChange}
          productSuggestions={productSuggestions}
          productSearch={productSearch}
          onProductSearchChange={handleProductSearch}
          onAddCustomItem={handleAddCustomItem}
          showJewelryFields={true}
          showDescription={true}
          showUnit={true}
          showDiscount={true}
          showTax={true}
          showMakingCharges={true}
          showWeightFields={false}
          showPurity={true}
          columns={quoteColumns}
          showSubtotalSection={true}
          showTotalSection={true}
          searchPlaceholder="Search jewelry items..."
          addButtonLabel="Add Item"
          title="Quote Items"
          additionalCharges={[]}
          autoAddDefaultRow={true}
          addButtonAtBottom={true}
        />

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />
              Notes
            </h4>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-500" />
              Terms & Conditions
            </h4>
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