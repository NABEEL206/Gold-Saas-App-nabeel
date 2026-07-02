// src/pages/sales/Quote/QuoteEdit.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, User, Mail, Phone, MapPin,
  Building2, Calendar, Package, Gem, AlertCircle,
} from 'lucide-react';
import { useQuotes } from '../../../hooks/Quote/useQuotes';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown, { type DropdownOption } from '../../../components/common/Searchabledropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Rajesh Jewelers', email: 'rajesh@jewelers.com', phone: '+91-98765-43210', address: '123 Jewel Street, Mumbai' },
  { id: '2', name: 'Priya Gold House', email: 'priya@goldhouse.com', phone: '+91-98765-43211', address: '456 Gold Road, Delhi' },
  { id: '3', name: 'Suresh Gold Mart', email: 'suresh@goldmart.com', phone: '+91-98765-43212', address: '789 Diamond Avenue, Bangalore' },
  { id: '4', name: 'Meera Jewel World', email: 'meera@jewelworld.com', phone: '+91-98765-43213', address: '321 Pearl Street, Chennai' },
];

const customerOptions: DropdownOption[] = MOCK_CUSTOMERS.map(customer => ({
  value: customer.id,
  label: customer.name,
  group: 'Customers'
}));

const QuoteEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuote, updateQuote, loading } = useQuotes();
  const {
    success,
    error: showError,
    confirm,
    withConfirmation,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      const found = getQuote(id);
      if (found) {
        setFormData(found);
      } else {
        setPageError('Quote not found');
      }
    }
  }, [id, getQuote]);

  const handleCustomerSelect = useCallback((option: DropdownOption) => {
    const customer = MOCK_CUSTOMERS.find(c => c.id === option.value);
    if (customer && formData) {
      setFormData({
        ...formData,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email || '',
        customerPhone: customer.phone || '',
        customerAddress: customer.address || '',
      });
    }
  }, [formData]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData?.customerId) newErrors.customerId = 'Please select a customer';
    if (!formData?.customerPhone?.trim()) newErrors.customerPhone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const updateQuoteData = useCallback(async (status: 'draft' | 'sent') => {
    if (!formData) return;
    setSaving(true);
    try {
      const result = await updateQuote(formData.id, { ...formData, status });
      if (result.success) {
        success(`Quote ${status === 'draft' ? 'updated as draft' : 'updated and sent'} successfully!`);
        navigate('/sales/quotes', { replace: true });
      } else {
        showError(result.error || 'Failed to update quote');
      }
    } catch (err) {
      showError('Failed to update quote. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [formData, updateQuote, success, showError, navigate]);

  const handleSubmit = useCallback(async (status: 'draft' | 'sent') => {
    if (!validateForm()) {
      showError('Please fix the validation errors before saving.');
      return;
    }

    const actionLabel = status === 'draft' ? 'Update Draft' : 'Update & Send';
    await withConfirmation(
      {
        title: status === 'draft' ? 'Update Quote Draft' : 'Update & Send Quote',
        message: status === 'draft'
          ? 'Are you sure you want to update this quote as draft?'
          : 'Are you sure you want to update and send this quote to the customer?',
        confirmText: actionLabel,
        variant: 'primary',
      },
      () => updateQuoteData(status)
    );
  }, [validateForm, showError, withConfirmation, updateQuoteData]);

  const handleCancelClick = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Discard Changes',
      message: 'Are you sure you want to discard all changes? This action cannot be undone.',
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      variant: 'warning',
    });
    if (confirmed) navigate('/sales/quotes', { replace: true });
  }, [confirm, navigate]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading quote..." />
      </div>
    );
  }

  if (pageError || !formData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Quote Not Found</h3>
          <p className="text-sm text-red-600">{pageError || 'Quote does not exist'}</p>
          <button onClick={() => navigate('/sales/quotes', { replace: true })} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={handleCancelClick} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Gem className="h-6 w-6 text-amber-500" />Edit Quote: {formData.quoteNo}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Update quote details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSubmit('draft')} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              <Save className="h-4 w-4" />Update Draft
            </button>
            <button onClick={() => handleSubmit('sent')} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50">
              {saving ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}Update & Send
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-amber-500" />Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Customer Name *</label>
              <SearchableDropdown options={customerOptions} value={formData.customerId || null} onChange={handleCustomerSelect} placeholder="Search customer..." triggerPlaceholder="Select a customer" className="w-full max-w-full" resetSearchOnOpen={true} showEmptyState={true} emptyStateText="No customers found" maxListHeight={280} />
              {errors.customerId && <p className="mt-1 text-xs text-red-500">{errors.customerId}</p>}
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label><input type="email" value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="customer@email.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label><input type="tel" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${errors.customerPhone ? 'border-red-500' : 'border-gray-200'}`} placeholder="Enter phone number" />{errors.customerPhone && <p className="mt-1 text-xs text-red-500">{errors.customerPhone}</p>}</div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">GST Number</label><input type="text" value={formData.customerGst || ''} onChange={(e) => setFormData({ ...formData, customerGst: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="GSTIN" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label><input type="text" value={formData.customerAddress || ''} onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Customer address" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-500" />Quote Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label><input type="date" value={formData.date.split('T')[0]} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Valid Until</label><input type="date" value={formData.validUntil.split('T')[0]} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
          </div>
        </div>

        {/* Items table - keep existing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-amber-500" />Items</h3>
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
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.items?.map((item: any, index: number) => {
                  const total = item.quantity * item.unitPrice + item.makingCharges * item.quantity + (item.quantity * item.unitPrice * item.wastagePercentage / 100) + item.stoneCharges * item.quantity;
                  return (
                    <tr key={item.id || index}>
                      <td className="px-3 py-2"><div><p className="font-medium text-gray-900">{item.itemName}</p><p className="text-xs text-gray-500">{item.itemId}</p></div></td>
                      <td className="px-3 py-2 text-sm text-gray-600">{item.category}</td>
                      <td className="px-3 py-2 text-sm text-gray-600">{item.purity}</td>
                      <td className="px-3 py-2 text-right text-sm text-gray-600">{item.weight}</td>
                      <td className="px-3 py-2 text-right text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-sm text-gray-600">₹{item.unitPrice}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">₹{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes</h4>
            <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Any additional notes..." />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Terms & Conditions</h4>
            <textarea value={formData.termsAndConditions || ''} onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Terms and conditions..." />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <button onClick={handleCancelClick} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
          <div className="flex items-center gap-2">
            <button onClick={() => handleSubmit('draft')} disabled={saving} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Update Draft</button>
            <button onClick={() => handleSubmit('sent')} disabled={saving} className="px-4 py-2 text-sm text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2">
              {saving ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}Update & Send
            </button>
          </div>
        </div>
      </div>

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

export default QuoteEdit;