// src/pages/purchases/PurchaseOrders/PurchaseOrderView.tsx

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
  Truck,
  User,
  Mail,
  Phone,
  MapPin,
  Printer,
  Download,
} from 'lucide-react';
import { usePurchaseOrder } from '../../../hooks/purchaseOrder/usePurchaseOrder';
import { usePurchaseOrderView } from '../../../hooks/purchaseOrder/usePurchaseOrderView';
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
    ordered: { color: 'bg-indigo-100 text-indigo-700', icon: Package, label: 'Ordered' },
    received: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Received' },
    partially_received: { color: 'bg-purple-100 text-purple-700', icon: Package, label: 'Partial' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
    completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Completed' },
  };
  const defaultConfig = { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const cfg = (config as Record<string, { color: string; icon: any; label: string }>)[status] || defaultConfig;
  const { color, icon: Icon, label } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

// Priority Badge
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const config = {
    low: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
    medium: { color: 'bg-blue-100 text-blue-700', label: 'Medium' },
    high: { color: 'bg-yellow-100 text-yellow-700', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' },
  };
  const { color, label } = (config as Record<string, { color: string; label: string }>)[priority] || config.low;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const PurchaseOrderView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getOrderById, deleteOrder } = usePurchaseOrder();
  const [order, setOrder] = useState<any>(null);
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
    getStatusLabel, 
    getPriorityLabel, 
    formatCurrency,
    getItemCount,
    getTotalItems
  } = usePurchaseOrderView(order);

  useEffect(() => {
    const loadOrder = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await getOrderById(id);
          if (data) {
            setOrder(data);
          } else {
            setError('Purchase order not found');
            showError('Purchase order not found');
          }
        } catch (err) {
          console.error('Error loading purchase order:', err);
          setError('Error loading purchase order');
          showError('Failed to load purchase order details. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        showError('Invalid purchase order ID');
        navigate('/purchases/orders');
      }
    };
    loadOrder();
  }, [id, getOrderById, navigate, showError]);

  const handleDelete = async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Purchase Order',
        message: `Are you sure you want to delete purchase order "${order?.poNumber}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteOrder(id);
            navigate('/purchases/orders');
          },
          'Deleting purchase order...',
          `Purchase order "${order?.poNumber}" deleted successfully.`,
          'Failed to delete purchase order. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    console.log('Edit clicked - Purchase Order ID:', id);
    if (id) {
      navigate(`/purchases/orders/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid purchase order ID');
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
      label: 'Edit Purchase Order',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Purchase Order',
      icon: <Trash className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading purchase order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{error || 'Purchase order not found'}</p>
          <button
            onClick={() => navigate('/purchases/orders')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Purchase Orders
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
              onClick={() => navigate('/purchases/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{order.poNumber}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Purchase Order Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Order
            </button>
            <ThreeDotDropdown
              items={dropdownItems}
              position="right"
            />
          </div>
        </div>

        {/* Status Badges */}
        <div className="mb-6 flex flex-wrap gap-2">
          <StatusBadge status={order.status} />
          <PriorityBadge priority={order.priority} />
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 inline-flex items-center gap-1">
            <Package className="h-3 w-3" />
            {getItemCount()} items ({getTotalItems()} units)
          </span>
          {order.expectedDeliveryDate && (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Expected: {new Date(order.expectedDeliveryDate).toLocaleDateString()}
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
                  <p className="text-gray-900 font-medium">{order.vendorName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Vendor ID</label>
                  <p className="text-gray-900">{order.vendorId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {order.vendorEmail || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {order.vendorPhone || 'N/A'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="text-gray-900 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    {order.vendorAddress || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                Order Items
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
                    {order.items.map((item: any, index: number) => (
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
                      <td className="py-2 px-3 text-right">{formatCurrency(order.subtotal)}</td>
                    </tr>
                    {order.discountTotal > 0 && (
                      <tr>
                        <td colSpan={5} className="py-1 px-3 text-right text-green-600 font-medium">Discount</td>
                        <td className="py-1 px-3 text-right text-green-600">-{formatCurrency(order.discountTotal)}</td>
                      </tr>
                    )}
                    {order.taxTotal > 0 && (
                      <tr>
                        <td colSpan={5} className="py-1 px-3 text-right text-blue-600 font-medium">Tax</td>
                        <td className="py-1 px-3 text-right text-blue-600">{formatCurrency(order.taxTotal)}</td>
                      </tr>
                    )}
                    {order.shippingCharges > 0 && (
                      <tr>
                        <td colSpan={5} className="py-1 px-3 text-right text-gray-600 font-medium">Shipping</td>
                        <td className="py-1 px-3 text-right">{formatCurrency(order.shippingCharges)}</td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={5} className="py-2 px-3 text-right font-bold text-gray-900">Total</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-700">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes & Terms */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}

            {order.terms && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Terms & Conditions</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{order.terms}</p>
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
                  <span className="text-sm text-gray-500">PO Number</span>
                  <span className="text-sm font-medium text-gray-900">{order.poNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Order Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium">
                    <StatusBadge status={order.status} />
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Priority</span>
                  <span className="text-sm font-medium">
                    <PriorityBadge priority={order.priority} />
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Total Amount</span>
                  <span className="text-sm font-bold text-amber-600">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Items</span>
                  <span className="text-sm font-medium text-gray-900">{getItemCount()} items</span>
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
                  Edit Order
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash className="h-4 w-4" />
                  Delete Order
                </button>
                <button
                  onClick={() => navigate('/purchases/orders')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Orders
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

export default PurchaseOrderView;