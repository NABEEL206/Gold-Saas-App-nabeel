// src/pages/sales/invoice/InvoiceView.tsx
import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useInvoices } from '../../../hooks/Invoices/useInvoices';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { Invoice } from '../../../types/Invoice/InvoiceTypes';

// Status Badge
const StatusBadge: React.FC<{ status: Invoice['status'] }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: FileText, label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Sent' },
    paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
    partial: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Partial' },
    overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Overdue' },
    cancelled: { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Cancelled' },
  };
  const { color, icon: Icon, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

export const InvoiceView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getInvoice, updateStatus } = useInvoices();
  
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvoice(id);
    }
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    setLoading(true);
    try {
      const data = await getInvoice(invoiceId) as Invoice;
      setInvoice(data);
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: Invoice['status']) => {
    if (!id) return;
    if (window.confirm(`Mark this invoice as ${status}?`)) {
      setUpdating(true);
      try {
        await updateStatus(id, status);
        await loadInvoice(id);
      } catch (error) {
        console.error('Error updating status:', error);
      } finally {
        setUpdating(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading invoice..." />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Invoice not found</p>
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
              onClick={() => navigate('/sales/invoices')}
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
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
            {invoice.status === 'draft' && (
              <button
                onClick={() => navigate(`/sales/invoices/edit/${invoice.id}`)}
                className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Status and Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Status:</span>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(invoice.status === 'sent' || invoice.status === 'partial') && (
              <button
                onClick={() => handleStatusUpdate('paid')}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {updating ? <LoadingSpinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
                Mark as Paid
              </button>
            )}
            {invoice.status === 'draft' && (
              <button
                onClick={() => handleStatusUpdate('sent')}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {updating ? <LoadingSpinner size="sm" /> : <Send className="h-4 w-4" />}
                Send Invoice
              </button>
            )}
            {invoice.status === 'sent' && (
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {updating ? <LoadingSpinner size="sm" /> : <XCircle className="h-4 w-4" />}
                Cancel
              </button>
            )}
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
                  {invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.itemName}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                          {item.purity && (
                            <span className="text-xs text-amber-600">{item.purity}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">₹{item.rate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">{item.discount}%</td>
                        <td className="px-4 py-3 text-right">{item.taxRate}%</td>
                        <td className="px-4 py-3 text-right font-medium">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No items in this invoice
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-right font-medium">Sub Total</td>
                    <td className="px-4 py-2 text-right">₹{invoice.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-right font-medium">Tax</td>
                    <td className="px-4 py-2 text-right">₹{invoice.taxAmount.toFixed(2)}</td>
                  </tr>
                  {invoice.discount > 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-right font-medium">
                        Discount ({invoice.discount}{invoice.discountType === 'percentage' ? '%' : ''})
                      </td>
                      <td className="px-4 py-2 text-right">-₹{invoice.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  {invoice.shippingCharge > 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-right font-medium">Shipping</td>
                      <td className="px-4 py-2 text-right">₹{invoice.shippingCharge.toFixed(2)}</td>
                    </tr>
                  )}
                  {invoice.otherCharges > 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-2 text-right font-medium">Other Charges</td>
                      <td className="px-4 py-2 text-right">₹{invoice.otherCharges.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={5} className="px-4 py-3 text-right font-bold text-lg">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-amber-600">₹{invoice.total.toFixed(2)}</td>
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
    </div>
  );
};

export default InvoiceView;