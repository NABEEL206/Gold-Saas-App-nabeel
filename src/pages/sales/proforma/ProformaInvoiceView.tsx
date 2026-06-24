import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Send, Edit, Trash2 } from 'lucide-react';
import { useProformaInvoice } from '../../../hooks/Proforma/useProformaInvoice';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import type { ProformaInvoice as ProformaInvoiceType } from '../../../types/proforma/ProformaInvoiceType';

const ProformaInvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getInvoice, deleteInvoice, loading } = useProformaInvoice();
  const [invoice, setInvoice] = useState<ProformaInvoiceType | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      if (id) {
        try {
          const data = await getInvoice(id);
          if (data) {
            setInvoice(data);
          } else {
            navigate('/sales/proforma');
          }
        } catch (err) {
          console.error('Failed to load invoice:', err);
          navigate('/sales/proforma');
        } finally {
          setLoadingData(false);
        }
      }
    };
    loadInvoice();
  }, [id, getInvoice, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this proforma invoice?')) {
      try {
        await deleteInvoice(id!);
        navigate('/sales/proforma');
      } catch (err) {
        console.error('Failed to delete invoice:', err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; label: string } } = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      expired: { color: 'bg-yellow-100 text-yellow-800', label: 'Expired' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Download functionality would be implemented here');
  };

  const handleSend = () => {
    alert('Send functionality would be implemented here');
  };

  if (loadingData) {
    return <LoadingSpinner fullScreen text="Loading invoice..." />;
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="space-y-6 print:space-y-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/sales/proforma')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              Viewing invoice #{invoice.invoiceNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          {invoice.status === 'draft' && (
            <>
              <button
                onClick={() => navigate(`/sales/proforma/${id}/edit`)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
          {invoice.status === 'draft' && (
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          )}
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-0 print:p-4">
        <div className="flex flex-wrap justify-between items-start border-b border-gray-200 pb-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">PROFORMA INVOICE</h2>
            <p className="text-sm text-gray-500 mt-1"># {invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Status</div>
            <div className="mt-1">{getStatusBadge(invoice.status)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">From</h4>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">Your Company Name</p>
              <p className="text-sm text-gray-600">123 Business Street</p>
              <p className="text-sm text-gray-600">City, State 12345</p>
              <p className="text-sm text-gray-600">Phone: +1-555-0000</p>
              <p className="text-sm text-gray-600">Email: info@company.com</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h4>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{invoice.customerName}</p>
              <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
              <p className="text-sm text-gray-600">Phone: {invoice.customerPhone}</p>
              <p className="text-sm text-gray-600">Email: {invoice.customerEmail}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Invoice Date</p>
            <p className="font-medium text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Valid Until</p>
            <p className="font-medium text-gray-900">{new Date(invoice.validUntil).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Currency</p>
            <p className="font-medium text-gray-900">{invoice.currency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Terms</p>
            <p className="font-medium text-gray-900">{invoice.paymentTerms}</p>
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-72 space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-red-600">-${invoice.discountTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">${invoice.taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Grand Total:</span>
              <span>${invoice.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {(invoice.notes || invoice.termsAndConditions) && (
          <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}
            {invoice.termsAndConditions && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Terms & Conditions</h4>
                <p className="text-sm text-gray-600">{invoice.termsAndConditions}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {loading && <LoadingSpinner fullScreen text="Processing..." />}
    </div>
  );
};

export default ProformaInvoiceView;