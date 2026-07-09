// src/pages/sales/PaymentsReceived/PaymentReceivedView.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Eye,
  FileText as FileTextIcon,
} from 'lucide-react';
import { usePaymentReceived } from '../../../hooks/PaymentReceived/usePaymentReceived';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { DocumentRenderer } from '../../../Templates/DocumentRenderer';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { PaymentReceived } from '../../../types/paymentReceived/PaymentReceivedTypes';
import type { DocumentData } from '../../../types/Template/TemplateTypes';

type ViewMode = 'details' | 'preview';

const StatusBadge: React.FC<{ status: PaymentReceived['status'] }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    completed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" />, label: 'Completed' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
    failed: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" />, label: 'Failed' },
    refunded: { color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-3 w-3" />, label: 'Refunded' },
  };
  const { color, icon, label } = config[status] || config.pending;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{icon}{label}</span>;
};

const PaymentMethodBadge: React.FC<{ method: PaymentReceived['paymentMethod'] }> = ({ method }) => {
  const config: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    cash: { icon: <Banknote className="h-3 w-3" />, label: 'Cash', color: 'bg-green-100 text-green-700' },
    bank_transfer: { icon: <Landmark className="h-3 w-3" />, label: 'Bank Transfer', color: 'bg-blue-100 text-blue-700' },
    cheque: { icon: <Receipt className="h-3 w-3" />, label: 'Cheque', color: 'bg-purple-100 text-purple-700' },
    credit_card: { icon: <CreditCard className="h-3 w-3" />, label: 'Credit Card', color: 'bg-indigo-100 text-indigo-700' },
    upi: { icon: <Wallet className="h-3 w-3" />, label: 'UPI', color: 'bg-amber-100 text-amber-700' },
    other: { icon: <Receipt className="h-3 w-3" />, label: 'Other', color: 'bg-gray-100 text-gray-700' },
  };
  const { icon, label, color } = config[method] || config.other;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{icon}{label}</span>;
};

const PaymentMethodIcon: React.FC<{ method: PaymentReceived['paymentMethod'] }> = ({ method }) => {
  const config: Record<string, { icon: React.ReactNode; label: string }> = {
    cash: { icon: <Banknote className="h-5 w-5" />, label: 'Cash' },
    bank_transfer: { icon: <Landmark className="h-5 w-5" />, label: 'Bank Transfer' },
    cheque: { icon: <Receipt className="h-5 w-5" />, label: 'Cheque' },
    credit_card: { icon: <CreditCard className="h-5 w-5" />, label: 'Credit Card' },
    upi: { icon: <Wallet className="h-5 w-5" />, label: 'UPI' },
    other: { icon: <Receipt className="h-5 w-5" />, label: 'Other' },
  };
  const { icon, label } = config[method] || config.other;
  return <span className="inline-flex items-center gap-2 text-gray-600">{icon}{label}</span>;
};

// Generate dummy payment data
const generateDummyPayment = (id: string): PaymentReceived => {
  const dummyPayments: Record<string, PaymentReceived> = {
    '1': {
      id: '1', paymentNumber: 'PAY-2024-001',
      paymentDate: new Date().toISOString().split('T')[0],
      customerId: '1', customerName: 'Rajesh Jewelers',
      customerEmail: 'rajesh@jewelers.com', customerPhone: '+91-98765-43210',
      invoiceId: '1', invoiceNumber: 'INV-000001', amount: 29500,
      paymentMethod: 'bank_transfer', referenceNumber: 'BT-2024-001',
      bankName: 'HDFC Bank', chequeNumber: '', chequeDate: '',
      notes: 'Payment received for invoice INV-000001 via bank transfer',
      status: 'completed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    '2': {
      id: '2', paymentNumber: 'PAY-2024-002',
      paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId: '2', customerName: 'Priya Gold House',
      customerEmail: 'priya@goldhouse.com', customerPhone: '+91-98765-43211',
      invoiceId: '2', invoiceNumber: 'INV-000002', amount: 50445,
      paymentMethod: 'upi', referenceNumber: 'UPI-2024-002',
      bankName: '', chequeNumber: '', chequeDate: '',
      notes: 'Payment received via UPI',
      status: 'completed', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    '3': {
      id: '3', paymentNumber: 'PAY-2024-003',
      paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId: '3', customerName: 'Suresh Gold Mart',
      customerEmail: 'suresh@goldmart.com', customerPhone: '+91-98765-43212',
      invoiceId: '3', invoiceNumber: 'INV-000003', amount: 37760,
      paymentMethod: 'cheque', referenceNumber: 'CHQ-2024-003',
      bankName: 'SBI Bank', chequeNumber: '123456',
      chequeDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Cheque payment received. Pending clearance.',
      status: 'pending', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    '4': {
      id: '4', paymentNumber: 'PAY-2024-004',
      paymentDate: new Date().toISOString().split('T')[0],
      customerId: '4', customerName: 'Meera Jewel World',
      customerEmail: 'meera@jewelworld.com', customerPhone: '+91-98765-43213',
      invoiceId: '4', invoiceNumber: 'INV-000004', amount: 12862,
      paymentMethod: 'cash', referenceNumber: '',
      bankName: '', chequeNumber: '', chequeDate: '',
      notes: 'Cash payment received at store',
      status: 'completed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
  };
  return dummyPayments[id] || dummyPayments['1'];
};

const PaymentReceivedView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPayment, updateStatus, deletePayment, loading: hookLoading } = usePaymentReceived();
  const { success, error: showError, warning, withConfirmation, isOpen: modalOpen, options: modalOptions, isLoading: modalLoading, handleConfirm: onModalConfirm, handleCancel: onModalCancel } = useToastAndConfirm();

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentReceived | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [previewLayout, setPreviewLayout] = useState<'modern' | 'classic' | 'compact' | 'minimal'>('modern');

  useEffect(() => { if (id) loadPayment(id); else { showError('Invalid payment ID'); navigate('/sales/payments-received'); } }, [id]);

  const loadPayment = useCallback(async (paymentId: string) => {
    setLoading(true);
    try {
      const data = await getPayment(paymentId) as PaymentReceived;
      if (data) { setPayment(data); }
      else { const dummyData = generateDummyPayment(paymentId); setPayment(dummyData); warning('Loaded demo data. Some features may be limited.'); }
    } catch { const dummyData = generateDummyPayment(paymentId); setPayment(dummyData); showError('Failed to load payment details. Loading demo data.'); }
    finally { setLoading(false); }
  }, [getPayment, showError, warning]);

const documentData = useMemo((): DocumentData | null => {
  if (!payment) return null;
  return {
    documentNumber: payment.paymentNumber,
    documentDate: new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    referenceNumber: payment.referenceNumber,
    company: {
      name: 'JewelPro Solutions Pvt Ltd',
      address: '123, Gold Street, Zaveri Bazaar',
      city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India',
      phone: '+91 98765 43210', email: 'info@jewelpro.com', gst: '27AABCG1234A1Z5',
    },
    customer: { name: payment.customerName, phone: payment.customerPhone, email: payment.customerEmail },
    items: [], subtotal: 0, totalAmount: payment.amount, notes: payment.notes,
    additionalFields: {
      'Status': payment.status,                    // ADD STATUS
      'Payment Method': payment.paymentMethod.replace('_', ' ').toUpperCase(),
      'Invoice': payment.invoiceNumber || 'N/A',
      'Reference': payment.referenceNumber || 'N/A',
      'Bank': payment.bankName || 'N/A',
      'Cheque': payment.chequeNumber || 'N/A',
    },
  };
}, [payment]);

  const handleStatusUpdate = useCallback(async (status: PaymentReceived['status']) => {
    if (!id) return;
    const labels: Record<string, string> = { completed: 'Complete', pending: 'Mark Pending', failed: 'Mark Failed', refunded: 'Refund' };
    await withConfirmation(
      { title: `${labels[status]} Payment`, message: `${labels[status]} this payment?`, confirmText: labels[status], variant: status === 'failed' || status === 'refunded' ? 'danger' : 'primary' },
      async () => { setUpdating(true); try { await updateStatus(id, status); await loadPayment(id); success(`Payment ${status}.`); } catch { showError('Failed to update.'); } finally { setUpdating(false); } }
    );
  }, [id, withConfirmation, updateStatus, loadPayment, success, showError]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    await withConfirmation(
      { title: 'Delete Payment', message: 'Delete this payment?', confirmText: 'Delete', variant: 'danger' },
      async () => { setDeleteLoading(true); try { await deletePayment(id); success('Deleted.'); navigate('/sales/payments-received'); } catch { showError('Failed to delete.'); } finally { setDeleteLoading(false); } }
    );
  }, [id, withConfirmation, deletePayment, success, showError, navigate]);

  const handleEdit = useCallback(() => { if (id) navigate(`/sales/payments-received/${id}/edit`); }, [id, navigate]);
  const handlePrint = useCallback(() => { setViewMode('preview'); setTimeout(() => window.print(), 300); }, []);
  const handleDownload = useCallback(() => { warning('Coming soon.'); }, [warning]);

  const dropdownItems = [
    { label: 'Print', icon: <Printer className="h-4 w-4 text-gray-500" />, onClick: handlePrint },
    { label: 'Download', icon: <Download className="h-4 w-4 text-blue-500" />, onClick: handleDownload },
    { label: 'Edit', icon: <Edit className="h-4 w-4 text-amber-500" />, onClick: handleEdit, show: payment?.status === 'pending' },
    { label: 'Delete', icon: deleteLoading ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4 text-red-500" />, onClick: handleDelete, show: payment?.status === 'pending', disabled: deleteLoading },
    { label: 'Complete', icon: <CheckCircle className="h-4 w-4 text-green-500" />, onClick: () => handleStatusUpdate('completed'), show: payment?.status === 'pending', disabled: updating },
    { label: 'Mark Failed', icon: <XCircle className="h-4 w-4 text-red-500" />, onClick: () => handleStatusUpdate('failed'), show: payment?.status === 'pending', disabled: updating },
  ];

  if (loading || hookLoading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" /></div>;
  if (!payment) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Not found</p><button onClick={() => navigate('/sales/payments-received')} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Back</button></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/sales/payments-received')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-600" /></button>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-500" />
              <div>
                <div className="flex items-center gap-2"><h1 className="text-lg font-bold text-gray-900">{payment.paymentNumber}</h1><StatusBadge status={payment.status} /></div>
                <p className="text-[11px] text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()} | {payment.customerName} | {formatCurrency(payment.amount)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('details')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><FileTextIcon className="h-3.5 w-3.5" />Details</button>
              <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Eye className="h-3.5 w-3.5" />PDF View</button>
            </div>
            {payment.status === 'pending' && (
              <>
                <button onClick={() => handleStatusUpdate('completed')} className="px-3 py-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />Complete</button>
                <button onClick={handleEdit} className="px-3 py-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1"><Edit className="h-3.5 w-3.5" />Edit</button>
              </>
            )}
            <div onClick={(e) => e.stopPropagation()}><ThreeDotDropdown items={dropdownItems.filter(i => i.show !== false)} position="right" /></div>
          </div>
        </div>
        {viewMode === 'preview' && (
          <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 p-0.5">
              {(['modern', 'classic', 'compact', 'minimal'] as const).map(layout => (
                <button key={layout} onClick={() => setPreviewLayout(layout)} className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors capitalize ${previewLayout === layout ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>{layout}</button>
              ))}
            </div>
            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium text-white bg-amber-500 rounded hover:bg-amber-600"><Printer className="h-3 w-3" />Print</button>
          </div>
        )}
      </div>

      <div className="p-4">
        {viewMode === 'details' ? (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 bg-gradient-to-r from-green-50 to-white">
              <div className="flex justify-between items-start">
                <div><h2 className="text-xl font-bold text-gray-900">{payment.paymentNumber}</h2><p className="text-sm text-gray-500 mt-1"><Calendar className="h-4 w-4 inline mr-1" />Date: {new Date(payment.paymentDate).toLocaleDateString()}</p>{payment.invoiceNumber && <p className="text-sm text-gray-500"><FileText className="h-4 w-4 inline mr-1" />Invoice: {payment.invoiceNumber}</p>}</div>
                <div className="text-right"><p className="text-sm text-gray-500">Amount</p><p className="text-2xl font-bold text-amber-600">{formatCurrency(payment.amount)}</p><PaymentMethodBadge method={payment.paymentMethod} /></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2"><User className="h-4 w-4 text-amber-500" />Customer</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="font-medium text-gray-900">{payment.customerName}</p><p className="text-gray-600 flex items-center gap-1 mt-1"><Mail className="h-3.5 w-3.5" />{payment.customerEmail}</p><p className="text-gray-600 flex items-center gap-1 mt-1"><Phone className="h-3.5 w-3.5" />{payment.customerPhone}</p></div>
                <div><p className="text-gray-600 flex items-center gap-1"><Receipt className="h-4 w-4" /><PaymentMethodIcon method={payment.paymentMethod} /></p>{payment.referenceNumber && <p className="text-gray-600 mt-1"><Hash className="h-4 w-4 inline" /> Ref: {payment.referenceNumber}</p>}{payment.bankName && <p className="text-gray-600 mt-1"><Building2 className="h-4 w-4 inline" /> Bank: {payment.bankName}</p>}{payment.chequeNumber && <p className="text-gray-600 mt-1">Cheque: {payment.chequeNumber}</p>}</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Payment Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200"><p className="text-xs text-gray-500">Payment #</p><p className="font-medium">{payment.paymentNumber}</p></div>
                <div className="bg-white p-3 rounded-lg border border-gray-200"><p className="text-xs text-gray-500">Amount</p><p className="font-medium text-amber-600">{formatCurrency(payment.amount)}</p></div>
                <div className="bg-white p-3 rounded-lg border border-gray-200"><p className="text-xs text-gray-500">Status</p><StatusBadge status={payment.status} /></div>
              </div>
            </div>
            {payment.notes && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">{payment.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer data={documentData} layout={previewLayout} config={{ documentType: 'payment_received', showCompanyLogo: true, showSignature: true, showTerms: true }} />
            )}
          </div>
        )}
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default PaymentReceivedView;