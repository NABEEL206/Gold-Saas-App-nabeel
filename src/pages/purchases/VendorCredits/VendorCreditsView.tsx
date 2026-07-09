// src/pages/purchases/VendorCredits/VendorCreditsView.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash, DollarSign, Building2, Calendar,
  FileText, CheckCircle, Clock, AlertCircle, XCircle, Package,
  Mail, Phone, TrendingDown, Hash, Tag, Printer, Download, Eye,
  FileText as FileTextIcon,
} from 'lucide-react';
import { useVendorCredits } from '../../../hooks/VendorCredits/useVendorCredits';
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
    draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Pending' },
    approved: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Approved' },
    used: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Used' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
    expired: { color: 'bg-gray-100 text-gray-500', icon: AlertCircle, label: 'Expired' },
  };
  const cfg = config[status] || { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = cfg;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}><Icon className="h-3 w-3" />{label}</span>;
};

const ReasonBadge: React.FC<{ reason: string }> = ({ reason }) => {
  const config: Record<string, { color: string; label: string }> = {
    return: { color: 'bg-blue-100 text-blue-700', label: 'Return' },
    discount: { color: 'bg-green-100 text-green-700', label: 'Discount' },
    adjustment: { color: 'bg-purple-100 text-purple-700', label: 'Adjustment' },
    damage: { color: 'bg-red-100 text-red-700', label: 'Damage' },
    other: { color: 'bg-gray-100 text-gray-700', label: 'Other' },
  };
  const { color, label } = config[reason] || config.other;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

const getReasonLabel = (reason: string): string => {
  const labels: Record<string, string> = { return: 'Return', discount: 'Discount', adjustment: 'Adjustment', damage: 'Damage', other: 'Other' };
  return labels[reason] || reason;
};

const VendorCreditsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCreditById, deleteCredit } = useVendorCredits();
  const [credit, setCredit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [previewLayout, setPreviewLayout] = useState<'modern' | 'classic' | 'compact' | 'minimal'>('modern');

  const { success, error: showError, warning, withConfirmation, withLoading, isOpen: modalOpen, options: modalOptions, isLoading: modalLoading, handleConfirm: onModalConfirm, handleCancel: onModalCancel } = useToastAndConfirm();

  useEffect(() => { if (id) loadCredit(id); }, [id]);

  const loadCredit = async (creditId: string) => {
    setLoading(true);
    try { const data = await getCreditById(creditId); if (data) setCredit(data); else setError('Not found'); }
    catch { setError('Error loading'); }
    finally { setLoading(false); }
  };

  const getItemCount = () => credit?.items?.length || 0;
  const getTotalItems = () => credit?.items?.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0) || 0;
  const isExpired = () => credit?.expiryDate && new Date(credit.expiryDate) < new Date();

  const documentData = useMemo((): DocumentData | null => {
    if (!credit) return null;
    return {
      documentNumber: credit.creditNumber,
      documentDate: new Date(credit.creditDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: credit.expiryDate ? new Date(credit.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
      company: {
        name: 'JewelPro Solutions Pvt Ltd', address: '123, Gold Street, Zaveri Bazaar',
        city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India',
        phone: '+91 98765 43210', email: 'info@jewelpro.com', gst: '27AABCG1234A1Z5',
      },
      vendor: { name: credit.vendorName || 'N/A', phone: credit.vendorPhone, email: credit.vendorEmail, gst: credit.vendorGST },
      items: (credit.items || []).map((item: any) => ({ name: item.productName, description: item.description || '', quantity: item.quantity, unit: item.unit || 'Pcs', rate: item.rate, discount: item.discount, taxRate: (item.taxAmount / ((item.quantity * item.rate) - (item.discount || 0)) * 100) || 0, total: item.total })),
      subtotal: credit.amount || credit.subtotal, taxTotal: credit.taxAmount, totalAmount: credit.totalAmount,
      notes: credit.notes,
      additionalFields: { 'Reason': getReasonLabel(credit.reason), 'Bill': credit.billNumber || 'N/A', 'Reference': credit.referenceNumber || 'N/A', 'Used Amount': formatCurrency(credit.usedAmount || 0), 'Balance': formatCurrency(credit.balanceAmount || 0) },
    };
  }, [credit]);

  const handleDelete = async () => {
    if (!id) return;
    await withConfirmation(
      { title: 'Delete', message: `Delete "${credit?.creditNumber}"?`, confirmText: 'Delete', variant: 'danger' },
      async () => { await withLoading(async () => { await deleteCredit(id); navigate('/purchases/vendor-credits'); }, 'Deleting...', 'Deleted.', 'Failed to delete.'); }
    );
  };

  const handleEdit = () => { if (id) navigate(`/purchases/vendor-credits/${id}/edit`); };
  const handlePrint = () => { setViewMode('preview'); setTimeout(() => window.print(), 300); };
  const handleDownload = () => { warning('Coming soon.'); };

  const dropdownItems = [
    { label: 'Print', icon: <Printer className="h-4 w-4 text-gray-500" />, onClick: handlePrint },
    { label: 'Download', icon: <Download className="h-4 w-4 text-blue-500" />, onClick: handleDownload },
    { label: 'Edit', icon: <Edit className="h-4 w-4 text-amber-500" />, onClick: handleEdit },
    { label: 'Delete', icon: <Trash className="h-4 w-4 text-red-500" />, onClick: handleDelete, danger: true },
  ];

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" text="Loading..." /></div>;
  if (error || !credit) return <div className="p-6"><div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">{error || 'Not found'}</div></div>;

  const expired = isExpired();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/purchases/vendor-credits')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-600" /></button>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-500" />
              <div>
                <div className="flex items-center gap-2"><h1 className="text-lg font-bold text-gray-900">{credit.creditNumber}</h1><StatusBadge status={credit.status} /></div>
                <p className="text-[11px] text-gray-500">{new Date(credit.creditDate).toLocaleDateString()} | {credit.vendorName} | {formatCurrency(credit.totalAmount)}</p>
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
              <StatusBadge status={credit.status} />
              <ReasonBadge reason={credit.reason} />
              {expired && <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Expired</span>}
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 flex items-center gap-1"><Package className="h-3 w-3" />{getItemCount()} items</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold uppercase mb-3"><Building2 className="h-4 w-4 inline mr-1" />Vendor</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="font-medium">{credit.vendorName}</p><p className="text-gray-500"><Mail className="h-3.5 w-3.5 inline" /> {credit.vendorEmail || 'N/A'}</p></div>
                    <div>{credit.vendorGST && <p className="text-gray-500">GST: {credit.vendorGST}</p>}{credit.billNumber && <p className="text-gray-500"><FileText className="h-3.5 w-3.5 inline" /> Bill: {credit.billNumber}</p>}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold uppercase mb-3">Items</h3>
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Total</th></tr></thead>
                    <tbody className="divide-y">
                      {credit.items.map((item: any, i: number) => (
                        <tr key={i}><td className="px-3 py-2 font-medium">{item.productName}</td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(item.rate)}</td><td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td></tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="border-t"><td colSpan={3} className="py-2 px-3 text-right font-bold">Total</td><td className="py-2 px-3 text-right font-bold text-amber-600">{formatCurrency(credit.totalAmount)}</td></tr></tfoot>
                  </table>
                </div>
                {credit.notes && <div className="bg-white rounded-lg border p-5"><h4 className="text-xs font-semibold uppercase mb-1">Notes</h4><p className="text-sm text-gray-600">{credit.notes}</p></div>}
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-5">
                  <h4 className="text-xs font-semibold uppercase mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Credit #</span><span className="font-medium">{credit.creditNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{new Date(credit.creditDate).toLocaleDateString()}</span></div>
                    {credit.expiryDate && <div className="flex justify-between"><span className="text-gray-500">Expiry</span><span className={expired ? 'text-red-600' : ''}>{new Date(credit.expiryDate).toLocaleDateString()}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={credit.status} /></div>
                    <div className="flex justify-between"><span className="text-gray-500">Used</span><span className="text-green-600">{formatCurrency(credit.usedAmount || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Balance</span><span className="text-blue-600">{formatCurrency(credit.balanceAmount || 0)}</span></div>
                    <div className="flex justify-between border-t pt-2"><span className="font-bold">Total</span><span className="font-bold text-amber-600">{formatCurrency(credit.totalAmount)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer data={documentData} layout={previewLayout} config={{ documentType: 'vendor_credit', showCompanyLogo: true, showSignature: true, showTerms: true }} />
            )}
          </div>
        )}
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default VendorCreditsView;