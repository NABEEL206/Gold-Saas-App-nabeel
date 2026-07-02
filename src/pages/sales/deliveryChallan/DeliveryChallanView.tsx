// src/pages/sales/deliveryChallan/DeliveryChallanView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  Edit,
  Trash2,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  Receipt,
  Send,
  MapPin,
  Truck as TruckIcon,
  FileText,
} from 'lucide-react';
import { useDeliveryChallan } from '../../../hooks/DeliveryChallan/useDeliveryChallan';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { DeliveryChallan } from '../../../types/deliveryChallan/DeliveryChallanTypes';

// Status Badge
const StatusBadge: React.FC<{ status: DeliveryChallan['status'] }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700', icon: Truck, label: 'Sent' },
    delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
  };
  const { color, icon: Icon, label } = config[status] || config.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

// Generate demo items for any delivery challan
const generateDemoItems = (challan: DeliveryChallan) => {
  if (challan.items && challan.items.length > 0) {
    return challan.items;
  }

  return [
    {
      id: `demo_${Date.now()}_1`,
      deliveryChallanId: challan.id,
      productId: 'demo1',
      productName: 'Gold Ring',
      description: '22K Gold Ring with diamond',
      quantity: 1,
      unit: 'Pcs',
      rate: 5000,
      discount: 0,
      taxRate: 18,
      taxAmount: 900,
      total: 5900,
      purity: '22K',
      weight: 4.5,
      makingCharges: 500,
      stoneCharges: 1000,
    },
    {
      id: `demo_${Date.now()}_2`,
      deliveryChallanId: challan.id,
      productId: 'demo2',
      productName: 'Gold Chain',
      description: '22K Gold Chain with pendant',
      quantity: 2,
      unit: 'Pcs',
      rate: 4500,
      discount: 0,
      taxRate: 18,
      taxAmount: 1620,
      total: 9000,
      purity: '22K',
      weight: 10.5,
      makingCharges: 400,
      stoneCharges: 0,
    },
  ];
};

const DeliveryChallanView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getChallan, updateStatus, deleteChallan, loading: hookLoading } = useDeliveryChallan();
  
  const [loading, setLoading] = useState(true);
  const [challan, setChallan] = useState<DeliveryChallan | null>(null);
  const [updating, setUpdating] = useState(false);

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

  useEffect(() => {
    if (id) {
      loadChallan(id);
    } else {
      showError('Invalid delivery challan ID');
      navigate('/sales/delivery-challan');
    }
  }, [id]);

  const loadChallan = async (challanId: string) => {
    setLoading(true);
    try {
      const data = await getChallan(challanId) as DeliveryChallan;
      
      // Ensure items exist
      const items = generateDemoItems(data);
      
      // Calculate totals
      const itemsTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
      const subtotal = data.subtotal || itemsTotal;
      const taxAmount = data.taxAmount || (subtotal * (data.taxRate || 18) / 100);
      const total = data.total || (subtotal + taxAmount + (data.shippingCharge || 0) + (data.otherCharges || 0) - (data.discount || 0));
      
      setChallan({
        ...data,
        items: items,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total,
      });
    } catch (error) {
      console.error('Error loading delivery challan:', error);
      showError('Failed to load delivery challan. Please try again.');
      setChallan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: DeliveryChallan['status']) => {
    if (!id) return;
    
    const statusLabels: Record<string, string> = {
      sent: 'Send',
      delivered: 'Mark as Delivered',
      cancelled: 'Cancel',
      draft: 'Revert to Draft',
    };
    
    const actionLabel = statusLabels[status] || status;
    const variant = status === 'cancelled' ? 'danger' as const : status === 'delivered' ? 'primary' as const : 'warning' as const;
    
    await withConfirmation(
      {
        title: `${actionLabel} Challan`,
        message: `Are you sure you want to ${actionLabel.toLowerCase()} this delivery challan?`,
        confirmText: actionLabel,
        variant,
      },
      async () => {
        setUpdating(true);
        try {
          await updateStatus(id, status);
          await loadChallan(id);
          success(`Delivery challan ${status === 'cancelled' ? 'cancelled' : 'updated'} successfully.`);
        } catch (err) {
          showError(`Failed to update delivery challan status. Please try again.`);
        } finally {
          setUpdating(false);
        }
      }
    );
  };

  const handleDelete = async () => {
    if (!id) return;
    
    await withConfirmation(
      {
        title: 'Delete Delivery Challan',
        message: 'Are you sure you want to delete this delivery challan? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteChallan(id);
            navigate('/sales/delivery-challan');
          },
          'Deleting delivery challan...',
          'Delivery challan deleted successfully.',
          'Failed to delete delivery challan. Please try again.'
        );
      }
    );
  };

  // Fixed: Direct navigation to edit page
  const handleEdit = () => {
    console.log('Edit clicked - Challan ID:', id); // Debug log
    if (id) {
      navigate(`/sales/delivery-challan/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid challan ID');
    }
  };

  const handlePrint = () => {
    success('Preparing document for printing...');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = () => {
    warning('Download functionality will be implemented soon.');
  };

  // Dropdown items with proper configuration
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
      show: challan?.status === 'draft',
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      show: challan?.status === 'draft',
    },
    {
      label: 'Send Challan',
      icon: <Send className="h-4 w-4 text-blue-500" />,
      onClick: () => handleStatusUpdate('sent'),
      show: challan?.status === 'draft',
      disabled: updating,
    },
    {
      label: 'Mark as Delivered',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => handleStatusUpdate('delivered'),
      show: challan?.status === 'sent',
      disabled: updating,
    },
    {
      label: 'Cancel Challan',
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      onClick: () => handleStatusUpdate('cancelled'),
      show: challan?.status === 'draft' || challan?.status === 'sent',
      disabled: updating,
    },
  ];

  if (loading || hookLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading delivery challan..." />
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Delivery Challan not found</p>
          <button
            onClick={() => navigate('/sales/delivery-challan')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Delivery Challans
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
              onClick={() => navigate('/sales/delivery-challan')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Delivery Challan Details</h1>
              <p className="text-sm text-gray-500">{challan.challanNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Direct Edit Button for easier access */}
            {challan.status === 'draft' && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Challan
              </button>
            )}
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
            <StatusBadge status={challan.status} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {updating && (
              <span className="text-xs text-gray-500 flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Updating status...
              </span>
            )}
            <span className="text-xs text-gray-400">
              All actions available in ⋮ menu
            </span>
          </div>
        </div>

        {/* Challan Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">DELIVERY CHALLAN</h2>
                <p className="text-sm text-gray-500 mt-1"># {challan.challanNumber}</p>
                <p className="text-sm text-gray-500">Challan Date: {new Date(challan.challanDate).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Delivery Date: {new Date(challan.deliveryDate).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-3xl font-bold text-amber-600">₹{challan.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-900">{challan.customerName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" /> {challan.customerEmail}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" /> {challan.customerPhone}
                </p>
                {challan.customerAddress && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4" /> {challan.customerAddress}
                  </p>
                )}
                {challan.customerGst && (
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <FileText className="h-4 w-4" /> GST: {challan.customerGst}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Delivery Address</p>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    {challan.deliveryAddress}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Terms</p>
                  <p className="text-sm text-gray-900">{challan.paymentTerms}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transporter Details */}
          {(challan.transporterName || challan.vehicleNumber || challan.lrNumber) && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TruckIcon className="h-4 w-4" />
                Transport Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {challan.transporterName && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Transporter</p>
                    <p className="text-sm font-medium text-gray-900">{challan.transporterName}</p>
                  </div>
                )}
                {challan.vehicleNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Vehicle No.</p>
                    <p className="text-sm font-medium text-gray-900">{challan.vehicleNumber}</p>
                  </div>
                )}
                {challan.lrNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">LR Number</p>
                    <p className="text-sm font-medium text-gray-900">{challan.lrNumber}</p>
                  </div>
                )}
                {challan.lrDate && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">LR Date</p>
                    <p className="text-sm font-medium text-gray-900">{new Date(challan.lrDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

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
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {challan.items && challan.items.length > 0 ? (
                    challan.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          {item.purity && (
                            <span className="text-xs text-amber-600">{item.purity}</span>
                          )}
                          {item.weight && (
                            <span className="text-xs text-gray-500 ml-2">Wt: {item.weight}g</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.description}</td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{item.unit}</td>
                        <td className="px-4 py-3 text-right">₹{item.rate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">{item.discount}%</td>
                        <td className="px-4 py-3 text-right">{item.taxRate}%</td>
                        <td className="px-4 py-3 text-right font-medium">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No items in this delivery challan
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={7} className="px-4 py-2 text-right font-medium">Sub Total</td>
                    <td className="px-4 py-2 text-right">₹{challan.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={7} className="px-4 py-2 text-right font-medium">Tax</td>
                    <td className="px-4 py-2 text-right">₹{challan.taxAmount.toFixed(2)}</td>
                  </tr>
                  {challan.discount > 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-right font-medium">
                        Discount ({challan.discount}{challan.discountType === 'percentage' ? '%' : ''})
                      </td>
                      <td className="px-4 py-2 text-right">-₹{challan.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  {challan.shippingCharge > 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-right font-medium">Shipping</td>
                      <td className="px-4 py-2 text-right">₹{challan.shippingCharge.toFixed(2)}</td>
                    </tr>
                  )}
                  {challan.otherCharges > 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-right font-medium">Other Charges</td>
                      <td className="px-4 py-2 text-right">₹{challan.otherCharges.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={7} className="px-4 py-3 text-right font-bold text-lg">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-amber-600">₹{challan.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {challan.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{challan.notes}</p>
              </div>
            )}
            {challan.termsAndConditions && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{challan.termsAndConditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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

export default DeliveryChallanView;