// src/pages/Sales/Quotes.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  File,
  Upload,
  Trash,
  Gem,
} from 'lucide-react';
import { useQuotes } from '../../../hooks/Quote/Quote/useQuotes';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { TableColumn, TableAction } from '../../../components/common/ReusableTable';
import type { Quote } from '../../../types/Quote/QuoteTypes';

// Status Badge
const StatusBadge: React.FC<{ status: Quote['status'] }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: FileText, label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Sent' },
    accepted: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Accepted' },
    rejected: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Rejected' },
    expired: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Expired' },
  };
  const { color, icon: Icon, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

export const Quotes: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    currentItems,
    stats,
    filters,
    currentPage,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    totalPages,
    setFilters,
    setCurrentPage,
    deleteQuote,
    handleRefresh,
    handleExport,
    handleImport,
    handleStatusUpdate,
  } = useQuotes();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const handleView = (quote: Quote) => {
    navigate(`/sales/quotes/${quote.id}`);
  };

  const handleEdit = (quote: Quote) => {
    navigate(`/sales/quotes/edit/${quote.id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      setDeleteLoading(id);
      try {
        await deleteQuote(id);
        setSelectedItems(prev => prev.filter(item => item !== id));
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleApprove = async (id: string) => {
    if (window.confirm('Approve this quote?')) {
      await handleStatusUpdate(id, 'accepted');
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleRefreshWithLoading = async () => {
    setRefreshLoading(true);
    try {
      await handleRefresh();
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleExportWithLoading = async (type: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      await handleExport(type);
    } finally {
      setExportLoading(false);
    }
  };

  const handleBulkDeleteWithLoading = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} quotes?`)) {
      setBulkDeleteLoading(true);
      try {
        await Promise.all(selectedItems.map(id => deleteQuote(id)));
        setSelectedItems([]);
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  // Columns
  const columns: TableColumn<Quote>[] = [
    {
      key: 'quoteNo',
      header: 'Quote No',
      render: (item) => (
        <span className="text-sm font-medium text-gray-900">{item.quoteNo}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{item.customerName}</p>
          <p className="text-xs text-gray-500">{item.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (item) => (
        <span className="text-sm font-semibold text-amber-600">₹{item.total.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      render: (item) => (
        <span className="text-sm text-gray-600">{new Date(item.validUntil).toLocaleDateString()}</span>
      ),
    },
  ];

  // Actions - Fixed the icon property
  const actions: TableAction<Quote>[] = [
    {
      icon: <Eye className="h-4 w-4" />,
      onClick: (item) => handleView(item),
      label: 'View',
      className: 'text-gray-400 hover:text-blue-500 hover:bg-blue-50',
    },
    {
      icon: <Edit className="h-4 w-4" />,
      onClick: (item) => handleEdit(item),
      label: 'Edit',
      className: 'text-gray-400 hover:text-amber-500 hover:bg-amber-50',
      show: (item) => item.status === 'draft',
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (item) => handleDelete(item.id),
      label: 'Delete',
      className: 'text-gray-400 hover:text-red-500 hover:bg-red-50',
      show: (item) => item.status === 'draft',
      disabled: (item) => deleteLoading === item.id,
    },
    {
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: (item) => handleApprove(item.id),
      label: 'Approve',
      className: 'text-gray-400 hover:text-green-500 hover:bg-green-50',
      show: (item) => item.status === 'sent',
    },
  ];

  // Dropdown items
  const dropdownItems = [
    {
      label: 'Export as PDF',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <File className="h-4 w-4 text-red-500" />
      ),
      onClick: () => handleExportWithLoading('pdf'),
      disabled: exportLoading,
    },
    {
      label: 'Export as Excel',
      icon: exportLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-green-500" />
      ),
      onClick: () => handleExportWithLoading('excel'),
      disabled: exportLoading,
    },
  ];

  // Show main loading spinner
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading quotes..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gem className="h-6 w-6 text-amber-500" />
            Quotes
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage jewelry quotes for customers</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefreshWithLoading}
            disabled={refreshLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </button>
          <button
            onClick={() => navigate('/sales/quotes/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Quote
          </button>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDeleteWithLoading}
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
            items={dropdownItems}
            position="right"
            onImport={(event) => {
              if (event.target.files) {
                setImportLoading(true);
                try {
                  handleImport(event.target.files);
                } finally {
                  setImportLoading(false);
                }
              }
            }}
            importLabel="Import Quotes"
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
                placeholder="Search by quote no, customer..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        data={currentItems}
        columns={columns}
        actions={actions}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => item.id}
        emptyMessage="No quotes found"
        emptyIcon={<FileText className="h-12 w-12 text-gray-300" />}
        onRowClick={(item) => handleView(item)}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          startIndex,
          endIndex,
          onPageChange: setCurrentPage,
          itemsPerPage: itemsPerPage || 5,
        }}
      />
    </div>
  );
};