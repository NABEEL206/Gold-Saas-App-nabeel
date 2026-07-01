// src/pages/sales/PaymentReceived/PaymentReceivedCreate.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Receipt,
  Users,
  Calendar,
  Hash,
  IndianRupee,
  Banknote,
  Landmark,
  CreditCard,
  Wallet,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { usePaymentReceived } from '../../../hooks/PaymentReceived/usePaymentReceived';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchableDropdown from '../../../components/common/Searchabledropdown';
import type { DropdownOption } from '../../../components/common/Searchabledropdown';

// Demo customers as DropdownOption[]
const DEMO_CUSTOMERS: DropdownOption[] = [
  { value: '1', label: 'Rajesh Jewelers', group: 'Regular' },
  { value: '2', label: 'Priya Gold House', group: 'Regular' },
  { value: '3', label: 'Suresh Gold Mart', group: 'VIP' },
  { value: '4', label: 'Meera Jewel World', group: 'Regular' },
];

// Customer details mapping
const CUSTOMER_DETAILS: Record<string, any> = {
  '1': { name: 'Rajesh Jewelers', email: 'rajesh@jewelers.com', phone: '+91-98765-43210' },
  '2': { name: 'Priya Gold House', email: 'priya@goldhouse.com', phone: '+91-98765-43211' },
  '3': { name: 'Suresh Gold Mart', email: 'suresh@goldmart.com', phone: '+91-98765-43212' },
  '4': { name: 'Meera Jewel World', email: 'meera@jewelworld.com', phone: '+91-98765-43213' },
};

// Demo invoices as DropdownOption[]
const DEMO_INVOICES: DropdownOption[] = [
  { value: '1', label: 'INV-000001 - ₹29,500', group: 'Pending' },
  { value: '2', label: 'INV-000002 - ₹50,445', group: 'Pending' },
  { value: '3', label: 'INV-000003 - ₹37,760', group: 'Completed' },
  { value: '4', label: 'INV-000004 - ₹12,862', group: 'Pending' },
];

// Invoice details mapping
const INVOICE_DETAILS: Record<string, any> = {
  '1': { number: 'INV-000001', amount: 29500 },
  '2': { number: 'INV-000002', amount: 50445 },
  '3': { number: 'INV-000003', amount: 37760 },
  '4': { number: 'INV-000004', amount: 12862 },
};

const PaymentReceivedCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createPayment, loading } = usePaymentReceived();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    invoiceId: '',
    invoiceNumber: '',
    amount: 0,
    paymentMethod: 'cash' as const,
    referenceNumber: '',
    bankName: '',
    chequeNumber: '',
    chequeDate: '',
    notes: '',
    status: 'completed' as const,
  });

  // Handle customer selection from dropdown
  const handleCustomerSelect = (selectedOption: DropdownOption) => {
    const details = CUSTOMER_DETAILS[selectedOption.value];
    if (details) {
      setFormData({
        ...formData,
        customerId: selectedOption.value,
        customerName: details.name,
        customerEmail: details.email,
        customerPhone: details.phone,
      });
    } else {
      setFormData({
        ...formData,
        customerId: selectedOption.value,
        customerName: selectedOption.label,
      });
    }
  };

  // Handle invoice selection from dropdown
  const handleInvoiceSelect = (selectedOption: DropdownOption) => {
    const details = INVOICE_DETAILS[selectedOption.value];
    if (details) {
      setFormData({
        ...formData,
        invoiceId: selectedOption.value,
        invoiceNumber: details.number,
        amount: details.amount,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await createPayment(formData);
      navigate('/sales/payments-received');
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales/payments-received')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                <Receipt className="h-6 w-6 text-amber-500" />
                Record Payment
              </h1>
              <p className="text-sm text-gray-500">Record a new customer payment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sales/payments-received')}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Record Payment
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500" />
              Customer Details
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Customer <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={DEMO_CUSTOMERS}
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
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.customerId}
                </p>
              )}
            </div>

            {formData.customerName && (
              <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                <p className="font-medium text-gray-900">{formData.customerName}</p>
                <p className="text-sm text-gray-600">{formData.customerEmail} | {formData.customerPhone}</p>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-amber-500" />
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice (Optional)
                </label>
                <SearchableDropdown
                  options={DEMO_INVOICES}
                  value={formData.invoiceId}
                  onChange={handleInvoiceSelect}
                  placeholder="Search invoice by number..."
                  triggerPlaceholder="Select or search invoice..."
                  className="w-full max-w-full"
                  showEmptyState={true}
                  emptyStateText="No invoices found"
                  resetSearchOnOpen={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className={`w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.amount}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white ${
                      errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="upi">UPI</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.paymentMethod}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter reference number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cheque Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.chequeNumber}
                    onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter cheque number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cheque Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.chequeDate}
                    onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber-500" />
              Status
            </h2>
            <div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

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
              placeholder="Enter any notes..."
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentReceivedCreate;