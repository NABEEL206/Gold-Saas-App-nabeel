// src/pages/sales/proforma/ProformaInvoiceView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  Edit,
  Trash2,
  FileText,
  Clock,
  XCircle,
  Mail,
  Phone,
  Building2,
  Receipt,
  CheckCircle,
} from 'lucide-react';
import { useProformaInvoice } from '../../../hooks/Proforma/useProformaInvoice';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { ProformaInvoice as ProformaInvoiceType } from '../../../types/proforma/ProformaInvoiceType';

// Status Badge
const StatusBadge: React.FC<{ status: ProformaInvoiceType['status'] }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3 w-3" />, label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700', icon: <Send className="h-3 w-3" />, label: 'Sent' },
    approved: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" />, label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" />, label: 'Rejected' },
    expired: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" />, label: 'Expired' },
  };
  const { color, icon, label } = config[status] || config.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};

const STATUS_LABELS: Record<string, string> = {
  sent: 'sent',
  approved: 'approved',
  rejected: 'rejected',
  expired: 'expired',
  draft: 'draft',
};

const ProformaInvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoice, deleteInvoice, updateInvoiceStatus, loading: hookLoading } = useProformaInvoice();

  const {
    success,
    error: showError,
    withConfirmation,
    isOpen: modalOpen,
    options: modalOptions,
    isLoading: modalLoading,
    handleConfirm: onModalConfirm,
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const [invoice, setInvoice] = useState<ProformaInvoiceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      if (id) {
        try {
          const data = await getInvoice(id);
          if (data) {
            // Ensure items exist
            const items = data.items && data.items.length > 0 ? data.items : generateDemoItems();

            // Calculate totals
            const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
            const discountTotal = items.reduce((sum, item) => sum + ((item.discount || 0) * item.quantity), 0);
            const taxTotal = items.reduce((sum, item) => sum + ((item.unitPrice * item.quantity - (item.discount || 0) * item.quantity) * ((item.taxRate || 0) / 100)), 0);
            const grandTotal = subtotal - discountTotal + taxTotal;

            setInvoice({
              ...data,
              items: items,
              subtotal: subtotal,
              discountTotal: discountTotal,
              taxTotal: taxTotal,
              grandTotal: grandTotal,
            });
          } else {
            showError('Proforma invoice not found.');
            navigate('/sales/proforma');
          }
        } catch (err) {
          showError('Failed to load proforma invoice.');
          navigate('/sales/proforma');
        } finally {
          setLoading(false);
        }
      }
    };
    loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getInvoice, navigate]);

  // Generate demo items
  const generateDemoItems = useCallback(() => {
    return [
      {
        id: `demo_${Date.now()}_1`,
        productId: 'prod1',
        productName: 'Gold Chain',
        description: '22K Gold Chain with pendant',
        quantity: 2,
        unitPrice: 4500,
        discount: 0,
        taxRate: 18,
        total: 9000,
      },
      {
        id: `demo_${Date.now()}_2`,
        productId: 'prod2',
        productName: 'Diamond Ring',
        description: '18K Diamond Ring with 0.5ct diamond',
        quantity: 1,
        unitPrice: 8500,
        discount: 5,
        taxRate: 18,
        total: 8075,
      },
    ];
  }, []);

  // Delete handler using confirmation modal
  const handleDelete = useCallback(() => {
    if (!id) return;

    withConfirmation(
      {
        title: 'Delete Proforma Invoice',
        message: 'Are you sure you want to delete this proforma invoice? This action cannot be undone.',
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(true);
        try {
          await deleteInvoice(id);
          success('Proforma invoice deleted successfully.');
          navigate('/sales/proforma');
        } catch (err) {
          showError('Failed to delete proforma invoice. Please try again.');
        } finally {
          setDeleteLoading(false);
        }
      }
    );
  }, [id, withConfirmation, deleteInvoice, success, showError, navigate]);

  // Status update handler using confirmation modal
  const handleStatusUpdate = useCallback((status: ProformaInvoiceType['status']) => {
    if (!id) return;

    withConfirmation(
      {
        title: 'Update Invoice Status',
        message: `Mark this proforma invoice as ${STATUS_LABELS[status] ?? status}?`,
        confirmText: 'Confirm',
        variant: status === 'rejected' ? 'danger' : 'primary',
      },
      async () => {
        setUpdating(true);
        try {
          await updateInvoiceStatus(id, status);
          const data = await getInvoice(id);
          if (data) {
            setInvoice(data);
          }
          success(`Invoice marked as ${STATUS_LABELS[status] ?? status}.`);
        } catch (err) {
          showError('Failed to update invoice status. Please try again.');
        } finally {
          setUpdating(false);
        }
      }
    );
  }, [id, withConfirmation, updateInvoiceStatus, getInvoice, success, showError]);

  const handleEdit = useCallback(() => {
    if (id) {
      navigate(`/sales/proforma/${id}/edit`);
    }
  }, [id, navigate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownload = useCallback(() => {
    // TODO: replace with real download/export call
    success('Download started.');
  }, [success]);

  // Dropdown items for three-dot menu
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
      label: 'Edit',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
      show: invoice?.status === 'draft',
    },
    {
      label: 'Delete',
      icon: deleteLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Trash2 className="h-4 w-4 text-red-500" />
      ),
      onClick: handleDelete,
      show: invoice?.status === 'draft',
      disabled: deleteLoading,
    },
    {
      label: 'Send Invoice',
      icon: <Send className="h-4 w-4 text-blue-500" />,
      onClick: () => handleStatusUpdate('sent'),
      show: invoice?.status === 'draft',
      disabled: updating,
    },
    {
      label: 'Approve Invoice',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => handleStatusUpdate('approved'),
      show: invoice?.status === 'sent',
      disabled: updating,
    },
    {
      label: 'Reject Invoice',
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      onClick: () => handleStatusUpdate('rejected'),
      show: invoice?.status === 'sent',
      disabled: updating,
    },
  ];

  if (loading || hookLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading proforma invoice..." />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Proforma Invoice not found</p>
          <button
            onClick={() => navigate('/sales/proforma')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Proforma Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales/proforma')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Proforma Invoice Details</h1>
              <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ThreeDotDropdown
              items={dropdownItems.filter(item => item.show !== false)}
              position="right"
            />
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Status:</span>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">
              All actions available in ⋮ menu
            </span>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">PROFORMA INVOICE</h2>
                <p className="text-sm text-gray-500 mt-1"># {invoice.invoiceNumber}</p>
                <p className="text-sm text-gray-500">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Valid Until: {new Date(invoice.validUntil).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-3xl font-bold text-amber-600">{formatCurrency(invoice.grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-900">{invoice.customerName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" /> {invoice.customerEmail}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" /> {invoice.customerPhone}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4" /> {invoice.customerAddress}
                </p>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Terms</p>
                  <p className="text-sm text-gray-900">{invoice.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Delivery Terms</p>
                  <p className="text-sm text-gray-900">{invoice.deliveryTerms}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Currency</p>
                  <p className="text-sm text-gray-900">{invoice.currency}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => {
                      const itemTotal = (item.unitPrice * item.quantity) - ((item.discount || 0) * item.quantity);
                      const taxAmount = itemTotal * ((item.taxRate || 0) / 100);
                      const total = itemTotal + taxAmount;
                      return (
                        <tr key={item.id || index}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.description}</td>
                          <td className="px-4 py-3 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right">{item.discount || 0}%</td>
                          <td className="px-4 py-3 text-right">{item.taxRate || 0}%</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(total)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No items in this proforma invoice
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-right font-medium">Subtotal</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  {invoice.discountTotal > 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-2 text-right font-medium text-red-600">Discount</td>
                      <td className="px-4 py-2 text-right font-medium text-red-600">-{formatCurrency(invoice.discountTotal)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-right font-medium">Tax</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(invoice.taxTotal)}</td>
                  </tr>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={6} className="px-4 py-3 text-right font-bold text-lg">Grand Total</td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-amber-600">{formatCurrency(invoice.grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {invoice.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.termsAndConditions && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.termsAndConditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reusable Confirmation Modal */}
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

export default ProformaInvoiceView;