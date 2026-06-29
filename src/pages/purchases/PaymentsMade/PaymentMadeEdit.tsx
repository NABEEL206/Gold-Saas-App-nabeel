// src/pages/purchases/PaymentsMade/PaymentMadeEdit.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { usePaymentMade } from '../../../hooks/PaymentMade/usePaymentMade';
import { usePaymentMadeEdit } from '../../../hooks/PaymentMade/usePaymentMadeEdit';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { PAYMENT_MADE_STATUSES, PAYMENT_MADE_STATUS_LABELS } from '../../../types/PaymentMade/PaymentMadeType';

const PaymentMadeEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPaymentById, updatePayment } = usePaymentMade();
  const [payment, setPayment] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showBankFields, setShowBankFields] = useState(false);
  const [showChequeFields, setShowChequeFields] = useState(false);

  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFormData,
    resetForm
  } = usePaymentMadeEdit(payment);

  useEffect(() => {
    const loadPayment = async () => {
      if (id) {
        setLoadingPayment(true);
        setLoadError(null);
        try {
          const data = await getPaymentById(id);
          if (data) {
            setPayment(data);
            setFormData({
              paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
              billId: data.billId || '',
              billNumber: data.billNumber || '',
              vendorId: data.vendorId || '',
              vendorName: data.vendorName || '',
              vendorEmail: data.vendorEmail || '',
              amount: data.amount || 0,
              paymentMethod: data.paymentMethod || 'bank',
              referenceNumber: data.referenceNumber || '',
              chequeNumber: data.chequeNumber || '',
              bankName: data.bankName || '',
              bankAccount: data.bankAccount || '',
              notes: data.notes || '',
              status: data.status || 'pending',
              attachment: data.attachment || '',
              currency: data.currency || 'INR',
              exchangeRate: data.exchangeRate || 1
            });
            setShowBankFields(data.paymentMethod === 'bank' || data.paymentMethod === 'auto_debit');
            setShowChequeFields(data.paymentMethod === 'cheque');
          } else {
            setLoadError('Payment not found');
          }
        } catch (error) {
          console.error('Error loading payment:', error);
          setLoadError('Error loading payment data');
        } finally {
          setLoadingPayment(false);
        }
      }
    };
    loadPayment();
  }, [id, getPaymentById, setFormData]);

  const onSubmit = async () => {
    const success = await handleSubmit(updatePayment);
    if (success) {
      navigate('/purchases/payments-made');
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: string) => {
    handleChange('paymentMethod', method);
    setShowBankFields(method === 'bank' || method === 'auto_debit');
    setShowChequeFields(method === 'cheque');
  };

  if (loadingPayment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading payment details..." />
      </div>
    );
  }

  if (loadError || !payment) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          {loadError || 'Payment not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/purchases/payments-made')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Payment</h1>
            <p className="text-sm text-gray-500 mt-0.5">{payment.paymentNumber}</p>
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Form - Same as Create with pre-populated data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Same fields as Create page with values from formData */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.vendorName || ''}
              onChange={(e) => handleChange('vendorName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.vendorId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter vendor name"
            />
            {errors.vendorId && <p className="mt-1 text-sm text-red-500">{errors.vendorId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor ID
            </label>
            <input
              type="text"
              value={formData.vendorId || ''}
              onChange={(e) => handleChange('vendorId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter vendor ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Email
            </label>
            <input
              type="email"
              value={formData.vendorEmail || ''}
              onChange={(e) => handleChange('vendorEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter vendor email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill Number
            </label>
            <input
              type="text"
              value={formData.billNumber || ''}
              onChange={(e) => handleChange('billNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter bill number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill ID
            </label>
            <input
              type="text"
              value={formData.billId || ''}
              onChange={(e) => handleChange('billId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter bill ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => handleChange('paymentDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.paymentDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.paymentDate && <p className="mt-1 text-sm text-red-500">{errors.paymentDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="cheque">Cheque</option>
              <option value="auto_debit">Auto Debit</option>
            </select>
            {errors.paymentMethod && <p className="mt-1 text-sm text-red-500">{errors.paymentMethod}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {PAYMENT_MADE_STATUSES.map(status => (
                <option key={status} value={status}>
                  {PAYMENT_MADE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={formData.referenceNumber || ''}
              onChange={(e) => handleChange('referenceNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter reference number"
            />
          </div>

          {/* Bank Fields */}
          {showBankFields && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account
                </label>
                <input
                  type="text"
                  value={formData.bankAccount || ''}
                  onChange={(e) => handleChange('bankAccount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter bank account number"
                />
              </div>
            </>
          )}

          {/* Cheque Fields */}
          {showChequeFields && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cheque Number
              </label>
              <input
                type="text"
                value={formData.chequeNumber || ''}
                onChange={(e) => handleChange('chequeNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter cheque number"
              />
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter additional notes"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMadeEdit;