// src/pages/purchases/Bills/BillView.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash,
  DollarSign,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Package,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Printer,
  Download,
} from 'lucide-react';
import { useBills } from '../../../hooks/Bill/useBills';
import { useBillView } from '../../../hooks/Bill/useBillView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Pending' },
    approved: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Approved' },
    paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Paid' },
    partial: { color: 'bg-purple-100 text-purple-700', icon: Clock, label: 'Partial' },
    overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Overdue' },
    cancelled: { color: 'bg-gray-100 text-gray-500', icon: XCircle, label: 'Cancelled' },
  };
  const defaultConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = config[status as keyof typeof config] || defaultConfig;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
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

  // Use the toast and confirm hook
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
    handleCancel: onModalCancel,
  } = useToastAndConfirm();

  const { 
    formatCurrency,
    getItemCount,
    getTotalItems,
  } = useBillView(bill);

  useEffect(() => {
    const loadBill = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await getBillById(id);
          if (data) {
            setBill(data);
          } else {
            setError('Bill not found');
            showError('Bill not found');
          }
        } catch (err) {
          console.error('Error loading bill:', err);
          setError('Error loading bill');
          showError('Failed to load bill details. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        showError('Invalid bill ID');
        navigate('/purchases/bills');
      }
    };
    loadBill();
  }, [id, getBillById, navigate, showError]);

  const handleDelete = async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Bill',
        message: `Are you sure you want to delete bill "${bill?.billNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteBill(id);
            navigate('/purchases/bills');
          },
          'Deleting bill...',
          `Bill "${bill?.billNumber}" deleted successfully.`,
          'Failed to delete bill. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    console.log('Edit clicked - Bill ID:', id);
    if (id) {
      navigate(`/purchases/bills/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid bill ID');
    }
  };

  const handlePrint = () => {
    success('Preparing document for printing...');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = () => {
    warning('Download functionality will be implemented soon.');
  };

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
      label: 'Edit Bill',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Bill',
      icon: <Trash className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading bill details..." />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error || 'Bill not found'}</p>
          <button
            onClick={() => navigate('/purchases/bills')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Bills
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/purchases/bills')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{bill.billNumber}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Bill Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Bill
            </button>
            <ThreeDotDropdown
              items={dropdownItems}
              position="right"
            />
          </div>
        </div>

        {/* Status Badges */}
        <div className="mb-6 flex flex-wrap gap-2">
          <StatusBadge status={bill.status} />
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 inline-flex items-center gap-1">
            <Package className="h-3 w-3" />
            {getItemCount()} items ({getTotalItems()} units)
          </span>
          {bill.dueDate && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full inline-flex items-center gap-1 ${
              bill.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              <Calendar className="h-3 w-3" />
              Due: {new Date(bill.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-500" />
                Vendor Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Vendor Name</label>
                  <p className="text-gray-900 font-medium">{bill.vendorName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Vendor ID</label>
                  <p className="text-gray-900">{bill.vendorId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {bill.vendorEmail || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {bill.vendorPhone || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="text-gray-900 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    {bill.vendorAddress || 'N/A'}
                  </p>
                </div>
                {bill.vendorGST && (
                  <div>
                    <label className="text-sm text-gray-500">GST Number</label>
                    <p className="text-gray-900">{bill.vendorGST}</p>
                  </div>
                )}
                {bill.purchaseOrderNumber && (
                  <div>
                    <label className="text-sm text-gray-500">PO Number</label>
                    <p className="text-gray-900">{bill.purchaseOrderNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bill Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Bill Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Item</th>
                      <th className="text-center py-2 px-3 text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="text-center py-2 px-3 text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Discount</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Tax</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500">{item.description}</p>
                          )}
                        </td>
                        <td className="text-center py-2 px-3">{item.quantity}</td>
                        <td className="text-center py-2 px-3">{item.unit || '-'}</td>
                        <td className="text-right py-2 px-3">{formatCurrency(item.rate)}</td>
                        <td className="text-right py-2 px-3 text-green-600">
                          {item.discount > 0 ? `-${formatCurrency(item.discount)}` : '-'}
                        </td>
                        <td className="text-right py-2 px-3">{formatCurrency(item.taxAmount)}</td>
                        <td className="text-right py-2 px-3 font-semibold text-amber-700">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={5} className="py-2 px-3 text-right font-medium">Subtotal</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(bill.subtotal)}</td>
                    </tr>
                    {bill.discountTotal > 0 && (
                      <tr>
                        <td colSpan={5} className="py-1 px-3 text-right text-green-600 font-medium">Discount</td>
                        <td className="py-1 px-3 text-right text-green-600">-{formatCurrency(bill.discountTotal)}</td>
                      </tr>
                    )}
                    {bill.taxTotal > 0 && (
                      <tr>
                        <td colSpan={5} className="py-1 px-3 text-right text-blue-600 font-medium">Tax</td>
                        <td className="py-1 px-3 text-right text-blue-600">{formatCurrency(bill.taxTotal)}</td>
                      </tr>
                    )}
                    {bill.shippingCharges > 0 && (
                      <tr>
                        <td colSpan={5} className="py-1 px-3 text-right text-gray-600 font-medium">Shipping</td>
                        <td className="py-1 px-3 text-right">{formatCurrency(bill.shippingCharges)}</td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={5} className="py-2 px-3 text-right font-bold text-gray-900">Total</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-700">{formatCurrency(bill.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            {bill.paymentDate && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Payment Method</label>
                    <p className="text-gray-900">{bill.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Payment Date</label>
                    <p className="text-gray-900">{new Date(bill.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Terms */}
            {bill.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{bill.notes}</p>
              </div>
            )}

            {bill.terms && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{bill.terms}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Bill Number</span>
                  <span className="text-sm font-medium text-gray-900">{bill.billNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Bill Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(bill.billDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium">
                    <StatusBadge status={bill.status} />
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Amount</span>
                  <span className="text-sm font-bold text-amber-600">{formatCurrency(bill.totalAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Items</span>
                  <span className="text-sm font-medium text-gray-900">{getItemCount()} items</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Total Units</span>
                  <span className="text-sm font-medium text-gray-900">{getTotalItems()} units</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Bill
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4" />
                  Delete Bill
                </button>
                <button
                  onClick={() => navigate('/purchases/bills')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Bills
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal - Replaces the custom delete modal */}
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