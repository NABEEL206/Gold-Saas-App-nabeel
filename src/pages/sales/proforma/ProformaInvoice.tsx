// src/pages/sales/proforma/ProformaInvoices.tsx
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
  Clock,
  RefreshCw,
  FileSpreadsheet,
  File,
  Upload,
  Trash,
  Receipt,
  XCircle,
  Send,
} from 'lucide-react';
import { useProformaInvoice } from '../../../hooks/Proforma/useProformaInvoice';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ReusableTable from '../../../components/common/ReusableTable';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { TableColumn } from '../../../components/common/ReusableTable';
import type { ProformaInvoice as ProformaInvoiceType } from '../../../types/proforma/ProformaInvoiceType';

// Format currency in Rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Status Badge
const StatusBadge: React.FC<{ status: ProformaInvoiceType['status'] }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: FileText, label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700', icon: Send, label: 'Sent' },
    approved: { color: 'bg-green-100 text-green-700', icon: FileText, label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
    expired: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Expired' },
  };
  const { color, icon: Icon, label } = config[status as keyof typeof config] || config.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const ProformaInvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const {
    invoices,
    loading,
    error,
    totalItems,
    currentPage,
    itemsPerPage,
    filters,
    fetchInvoices,
    deleteInvoice,
    updateInvoiceStatus,
    setPage,
    setItemsPerPage,
    setFilters,
  } = useProformaInvoice();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Navigate to view page on row click
  const handleRowClick = (invoice: ProformaInvoiceType) => {
    navigate(`/sales/proforma/${invoice.id}/view`);
  };

  const handleView = (invoice: ProformaInvoiceType) => {
    navigate(`/sales/proforma/${invoice.id}/view`);
  };

  const handleEdit = (invoice: ProformaInvoiceType) => {
    navigate(`/sales/proforma/${invoice.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this proforma invoice?')) {
      setDeleteLoading(id);
      try {
        await deleteInvoice(id);
        setSelectedItems(prev => prev.filter(item => item !== id));
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: ProformaInvoiceType['status']) => {
    try {
      await updateInvoiceStatus(id, status);
    } catch (err) {
      console.error('Failed to update invoice status:', err);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === invoices.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(invoices.map(item => item.id!));
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
      await fetchInvoices();
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleExportWithLoading = async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      console.log(`Exporting as ${format}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setExportLoading(false);
    }
  };

  const handleBulkDeleteWithLoading = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} proforma invoices?`)) {
      setBulkDeleteLoading(true);
      try {
        await Promise.all(selectedItems.map(id => deleteInvoice(id)));
        setSelectedItems([]);
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  const handleImport = (files: FileList) => {
    console.log('Importing files:', files);
  };

  // Columns - No action column
  const columns: TableColumn<ProformaInvoiceType>[] = [
    {
      key: 'invoiceNumber',
      header: 'Proforma #',
      render: (item) => (
        <span className="text-sm font-medium text-gray-900">{item.invoiceNumber}</span>
      ),
    },
    {
      key: 'invoiceDate',
      header: 'Date',
      render: (item) => (
        <span className="text-sm text-gray-600">{new Date(item.invoiceDate).toLocaleDateString()}</span>
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
      key: 'grandTotal',
      header: 'Total',
      render: (item) => (
        <span className="text-sm font-semibold text-amber-600">{formatCurrency(item.grandTotal)}</span>
      ),
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      render: (item) => (
        <span className="text-sm text-gray-600">{new Date(item.validUntil).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
  ];

  // Dropdown items for ThreeDotDropdown
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
        <LoadingSpinner size="lg" text="Loading proforma invoices..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error: {error}</p>
          <button
            onClick={() => fetchInvoices()}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="h-6 w-6 text-amber-500" />
            Proforma Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your proforma invoices</p>
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
            onClick={() => navigate('/sales/proforma/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Proforma
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
            importLabel="Import Proformas"
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
                placeholder="Search by proforma # or customer..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Start Date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Table - No actions prop, row click for view */}
      <ReusableTable
        data={invoices}
        columns={columns}
        selectable={true}
        selectedItems={selectedItems}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        getId={(item) => item.id!}
        emptyMessage="No proforma invoices found"
        emptyIcon={<Receipt className="h-12 w-12 text-gray-300" />}
        onRowClick={handleRowClick}
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalItems / itemsPerPage),
          totalItems,
          startIndex: (currentPage - 1) * itemsPerPage,
          endIndex: Math.min(currentPage * itemsPerPage, totalItems),
          onPageChange: setPage,
          itemsPerPage: itemsPerPage || 5,
        }}
      />
    </div>
  );
};

export default ProformaInvoiceList;