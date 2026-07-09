// src/pages/purchases/Bills/BillView.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash, DollarSign, Building2, Calendar,
  FileText, CheckCircle, Clock, AlertCircle, XCircle, Package,
  Mail, Phone, MapPin, CreditCard, Printer, Download, Eye,
  FileText as FileTextIcon,
} from 'lucide-react';
import { useBills } from '../../../hooks/Bill/useBills';
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
    paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
    partial: { color: 'bg-purple-100 text-purple-700', icon: Clock, label: 'Partial' },
    overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Overdue' },
    cancelled: { color: 'bg-gray-100 text-gray-500', icon: XCircle, label: 'Cancelled' },
  };
  const cfg = config[status] || { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = cfg;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}><Icon className="h-3 w-3" />{label}</span>;
};

const BillView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getBillById, deleteBill } = useBills();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [previewLayout, setPreviewLayout] = useState<'modern' | 'classic' | 'compact' | 'minimal'>('modern');

  const { success, error: showError, warning, withConfirmation, withLoading, isOpen: modalOpen, options: modalOptions, isLoading: modalLoading, handleConfirm: onModalConfirm, handleCancel: onModalCancel } = useToastAndConfirm();

  useEffect(() => { if (id) loadBill(id); else { showError('Invalid ID'); navigate('/purchases/bills'); } }, [id]);

  const loadBill = async (billId: string) => {
    setLoading(true);
    try {
      const data = await getBillById(billId);
      if (data) setBill(data);
      else { setError('Not found'); showError('Bill not found'); }
    } catch { setError('Error loading'); showError('Failed to load.'); }
    finally { setLoading(false); }
  };

  const getItemCount = () => bill?.items?.length || 0;
  const getTotalItems = () => bill?.items?.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0) || 0;

  const documentData = useMemo((): DocumentData | null => {
    if (!bill) return null;
    return {
      documentNumber: bill.billNumber,
      documentDate: new Date(bill.billDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
      company: {
        name: 'JewelPro Solutions Pvt Ltd', address: '123, Gold Street, Zaveri Bazaar',
        city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India',
        phone: '+91 98765 43210', email: 'info@jewelpro.com', gst: '27AABCG1234A1Z5',
      },
      vendor: { name: bill.vendorName || 'N/A', address: bill.vendorAddress, phone: bill.vendorPhone, email: bill.vendorEmail, gst: bill.vendorGST },
      items: (bill.items || []).map((item: any) => ({ name: item.productName, description: item.description || '', quantity: item.quantity, unit: item.unit || 'Pcs', rate: item.rate, discount: item.discount, taxRate: (item.taxAmount / ((item.quantity * item.rate) - (item.discount || 0)) * 100) || 0, total: item.total })),
      subtotal: bill.subtotal, discountTotal: bill.discountTotal, taxTotal: bill.taxTotal,
      shippingCharges: bill.shippingCharges, totalAmount: bill.totalAmount,
      paidAmount: bill.paidAmount, balanceDue: bill.balanceDue,
      notes: bill.notes, terms: bill.terms,
    };
  }, [bill]);

  const handleDelete = async () => {
    if (!id) return;
    await withConfirmation(
      { title: 'Delete', message: `Delete "${bill?.billNumber}"?`, confirmText: 'Delete', variant: 'danger' },
      async () => { await withLoading(async () => { await deleteBill(id); navigate('/purchases/bills'); }, 'Deleting...', 'Deleted.', 'Failed to delete.'); }
    );
  };

  const handleEdit = () => { if (id) navigate(`/purchases/bills/${id}/edit`); };
  const handlePrint = () => { setViewMode('preview'); setTimeout(() => window.print(), 300); };
  const handleDownload = () => { warning('Coming soon.'); };

  const dropdownItems = [
    { label: 'Print', icon: <Printer className="h-4 w-4 text-gray-500" />, onClick: handlePrint },
    { label: 'Download', icon: <Download className="h-4 w-4 text-blue-500" />, onClick: handleDownload },
    { label: 'Edit', icon: <Edit className="h-4 w-4 text-amber-500" />, onClick: handleEdit },
    { label: 'Delete', icon: <Trash className="h-4 w-4 text-red-500" />, onClick: handleDelete, danger: true },
  ];

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" text="Loading..." /></div>;
  if (error || !bill) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{error || 'Not found'}</p><button onClick={() => navigate('/purchases/bills')} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Back</button></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/purchases/bills')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-600" /></button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              <div>
                <div className="flex items-center gap-2"><h1 className="text-lg font-bold text-gray-900">{bill.billNumber}</h1><StatusBadge status={bill.status} /></div>
                <p className="text-[11px] text-gray-500">{new Date(bill.billDate).toLocaleDateString()} | {bill.vendorName} | {formatCurrency(bill.totalAmount)}</p>
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
              <StatusBadge status={bill.status} />
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 flex items-center gap-1"><Package className="h-3 w-3" />{getItemCount()} items ({getTotalItems()} units)</span>
              {bill.dueDate && <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${bill.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}><Calendar className="h-3 w-3" />Due: {new Date(bill.dueDate).toLocaleDateString()}</span>}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3"><Building2 className="h-4 w-4 inline mr-1" />Vendor</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="font-medium">{bill.vendorName}</p><p className="text-gray-500"><Mail className="h-3.5 w-3.5 inline" /> {bill.vendorEmail || 'N/A'}</p><p className="text-gray-500"><Phone className="h-3.5 w-3.5 inline" /> {bill.vendorPhone || 'N/A'}</p></div>
                    <div>{bill.vendorAddress && <p className="text-gray-500"><MapPin className="h-3.5 w-3.5 inline" /> {bill.vendorAddress}</p>}{bill.vendorGST && <p className="text-gray-500 mt-1">GST: {bill.vendorGST}</p>}{bill.purchaseOrderNumber && <p className="text-gray-500">PO: {bill.purchaseOrderNumber}</p>}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold uppercase mb-3">Items</h3>
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Item</th><th className="px-3 py-2 text-right">Qty</th><th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Total</th></tr></thead>
                    <tbody className="divide-y">
                      {bill.items.map((item: any, i: number) => (
                        <tr key={i}><td className="px-3 py-2 font-medium">{item.productName}</td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(item.rate)}</td><td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td></tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="border-t"><td colSpan={3} className="py-2 px-3 text-right font-bold">Total</td><td className="py-2 px-3 text-right font-bold text-amber-600">{formatCurrency(bill.totalAmount)}</td></tr></tfoot>
                  </table>
                </div>
                {bill.paymentDate && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <h3 className="text-xs font-semibold uppercase mb-2"><CreditCard className="h-4 w-4 inline mr-1" />Payment</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm"><div><span className="text-gray-500">Method:</span> {bill.paymentMethod || 'N/A'}</div><div><span className="text-gray-500">Date:</span> {new Date(bill.paymentDate).toLocaleDateString()}</div></div>
                  </div>
                )}
                {bill.notes && <div className="bg-white rounded-lg border border-gray-200 p-5"><h4 className="text-xs font-semibold uppercase mb-1">Notes</h4><p className="text-sm text-gray-600">{bill.notes}</p></div>}
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h4 className="text-xs font-semibold uppercase mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Bill #</span><span className="font-medium">{bill.billNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{new Date(bill.billDate).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={bill.status} /></div>
                    {bill.paidAmount > 0 && <div className="flex justify-between"><span className="text-gray-500">Paid</span><span className="text-green-600">{formatCurrency(bill.paidAmount)}</span></div>}
                    {bill.balanceDue > 0 && <div className="flex justify-between"><span className="text-gray-500">Balance</span><span className="text-red-600">{formatCurrency(bill.balanceDue)}</span></div>}
                    <div className="flex justify-between border-t pt-2"><span className="font-bold">Total</span><span className="font-bold text-amber-600">{formatCurrency(bill.totalAmount)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer data={documentData} layout={previewLayout} config={{ documentType: 'bill', showCompanyLogo: true, showSignature: true, showTerms: true }} />
            )}
          </div>
        )}
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default BillView;