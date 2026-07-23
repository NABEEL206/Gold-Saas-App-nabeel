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

// ============================================================
// CONSTANTS - Single source of truth (shared with List page)
// ============================================================

// Default company details - can be moved to a config file
const DEFAULT_COMPANY = {
  name: 'JewelPro Solutions Pvt Ltd',
  address: '123, Gold Street, Zaveri Bazaar',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400002',
  country: 'India',
  phone: '+91 98765 43210',
  email: 'info@jewelpro.com',
  website: 'www.jewelpro.com',
  gst: '27AABCG1234A1Z5',
  pan: 'AABCG1234A',
};

// Status configuration - Single source of truth (shared with List page)
const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  draft: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-secondary)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Draft',
  },
  pending: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Pending',
  },
  posted: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Posted',
  },
  cancelled: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Cancelled',
  },
};

type ViewMode = 'details' | 'preview';

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const { bg, color, icon, label } = config;
  
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium themed-transition"
      style={{
        background: bg,
        color: color,
      }}
    >
      {icon}
      {label}
    </span>
  );
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
    handleCancel: onModalCancel 
  } = useToastAndConfirm();

  useEffect(() => { 
    if (id) loadJournal(id); 
    else { showError('Invalid ID'); navigate('/accountant/manual-journals'); } 
  }, [id]);

  const loadJournal = async (journalId: string) => {
    setLoading(true);
    try { 
      const data = await getJournalById(journalId); 
      if (data) setJournal(data); 
      else setError('Not found'); 
    } catch { 
      setError('Error loading'); 
    } finally { 
      setLoading(false); 
    }
  };

  const isBalanced = () => journal?.totalDebit === journal?.totalCredit && journal?.totalDebit > 0;
  const getEntryCount = () => journal?.entries?.length || 0;

  const documentData = useMemo((): DocumentData | null => {
    if (!journal) return null;
    const items = (journal.entries || []).map((entry: any) => ({
      name: entry.accountName,
      description: entry.description || entry.accountCode || '',
      quantity: 1,
      unit: '',
      rate: entry.debitAmount > 0 ? entry.debitAmount : entry.creditAmount,
      total: entry.debitAmount > 0 ? entry.debitAmount : entry.creditAmount,
      taxRate: 0,
      isDebit: entry.debitAmount > 0,
    }));
    
    return {
      documentNumber: journal.journalNumber,
      documentDate: new Date(journal.journalDate).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      referenceNumber: journal.referenceNumber,
      company: DEFAULT_COMPANY,
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
      { 
        title: 'Delete', 
        message: `Delete "${journal?.journalNumber}"?`, 
        confirmText: 'Delete', 
        variant: 'danger' 
      },
      async () => { 
        await withLoading(
          async () => { 
            await deleteJournal(id); 
            navigate('/accountant/manual-journals'); 
          }, 
          'Deleting...', 
          'Deleted.', 
          'Failed to delete.'
        ); 
      }
    );
  };

  const handleEdit = () => { 
    if (id) navigate(`/accountant/manual-journals/${id}/edit`); 
  };
  
  const handlePrint = () => { 
    setViewMode('preview'); 
    setTimeout(() => window.print(), 300); 
  };
  
  const handleDownload = () => { 
    warning('Coming soon.'); 
  };

  const dropdownItems = [
    { 
      label: 'Print', 
      icon: <Printer className="h-4 w-4" style={{ color: 'var(--foreground-secondary)' }} />, 
      onClick: handlePrint 
    },
    { 
      label: 'Download', 
      icon: <Download className="h-4 w-4" style={{ color: 'var(--info)' }} />, 
      onClick: handleDownload 
    },
    { 
      label: 'Edit', 
      icon: <Edit className="h-4 w-4" style={{ color: 'var(--primary)' }} />, 
      onClick: handleEdit, 
      show: journal?.status === 'draft' || journal?.status === 'pending' 
    },
    { 
      label: 'Delete', 
      icon: <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />, 
      onClick: handleDelete, 
      show: journal?.status === 'draft' || journal?.status === 'pending', 
      danger: true 
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {error || 'Not found'}
          </p>
          <button
            onClick={() => navigate('/accountant/manual-journals')}
            className="mt-4 px-4 py-2 rounded-lg transition-colors themed-transition"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const balanced = isBalanced();

  return (
    <div
      className="min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-30 themed-transition"
        style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/accountant/manual-journals')}
              className="p-1.5 rounded-lg transition-colors themed-transition"
              style={{ color: 'var(--foreground-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-lg font-bold themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {journal.journalNumber}
                  </h1>
                  <StatusBadge status={journal.status} />
                </div>
                <p
                  className="text-[11px] themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  {new Date(journal.journalDate).toLocaleDateString()} | {getEntryCount()} entries | {balanced ? 'Balanced' : 'Unbalanced'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div
              className="flex items-center rounded-lg p-0.5 themed-transition"
              style={{ background: 'var(--surface)' }}
            >
              <button
                onClick={() => setViewMode('details')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all themed-transition ${
                  viewMode === 'details'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  background: viewMode === 'details' ? 'var(--card)' : 'transparent',
                  color: viewMode === 'details' ? 'var(--foreground)' : 'var(--foreground-secondary)',
                  boxShadow: viewMode === 'details' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <FileTextIcon className="h-3.5 w-3.5" />
                Details
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all themed-transition ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  background: viewMode === 'preview' ? 'var(--card)' : 'transparent',
                  color: viewMode === 'preview' ? 'var(--foreground)' : 'var(--foreground-secondary)',
                  boxShadow: viewMode === 'preview' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                PDF View
              </button>
            </div>

            {(journal.status === 'draft' || journal.status === 'pending') && (
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 themed-transition"
                style={{
                  color: 'var(--primary)',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            <div onClick={(e) => e.stopPropagation()}>
              <ThreeDotDropdown items={dropdownItems.filter(i => i.show !== false)} position="right" />
            </div>
          </div>
        </div>

        {/* Preview Mode Layout Selector */}
        {viewMode === 'preview' && (
          <div
            className="px-4 py-1.5 themed-transition flex items-center justify-between"
            style={{
              background: 'var(--surface)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="flex items-center gap-1 rounded-md p-0.5 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              {(['modern', 'classic', 'compact', 'minimal'] as const).map((layout) => (
                <button
                  key={layout}
                  onClick={() => setPreviewLayout(layout)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors capitalize themed-transition ${
                    previewLayout === layout
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{
                    background: previewLayout === layout ? 'var(--primary)' : 'transparent',
                    color: previewLayout === layout ? 'white' : 'var(--foreground-secondary)',
                  }}
                >
                  {layout}
                </button>
              ))}
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded transition-colors themed-transition"
              style={{
                background: 'var(--primary)',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
              }}
            >
              <Printer className="h-3 w-3" />
              Print
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-4">
        {viewMode === 'details' ? (
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Status Badges Row */}
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={journal.status} />
              <span
                className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 themed-transition ${
                  balanced ? 'bg-success-light text-success' : 'bg-error-light text-error'
                }`}
                style={{
                  background: balanced ? 'var(--success-light)' : 'var(--error-light)',
                  color: balanced ? 'var(--success)' : 'var(--error)',
                }}
              >
                <CheckCircle className="h-3 w-3" />
                {balanced ? 'Balanced' : 'Unbalanced'}
              </span>
              <span
                className="px-3 py-1 text-sm rounded-full flex items-center gap-1 themed-transition"
                style={{
                  background: 'var(--info-light)',
                  color: 'var(--info)',
                }}
              >
                <FileText className="h-3 w-3" />
                {getEntryCount()} Entries
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                {/* Journal Details */}
                <div
                  className="rounded-lg p-5 themed-transition"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h3
                    className="text-xs font-semibold uppercase mb-3 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <FileText className="h-4 w-4 inline mr-1" style={{ color: 'var(--gold)' }} />
                    Journal Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p
                        className="font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {journal.description}
                      </p>
                    </div>
                    <div className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      <Calendar className="h-4 w-4 inline" />
                      {new Date(journal.journalDate).toLocaleDateString()}
                    </div>
                    <div className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                      {journal.referenceNumber && <span>Ref: {journal.referenceNumber}</span>}
                    </div>
                    <div>
                      <StatusBadge status={journal.status} />
                    </div>
                  </div>
                </div>

                {/* Entries Table */}
                <div
                  className="rounded-lg p-5 themed-transition"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h3
                    className="text-xs font-semibold uppercase mb-3 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Entries
                  </h3>
                  <table className="w-full text-xs">
                    <thead style={{ background: 'var(--surface)' }}>
                      <tr>
                        <th
                          className="px-3 py-2 text-left themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          Account
                        </th>
                        <th
                          className="px-3 py-2 text-left themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          Desc
                        </th>
                        <th
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--error)' }}
                        >
                          Debit
                        </th>
                        <th
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--success)' }}
                        >
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                      {journal.entries.map((entry: any, i: number) => (
                        <tr key={i}>
                          <td
                            className="px-3 py-2 font-medium themed-transition"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {entry.accountName}
                            <span
                              className="ml-1 themed-transition"
                              style={{ color: 'var(--foreground-tertiary)' }}
                            >
                              {entry.accountCode}
                            </span>
                          </td>
                          <td
                            className="px-3 py-2 themed-transition"
                            style={{ color: 'var(--foreground-secondary)' }}
                          >
                            {entry.description || '-'}
                          </td>
                          <td
                            className="px-3 py-2 text-right themed-transition"
                            style={{ color: 'var(--error)' }}
                          >
                            {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '-'}
                          </td>
                          <td
                            className="px-3 py-2 text-right themed-transition"
                            style={{ color: 'var(--success)' }}
                          >
                            {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ background: 'var(--surface)' }}>
                      <tr>
                        <td
                          colSpan={2}
                          className="px-3 py-2 text-right font-bold themed-transition"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Totals
                        </td>
                        <td
                          className="px-3 py-2 text-right font-bold themed-transition"
                          style={{ color: 'var(--error)' }}
                        >
                          {formatCurrency(journal.totalDebit)}
                        </td>
                        <td
                          className="px-3 py-2 text-right font-bold themed-transition"
                          style={{ color: 'var(--success)' }}
                        >
                          {formatCurrency(journal.totalCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Notes */}
                {journal.notes && (
                  <div
                    className="rounded-lg p-5 themed-transition"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h4
                      className="text-xs font-semibold uppercase mb-1 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      Notes
                    </h4>
                    <p
                      className="text-sm themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      {journal.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Summary Card */}
                <div
                  className="rounded-lg p-5 themed-transition"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h4
                    className="text-xs font-semibold uppercase mb-3 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Journal #
                      </span>
                      <span
                        className="font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {journal.journalNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Status
                      </span>
                      <StatusBadge status={journal.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Debit
                      </span>
                      <span
                        className="font-bold themed-transition"
                        style={{ color: 'var(--error)' }}
                      >
                        {formatCurrency(journal.totalDebit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Credit
                      </span>
                      <span
                        className="font-bold themed-transition"
                        style={{ color: 'var(--success)' }}
                      >
                        {formatCurrency(journal.totalCredit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Entries
                      </span>
                      <span
                        className="themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {getEntryCount()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer
                data={documentData}
                layout={previewLayout}
                config={{
                  documentType: 'manual_journal' as any,
                  showCompanyLogo: true,
                  showSignature: true,
                  showTerms: false,
                }}
              />
            )}
          </div>
        )}
      </div>

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

export default ManualJournalView;