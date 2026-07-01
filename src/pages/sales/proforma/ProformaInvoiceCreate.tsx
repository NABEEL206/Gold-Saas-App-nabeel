// src/pages/sales/proforma/ProformaInvoiceCreate.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Hash,
  Calendar,
  Clock,
  Receipt,
  Pencil,
} from 'lucide-react';
import { useProformaInvoiceCreate } from '../../../hooks/Proforma/useProformaInvoiceCreate';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';

// Mock customer data for dropdown
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

// Mock product suggestions
const MOCK_PRODUCTS = [
  { id: '1', name: 'Gold Ring', code: 'GR-001', category: 'Ring', purity: '22K', price: 7500, description: '22K Gold Ring with diamond', unit: 'Pcs' },
  { id: '2', name: 'Gold Chain', code: 'GC-001', category: 'Chain', purity: '22K', price: 4500, description: '22K Gold Chain with pendant', unit: 'Pcs' },
  { id: '3', name: 'Gold Earrings', code: 'GE-001', category: 'Earring', purity: '22K', price: 3200, description: '22K Gold Earrings with pearl', unit: 'Pair' },
  { id: '4', name: 'Diamond Ring', code: 'DR-001', category: 'Ring', purity: '18K', price: 8500, description: '18K Diamond Ring with 0.5ct diamond', unit: 'Pcs' },
  { id: '5', name: 'Gold Bracelet', code: 'GB-001', category: 'Bracelet', purity: '22K', price: 3800, description: '22K Gold Bracelet with diamonds', unit: 'Pcs' },
  { id: '6', name: 'Silver Necklace', code: 'SN-001', category: 'Necklace', purity: '18K', price: 2800, description: '18K Silver Necklace with chain', unit: 'Pcs' },
];

const ProformaInvoiceCreate: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    updateFormData,
    errors,
    saving,
    files,
    totals,
    handleFileUpload,
    removeFile,
    handleSubmit,
  } = useProformaInvoiceCreate();

  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions] = useState(MOCK_PRODUCTS);
  const [items, setItems] = useState<ItemSelectionItem[]>([]);

  // Handle customer selection from dropdown
  const handleCustomerSelect = (selectedOption: DropdownOption) => {
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
      updateFormData('customerId', selectedOption.value);
      updateFormData('customerName', details.name || selectedOption.label);
      updateFormData('customerEmail', details.email || '');
      updateFormData('customerPhone', details.phone || '');
      updateFormData('customerAddress', details.address || '');
      updateFormData('customerGst', details.gst || '');
    } else {
      updateFormData('customerId', selectedOption.value);
      updateFormData('customerName', selectedOption.label);
    }
  };

  // Handle items change from ItemSelectionTable
  const handleItemsChange = (newItems: ItemSelectionItem[]) => {
    setItems(newItems);
    // Map ItemSelectionItem to ProformaInvoiceItem format
    const proformaItems = newItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.rate || 0,
      discount: item.discount || 0,
      taxRate: item.taxRate || 0,
      total: item.total || 0,
      purity: item.purity || '',
      category: item.category || '',
    }));
    updateFormData('items', proformaItems);
  };

  // Handle product search
  const handleProductSearch = (search: string) => {
    setProductSearch(search);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleSubmit(navigate);
    if (result) {
      navigate('/sales/proforma');
    }
  };

  // Custom columns configuration for Proforma Invoice
  const proformaColumns = {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales/proforma')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <Receipt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Create Proforma Invoice</h1>
                <p className="text-sm text-gray-500">Create a new proforma invoice for your customer</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/sales/proforma')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={saving}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Proforma
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

        <form onSubmit={onSubmit}>
          {/* Customer & Invoice Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Customer Name - Using SearchableDropdown */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={MOCK_CUSTOMERS}
                  value={formData.customerId}
                  onChange={handleCustomerSelect}
                  placeholder="Search customer by name..."
                  triggerPlaceholder="Select or search customer..."
                  className="w-full max-w-full"
                  showEmptyState={true}
                  emptyStateText="No customers found"
                  resetSearchOnOpen={true}
                />
                {errors.customerId && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerId}</p>
                )}
                {formData.customerName && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {formData.customerEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {formData.customerEmail}
                      </span>
                    )}
                    {formData.customerPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {formData.customerPhone}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Invoice # - Auto-generated with edit option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Proforma # <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all bg-white">
                  <Hash className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={formData.invoiceNumber || 'PI-000001'}
                    onChange={(e) => updateFormData('invoiceNumber', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900"
                  />
                  <span className="text-xs text-gray-400 flex items-center gap-1 ml-2">
                    <Pencil className="h-3 w-3" />
                    Editable
                  </span>
                </div>
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all ${
                  errors.invoiceDate ? 'border-red-400' : 'border-gray-300'
                }`}>
                  <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => updateFormData('invoiceDate', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900"
                  />
                </div>
                {errors.invoiceDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.invoiceDate}</p>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2.5 focus-within:border-amber-400 transition-all ${
                  errors.validUntil ? 'border-red-400' : 'border-gray-300'
                }`}>
                  <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => updateFormData('validUntil', e.target.value)}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900"
                  />
                </div>
                {errors.validUntil && (
                  <p className="mt-1 text-xs text-red-500">{errors.validUntil}</p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 - Payment Terms & Delivery Terms */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Terms
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-white"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Delivery Terms
                </label>
                <select
                  value={formData.deliveryTerms}
                  onChange={(e) => updateFormData('deliveryTerms', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-white"
                >
                  <option value="FOB Shipping Point">FOB Shipping Point</option>
                  <option value="FOB Destination">FOB Destination</option>
                  <option value="CIF">CIF</option>
                  <option value="DDP">DDP</option>
                  <option value="Ex-Works">Ex-Works</option>
                </select>
              </div>
            </div>
          </div>

          {/* Item Selection Table */}
          <ItemSelectionTable
            items={items}
            onItemsChange={handleItemsChange}
            productSuggestions={productSuggestions}
            productSearch={productSearch}
            onProductSearchChange={handleProductSearch}
            showJewelryFields={true}
            showDescription={true}
            showUnit={true}
            showDiscount={true}
            showTax={true}
            showMakingCharges={false}
            showWeightFields={false}
            showPurity={true}
            columns={proformaColumns}
            showSubtotalSection={true}
            showTotalSection={true}
            searchPlaceholder="Search jewelry items..."
            addButtonLabel="Add Item"
            title="Proforma Items"
            additionalCharges={[]}
            autoAddDefaultRow={true}
            addButtonAtBottom={true}
          />

          {/* Customer Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Customer Notes</span>
            </div>
            <textarea
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all resize-none text-gray-900"
              placeholder="Thank you for your business."
            />
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Terms & Conditions</span>
            </div>
            <textarea
              value={formData.termsAndConditions}
              onChange={(e) => updateFormData('termsAndConditions', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all resize-none text-gray-900"
              placeholder="Enter the terms and conditions..."
            />
          </div>
        </form>
      </div>

      {saving && <LoadingSpinner fullScreen text="Creating proforma invoice..." />}
    </div>
  );
};

export default ProformaInvoiceCreate;