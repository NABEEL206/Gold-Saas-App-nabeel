// src/pages/accountant/ManualJournal/ManualJournalView.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  FileText,
  User,
  Calendar,
  Hash,
  Printer,
  Download,
} from 'lucide-react';
import { useManualJournal } from '../../../hooks/ManualJournal/useManualJournal';
import { useManualJournalView } from '../../../hooks/ManualJournal/useManualJournalView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Pending' },
    posted: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Posted' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
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

const ManualJournalView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getJournalById, deleteJournal } = useManualJournal();
  const [journal, setJournal] = useState<any>(null);
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
    formatCurrency,
    isBalanced,
    getEntryCount
  } = useManualJournalView(journal);

  useEffect(() => {
    const loadJournal = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await getJournalById(id);
          if (data) {
            setJournal(data);
          } else {
            setError('Manual journal not found');
            showError('Manual journal not found');
          }
        } catch (err) {
          console.error('Error loading manual journal:', err);
          setError('Error loading manual journal');
          showError('Failed to load manual journal details. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        showError('Invalid journal ID');
        navigate('/accountant/manual-journals');
      }
    };
    loadJournal();
  }, [id, getJournalById, navigate, showError]);

  const handleDelete = async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Manual Journal',
        message: `Are you sure you want to delete manual journal "${journal?.journalNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteJournal(id);
            navigate('/accountant/manual-journals');
          },
          'Deleting manual journal...',
          `Manual journal "${journal?.journalNumber}" deleted successfully.`,
          'Failed to delete manual journal. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    console.log('Edit clicked - Journal ID:', id);
    if (id) {
      navigate(`/accountant/manual-journals/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid journal ID');
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
      label: 'Edit Journal',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
      show: journal?.status === 'draft' || journal?.status === 'pending',
    },
    {
      label: 'Delete Journal',
      icon: <Trash className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      show: journal?.status === 'draft' || journal?.status === 'pending',
      danger: true,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading manual journal details..." />
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error || 'Manual journal not found'}</p>
          <button
            onClick={() => navigate('/accountant/manual-journals')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Manual Journals
          </button>
        </div>
      </div>
    );
  }

  const balanced = isBalanced();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/accountant/manual-journals')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{journal.journalNumber}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manual Journal Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {journal.status === 'draft' || journal.status === 'pending' ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Journal
              </button>
            ) : null}
            <ThreeDotDropdown
              items={dropdownItems.filter(item => item.show !== false)}
              position="right"
            />
          </div>
        </div>

        {/* Status Badges */}
        <div className="mb-6 flex flex-wrap gap-2">
          <StatusBadge status={journal.status} />
          <span className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center gap-1 ${
            balanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <CheckCircle className="h-3 w-3" />
            {balanced ? 'Balanced' : 'Unbalanced'}
          </span>
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 inline-flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {getEntryCount()} Entries
          </span>
          {journal.referenceNumber && (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1">
              <Hash className="h-3 w-3" />
              Ref: {journal.referenceNumber}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journal Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Journal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Description</label>
                  <p className="text-gray-900 font-medium">{journal.description}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Journal Date</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(journal.journalDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Reference Number</label>
                  <p className="text-gray-900">{journal.referenceNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className="text-gray-900">
                    <StatusBadge status={journal.status} />
                  </p>
                </div>
              </div>
            </div>

            {/* Journal Entries */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-500" />
                Journal Entries
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {journal.entries.map((entry: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-900">{entry.accountName}</p>
                          <p className="text-xs text-gray-500">{entry.accountCode}</p>
                        </td>
                        <td className="px-3 py-2 text-gray-600">{entry.description || '-'}</td>
                        <td className="px-3 py-2 text-right text-red-600">
                          {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '-'}
                        </td>
                        <td className="px-3 py-2 text-right text-green-600">
                          {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-right font-medium">Totals</td>
                      <td className="px-3 py-2 text-right font-medium text-red-600">
                        {formatCurrency(journal.totalDebit)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-green-600">
                        {formatCurrency(journal.totalCredit)}
                      </td>
                    </tr>
                    {balanced && (
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-right text-green-600 font-medium">
                          ✓ Journal is balanced
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            {journal.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{journal.notes}</p>
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
                  <span className="text-sm text-gray-500">Journal ID</span>
                  <span className="text-sm font-medium text-gray-900">#{journal.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Journal #</span>
                  <span className="text-sm font-medium text-gray-900">{journal.journalNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium">
                    <StatusBadge status={journal.status} />
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Debit</span>
                  <span className="text-sm font-bold text-red-600">{formatCurrency(journal.totalDebit)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Credit</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(journal.totalCredit)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Entries</span>
                  <span className="text-sm font-medium text-gray-900">{getEntryCount()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                {(journal.status === 'draft' || journal.status === 'pending') && (
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Journal
                  </button>
                )}
                {(journal.status === 'draft' || journal.status === 'pending') && (
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                    Delete Journal
                  </button>
                )}
                <button
                  onClick={() => navigate('/accountant/manual-journals')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Journals
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

export default ManualJournalView;