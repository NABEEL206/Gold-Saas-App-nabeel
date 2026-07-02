// src/pages/sales/PaymentsReceived/PaymentReceivedView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  Edit,
  Trash2,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Building2,
  Banknote,
  Landmark,
  CreditCard,
  Wallet,
  Calendar,
  Hash,
  FileText,
  User,
  IndianRupee,
} from 'lucide-react';
import { usePaymentReceived } from '../../../hooks/PaymentReceived/usePaymentReceived';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { PaymentReceived } from '../../../types/paymentReceived/PaymentReceivedTypes';

// Status Badge
const StatusBadge: React.FC<{ status: PaymentReceived['status'] }> = ({ status }) => {
  const config = {
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
    refunded: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Refunded' },
  };
  const { color, icon: Icon, label } = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

// Payment Method Badge
const PaymentMethodBadge: React.FC<{ method: PaymentReceived['paymentMethod'] }> = ({ method }) => {
  const config = {
    cash: { icon: Banknote, label: 'Cash', color: 'bg-green-100 text-green-700' },
    bank_transfer: { icon: Landmark, label: 'Bank Transfer', color: 'bg-blue-100 text-blue-700' },
    cheque: { icon: Receipt, label: 'Cheque', color: 'bg-purple-100 text-purple-700' },
    credit_card: { icon: CreditCard, label: 'Credit Card', color: 'bg-indigo-100 text-indigo-700' },
    upi: { icon: Wallet, label: 'UPI', color: 'bg-amber-100 text-amber-700' },
    other: { icon: Receipt, label: 'Other', color: 'bg-gray-100 text-gray-700' },
  };
  const { icon: Icon, label, color } = config[method] || config.other;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

// Payment Method Icon
const PaymentMethodIcon: React.FC<{ method: PaymentReceived['paymentMethod'] }> = ({ method }) => {
  const config = {
    cash: { icon: Banknote, label: 'Cash' },
    bank_transfer: { icon: Landmark, label: 'Bank Transfer' },
    cheque: { icon: Receipt, label: 'Cheque' },
    credit_card: { icon: CreditCard, label: 'Credit Card' },
    upi: { icon: Wallet, label: 'UPI' },
    other: { icon: Receipt, label: 'Other' },
  };
  const { icon: Icon, label } = config[method] || config.other;
  return (
    <span className="inline-flex items-center gap-2 text-gray-600">
      <Icon className="h-5 w-5" />
      {label}
    </span>
  );
};

// Generate dummy payment data
const generateDummyPayment = (id: string): PaymentReceived => {
  const dummyPayments: Record<string, PaymentReceived> = {
    '1': {
      id: '1',
      paymentNumber: 'PAY-2024-001',
      paymentDate: new Date().toISOString().split('T')[0],
      customerId: '1',
      customerName: 'Rajesh Jewelers',
      customerEmail: 'rajesh@jewelers.com',
      customerPhone: '+91-98765-43210',
      invoiceId: '1',
      invoiceNumber: 'INV-000001',
      amount: 29500,
      paymentMethod: 'bank_transfer',
      referenceNumber: 'BT-2024-001',
      bankName: 'HDFC Bank',
      chequeNumber: '',
      chequeDate: '',
      notes: 'Payment received for invoice INV-000001 via bank transfer',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    '2': {
      id: '2',
      paymentNumber: 'PAY-2024-002',
      paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId: '2',
      customerName: 'Priya Gold House',
      customerEmail: 'priya@goldhouse.com',
      customerPhone: '+91-98765-43211',
      invoiceId: '2',
      invoiceNumber: 'INV-000002',
      amount: 50445,
      paymentMethod: 'upi',
      referenceNumber: 'UPI-2024-002',
      bankName: '',
      chequeNumber: '',
      chequeDate: '',
      notes: 'Payment received via UPI',
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    '3': {
      id: '3',
      paymentNumber: 'PAY-2024-003',
      paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId: '3',
      customerName: 'Suresh Gold Mart',
      customerEmail: 'suresh@goldmart.com',
      customerPhone: '+91-98765-43212',
      invoiceId: '3',
      invoiceNumber: 'INV-000003',
      amount: 37760,
      paymentMethod: 'cheque',
      referenceNumber: 'CHQ-2024-003',
      bankName: 'SBI Bank',
      chequeNumber: '123456',
      chequeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Cheque payment received. Pending clearance.',
      status: 'pending',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    '4': {
      id: '4',
      paymentNumber: 'PAY-2024-004',
      paymentDate: new Date().toISOString().split('T')[0],
      customerId: '4',
      customerName: 'Meera Jewel World',
      customerEmail: 'meera@jewelworld.com',
      customerPhone: '+91-98765-43213',
      invoiceId: '4',
      invoiceNumber: 'INV-000004',
      amount: 12862,
      paymentMethod: 'cash',
      referenceNumber: '',
      bankName: '',
      chequeNumber: '',
      chequeDate: '',
      notes: 'Cash payment received at store',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  return dummyPayments[id] || dummyPayments['1'];
};

const PaymentReceivedView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPayment, updateStatus, deletePayment, loading: hookLoading } = usePaymentReceived();
  
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentReceived | null>(null);
  const [updating, setUpdating] = useState(false);

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

  useEffect(() => {
    if (id) {
      loadPayment(id);
    } else {
      showError('Invalid payment ID');
      navigate('/sales/payments-received');
    }
  }, [id]);

  const loadPayment = async (paymentId: string) => {
    setLoading(true);
    try {
      const data = await getPayment(paymentId) as PaymentReceived;
      if (data) {
        setPayment(data);
      } else {
        // If no data from hook, generate dummy data
        const dummyData = generateDummyPayment(paymentId);
        setPayment(dummyData);
      }
    } catch (error) {
      console.error('Error loading payment:', error);
      showError('Failed to load payment details. Loading demo data.');
      // Generate dummy data on error
      const dummyData = generateDummyPayment(paymentId);
      setPayment(dummyData);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: PaymentReceived['status']) => {
    if (!id) return;
    
    const statusLabels: Record<string, string> = {
      completed: 'Mark as Completed',
      pending: 'Mark as Pending',
      failed: 'Mark as Failed',
      refunded: 'Mark as Refunded',
    };
    
    const actionLabel = statusLabels[status] || status;
    const variant = status === 'failed' || status === 'refunded' ? 'danger' as const : 'primary' as const;
    
    await withConfirmation(
      {
        title: `${actionLabel} Payment`,
        message: `Are you sure you want to ${actionLabel.toLowerCase()} this payment?`,
        confirmText: actionLabel,
        variant,
      },
      async () => {
        setUpdating(true);
        try {
          await updateStatus(id, status);
          await loadPayment(id);
          success(`Payment ${status === 'completed' ? 'marked as completed' : `status updated to ${status}`} successfully.`);
        } catch (error) {
          console.error('Error updating status:', error);
          showError('Failed to update payment status. Please try again.');
        } finally {
          setUpdating(false);
        }
      }
    );
  };

  const handleDelete = async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Payment',
        message: 'Are you sure you want to delete this payment? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deletePayment(id);
            navigate('/sales/payments-received');
          },
          'Deleting payment...',
          'Payment deleted successfully.',
          'Failed to delete payment. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    console.log('Edit clicked - Payment ID:', id);
    if (id) {
      navigate(`/sales/payments-received/${id}/edit`);
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

  // Dropdown items for three-dot menu
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
      label: 'Edit',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
      show: payment?.status === 'pending',
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      show: payment?.status === 'pending',
    },
    {
      label: 'Mark as Completed',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => handleStatusUpdate('completed'),
      show: payment?.status === 'pending',
      disabled: updating,
    },
    {
      label: 'Mark as Failed',
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      onClick: () => handleStatusUpdate('failed'),
      show: payment?.status === 'pending',
      disabled: updating,
    },
  ];

  if (loading || hookLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading payment..." />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Payment not found</p>
          <button
            onClick={() => navigate('/sales/payments-received')}
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
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-2xl font-semibold text-gray-900">Payment Details</h1>
              <p className="text-sm text-gray-500">{payment.paymentNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Direct Edit Button for pending payments */}
            {payment.status === 'pending' && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Payment
              </button>
            )}
            <ThreeDotDropdown
              items={dropdownItems.filter(item => item.show !== false)}
              position="right"
            />
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Status:</span>
            <StatusBadge status={payment.status} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {updating && (
              <span className="text-xs text-gray-500 flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Updating status...
              </span>
            )}
            <span className="text-xs text-gray-400">
              All actions available in ⋮ menu
            </span>
          </div>
        </div>

        {/* Payment Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{payment.paymentNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date: {new Date(payment.paymentDate).toLocaleDateString()}
                </p>
                {payment.invoiceNumber && (
                  <p className="text-sm text-gray-500">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Invoice: {payment.invoiceNumber}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Received: {new Date(payment.createdAt || payment.paymentDate).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-3xl font-bold text-amber-600">₹{payment.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">
                  <PaymentMethodBadge method={payment.paymentMethod} />
                </p>
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-amber-500" />
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-900">{payment.customerName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" /> {payment.customerEmail}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" /> {payment.customerPhone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Receipt className="h-4 w-4" /> Payment Method: <PaymentMethodIcon method={payment.paymentMethod} />
                </p>
                {payment.referenceNumber && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Hash className="h-4 w-4" /> Ref: {payment.referenceNumber}
                  </p>
                )}
                {payment.bankName && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4" /> Bank: {payment.bankName}
                  </p>
                )}
                {payment.chequeNumber && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4" /> Cheque: {payment.chequeNumber}
                  </p>
                )}
                {payment.chequeDate && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" /> Cheque Date: {new Date(payment.chequeDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Payment Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Payment Number</p>
                <p className="font-medium text-gray-900">{payment.paymentNumber}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-medium text-amber-600">₹{payment.amount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">Status</p>
                <StatusBadge status={payment.status} />
              </div>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-500" />
                Notes
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
                {payment.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
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

export default PaymentReceivedView;