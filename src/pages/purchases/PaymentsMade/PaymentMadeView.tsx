// src/pages/purchases/PaymentsMade/PaymentMadeView.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash, DollarSign, Building2, Calendar,
  CreditCard, FileText, CheckCircle, Clock, AlertCircle, XCircle,
  Mail, Phone, Banknote, Hash, Printer, Download, Eye,
  FileText as FileTextIcon,
} from 'lucide-react';
import { usePaymentMade } from '../../../hooks/PaymentMade/usePaymentMade';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { DocumentRenderer } from '../../../Templates/DocumentRenderer';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { DocumentData } from '../../../types/Template/TemplateTypes';

type ViewMode = 'details' | 'preview';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
    failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
    cancelled: { color: 'bg-gray-100 text-gray-500', icon: XCircle, label: 'Cancelled' },
  };
  const cfg = config[status] || { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = cfg;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}><Icon className="h-3 w-3" />{label}</span>;
};

const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = { cash: 'Cash', bank: 'Bank Transfer', credit_card: 'Credit Card', cheque: 'Cheque', auto_debit: 'Auto Debit' };
  return labels[method] || method;
};

const PaymentMadeView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPaymentById, deletePayment } = usePaymentMade();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [previewLayout, setPreviewLayout] = useState<'modern' | 'classic' | 'compact' | 'minimal'>('modern');

  const { success, error: showError, warning, withConfirmation, withLoading, isOpen: modalOpen, options: modalOptions, isLoading: modalLoading, handleConfirm: onModalConfirm, handleCancel: onModalCancel } = useToastAndConfirm();

  useEffect(() => { if (id) loadPayment(id); else { showError('Invalid ID'); navigate('/purchases/payments-made'); } }, [id]);

  const loadPayment = async (paymentId: string) => {
    setLoading(true);
    try {
      const data = await getPaymentById(paymentId);
      if (data) setPayment(data);
      else { setError('Not found'); showError('Payment not found'); }
    } catch { setError('Error loading'); showError('Failed to load.'); }
    finally { setLoading(false); }
  };


const documentData = useMemo((): DocumentData | null => {
  if (!payment) return null;
  return {
    documentNumber: payment.paymentNumber,
    documentDate: new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    referenceNumber: payment.referenceNumber,
    company: {
      name: 'JewelPro Solutions Pvt Ltd', address: '123, Gold Street, Zaveri Bazaar',
      city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India',
      phone: '+91 98765 43210', email: 'info@jewelpro.com', gst: '27AABCG1234A1Z5',
    },
    vendor: { name: payment.vendorName || 'N/A', phone: payment.vendorPhone, email: payment.vendorEmail },
    items: [], subtotal: 0, totalAmount: payment.amount, notes: payment.notes,
    additionalFields: {
      'Status': payment.status,  // ← ADD THIS LINE HERE
      'Payment Method': getPaymentMethodLabel(payment.paymentMethod),
      'Bill': payment.billNumber || 'N/A',
      'Reference': payment.referenceNumber || 'N/A',
      'Bank': payment.bankName || 'N/A',
      'Cheque': payment.chequeNumber || 'N/A',
    },
  };
}, [payment]);

  const handleDelete = async () => {
    if (!id) return;
    await withConfirmation(
      { title: 'Delete', message: `Delete "${payment?.paymentNumber}"?`, confirmText: 'Delete', variant: 'danger' },
      async () => { await withLoading(async () => { await deletePayment(id); navigate('/purchases/payments-made'); }, 'Deleting...', 'Deleted.', 'Failed to delete.'); }
    );
  };

  const handleEdit = () => { if (id) navigate(`/purchases/payments-made/${id}/edit`); };
  const handlePrint = () => { setViewMode('preview'); setTimeout(() => window.print(), 300); };
  const handleDownload = () => { warning('Coming soon.'); };

  const dropdownItems = [
    { label: 'Print', icon: <Printer className="h-4 w-4 text-gray-500" />, onClick: handlePrint },
    { label: 'Download', icon: <Download className="h-4 w-4 text-blue-500" />, onClick: handleDownload },
    { label: 'Edit', icon: <Edit className="h-4 w-4 text-amber-500" />, onClick: handleEdit },
    { label: 'Delete', icon: <Trash className="h-4 w-4 text-red-500" />, onClick: handleDelete, danger: true },
  ];

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" text="Loading..." /></div>;
  if (error || !payment) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{error || 'Not found'}</p><button onClick={() => navigate('/purchases/payments-made')} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Back</button></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/purchases/payments-made')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-600" /></button>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <div className="flex items-center gap-2"><h1 className="text-lg font-bold text-gray-900">{payment.paymentNumber}</h1><StatusBadge status={payment.status} /></div>
                <p className="text-[11px] text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()} | {payment.vendorName} | {formatCurrency(payment.amount)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('details')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><FileTextIcon className="h-3.5 w-3.5" />Details</button>
              <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Eye className="h-3.5 w-3.5" />PDF View</button>
            </div>
            <button onClick={handleEdit} className="px-3 py-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1"><Edit className="h-3.5 w-3.5" />Edit</button>
            <div onClick={(e) => e.stopPropagation()}><ThreeDotDropdown items={dropdownItems} position="right" /></div>
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
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={payment.status} />
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"><CreditCard className="h-3 w-3" />{getPaymentMethodLabel(payment.paymentMethod)}</span>
              {payment.referenceNumber && <span className="px-3 py-1 text-sm rounded-full bg-gray-100 flex items-center gap-1"><Hash className="h-3 w-3" />Ref: {payment.referenceNumber}</span>}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold uppercase mb-3"><Building2 className="h-4 w-4 inline mr-1" />Vendor</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="font-medium">{payment.vendorName}</p><p className="text-gray-500"><Mail className="h-3.5 w-3.5 inline" /> {payment.vendorEmail || 'N/A'}</p></div>
                    <div>{payment.billNumber && <p className="text-gray-500"><FileText className="h-3.5 w-3.5 inline" /> Bill: {payment.billNumber}</p>}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold uppercase mb-3"><CreditCard className="h-4 w-4 inline mr-1" />Payment</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-2xl font-bold text-amber-600">{formatCurrency(payment.amount)}</p></div>
                    <div><span className="text-gray-500">Date:</span> {new Date(payment.paymentDate).toLocaleDateString()}</div>
                    <div><span className="text-gray-500">Method:</span> {getPaymentMethodLabel(payment.paymentMethod)}</div>
                    <div><span className="text-gray-500">Status:</span> <StatusBadge status={payment.status} /></div>
                  </div>
                  {(payment.bankName || payment.bankAccount || payment.chequeNumber) && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-xs font-semibold mb-2">Bank Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {payment.bankName && <div><span className="text-gray-500">Bank:</span> {payment.bankName}</div>}
                        {payment.bankAccount && <div><span className="text-gray-500">Account:</span> {payment.bankAccount}</div>}
                        {payment.chequeNumber && <div><span className="text-gray-500">Cheque:</span> {payment.chequeNumber}</div>}
                      </div>
                    </div>
                  )}
                </div>
                {payment.notes && <div className="bg-white rounded-lg border p-5"><h4 className="text-xs font-semibold uppercase mb-1">Notes</h4><p className="text-sm text-gray-600">{payment.notes}</p></div>}
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-5">
                  <h4 className="text-xs font-semibold uppercase mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Payment #</span><span className="font-medium">{payment.paymentNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-amber-600">{formatCurrency(payment.amount)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={payment.status} /></div>
                    <div className="flex justify-between"><span className="text-gray-500">Created</span><span>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer data={documentData} layout={previewLayout} config={{ documentType: 'payment_made', showCompanyLogo: true, showSignature: true, showTerms: true }} />
            )}
          </div>
        )}
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default PaymentMadeView;