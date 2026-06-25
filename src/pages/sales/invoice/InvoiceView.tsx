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
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { useInvoices } from '../../../hooks/Invoices/useInvoices';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
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

// Generate demo items for any invoice
const generateDemoItems = (invoice: Invoice) => {
  if (invoice.items && invoice.items.length > 0) {
    return invoice.items;
  }

  // Generate demo items based on invoice ID or random
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
  
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvoice(id);
    }
  }, [id]);

  const loadInvoice = async (invoiceId: string) => {
    setLoading(true);
    try {
      const data = await getInvoice(invoiceId) as Invoice;
      
      // Ensure items exist
      const items = generateDemoItems(data);
      
      // Calculate totals
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
      // Try to load from mock data directly if getInvoice fails
      try {
        const mockModule = await import('../../../hooks/Invoices/useInvoices');
        const mockData = (mockModule as any).MOCK_INVOICES?.find((inv: Invoice) => inv.id === invoiceId);
        if (mockData) {
          const items = generateDemoItems(mockData);
          setInvoice({
            ...mockData,
            items: items,
          });
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

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setDeleteLoading(true);
      try {
        await deleteInvoice(id);
        navigate('/sales/invoices');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setDeleteLoading(false);
      }
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/sales/invoices/edit/${id}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Download logic here
    alert('Download functionality will be implemented');
  };

  // Dropdown items for three-dot menu - includes ALL actions
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
      label: 'Mark as Paid',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => handleStatusUpdate('paid'),
      show: invoice?.status === 'sent' || invoice?.status === 'partial',
      disabled: updating,
    },
    {
      label: 'Send Invoice',
      icon: <Send className="h-4 w-4 text-blue-500" />,
      onClick: () => handleStatusUpdate('sent'),
      show: invoice?.status === 'draft',
      disabled: updating,
    },
    {
      label: 'Cancel Invoice',
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      onClick: () => handleStatusUpdate('cancelled'),
      show: invoice?.status === 'sent',
      disabled: updating,
    },
  ];

  if (loading || hookLoading) {
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
          <button
            onClick={() => navigate('/sales/invoices')}
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
            {/* Three Dot Dropdown - Contains ALL actions */}
            <ThreeDotDropdown
              items={dropdownItems.filter(item => item.show !== false)}
              position="right"
            />
          </div>
        </div>

        {/* Status - Removed action buttons, only showing status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Status:</span>
            <StatusBadge status={invoice.status} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick action buttons removed - all actions now in dropdown */}
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
                          {item.purity && (
                            <span className="text-xs text-amber-600">{item.purity}</span>
                          )}
                          {item.weight && (
                            <span className="text-xs text-gray-500 ml-2">Weight: {item.weight}g</span>
                          )}
                          {item.makingCharges && item.makingCharges > 0 && (
                            <span className="text-xs text-gray-500 ml-2">MC: ₹{item.makingCharges}</span>
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
                    <td className="px-4 py-2 text-right">
                      ₹{(invoice.items || []).reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2)}
                    </td>
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