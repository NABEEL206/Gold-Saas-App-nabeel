// src/pages/purchases/PaymentsMade/PaymentMadeView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash, DollarSign, Building2, Calendar,
  CreditCard, FileText, CheckCircle, Clock, AlertCircle, XCircle,
  Mail, Phone, Banknote, Hash, Printer, Download, Eye,
  FileText as FileTextIcon,
} from 'lucide-react';
import { usePaymentMade } from '../../../hooks/PaymentMade/usePaymentMade';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { DocumentRenderer } from '../../../Templates/DocumentRenderer';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { DocumentData } from '../../../types/Template/TemplateTypes';

// ============================================================
// CONSTANTS - Single source of truth
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

// Status configuration - Single source of truth
const STATUS_CONFIG: Record<
  string,
  { bg: string; color: string; icon: React.ReactNode; label: string }
> = {
  pending: {
    bg: 'var(--warning-light)',
    color: 'var(--warning)',
    icon: <Clock className="h-3 w-3" />,
    label: 'Pending',
  },
  completed: {
    bg: 'var(--success-light)',
    color: 'var(--success)',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Completed',
  },
  failed: {
    bg: 'var(--error-light)',
    color: 'var(--error)',
    icon: <XCircle className="h-3 w-3" />,
    label: 'Failed',
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
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
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

const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = { 
    cash: 'Cash', 
    bank: 'Bank Transfer', 
    credit_card: 'Credit Card', 
    cheque: 'Cheque', 
    auto_debit: 'Auto Debit' 
  };
  return labels[method] || method;
};

const PaymentMadeView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPaymentById, deletePayment } = usePaymentMade();
  const [payment, setPayment] = useState<any>(null);
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
    if (id) loadPayment(id); 
    else { showError('Invalid ID'); navigate('/purchases/payments-made'); } 
  }, [id]);

  const loadPayment = async (paymentId: string) => {
    setLoading(true);
    try {
      const data = await getPaymentById(paymentId);
      if (data) setPayment(data);
      else { setError('Not found'); showError('Payment not found'); }
    } catch { 
      setError('Error loading'); 
      showError('Failed to load.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const documentData = useMemo((): DocumentData | null => {
    if (!payment) return null;
    return {
      documentNumber: payment.paymentNumber,
      documentDate: new Date(payment.paymentDate).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      referenceNumber: payment.referenceNumber,
      company: DEFAULT_COMPANY,
      vendor: { 
        name: payment.vendorName || 'N/A', 
        phone: payment.vendorPhone, 
        email: payment.vendorEmail 
      },
      items: [], 
      subtotal: 0, 
      totalAmount: payment.amount, 
      notes: payment.notes,
      additionalFields: {
        'Status': payment.status,
        'Payment Method': getPaymentMethodLabel(payment.paymentMethod),
        'Bill': payment.billNumber || 'N/A',
        'Reference': payment.referenceNumber || 'N/A',
        'Bank': payment.bankName || 'N/A',
        'Cheque': payment.chequeNumber || 'N/A',
      },
    };
  }, [payment]);

  const handleDelete = async () => {
    if (!id) return;
    await withConfirmation(
      { 
        title: 'Delete', 
        message: `Delete "${payment?.paymentNumber}"?`, 
        confirmText: 'Delete', 
        variant: 'danger' 
      },
      async () => { 
        await withLoading(
          async () => { 
            await deletePayment(id); 
            navigate('/purchases/payments-made'); 
          }, 
          'Deleting...', 
          'Deleted.', 
          'Failed to delete.'
        ); 
      }
    );
  };

  const handleEdit = () => { 
    if (id) navigate(`/purchases/payments-made/${id}/edit`); 
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

  if (error || !payment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--foreground-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {error || 'Not found'}
          </p>
          <button
            onClick={() => navigate('/purchases/payments-made')}
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
              onClick={() => navigate('/purchases/payments-made')}
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
              <DollarSign className="h-5 w-5" style={{ color: 'var(--success)' }} />
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-lg font-bold themed-transition"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {payment.paymentNumber}
                  </h1>
                  <StatusBadge status={payment.status} />
                </div>
                <p
                  className="text-[11px] themed-transition"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  {new Date(payment.paymentDate).toLocaleDateString()} | {payment.vendorName} | {formatCurrency(payment.amount)}
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
              <StatusBadge status={payment.status} />
              <span
                className="px-3 py-1 text-sm rounded-full flex items-center gap-1 themed-transition"
                style={{
                  background: 'var(--info-light)',
                  color: 'var(--info)',
                }}
              >
                <CreditCard className="h-3 w-3" />
                {getPaymentMethodLabel(payment.paymentMethod)}
              </span>
              {payment.referenceNumber && (
                <span
                  className="px-3 py-1 text-sm rounded-full flex items-center gap-1 themed-transition"
                  style={{
                    background: 'var(--surface-hover)',
                    color: 'var(--foreground-secondary)',
                  }}
                >
                  <Hash className="h-3 w-3" />
                  Ref: {payment.referenceNumber}
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
                    className="text-xs font-semibold uppercase mb-3 themed-transition"
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
                        {payment.vendorName}
                      </p>
                      <p
                        className="themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        <Mail className="h-3.5 w-3.5 inline" />
                        {payment.vendorEmail || 'N/A'}
                      </p>
                    </div>
                    <div>
                      {payment.billNumber && (
                        <p
                          className="themed-transition"
                          style={{ color: 'var(--foreground-secondary)' }}
                        >
                          <FileText className="h-3.5 w-3.5 inline" />
                          Bill: {payment.billNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Card */}
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
                    <CreditCard className="h-4 w-4 inline mr-1" style={{ color: 'var(--gold)' }} />
                    Payment
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p
                        className="text-2xl font-bold themed-transition"
                        style={{ color: 'var(--gold)' }}
                      >
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Date:
                      </span>
                      <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Method:
                      </span>
                      <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </span>
                    </div>
                    <div>
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Status:
                      </span>
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>

                  {/* Bank Details */}
                  {(payment.bankName || payment.bankAccount || payment.chequeNumber) && (
                    <div
                      className="mt-4 pt-4 themed-transition"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <h4
                        className="text-xs font-semibold mb-2 themed-transition"
                        style={{ color: 'var(--foreground-secondary)' }}
                      >
                        Bank Details
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {payment.bankName && (
                          <div>
                            <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                              Bank:
                            </span>
                            <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                              {payment.bankName}
                            </span>
                          </div>
                        )}
                        {payment.bankAccount && (
                          <div>
                            <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                              Account:
                            </span>
                            <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                              {payment.bankAccount}
                            </span>
                          </div>
                        )}
                        {payment.chequeNumber && (
                          <div>
                            <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                              Cheque:
                            </span>
                            <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                              {payment.chequeNumber}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {payment.notes && (
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
                      {payment.notes}
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
                        Payment #
                      </span>
                      <span
                        className="font-medium themed-transition"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {payment.paymentNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Amount
                      </span>
                      <span
                        className="font-bold themed-transition"
                        style={{ color: 'var(--gold)' }}
                      >
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Status
                      </span>
                      <StatusBadge status={payment.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="themed-transition" style={{ color: 'var(--foreground-secondary)' }}>
                        Created
                      </span>
                      <span className="themed-transition" style={{ color: 'var(--foreground)' }}>
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
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
                  documentType: 'payment_made',
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

export default PaymentMadeView;