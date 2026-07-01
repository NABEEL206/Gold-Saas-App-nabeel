// src/pages/accountant/ManualJournal/ManualJournals.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  File,
  Upload,
  Trash,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  Calculator,
} from 'lucide-react';
import { useManualJournal } from '../../../hooks/ManualJournal/useManualJournal';
import type { ManualJournal } from '../../../types/ManualJournal/ManualJournalType';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { TableColumn } from '../../../components/common/ReusableTable';
import { MANUAL_JOURNAL_STATUSES, MANUAL_JOURNAL_STATUS_LABELS } from '../../../types/ManualJournal/ManualJournalType';

// Status Badge
const StatusBadge: React.FC<{ status: ManualJournal['status'] }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Pending' },
    posted: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Posted' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
  };
  const defaultConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = config[status] || defaultConfig;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const ManualJournals: React.FC = () => {
  const navigate = useNavigate();
  const {
    journals,
    loading,
    error,
    filters,
    pagination,
    stats,
    deleteJournal,
    updateFilters,
    changePage,
    fetchJournals,
  } = useManualJournal({ page: 1, limit: 10 });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState<ManualJournal | null>(null);

  const handleView = (journal: ManualJournal) => {
    navigate(`/accountant/manual-journals/${journal.id}`);
  };

  const handleEdit = (journal: ManualJournal) => {
    navigate(`/accountant/manual-journals/${journal.id}/edit`);
  };

  const handleDeleteClick = (journal: ManualJournal) => {
    setJournalToDelete(journal);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (journalToDelete) {
      try {
        await deleteJournal(journalToDelete.id);
        setShowDeleteModal(false);
        setJournalToDelete(null);
      } catch (error) {
        console.error('Error deleting manual journal:', error);
      }
    }
  };

  const handleBulkDeleteAction = async () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Delete ${selectedItems.length} manual journals?`)) {
      setBulkDeleteLoading(true);
      try {
        for (const id of selectedItems) {
          await deleteJournal(id);
        }
        setSelectedItems([]);
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  const handleExportAction = async (format: 'excel' | 'pdf') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Exporting manual journals as ${format}`);
    } finally {
      setExportLoading(false);
    }
  };

  const handleImportAction = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Importing files:', files);
        await fetchJournals();
      } finally {
        setImportLoading(false);
      }
    }
  };

  const handleRefreshClick = async () => {
    setRefreshLoading(true);
    try {
      await fetchJournals();
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === journals.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(journals.map(item => String(item.id)));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Format currency in Rupees
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };

  // Columns
  const columns: TableColumn<ManualJournal>[] = [
    {
      key: 'journalNumber',
      header: 'Journal #',
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{item.journalNumber}</p>
          <p className="text-xs text-gray-500">{new Date(item.journalDate).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <div>
          <p className="text-sm text-gray-900">{item.description}</p>
          <p className="text-xs text-gray-500">{item.referenceNumber || 'No ref'}</p>
        </div>
      ),
    },
    {
      key: 'totalDebit',
      header: 'Debit',
      render: (item) => (
        <span className="text-sm font-medium text-red-600">
          {formatCurrency(item.totalDebit)}
        </span>
      ),
    },
    {
      key: 'totalCredit',
      header: 'Credit',
      render: (item) => (
        <span className="text-sm font-medium text-green-600">
          {formatCurrency(item.totalCredit)}
        </span>
      ),
    },
    {
      key: 'entries',
      header: 'Entries',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.entries.length}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  // Dropdown items for header ThreeDotDropdown
  const headerDropdownItems = [
    {
      label: 'Export as PDF',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <File className="h-4 w-4 text-red-500" />
      ),
      onClick: () => handleExportAction('pdf'),
      disabled: exportLoading,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-green-500" />
      ),
      onClick: () => handleExportAction('excel'),
      disabled: exportLoading,
    },
  ];

  // Show main loading spinner
  if (loading && journals.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading manual journals..." />
      </div>
    );
  }

  // Show refresh loading spinner
  if (refreshLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Refreshing manual journals..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-500" />
            Manual Journals
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage manual journal entries</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefreshClick}
            disabled={refreshLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/accountant/manual-journals/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Journal
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteAction}
              disabled={bulkDeleteLoading}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkDeleteLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              Delete ({selectedItems.length})
            </button>
          )}
          <ThreeDotDropdown
            items={headerDropdownItems}
            position="right"
            onImport={handleImportAction}
            importLabel="Import Journals"
            importIcon={
              importLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Upload className="h-4 w-4 text-blue-500" />
              )
            }
            importAccept=".csv,.xlsx,.xls"
            importMultiple={true}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by journal #, description, account..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Status</option>
              {MANUAL_JOURNAL_STATUSES.map(status => (
                <option key={status} value={status}>
                  {MANUAL_JOURNAL_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilters({ dateFrom: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Start Date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilters({ dateTo: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <ReusableTable
        data={journals}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => String(item.id)}
        emptyMessage="No manual journals found"
        emptyIcon={<BookOpen className="h-12 w-12 text-gray-300" />}
        onRowClick={(item) => handleView(item)}
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          totalItems: pagination.total,
          startIndex: (pagination.page - 1) * pagination.limit,
          endIndex: pagination.page * pagination.limit,
          onPageChange: changePage,
          itemsPerPage: pagination.limit,
        }}
      />

      {/* Delete Modal */}
      {showDeleteModal && journalToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Manual Journal</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete manual journal "<span className="font-medium">{journalToDelete.journalNumber}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualJournals;