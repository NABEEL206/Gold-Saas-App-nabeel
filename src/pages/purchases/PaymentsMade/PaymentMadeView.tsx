// src/pages/purchases/PaymentsMade/PaymentMadeView.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash,
  DollarSign,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Mail,
  Phone,
  Banknote,
  Hash,
  Printer,
  Download,
} from 'lucide-react';
import { usePaymentMade } from '../../../hooks/PaymentMade/usePaymentMade';
import { usePaymentMadeView } from '../../../hooks/PaymentMade/usePaymentMadeView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
    cancelled: { color: 'bg-gray-100 text-gray-500', icon: XCircle, label: 'Cancelled' },
  };
  const defaultConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = config[status as keyof typeof config] || defaultConfig;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const PaymentMadeView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPaymentById, deletePayment } = usePaymentMade();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the toast and confirm hook
  const {
    success,
    error: showError,
    warning,
    withConfirmation,
    withLoading,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const { 
    getStatusLabel, 
    getPaymentMethodLabel, 
    formatCurrency,
    getPaymentSummary
  } = usePaymentMadeView(payment);

  useEffect(() => {
    const loadPayment = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await getPaymentById(id);
          if (data) {
            setPayment(data);
          } else {
            setError('Payment not found');
            showError('Payment not found');
          }
        } catch (err) {
          console.error('Error loading payment:', err);
          setError('Error loading payment');
          showError('Failed to load payment details. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        showError('Invalid payment ID');
        navigate('/purchases/payments-made');
      }
    };
    loadPayment();
  }, [id, getPaymentById, navigate, showError]);

  const handleDelete = async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Payment',
        message: `Are you sure you want to delete payment "${payment?.paymentNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deletePayment(id);
            navigate('/purchases/payments-made');
          },
          'Deleting payment...',
          `Payment "${payment?.paymentNumber}" deleted successfully.`,
          'Failed to delete payment. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    console.log('Edit clicked - Payment ID:', id);
    if (id) {
      navigate(`/purchases/payments-made/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid payment ID');
    }
  };

  const handlePrint = () => {
    success('Preparing document for printing...');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = () => {
    warning('Download functionality will be implemented soon.');
  };

  const dropdownItems = [
    {
      label: 'Print',
      icon: <Printer className="h-4 w-4 text-gray-500" />,
      onClick: handlePrint,
    },
    {
      label: 'Download',
      icon: <Download className="h-4 w-4 text-blue-500" />,
      onClick: handleDownload,
    },
    {
      label: 'Edit Payment',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Payment',
      icon: <Trash className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading payment details..." />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error || 'Payment not found'}</p>
          <button
            onClick={() => navigate('/purchases/payments-made')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/purchases/payments-made')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{payment.paymentNumber}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Payment Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Payment
            </button>
            <ThreeDotDropdown
              items={dropdownItems}
              position="right"
            />
          </div>
        </div>

        {/* Status Badges */}
        <div className="mb-6 flex flex-wrap gap-2">
          <StatusBadge status={payment.status} />
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 inline-flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            {getPaymentMethodLabel()}
          </span>
          {payment.billNumber && (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 inline-flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Bill: {payment.billNumber}
            </span>
          )}
          {payment.referenceNumber && (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Ref: {payment.referenceNumber}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-500" />
                Vendor Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Vendor Name</label>
                  <p className="text-gray-900 font-medium">{payment.vendorName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Vendor ID</label>
                  <p className="text-gray-900">{payment.vendorId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {payment.vendorEmail || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Bill Number</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {payment.billNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-500" />
                Payment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Amount</label>
                  <p className="text-xl font-bold text-amber-600">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Payment Date</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Payment Method</label>
                  <p className="text-gray-900">{getPaymentMethodLabel()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className="text-gray-900">
                    <StatusBadge status={payment.status} />
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Reference Number</label>
                  <p className="text-gray-900">{payment.referenceNumber || 'N/A'}</p>
                </div>
              </div>

              {/* Bank Details */}
              {(payment.bankName || payment.bankAccount) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Bank Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {payment.bankName && (
                      <div>
                        <label className="text-xs text-gray-500">Bank Name</label>
                        <p className="text-sm text-gray-900">{payment.bankName}</p>
                      </div>
                    )}
                    {payment.bankAccount && (
                      <div>
                        <label className="text-xs text-gray-500">Bank Account</label>
                        <p className="text-sm text-gray-900">{payment.bankAccount}</p>
                      </div>
                    )}
                    {payment.chequeNumber && (
                      <div>
                        <label className="text-xs text-gray-500">Cheque Number</label>
                        <p className="text-sm text-gray-900">{payment.chequeNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {payment.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{payment.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Payment ID</span>
                  <span className="text-sm font-medium text-gray-900">#{payment.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Payment #</span>
                  <span className="text-sm font-medium text-gray-900">{payment.paymentNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-sm font-bold text-amber-600">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium">
                    <StatusBadge status={payment.status} />
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Payment
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4" />
                  Delete Payment
                </button>
                <button
                  onClick={() => navigate('/purchases/payments-made')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Payments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Replaces the custom delete modal */}
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

export default PaymentMadeView;