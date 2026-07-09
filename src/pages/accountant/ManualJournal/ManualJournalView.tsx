// src/pages/accountant/ManualJournal/ManualJournalView.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash, BookOpen, CheckCircle, Clock,
  AlertCircle, XCircle, DollarSign, FileText, User, Calendar,
  Hash, Printer, Download, Eye, FileText as FileTextIcon,
} from 'lucide-react';
import { useManualJournal } from '../../../hooks/ManualJournal/useManualJournal';
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
    posted: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Posted' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
  };
  const cfg = config[status] || { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = cfg;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}><Icon className="h-3 w-3" />{label}</span>;
};

const ManualJournalView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getJournalById, deleteJournal } = useManualJournal();
  const [journal, setJournal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [previewLayout, setPreviewLayout] = useState<'modern' | 'classic' | 'compact' | 'minimal'>('modern');

  const { success, error: showError, warning, withConfirmation, withLoading, isOpen: modalOpen, options: modalOptions, isLoading: modalLoading, handleConfirm: onModalConfirm, handleCancel: onModalCancel } = useToastAndConfirm();

  useEffect(() => { if (id) loadJournal(id); else { showError('Invalid ID'); navigate('/accountant/manual-journals'); } }, [id]);

  const loadJournal = async (journalId: string) => {
    setLoading(true);
    try { const data = await getJournalById(journalId); if (data) setJournal(data); else setError('Not found'); }
    catch { setError('Error loading'); }
    finally { setLoading(false); }
  };

  const isBalanced = () => journal?.totalDebit === journal?.totalCredit && journal?.totalDebit > 0;
  const getEntryCount = () => journal?.entries?.length || 0;


const documentData = useMemo((): DocumentData | null => {
  if (!journal) return null;
  // Map entries: debit entries first, then credit entries
  const items = (journal.entries || []).map((entry: any) => ({
    name: entry.accountName,
    description: entry.description || entry.accountCode || '',
    quantity: 1,
    unit: '',
    rate: entry.debitAmount > 0 ? entry.debitAmount : entry.creditAmount,
    total: entry.debitAmount > 0 ? entry.debitAmount : entry.creditAmount,
    taxRate: 0,
    isDebit: entry.debitAmount > 0,  // Flag to identify debit vs credit
  }));
  
  return {
    documentNumber: journal.journalNumber,
    documentDate: new Date(journal.journalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    referenceNumber: journal.referenceNumber,
    company: {
      name: 'JewelPro Solutions Pvt Ltd', address: '123, Gold Street, Zaveri Bazaar',
      city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India',
      phone: '+91 98765 43210', email: 'info@jewelpro.com', gst: '27AABCG1234A1Z5',
    },
    items,
    subtotal: journal.totalDebit,
    totalAmount: journal.totalDebit,
    notes: journal.notes,
    additionalFields: {
      'Description': journal.description || 'N/A',
      'Total Debit': formatCurrency(journal.totalDebit),
      'Total Credit': formatCurrency(journal.totalCredit),
      'Balanced': isBalanced() ? 'Yes' : 'No',
    },
  };
}, [journal]);

  const handleDelete = async () => {
    if (!id) return;
    await withConfirmation(
      { title: 'Delete', message: `Delete "${journal?.journalNumber}"?`, confirmText: 'Delete', variant: 'danger' },
      async () => { await withLoading(async () => { await deleteJournal(id); navigate('/accountant/manual-journals'); }, 'Deleting...', 'Deleted.', 'Failed to delete.'); }
    );
  };

  const handleEdit = () => { if (id) navigate(`/accountant/manual-journals/${id}/edit`); };
  const handlePrint = () => { setViewMode('preview'); setTimeout(() => window.print(), 300); };
  const handleDownload = () => { warning('Coming soon.'); };

  const dropdownItems = [
    { label: 'Print', icon: <Printer className="h-4 w-4 text-gray-500" />, onClick: handlePrint },
    { label: 'Download', icon: <Download className="h-4 w-4 text-blue-500" />, onClick: handleDownload },
    { label: 'Edit', icon: <Edit className="h-4 w-4 text-amber-500" />, onClick: handleEdit, show: journal?.status === 'draft' || journal?.status === 'pending' },
    { label: 'Delete', icon: <Trash className="h-4 w-4 text-red-500" />, onClick: handleDelete, show: journal?.status === 'draft' || journal?.status === 'pending', danger: true },
  ];

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" text="Loading..." /></div>;
  if (error || !journal) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{error || 'Not found'}</p><button onClick={() => navigate('/accountant/manual-journals')} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Back</button></div></div>;

  const balanced = isBalanced();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/accountant/manual-journals')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-600" /></button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <div>
                <div className="flex items-center gap-2"><h1 className="text-lg font-bold text-gray-900">{journal.journalNumber}</h1><StatusBadge status={journal.status} /></div>
                <p className="text-[11px] text-gray-500">{new Date(journal.journalDate).toLocaleDateString()} | {getEntryCount()} entries | {balanced ? 'Balanced' : 'Unbalanced'}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('details')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><FileTextIcon className="h-3.5 w-3.5" />Details</button>
              <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Eye className="h-3.5 w-3.5" />PDF View</button>
            </div>
            {(journal.status === 'draft' || journal.status === 'pending') && (
              <button onClick={handleEdit} className="px-3 py-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1"><Edit className="h-3.5 w-3.5" />Edit</button>
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
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={journal.status} />
              <span className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${balanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}><CheckCircle className="h-3 w-3" />{balanced ? 'Balanced' : 'Unbalanced'}</span>
              <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 flex items-center gap-1"><FileText className="h-3 w-3" />{getEntryCount()} Entries</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold uppercase mb-3"><FileText className="h-4 w-4 inline mr-1" />Journal Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="font-medium">{journal.description}</p></div>
                    <div><Calendar className="h-4 w-4 inline" /> {new Date(journal.journalDate).toLocaleDateString()}</div>
                    <div>{journal.referenceNumber && <span>Ref: {journal.referenceNumber}</span>}</div>
                    <div><StatusBadge status={journal.status} /></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold uppercase mb-3">Entries</h3>
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Account</th><th className="px-3 py-2 text-left">Desc</th><th className="px-3 py-2 text-right text-red-600">Debit</th><th className="px-3 py-2 text-right text-green-600">Credit</th></tr></thead>
                    <tbody className="divide-y">
                      {journal.entries.map((entry: any, i: number) => (
                        <tr key={i}><td className="px-3 py-2 font-medium">{entry.accountName}<span className="text-gray-400 ml-1">{entry.accountCode}</span></td><td className="px-3 py-2 text-gray-500">{entry.description || '-'}</td><td className="px-3 py-2 text-right text-red-600">{entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '-'}</td><td className="px-3 py-2 text-right text-green-600">{entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : '-'}</td></tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50"><tr><td colSpan={2} className="px-3 py-2 text-right font-bold">Totals</td><td className="px-3 py-2 text-right font-bold text-red-600">{formatCurrency(journal.totalDebit)}</td><td className="px-3 py-2 text-right font-bold text-green-600">{formatCurrency(journal.totalCredit)}</td></tr></tfoot>
                  </table>
                </div>
                {journal.notes && <div className="bg-white rounded-lg border p-5"><h4 className="text-xs font-semibold uppercase mb-1">Notes</h4><p className="text-sm text-gray-600">{journal.notes}</p></div>}
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg border p-5">
                  <h4 className="text-xs font-semibold uppercase mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Journal #</span><span className="font-medium">{journal.journalNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={journal.status} /></div>
                    <div className="flex justify-between"><span className="text-gray-500">Debit</span><span className="font-bold text-red-600">{formatCurrency(journal.totalDebit)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Credit</span><span className="font-bold text-green-600">{formatCurrency(journal.totalCredit)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Entries</span><span>{getEntryCount()}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer data={documentData} layout={previewLayout} config={{ documentType: 'manual_journal' as any, showCompanyLogo: true, showSignature: true, showTerms: false }} />
            )}
          </div>
        )}
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default ManualJournalView;