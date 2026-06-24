import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  User,
  Mail,
  Phone,
  Hash,
  Calendar,
  Clock,
  ShoppingBag,
  Gem,
  FileText,
  Paperclip,
  Upload,
  X,
  ChevronDown,
  AlertCircle,
  Pencil,
  Receipt,
} from 'lucide-react';
import { useProformaInvoice } from '../../../hooks/Proforma/useProformaInvoice';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { 
  ProformaInvoiceFormData, 
  ProformaInvoiceItem 
} from '../../../types/proforma/ProformaInvoiceType';

// Purity options
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

const TAX_OPTIONS = [
  { value: 'gst_0', label: 'GST 0%' },
  { value: 'gst_5', label: 'GST 5%' },
  { value: 'gst_12', label: 'GST 12%' },
  { value: 'gst_18', label: 'GST 18%' },
  { value: 'gst_28', label: 'GST 28%' },
];

const ProformaInvoiceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoice, updateInvoiceStatus, deleteInvoice } = useProformaInvoice();
  
  const [formData, setFormData] = useState<ProformaInvoiceFormData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [selectedTax, setSelectedTax] = useState('');

  // New item state
  const [newItem, setNewItem] = useState<ProformaInvoiceItem>({
    productId: '',
    productName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    taxRate: 0,
    total: 0,
  });

  useEffect(() => {
    const loadInvoice = async () => {
      if (id) {
        try {
          const invoice = await getInvoice(id);
          if (invoice) {
            setFormData({
              invoiceNumber: invoice.invoiceNumber,
              invoiceDate: invoice.invoiceDate,
              validUntil: invoice.validUntil,
              customerId: invoice.customerId,
              customerName: invoice.customerName,
              customerEmail: invoice.customerEmail,
              customerPhone: invoice.customerPhone,
              customerAddress: invoice.customerAddress,
              items: invoice.items,
              currency: invoice.currency,
              paymentTerms: invoice.paymentTerms,
              deliveryTerms: invoice.deliveryTerms,
              notes: invoice.notes,
              termsAndConditions: invoice.termsAndConditions,
              status: invoice.status,
              discount: invoice.discount || 0,
            });
          } else {
            navigate('/sales/proforma');
          }
        } catch (err) {
          console.error('Failed to load invoice:', err);
          navigate('/sales/proforma');
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadInvoice();
  }, [id, getInvoice, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => {
      const updated = { 
        ...prev, 
        [name]: ['quantity', 'unitPrice', 'discount', 'taxRate'].includes(name) 
          ? parseFloat(value) || 0 
          : value 
      };
      
      const quantity = name === 'quantity' ? parseFloat(value) || 0 : prev.quantity;
      const unitPrice = name === 'unitPrice' ? parseFloat(value) || 0 : prev.unitPrice;
      const discount = name === 'discount' ? parseFloat(value) || 0 : prev.discount;
      const taxRate = name === 'taxRate' ? parseFloat(value) || 0 : prev.taxRate;
      
      const subtotal = quantity * unitPrice;
      const discountAmount = subtotal * (discount / 100);
      const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
      updated.total = subtotal - discountAmount + taxAmount;
      
      return updated;
    });
  };

  const addItem = () => {
    if (newItem.productName && newItem.quantity > 0 && newItem.unitPrice > 0) {
      setFormData(prev => prev ? {
        ...prev,
        items: [...prev.items, { ...newItem, id: Date.now().toString() }],
      } : null);
      setNewItem({
        productId: '',
        productName: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0,
        total: 0,
      });
      if (errors.items) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.items;
          return newErrors;
        });
      }
    } else {
      setErrors({ items: 'Please fill in product name, quantity, and unit price' });
    }
  };

  const removeItem = (index: number) => {
    setFormData(prev => prev ? {
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    } : null);
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => {
      if (!prev) return null;
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate total
      const item = newItems[index];
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discount / 100);
      const taxAmount = (subtotal - discountAmount) * (item.taxRate / 100);
      item.total = subtotal - discountAmount + taxAmount;
      
      return { ...prev, items: newItems };
    });
  };

  const calculateTotals = (items: ProformaInvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountTotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discount / 100)), 0);
    const taxTotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount / 100);
      return sum + ((itemSubtotal - itemDiscount) * (item.taxRate / 100));
    }, 0);
    const grandTotal = subtotal - discountTotal + taxTotal;
    return { subtotal, discountTotal, taxTotal, grandTotal };
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData?.customerName) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData?.customerEmail) {
      newErrors.customerEmail = 'Customer email is required';
    }
    if (!formData?.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required';
    }
    if (!formData?.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }
    if (formData?.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Update invoice status back to draft
      await updateInvoiceStatus(id!, 'draft');
      
      // Here you would call your API to update the invoice
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Updated Proforma Invoice:', {
        id,
        ...formData,
        files,
        selectedTax,
      });
      
      navigate('/sales/proforma');
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to update invoice' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this proforma invoice?')) {
      try {
        await deleteInvoice(id!);
        navigate('/sales/proforma');
      } catch (err) {
        console.error('Failed to delete invoice:', err);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const newFiles = Array.from(fileList);
      // Check file size (10MB limit)
      const oversizedFiles = newFiles.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setErrors(prev => ({ ...prev, files: 'Some files exceed the 10MB limit' }));
        return;
      }
      // Check file count (max 5)
      if (files.length + newFiles.length > 5) {
        setErrors(prev => ({ ...prev, files: 'Maximum 5 files allowed' }));
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loadingData) {
    return <LoadingSpinner fullScreen text="Loading invoice..." />;
  }

  if (!formData) {
    return null;
  }

  const totals = calculateTotals(formData.items);
  const isEditable = formData.status === 'draft';

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
                <h1 className="text-2xl font-semibold text-gray-900">Edit Proforma Invoice</h1>
                <p className="text-sm text-gray-500">
                  Editing invoice #{formData.invoiceNumber}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditable && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/sales/proforma')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !isEditable}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Warning */}
        {!isEditable && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                This invoice is in <strong>{formData.status}</strong> status and cannot be edited.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Only draft invoices can be modified.
              </p>
            </div>
          </div>
        )}

        {/* Error summary */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Customer & Invoice Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Customer <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2.5 ${
                  errors.customerName ? 'border-red-400' : 'border-gray-300'
                } ${!isEditable ? 'bg-gray-50' : ''}`}>
                  <User className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    placeholder="Customer name"
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400 disabled:text-gray-500"
                  />
                </div>
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
                )}
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2.5 ${
                  errors.customerEmail ? 'border-red-400' : 'border-gray-300'
                } ${!isEditable ? 'bg-gray-50' : ''}`}>
                  <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    placeholder="customer@email.com"
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400 disabled:text-gray-500"
                  />
                </div>
                {errors.customerEmail && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerEmail}</p>
                )}
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <div className={`flex items-center border border-gray-300 rounded-lg px-3 py-2.5 ${!isEditable ? 'bg-gray-50' : ''}`}>
                  <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    placeholder="+1-555-0000"
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Customer Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address
                </label>
                <div className={`flex items-center border border-gray-300 rounded-lg px-3 py-2.5 ${!isEditable ? 'bg-gray-50' : ''}`}>
                  <input
                    type="text"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    placeholder="Customer address"
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 placeholder:text-gray-400 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details Row 2 */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Proforma # <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 bg-white">
                  <Hash className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 disabled:text-gray-500"
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
                <div className={`flex items-center border rounded-lg px-3 py-2.5 ${
                  errors.invoiceDate ? 'border-red-400' : 'border-gray-300'
                } ${!isEditable ? 'bg-gray-50' : ''}`}>
                  <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 disabled:text-gray-500"
                  />
                </div>
                {errors.invoiceDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.invoiceDate}</p>
                )}
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2.5 ${
                  errors.validUntil ? 'border-red-400' : 'border-gray-300'
                } ${!isEditable ? 'bg-gray-50' : ''}`}>
                  <Clock className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 disabled:text-gray-500"
                  />
                </div>
                {errors.validUntil && (
                  <p className="mt-1 text-xs text-red-500">{errors.validUntil}</p>
                )}
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment & Delivery Terms */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Terms
                </label>
                <select
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-white disabled:bg-gray-50 disabled:text-gray-500"
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
                  name="deliveryTerms"
                  value={formData.deliveryTerms}
                  onChange={handleInputChange}
                  disabled={!isEditable}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 bg-white disabled:bg-gray-50 disabled:text-gray-500"
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

          {/* Item Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
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
              {isEditable && <div className="col-span-1 text-center">ACTION</div>}
            </div>

            {/* Items */}
            {formData.items.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">
                <p>No items added yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {formData.items.map((item: any, index: number) => {
                  const itemTotal = item.quantity * item.unitPrice;
                  const discountAmount = itemTotal * (item.discount / 100);
                  const amount = itemTotal - discountAmount + ((itemTotal - discountAmount) * (item.taxRate / 100));
                  
                  return (
                    <div key={item.id} className="grid grid-cols-10 gap-2 px-5 py-2 items-center hover:bg-gray-50 transition-colors">
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Gem className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {isEditable ? (
                              <input
                                type="text"
                                value={item.productName}
                                onChange={(e) => updateItem(index, 'productName', e.target.value)}
                                placeholder="Item name"
                                className="w-full px-2 py-1 border-0 border-b border-gray-200 focus:border-amber-400 focus:ring-0 text-sm outline-none bg-transparent font-medium text-gray-900"
                              />
                            ) : (
                              <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              {isEditable ? (
                                <>
                                  <select
                                    value={item.purity || ''}
                                    onChange={(e) => updateItem(index, 'purity', e.target.value)}
                                    className="text-xs border-0 text-amber-600 font-medium bg-transparent focus:ring-0 outline-none"
                                  >
                                    <option value="">Select Purity</option>
                                    {PURITY_OPTIONS.map(p => (
                                      <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                  </select>
                                  <span className="text-gray-300">|</span>
                                  <select
                                    value={item.category || ''}
                                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                                    className="text-xs border-0 text-gray-500 bg-transparent focus:ring-0 outline-none"
                                  >
                                    <option value="">Select Category</option>
                                    {CATEGORY_OPTIONS.map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                  </select>
                                </>
                              ) : (
                                <>
                                  {item.purity && (
                                    <span className="text-xs text-amber-600 font-medium">{item.purity}</span>
                                  )}
                                  {item.category && (
                                    <>
                                      <span className="text-gray-300">|</span>
                                      <span className="text-xs text-gray-500">{item.category}</span>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1">
                        {isEditable ? (
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full text-center px-2 py-1 border-0 border-b border-gray-200 focus:border-amber-400 focus:ring-0 text-sm outline-none bg-transparent text-gray-900"
                            min="1"
                            step="1"
                          />
                        ) : (
                          <p className="text-sm text-center text-gray-900">{item.quantity}</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        {isEditable ? (
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full text-center px-2 py-1 border-0 border-b border-gray-200 focus:border-amber-400 focus:ring-0 text-sm outline-none bg-transparent text-gray-900"
                            step="0.01"
                          />
                        ) : (
                          <p className="text-sm text-center text-gray-900">${item.unitPrice.toFixed(2)}</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        {isEditable ? (
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
                        ) : (
                          <p className="text-sm text-center text-gray-900">{item.discount}%</p>
                        )}
                      </div>
                      <div className="col-span-2 text-center font-semibold text-gray-900">
                        ${amount.toFixed(2)}
                      </div>
                      {isEditable && (
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Actions */}
            {isEditable && (
              <div className="flex items-center px-5 py-3 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={addItem}
                  className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1.5 px-3 py-1.5 hover:bg-amber-50 rounded-lg transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Row</span>
                </button>
              </div>
            )}
          </div>

          {/* Sub Total, Taxes & Customer Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Sub Total & Taxes */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Sub Total</span>
                    <span className="font-semibold text-gray-900">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="font-semibold text-red-500">-${totals.discountTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Tax</span>
                    <span className="font-semibold text-gray-900">${totals.taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm font-semibold text-gray-700">Grand Total</span>
                    <span className="text-lg font-bold text-amber-600">${totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end">
                  <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                  <div className="text-3xl font-bold text-amber-600">
                    ${totals.grandTotal.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formData.currency || 'USD'}
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
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                disabled={!isEditable}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all resize-none text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Thank you for your business."
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
                name="termsAndConditions"
                value={formData.termsAndConditions}
                onChange={handleInputChange}
                disabled={!isEditable}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all resize-none text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Enter the terms and conditions..."
              />
            </div>

            {/* Attach Files */}
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Paperclip className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Attach Files</span>
              </div>
              
              {isEditable && (
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
              )}

              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700 truncate max-w-[150px]">{file.name}</span>
                        <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      {isEditable && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {saving && <LoadingSpinner fullScreen text="Saving changes..." />}
    </div>
  );
};

export default ProformaInvoiceEdit;