// src/pages/sales/proforma/ProformaInvoiceEdit.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  Mail,
  Phone,
  Hash,
  Calendar,
  Clock,
  FileText,
  Paperclip,
  Upload,
  X,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { useProformaInvoice } from '../../../hooks/Proforma/useProformaInvoice';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import ItemSelectionTable from '../../../components/common/ItemSelectionTable';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';
import type { ItemSelectionItem } from '../../../components/common/ItemSelectionTable';
import type { ProformaInvoiceFormData } from '../../../types/proforma/ProformaInvoiceType';

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

const ProformaInvoiceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoice, updateInvoiceStatus, deleteInvoice } = useProformaInvoice();

  const {
    success,
    error: showError,
    withConfirmation,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const [formData, setFormData] = useState<ProformaInvoiceFormData | null>(null);
  const [initialFormData, setInitialFormData] = useState<string>('');
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ItemSelectionItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions] = useState(MOCK_PRODUCTS);

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
    if (details && formData) {
      setFormData({
        ...formData,
        customerId: selectedOption.value,
        customerName: details.name || selectedOption.label,
        customerEmail: details.email || '',
        customerPhone: details.phone || '',
        customerAddress: details.address || '',
      });
    }
  };

  // Handle items change from ItemSelectionTable
  const handleItemsChange = (newItems: ItemSelectionItem[]) => {
    setItems(newItems);
    if (formData) {
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
      setFormData({
        ...formData,
        items: proformaItems,
      });
    }
  };

  // Handle product search
  const handleProductSearch = (search: string) => {
    setProductSearch(search);
  };

  useEffect(() => {
    const loadInvoice = async () => {
      if (id) {
        try {
          const invoice = await getInvoice(id);
          if (invoice) {
            const loaded: ProformaInvoiceFormData = {
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
            };
            setFormData(loaded);
            setInitialFormData(JSON.stringify(loaded));

            // Convert items to ItemSelectionItem format
            if (invoice.items && invoice.items.length > 0) {
              const convertedItems = invoice.items.map((item: any) => ({
                productId: item.productId || `item_${Date.now()}`,
                productName: item.productName || '',
                description: item.description || '',
                quantity: item.quantity || 1,
                unit: 'Pcs',
                rate: item.unitPrice || 0,
                discount: item.discount || 0,
                discountType: 'percentage' as const,
                taxRate: item.taxRate || 0,
                taxAmount: 0,
                total: item.total || 0,
                purity: item.purity || '22K',
                category: item.category || '',
              }));
              setItems(convertedItems);
            }
          } else {
            showError('Proforma invoice not found.');
            navigate('/sales/proforma');
          }
        } catch (err) {
          showError('Failed to load proforma invoice.');
          navigate('/sales/proforma');
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getInvoice, navigate]);

  const hasUnsavedChanges = Boolean(
    formData && initialFormData && JSON.stringify(formData) !== initialFormData
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
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
      showError('Please fix the errors in the form and try again.');
      return;
    }

    setSaving(true);
    try {
      await updateInvoiceStatus(id!, 'draft');
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Updated Proforma Invoice:', {
        id,
        ...formData,
        files,
      });
      success('Proforma invoice updated successfully.');
      navigate('/sales/proforma');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update invoice';
      setErrors({ submit: message });
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  // Delete handler using confirmation modal instead of window.confirm
  const handleDelete = () => {
    withConfirmation(
      {
        title: 'Delete Proforma Invoice',
        message: 'Are you sure you want to delete this proforma invoice? This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleting(true);
        try {
          await deleteInvoice(id!);
          success('Proforma invoice deleted successfully.');
          navigate('/sales/proforma');
        } catch (err) {
          showError('Failed to delete proforma invoice. Please try again.');
        } finally {
          setDeleting(false);
        }
      }
    );
  };

  // Cancel handler - confirm before discarding unsaved changes
  const handleCancel = () => {
    if (!hasUnsavedChanges) {
      navigate('/sales/proforma');
      return;
    }

    withConfirmation(
      {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate('/sales/proforma');
      }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const newFiles = Array.from(fileList);
      const oversizedFiles = newFiles.filter(f => f.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setErrors(prev => ({ ...prev, files: 'Some files exceed the 10MB limit' }));
        showError('Some files exceed the 10MB limit.');
        return;
      }
      if (files.length + newFiles.length > 5) {
        setErrors(prev => ({ ...prev, files: 'Maximum 5 files allowed' }));
        showError('Maximum 5 files allowed.');
        return;
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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

  if (loadingData) {
    return <LoadingSpinner fullScreen text="Loading invoice..." />;
  }

  if (!formData) {
    return null;
  }

  const isEditable = formData.status === 'draft';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
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
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
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
                  disabled={!isEditable}
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>
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

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Proforma # <span className="text-red-500">*</span>
                </label>
                <div className={`flex items-center border rounded-lg px-3 py-2.5 ${!isEditable ? 'bg-gray-50' : 'bg-white'} border-gray-300`}>
                  <Hash className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    className="flex-1 outline-none text-sm bg-transparent text-gray-900 disabled:text-gray-500"
                  />
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
            className={!isEditable ? 'pointer-events-none opacity-75' : ''}
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
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={!isEditable}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-amber-400 transition-all resize-none text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="Thank you for your business."
            />
          </div>

          {/* Terms & Conditions and Attach Files */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
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
                rows={3}
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

      {/* Reusable Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={onModalCancel}
        onConfirm={onModalConfirm}
        title={modalOptions?.title}
        message={modalOptions?.message ?? ''}
        confirmText={modalOptions?.confirmText}
        cancelText={modalOptions?.cancelText}
        variant={modalOptions?.variant}
        isLoading={modalLoading}
      />
    </div>
  );
};

export default ProformaInvoiceEdit;