// src/pages/sales/CreditNotes/CreditNoteView.tsx

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
  FileText,
  Send,
  Calendar,
  User,
  Eye,
  FileText as FileTextIcon,
} from 'lucide-react';
import { useCreditNote } from '../../../hooks/CreditNote/useCreditNote';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { DocumentRenderer } from '../../../Templates/DocumentRenderer';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { CreditNote } from '../../../types/creditNote/CreditNoteTypes';
import type { DocumentData } from '../../../types/Template/TemplateTypes';

type ViewMode = 'details' | 'preview';

const StatusBadge: React.FC<{ status: CreditNote['status'] }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3 w-3" />, label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700', icon: <Send className="h-3 w-3" />, label: 'Sent' },
    approved: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" />, label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" />, label: 'Rejected' },
  };
  const { color, icon, label } = config[status] || config.draft;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{icon}{label}</span>;
};

const generateDummyCreditNote = (id: string): CreditNote => {
  const dummy: Record<string, CreditNote> = {
    '1': { id: '1', creditNoteNumber: 'CN-2024-001', creditNoteDate: new Date().toISOString().split('T')[0], customerId: '1', customerName: 'Rajesh Jewelers', customerEmail: 'rajesh@jewelers.com', customerPhone: '+91-98765-43210', customerGst: '22AAAAA0000A1Z5', invoiceId: '1', invoiceNumber: 'INV-000001', items: [{ id: 'item1', creditNoteId: '1', itemName: 'Gold Chain', description: '22K Gold Chain with pendant', quantity: 1, unit: 'Pcs', rate: 4500, discount: 0, taxRate: 18, taxAmount: 810, total: 5310, purity: '22K', weight: 5.5, makingCharges: 400 }], subtotal: 4500, taxRate: 18, taxAmount: 810, discount: 0, discountType: 'percentage', total: 5310, reason: 'Product damaged during shipping', status: 'approved', notes: 'Customer returned damaged item', createdBy: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    '2': { id: '2', creditNoteNumber: 'CN-2024-002', creditNoteDate: new Date(Date.now()-5*86400000).toISOString().split('T')[0], customerId: '2', customerName: 'Priya Gold House', customerEmail: 'priya@goldhouse.com', customerPhone: '+91-98765-43211', customerGst: '22BBBBB0000B1Z5', invoiceId: '2', invoiceNumber: 'INV-000002', items: [{ id: 'item2', creditNoteId: '2', itemName: 'Gold Earrings', description: '22K Gold Earrings', quantity: 2, unit: 'Pcs', rate: 3200, discount: 0, taxRate: 18, taxAmount: 1152, total: 7552, purity: '22K', weight: 6.8, makingCharges: 400 }], subtotal: 6400, taxRate: 18, taxAmount: 1152, discount: 0, discountType: 'percentage', total: 7552, reason: 'Quality issue', status: 'sent', notes: 'Customer complained', createdBy: 'admin', createdAt: new Date(Date.now()-5*86400000).toISOString(), updatedAt: new Date(Date.now()-5*86400000).toISOString() },
    '3': { id: '3', creditNoteNumber: 'CN-2024-003', creditNoteDate: new Date(Date.now()-10*86400000).toISOString().split('T')[0], customerId: '3', customerName: 'Suresh Gold Mart', customerEmail: 'suresh@goldmart.com', customerPhone: '+91-98765-43212', customerGst: '22CCCCC0000C1Z5', invoiceId: '3', invoiceNumber: 'INV-000003', items: [{ id: 'item3', creditNoteId: '3', itemName: 'Gold Bracelet', description: '22K Gold Bracelet', quantity: 1, unit: 'Pcs', rate: 3800, discount: 0, taxRate: 18, taxAmount: 684, total: 4484, purity: '22K', weight: 5.2, makingCharges: 700 }], subtotal: 3800, taxRate: 18, taxAmount: 684, discount: 0, discountType: 'percentage', total: 4484, reason: 'Cancellation', status: 'draft', notes: 'Pending approval', createdBy: 'admin', createdAt: new Date(Date.now()-10*86400000).toISOString(), updatedAt: new Date(Date.now()-10*86400000).toISOString() },
    '4': { id: '4', creditNoteNumber: 'CN-2024-004', creditNoteDate: new Date().toISOString().split('T')[0], customerId: '4', customerName: 'Meera Jewel World', customerEmail: 'meera@jewelworld.com', customerPhone: '+91-98765-43213', customerGst: '22DDDDD0000D1Z5', invoiceId: '4', invoiceNumber: 'INV-000004', items: [{ id: 'item4', creditNoteId: '4', itemName: 'Diamond Ring', description: '18K Diamond Ring', quantity: 1, unit: 'Pcs', rate: 8500, discount: 0, taxRate: 18, taxAmount: 1530, total: 10030, purity: '18K', weight: 3.2, makingCharges: 800 }], subtotal: 8500, taxRate: 18, taxAmount: 1530, discount: 0, discountType: 'percentage', total: 10030, reason: 'Wrong item', status: 'approved', notes: 'Replacement sent', createdBy: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  };
  return dummy[id] || dummy['1'];
};

const CreditNoteView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCreditNote, updateStatus, deleteCreditNote, loading: hookLoading } = useCreditNote();
  const { success, error: showError, warning, withConfirmation, isOpen: modalOpen, options: modalOptions, isLoading: modalLoading, handleConfirm: onModalConfirm, handleCancel: onModalCancel } = useToastAndConfirm();

  const [loading, setLoading] = useState(true);
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [previewLayout, setPreviewLayout] = useState<'modern' | 'classic' | 'compact' | 'minimal'>('modern');

  useEffect(() => { if (id) loadCreditNote(id); else { showError('Invalid ID'); navigate('/sales/credit-notes'); } }, [id]);

  const loadCreditNote = useCallback(async (creditNoteId: string) => {
    setLoading(true);
    try {
      const data = await getCreditNote(creditNoteId) as CreditNote;
      if (data) setCreditNote(data);
      else { setCreditNote(generateDummyCreditNote(creditNoteId)); warning('Loaded demo data.'); }
    } catch { setCreditNote(generateDummyCreditNote(creditNoteId)); showError('Failed to load. Loading demo data.'); }
    finally { setLoading(false); }
  }, [getCreditNote, showError, warning]);

  const documentData = useMemo((): DocumentData | null => {
    if (!creditNote) return null;
    return {
      documentNumber: creditNote.creditNoteNumber,
      documentDate: new Date(creditNote.creditNoteDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      company: {
        name: 'JewelPro Solutions Pvt Ltd', address: '123, Gold Street, Zaveri Bazaar',
        city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India',
        phone: '+91 98765 43210', email: 'info@jewelpro.com', gst: '27AABCG1234A1Z5',
      },
      customer: { name: creditNote.customerName, phone: creditNote.customerPhone, email: creditNote.customerEmail, gst: creditNote.customerGst },
      items: (creditNote.items || []).map(item => ({ name: item.itemName, description: item.description || '', quantity: item.quantity, unit: item.unit || 'Pcs', rate: item.rate, discount: item.discount, taxRate: item.taxRate, total: item.total })),
      subtotal: creditNote.subtotal, discountTotal: creditNote.discount, taxTotal: creditNote.taxAmount, totalAmount: creditNote.total,
      notes: creditNote.notes, terms: creditNote.reason,
      additionalFields: { 'Invoice': creditNote.invoiceNumber || 'N/A', 'Reason': creditNote.reason || 'N/A' },
    };
  }, [creditNote]);

  const handleStatusUpdate = useCallback(async (status: CreditNote['status']) => {
    if (!id) return;
    const labels: Record<string, string> = { draft: 'Revert', sent: 'Send', approved: 'Approve', rejected: 'Reject' };
    await withConfirmation(
      { title: `${labels[status]} Credit Note`, message: `${labels[status]} this credit note?`, confirmText: labels[status], variant: status === 'rejected' ? 'danger' : 'primary' },
      async () => { setUpdating(true); try { await updateStatus(id, status); await loadCreditNote(id); success(`Credit note ${status}.`); } catch { showError('Failed to update.'); } finally { setUpdating(false); } }
    );
  }, [id, withConfirmation, updateStatus, loadCreditNote, success, showError]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    await withConfirmation(
      { title: 'Delete', message: 'Delete this credit note?', confirmText: 'Delete', variant: 'danger' },
      async () => { setDeleteLoading(true); try { await deleteCreditNote(id); success('Deleted.'); navigate('/sales/credit-notes'); } catch { showError('Failed to delete.'); } finally { setDeleteLoading(false); } }
    );
  }, [id, withConfirmation, deleteCreditNote, success, showError, navigate]);

  const handleEdit = useCallback(() => { if (id) navigate(`/sales/credit-notes/${id}/edit`); }, [id, navigate]);
  const handlePrint = useCallback(() => { setViewMode('preview'); setTimeout(() => window.print(), 300); }, []);
  const handleDownload = useCallback(() => { warning('Coming soon.'); }, [warning]);

  const dropdownItems = [
    { label: 'Print', icon: <Printer className="h-4 w-4 text-gray-500" />, onClick: handlePrint },
    { label: 'Download', icon: <Download className="h-4 w-4 text-blue-500" />, onClick: handleDownload },
    { label: 'Edit', icon: <Edit className="h-4 w-4 text-amber-500" />, onClick: handleEdit, show: creditNote?.status === 'draft' },
    { label: 'Delete', icon: deleteLoading ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4 text-red-500" />, onClick: handleDelete, show: creditNote?.status === 'draft', disabled: deleteLoading },
    { label: 'Send', icon: <Send className="h-4 w-4 text-blue-500" />, onClick: () => handleStatusUpdate('sent'), show: creditNote?.status === 'draft', disabled: updating },
    { label: 'Approve', icon: <CheckCircle className="h-4 w-4 text-green-500" />, onClick: () => handleStatusUpdate('approved'), show: creditNote?.status === 'sent', disabled: updating },
    { label: 'Reject', icon: <XCircle className="h-4 w-4 text-red-500" />, onClick: () => handleStatusUpdate('rejected'), show: creditNote?.status === 'sent', disabled: updating },
  ];

  if (loading || hookLoading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" /></div>;
  if (!creditNote) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Not found</p><button onClick={() => navigate('/sales/credit-notes')} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Back</button></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/sales/credit-notes')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-600" /></button>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              <div>
                <div className="flex items-center gap-2"><h1 className="text-lg font-bold text-gray-900">{creditNote.creditNoteNumber}</h1><StatusBadge status={creditNote.status} /></div>
                <p className="text-[11px] text-gray-500">{new Date(creditNote.creditNoteDate).toLocaleDateString()} | {creditNote.customerName} | {formatCurrency(creditNote.total)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('details')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><FileTextIcon className="h-3.5 w-3.5" />Details</button>
              <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Eye className="h-3.5 w-3.5" />PDF View</button>
            </div>
            {creditNote.status === 'draft' && (
              <>
                <button onClick={() => handleStatusUpdate('sent')} className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-1"><Send className="h-3.5 w-3.5" />Send</button>
                <button onClick={handleEdit} className="px-3 py-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1"><Edit className="h-3.5 w-3.5" />Edit</button>
              </>
            )}
            {creditNote.status === 'sent' && (
              <>
                <button onClick={() => handleStatusUpdate('approved')} className="px-3 py-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" />Approve</button>
                <button onClick={() => handleStatusUpdate('rejected')} className="px-3 py-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />Reject</button>
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
            <div className="bg-white rounded-lg border border-gray-200 p-5 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex justify-between items-start">
                <div><h2 className="text-xl font-bold text-gray-900">{creditNote.creditNoteNumber}</h2><p className="text-sm text-gray-500 mt-1"><Calendar className="h-4 w-4 inline mr-1" />Date: {new Date(creditNote.creditNoteDate).toLocaleDateString()}</p>{creditNote.invoiceNumber && <p className="text-sm text-gray-500"><FileText className="h-4 w-4 inline mr-1" />Invoice: {creditNote.invoiceNumber}</p>}</div>
                <div className="text-right"><p className="text-sm text-gray-500">Amount</p><p className="text-2xl font-bold text-amber-600">{formatCurrency(creditNote.total)}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3"><User className="h-4 w-4 text-amber-500 inline mr-1" />Customer</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="font-medium text-gray-900">{creditNote.customerName}</p><p className="text-gray-600 flex items-center gap-1 mt-1"><Mail className="h-3.5 w-3.5" />{creditNote.customerEmail}</p><p className="text-gray-600 flex items-center gap-1 mt-1"><Phone className="h-3.5 w-3.5" />{creditNote.customerPhone}</p></div>
                <div>{creditNote.customerGst && <p className="text-gray-600"><Building2 className="h-4 w-4 inline" /> GST: {creditNote.customerGst}</p>}</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5 bg-yellow-50">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"><FileText className="h-4 w-4 text-yellow-600 inline mr-1" />Reason</h3>
              <p className="text-sm font-medium text-gray-900">{creditNote.reason}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Items ({creditNote.items?.length || 0})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500">Item</th><th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">Qty</th><th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">Rate</th><th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">Tax</th><th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">Total</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {creditNote.items.map((item, i) => (
                      <tr key={i}><td className="px-3 py-2"><p className="font-medium text-gray-900">{item.itemName}</p><p className="text-[10px] text-gray-400">{item.description}</p></td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(item.rate)}</td><td className="px-3 py-2 text-right">{item.taxRate}%</td><td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex justify-end"><div className="w-72 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(creditNote.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCurrency(creditNote.taxAmount)}</span></div>
                {creditNote.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-{formatCurrency(creditNote.discount)}</span></div>}
                <div className="border-t pt-2 flex justify-between text-base font-bold"><span>Total</span><span className="text-amber-600">{formatCurrency(creditNote.total)}</span></div>
              </div></div>
            </div>
            {creditNote.notes && (
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h4 className="text-xs font-semibold text-gray-700 uppercase mb-1">Notes</h4>
                <p className="text-sm text-gray-600">{creditNote.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer data={documentData} layout={previewLayout} config={{ documentType: 'credit_note', showCompanyLogo: true, showSignature: true, showTerms: true }} />
            )}
          </div>
        )}
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default CreditNoteView;