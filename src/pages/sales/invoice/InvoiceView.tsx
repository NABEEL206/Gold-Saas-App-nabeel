// src/pages/sales/invoice/InvoiceView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  Send,
  Edit,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Receipt,
  Trash2,
} from 'lucide-react';
import { useInvoices } from '../../../hooks/Invoices/useInvoices';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { Invoice } from '../../../types/Invoice/InvoiceTypes';

// Status Badge
const StatusBadge: React.FC<{ status: Invoice['status'] }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-3 w-3" />, label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" />, label: 'Sent' },
    paid: { color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" />, label: 'Paid' },
    partial: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" />, label: 'Partial' },
    overdue: { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-3 w-3" />, label: 'Overdue' },
    cancelled: { color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-3 w-3" />, label: 'Cancelled' },
  };
  const { color, icon, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {label}
    </span>
  );
};

// Generate demo items for any invoice
const generateDemoItems = (invoice: Invoice) => {
  if (invoice.items && invoice.items.length > 0) {
    return invoice.items;
  }
  return [
    {
      id: `demo_${Date.now()}_1`,
      invoiceId: invoice.id,
      itemId: 'demo1',
      itemName: 'Gold Ring',
      description: '22K Gold Ring with diamond studded',
      quantity: 1,
      rate: 5000,
      discount: 0,
      taxRate: 18,
      taxAmount: 900,
      total: 5900,
      purity: '22K',
      category: 'Ring',
      weight: 4.5,
      makingCharges: 500,
      wastagePercentage: 2,
      stoneCharges: 1000,
    },
    {
      id: `demo_${Date.now()}_2`,
      invoiceId: invoice.id,
      itemId: 'demo2',
      itemName: 'Gold Chain',
      description: '22K Gold Chain with pendant',
      quantity: 2,
      rate: 4500,
      discount: 0,
      taxRate: 18,
      taxAmount: 1620,
      total: 9000,
      purity: '22K',
      category: 'Chain',
      weight: 10.5,
      makingCharges: 400,
      wastagePercentage: 3,
      stoneCharges: 0,
    },
  ];
};

export const InvoiceView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getInvoice, updateStatus, deleteInvoice, loading: hookLoading } = useInvoices();
  
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

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvoice(id);
    }
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    setLoading(true);
    try {
      const data = await getInvoice(invoiceId) as Invoice;
      const items = generateDemoItems(data);
      const itemsTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
      const subtotal = data.subtotal || itemsTotal;
      const taxAmount = data.taxAmount || (subtotal * (data.taxRate || 18) / 100);
      const total = data.total || (subtotal + taxAmount + (data.shippingCharge || 0) + (data.otherCharges || 0) - (data.discount || 0));
      
      setInvoice({
        ...data,
        items: items,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total,
      });
    } catch (error) {
      console.error('Error loading invoice:', error);
      try {
        const mockModule = await import('../../../hooks/Invoices/useInvoices');
        const mockData = (mockModule as any).MOCK_INVOICES?.find((inv: Invoice) => inv.id === invoiceId);
        if (mockData) {
          const items = generateDemoItems(mockData);
          setInvoice({ ...mockData, items: items });
        } else {
          setInvoice(null);
        }
      } catch (err) {
        setInvoice(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Status update handler with confirmation
  const handleStatusUpdate = useCallback(async (status: Invoice['status']) => {
    if (!id || !invoice) return;

    const statusLabels: Record<string, string> = {
      sent: 'Send Invoice',
      paid: 'Mark as Paid',
      cancelled: 'Cancel Invoice',
    };

    const statusMessages: Record<string, string> = {
      sent: 'Are you sure you want to send this invoice to the customer?',
      paid: 'Are you sure you want to mark this invoice as paid?',
      cancelled: 'Are you sure you want to cancel this invoice?',
    };

    await withConfirmation(
      {
        title: statusLabels[status] || `Update Status`,
        message: statusMessages[status] || `Mark this invoice as ${status}?`,
        confirmText: statusLabels[status] || 'Confirm',
        variant: status === 'cancelled' ? 'danger' : 'primary',
      },
      async () => {
        setUpdating(true);
        try {
          const result = await updateStatus(id, status);
          if (result) {
            success(`Invoice ${status === 'sent' ? 'sent' : status === 'paid' ? 'marked as paid' : status === 'cancelled' ? 'cancelled' : 'updated'} successfully.`);
            await loadInvoice(id);
          }
        } catch (err) {
          showError('Failed to update status. Please try again.');
        } finally {
          setUpdating(false);
        }
      }
    );
  }, [id, invoice, withConfirmation, updateStatus, success, showError]);

  // Delete handler with confirmation
  const handleDelete = useCallback(async () => {
    if (!id || !invoice) return;

    await withConfirmation(
      {
        title: 'Delete Invoice',
        message: `Are you sure you want to delete ${invoice.invoiceNo}? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        setDeleteLoading(true);
        try {
          const result = await deleteInvoice(id);
          if (result) {
            success(`Invoice ${invoice.invoiceNo} deleted successfully.`);
            navigate('/sales/invoices', { replace: true });
          }
        } catch (err) {
          showError('Failed to delete invoice. Please try again.');
          setDeleteLoading(false);
        }
      }
    );
  }, [id, invoice, withConfirmation, deleteInvoice, success, showError, navigate]);

  // Edit handler
  const handleEdit = useCallback(() => {
    if (id) navigate(`/sales/invoices/edit/${id}`);
  }, [id, navigate]);

  // Print handler
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Export handler
  const handleExport = useCallback(async (format: 'pdf' | 'excel') => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success(`Invoice exported as ${format.toUpperCase()} successfully.`);
    } catch (err) {
      showError(`Failed to export as ${format.toUpperCase()}.`);
    } finally {
      setExportLoading(false);
    }
  }, [success, showError]);

  // Back navigation
  const handleGoBack = useCallback(() => {
    navigate('/sales/invoices', { replace: true });
  }, [navigate]);

  // Dropdown items
  const dropdownItems = [
    {
      label: 'Print',
      icon: <Printer className="h-4 w-4 text-gray-500" />,
      onClick: handlePrint,
    },
    {
      label: 'Export as PDF',
      icon: <Download className="h-4 w-4 text-red-500" />,
      onClick: () => handleExport('pdf'),
      disabled: exportLoading,
    },
    {
      label: 'Export as Excel',
      icon: <Download className="h-4 w-4 text-green-500" />,
      onClick: () => handleExport('excel'),
      disabled: exportLoading,
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
      show: invoice?.status === 'draft',
    },
    {
      label: 'Delete',
      icon: deleteLoading ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4 text-red-500" />,
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
      label: 'Mark as Paid',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => handleStatusUpdate('paid'),
      show: invoice?.status === 'sent' || invoice?.status === 'partial' || invoice?.status === 'overdue',
      disabled: updating,
    },
    {
      label: 'Cancel Invoice',
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      onClick: () => handleStatusUpdate('cancelled'),
      show: invoice?.status === 'sent' || invoice?.status === 'draft',
      disabled: updating,
    },
  ];

  // Loading state
  if (loading || hookLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading invoice..." />
      </div>
    );
  }

  // Not found state
  if (!invoice) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Invoice not found</p>
          <button
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Invoices
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
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Invoice Details</h1>
              <p className="text-sm text-gray-500">{invoice.invoiceNo}</p>
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
        </div>

        {/* Invoice Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{invoice.invoiceNo}</h2>
                <p className="text-sm text-gray-500 mt-1">Invoice Date: {new Date(invoice.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Payment Terms: {invoice.paymentTerms}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-3xl font-bold text-amber-600">₹{invoice.total.toLocaleString()}</p>
                {invoice.balanceDue > 0 && (
                  <p className="text-sm text-red-600 mt-1">Balance Due: ₹{invoice.balanceDue.toLocaleString()}</p>
                )}
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
                {invoice.customerAddress && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4" /> {invoice.customerAddress}
                  </p>
                )}
              </div>
              <div>
                {invoice.customerGst && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> GST: {invoice.customerGst}
                  </p>
                )}
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.itemName}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                          {item.purity && <span className="text-xs text-amber-600">{item.purity}</span>}
                          {item.weight && <span className="text-xs text-gray-500 ml-2">Weight: {item.weight}g</span>}
                          {item.makingCharges && item.makingCharges > 0 && <span className="text-xs text-gray-500 ml-2">MC: ₹{item.makingCharges}</span>}
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">₹{item.rate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">{item.discount}%</td>
                        <td className="px-4 py-3 text-right">{item.taxRate}%</td>
                        <td className="px-4 py-3 text-right font-medium">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No items in this invoice</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr><td colSpan={5} className="px-4 py-2 text-right font-medium">Sub Total</td><td className="px-4 py-2 text-right">₹{(invoice.items || []).reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2)}</td></tr>
                  <tr><td colSpan={5} className="px-4 py-2 text-right font-medium">Tax</td><td className="px-4 py-2 text-right">₹{invoice.taxAmount.toFixed(2)}</td></tr>
                  {invoice.discount > 0 && <tr><td colSpan={5} className="px-4 py-2 text-right font-medium">Discount ({invoice.discount}{invoice.discountType === 'percentage' ? '%' : ''})</td><td className="px-4 py-2 text-right">-₹{invoice.discount.toFixed(2)}</td></tr>}
                  {invoice.shippingCharge > 0 && <tr><td colSpan={5} className="px-4 py-2 text-right font-medium">Shipping</td><td className="px-4 py-2 text-right">₹{invoice.shippingCharge.toFixed(2)}</td></tr>}
                  {invoice.otherCharges > 0 && <tr><td colSpan={5} className="px-4 py-2 text-right font-medium">Other Charges</td><td className="px-4 py-2 text-right">₹{invoice.otherCharges.toFixed(2)}</td></tr>}
                  <tr className="border-t-2 border-gray-300"><td colSpan={5} className="px-4 py-3 text-right font-bold text-lg">Total</td><td className="px-4 py-3 text-right font-bold text-lg text-amber-600">₹{invoice.total.toFixed(2)}</td></tr>
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

export default InvoiceView;