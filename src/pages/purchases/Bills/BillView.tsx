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
  approved: {
    bg: 'var(--info-light)',
    color: 'var(--info)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Approved',
  },
  paid: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Paid',
  },
  partial: {
    bg: 'var(--primary-light)',
    color: 'var(--primary)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Partial',
  },
  overdue: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Overdue',
  },
  cancelled: {
    bg: 'var(--surface-hover)',
    color: 'var(--foreground-tertiary)',
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

const BillView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getBillById, deleteBill } = useBills();
  const [bill, setBill] = useState<any>(null);
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
    if (id) loadBill(id); 
    else { showError('Invalid ID'); navigate('/purchases/bills'); } 
  }, [id]);

  const loadBill = async (billId: string) => {
    setLoading(true);
    try {
      const data = await getBillById(billId);
      if (data) setBill(data);
      else { setError('Not found'); showError('Bill not found'); }
    } catch { 
      setError('Error loading'); 
      showError('Failed to load.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const getItemCount = () => bill?.items?.length || 0;
  const getTotalItems = () => bill?.items?.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0) || 0;

  const documentData = useMemo((): DocumentData | null => {
    if (!bill) return null;
    return {
      documentNumber: bill.billNumber,
      documentDate: new Date(bill.billDate).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      dueDate: bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }) : undefined,
      company: DEFAULT_COMPANY,
      vendor: { 
        name: bill.vendorName || 'N/A', 
        address: bill.vendorAddress, 
        phone: bill.vendorPhone, 
        email: bill.vendorEmail, 
        gst: bill.vendorGST 
      },
      items: (bill.items || []).map((item: any) => ({ 
        name: item.productName, 
        description: item.description || '', 
        quantity: item.quantity, 
        unit: item.unit || 'Pcs', 
        rate: item.rate, 
        discount: item.discount, 
        taxRate: (item.taxAmount / ((item.quantity * item.rate) - (item.discount || 0)) * 100) || 0, 
        total: item.total 
      })),
      subtotal: bill.subtotal, 
      discountTotal: bill.discountTotal, 
      taxTotal: bill.taxTotal,
      shippingCharges: bill.shippingCharges, 
      totalAmount: bill.totalAmount,
      paidAmount: bill.paidAmount, 
      balanceDue: bill.balanceDue,
      notes: bill.notes, 
      terms: bill.terms,
    };
  }, [bill]);

  const handleDelete = async () => {
    if (!id) return;
    await withConfirmation(
      { 
        title: 'Delete', 
        message: `Delete "${bill?.billNumber}"?`, 
        confirmText: 'Delete', 
        variant: 'danger' 
      },
      async () => { 
        await withLoading(
          async () => { 
            await deleteBill(id); 
            navigate('/purchases/bills'); 
          }, 
          'Deleting...', 
          'Deleted.', 
          'Failed to delete.'
        ); 
      }
    );
  };

  const handleEdit = () => { 
    if (id) navigate(`/purchases/bills/${id}/edit`); 
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
      onClick: handleEdit 
    },
    { 
      label: 'Delete', 
      icon: <Trash className="h-4 w-4" style={{ color: 'var(--error)' }} />, 
      onClick: handleDelete, 
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

  if (error || !bill) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {error || 'Not found'}
          </p>
          <button
            onClick={() => navigate('/purchases/bills')}
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
              onClick={() => navigate('/purchases/bills')}
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
              <FileText className="h-5 w-5" style={{ color: 'var(--gold)' }} />
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-lg font-bold themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {bill.billNumber}
                  </h1>
                  <StatusBadge status={bill.status} />
                </div>
                <p
                  className="text-[11px] themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  {new Date(bill.billDate).toLocaleDateString()} | {bill.vendorName} | {formatCurrency(bill.totalAmount)}
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
            <div onClick={(e) => e.stopPropagation()}>
              <ThreeDotDropdown items={dropdownItems} position="right" />
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
              <StatusBadge status={bill.status} />
              <span
                className="px-3 py-1 text-sm rounded-full flex items-center gap-1 themed-transition"
                style={{
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                }}
              >
                <Package className="h-3 w-3" />
                {getItemCount()} items ({getTotalItems()} units)
              </span>
              {bill.dueDate && (
                <span
                  className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 themed-transition ${
                    bill.status === 'overdue'
                      ? 'bg-error-light text-error'
                      : 'bg-info-light text-info'
                  }`}
                  style={{
                    background: bill.status === 'overdue' ? 'var(--error-light)' : 'var(--info-light)',
                    color: bill.status === 'overdue' ? 'var(--error)' : 'var(--info)',
                  }}
                >
                  <Calendar className="h-3 w-3" />
                  Due: {new Date(bill.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                {/* Vendor Card */}
                <div
                  className="rounded-lg p-5 themed-transition"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider mb-3 themed-transition"
                    style={{ color: 'var(--foreground-secondary)' }}
                  >
                    <Building2 className="h-4 w-4 inline mr-1" style={{ color: 'var(--gold)' }} />
                    Vendor
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p
                        className="font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {bill.vendorName}
                      </p>
                      <p
                        className="themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        <Mail className="h-3.5 w-3.5 inline" />
                        {bill.vendorEmail || 'N/A'}
                      </p>
                      <p
                        className="themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        <Phone className="h-3.5 w-3.5 inline" />
                        {bill.vendorPhone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      {bill.vendorAddress && (
                        <p
                          className="themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          <MapPin className="h-3.5 w-3.5 inline" />
                          {bill.vendorAddress}
                        </p>
                      )}
                      {bill.vendorGST && (
                        <p
                          className="mt-1 themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          GST: {bill.vendorGST}
                        </p>
                      )}
                      {bill.purchaseOrderNumber && (
                        <p
                          className="themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          PO: {bill.purchaseOrderNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
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
                    Items
                  </h3>
                  <table className="w-full text-xs">
                    <thead style={{ background: 'var(--surface)' }}>
                      <tr>
                        <th
                          className="px-3 py-2 text-left themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          Item
                        </th>
                        <th
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          Qty
                        </th>
                        <th
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          Rate
                        </th>
                        <th
                          className="px-3 py-2 text-right themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                      {bill.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td
                            className="px-3 py-2 font-medium themed-transition"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {item.productName}
                          </td>
                          <td
                            className="px-3 py-2 text-right themed-transition"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {item.quantity}
                          </td>
                          <td
                            className="px-3 py-2 text-right themed-transition"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {formatCurrency(item.rate)}
                          </td>
                          <td
                            className="px-3 py-2 text-right font-medium themed-transition"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '1px solid var(--border)' }}>
                        <td
                          colSpan={3}
                          className="py-2 px-3 text-right font-bold themed-transition"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Total
                        </td>
                        <td
                          className="py-2 px-3 text-right font-bold themed-transition"
                          style={{ color: 'var(--gold)' }}
                        >
                          {formatCurrency(bill.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Payment Information */}
                {bill.paymentDate && (
                  <div
                    className="rounded-lg p-5 themed-transition"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <h3
                      className="text-xs font-semibold uppercase mb-2 themed-transition"
                      style={{ color: 'var(--foreground-secondary)' }}
                    >
                      <CreditCard className="h-4 w-4 inline mr-1" style={{ color: 'var(--gold)' }} />
                      Payment
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                          Method:
                        </span>
                        <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                          {bill.paymentMethod || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                          Date:
                        </span>
                        <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                          {new Date(bill.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {bill.notes && (
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
                      {bill.notes}
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
                        Bill #
                      </span>
                      <span
                        className="font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {bill.billNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Date
                      </span>
                      <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                        {new Date(bill.billDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Status
                      </span>
                      <StatusBadge status={bill.status} />
                    </div>
                    {bill.paidAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                          Paid
                        </span>
                        <span style={{ color: 'var(--success)' }}>
                          {formatCurrency(bill.paidAmount)}
                        </span>
                      </div>
                    )}
                    {bill.balanceDue > 0 && (
                      <div className="flex justify-between">
                        <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                          Balance
                        </span>
                        <span style={{ color: 'var(--error)' }}>
                          {formatCurrency(bill.balanceDue)}
                        </span>
                      </div>
                    )}
                    <div
                      className="flex justify-between pt-2 themed-transition"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <span
                        className="font-bold themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Total
                      </span>
                      <span
                        className="font-bold themed-transition"
                        style={{ color: 'var(--gold)' }}
                      >
                        {formatCurrency(bill.totalAmount)}
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
                  documentType: 'bill',
                  showCompanyLogo: true,
                  showSignature: true,
                  showTerms: true,
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

export default BillView;