// src/pages/purchases/PurchaseOrders/PurchaseOrderView.tsx

import React, { useState, useEffect, useMemo } from 'react';
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
  User,
  Mail,
  Phone,
  MapPin,
  Printer,
  Download,
  Eye,
  FileText as FileTextIcon,
} from 'lucide-react';
import { usePurchaseOrder } from '../../../hooks/purchaseOrder/usePurchaseOrder';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import { DocumentRenderer } from '../../../Templates/DocumentRenderer';
import { formatCurrency } from '../../../utils/Invoice/calculations';
import type { DocumentData } from '../../../types/Template/TemplateTypes';

type ViewMode = 'details' | 'preview';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Pending' },
    approved: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Approved' },
    ordered: { color: 'bg-indigo-100 text-indigo-700', icon: Package, label: 'Ordered' },
    received: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Received' },
    partially_received: { color: 'bg-purple-100 text-purple-700', icon: Package, label: 'Partial' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
    completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Completed' },
  };
  const cfg = config[status] || { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Unknown' };
  const { color, icon: Icon, label } = cfg;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}><Icon className="h-3 w-3" />{label}</span>;
};

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const config: Record<string, { color: string; label: string }> = {
    low: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
    medium: { color: 'bg-blue-100 text-blue-700', label: 'Medium' },
    high: { color: 'bg-yellow-100 text-yellow-700', label: 'High' },
    urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' },
  };
  const { color, label } = config[priority] || config.low;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
};

const PurchaseOrderView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getOrderById, deleteOrder } = usePurchaseOrder();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('details');
  const [previewLayout, setPreviewLayout] = useState<'modern' | 'classic' | 'compact' | 'minimal'>('modern');

  const { success, error: showError, warning, withConfirmation, withLoading, isOpen: modalOpen, options: modalOptions, isLoading: modalLoading, handleConfirm: onModalConfirm, handleCancel: onModalCancel } = useToastAndConfirm();

  useEffect(() => { if (id) loadOrder(id); else { showError('Invalid ID'); navigate('/purchases/orders'); } }, [id]);

  const loadOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const data = await getOrderById(orderId);
      if (data) setOrder(data);
      else { setError('Not found'); showError('Purchase order not found'); }
    } catch { setError('Error loading'); showError('Failed to load.'); }
    finally { setLoading(false); }
  };

  const getItemCount = () => order?.items?.length || 0;
  const getTotalItems = () => order?.items?.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0) || 0;

  const documentData = useMemo((): DocumentData | null => {
    if (!order) return null;
    return {
      documentNumber: order.poNumber,
      documentDate: new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      dueDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : undefined,
      company: {
        name: 'JewelPro Solutions Pvt Ltd', address: '123, Gold Street, Zaveri Bazaar',
        city: 'Mumbai', state: 'Maharashtra', pincode: '400002', country: 'India',
        phone: '+91 98765 43210', email: 'info@jewelpro.com', gst: '27AABCG1234A1Z5',
      },
      vendor: { name: order.vendorName || 'N/A', address: order.vendorAddress, phone: order.vendorPhone, email: order.vendorEmail },
      items: (order.items || []).map((item: any) => ({ name: item.productName, description: item.description || '', quantity: item.quantity, unit: item.unit || 'Pcs', rate: item.rate, discount: item.discount, taxRate: (item.taxAmount / ((item.quantity * item.rate) - (item.discount || 0)) * 100) || 0, total: item.total })),
      subtotal: order.subtotal, discountTotal: order.discountTotal, taxTotal: order.taxTotal,
      shippingCharges: order.shippingCharges, totalAmount: order.totalAmount,
      notes: order.notes, terms: order.terms,
    };
  }, [order]);

  const handleDelete = async () => {
    if (!id) return;
    await withConfirmation(
      { title: 'Delete', message: `Delete "${order?.poNumber}"?`, confirmText: 'Delete', variant: 'danger' },
      async () => { await withLoading(async () => { await deleteOrder(id); navigate('/purchases/orders'); }, 'Deleting...', 'Deleted.', 'Failed to delete.'); }
    );
  };

  const handleEdit = () => { if (id) navigate(`/purchases/orders/${id}/edit`); };
  const handlePrint = () => { setViewMode('preview'); setTimeout(() => window.print(), 300); };
  const handleDownload = () => { warning('Coming soon.'); };

  const dropdownItems = [
    { label: 'Print', icon: <Printer className="h-4 w-4 text-gray-500" />, onClick: handlePrint },
    { label: 'Download', icon: <Download className="h-4 w-4 text-blue-500" />, onClick: handleDownload },
    { label: 'Edit', icon: <Edit className="h-4 w-4 text-amber-500" />, onClick: handleEdit },
    { label: 'Delete', icon: <Trash className="h-4 w-4 text-red-500" />, onClick: handleDelete, danger: true },
  ];

  if (loading) return <div className="p-6 flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" text="Loading..." /></div>;
  if (error || !order) return <div className="p-6 flex items-center justify-center min-h-[400px]"><div className="text-center"><Package className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">{error || 'Not found'}</p><button onClick={() => navigate('/purchases/orders')} className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Back</button></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/purchases/orders')} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-600" /></button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              <div>
                <div className="flex items-center gap-2"><h1 className="text-lg font-bold text-gray-900">{order.poNumber}</h1><StatusBadge status={order.status} /></div>
                <p className="text-[11px] text-gray-500">{new Date(order.orderDate).toLocaleDateString()} | {order.vendorName} | {formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('details')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><FileTextIcon className="h-3.5 w-3.5" />Details</button>
              <button onClick={() => setViewMode('preview')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Eye className="h-3.5 w-3.5" />PDF View</button>
            </div>
            <button onClick={handleEdit} className="px-3 py-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1"><Edit className="h-3.5 w-3.5" />Edit</button>
            <div onClick={(e) => e.stopPropagation()}><ThreeDotDropdown items={dropdownItems} position="right" /></div>
          </div>
        </div>
        {viewMode === 'preview' && (
          <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 p-0.5">
              {(['modern', 'classic', 'compact', 'minimal'] as const).map(layout => (
                <button key={layout} onClick={() => setPreviewLayout(layout)} className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors capitalize ${previewLayout === layout ? 'bg-amber-500 text-white' : 'text-gray-500 hover:text-gray-700'}`}>{layout}</button>
              ))}
            </div>
            <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium text-white bg-amber-500 rounded hover:bg-amber-600"><Printer className="h-3 w-3" />Print</button>
          </div>
        )}
      </div>

      <div className="p-4">
        {viewMode === 'details' ? (
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={order.status} />
              <PriorityBadge priority={order.priority} />
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 flex items-center gap-1"><Package className="h-3 w-3" />{getItemCount()} items ({getTotalItems()} units)</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3"><Building2 className="h-4 w-4 inline mr-1" />Vendor</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="font-medium">{order.vendorName}</p><p className="text-gray-500 flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{order.vendorEmail || 'N/A'}</p><p className="text-gray-500 flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{order.vendorPhone || 'N/A'}</p></div>
                    <div><p className="text-gray-500 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 mt-0.5" />{order.vendorAddress || 'N/A'}</p></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Items</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-[11px] font-medium text-gray-500">Item</th><th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">Qty</th><th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">Rate</th><th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">Tax</th><th className="px-3 py-2 text-right text-[11px] font-medium text-gray-500">Total</th></tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {order.items.map((item: any, i: number) => (
                          <tr key={i}><td className="px-3 py-2"><p className="font-medium">{item.productName}</p></td><td className="px-3 py-2 text-right">{item.quantity}</td><td className="px-3 py-2 text-right">{formatCurrency(item.rate)}</td><td className="px-3 py-2 text-right">{formatCurrency(item.taxAmount)}</td><td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td></tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t"><td colSpan={4} className="py-2 px-3 text-right font-bold">Total</td><td className="py-2 px-3 text-right font-bold text-amber-600">{formatCurrency(order.totalAmount)}</td></tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                {order.notes && <div className="bg-white rounded-lg border border-gray-200 p-5"><h4 className="text-xs font-semibold uppercase mb-1">Notes</h4><p className="text-sm text-gray-600">{order.notes}</p></div>}
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                  <h4 className="text-xs font-semibold uppercase mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">PO #</span><span className="font-medium">{order.poNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{new Date(order.orderDate).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={order.status} /></div>
                    <div className="flex justify-between"><span className="text-gray-500">Priority</span><PriorityBadge priority={order.priority} /></div>
                    <div className="flex justify-between border-t pt-2"><span className="font-bold">Total</span><span className="font-bold text-amber-600">{formatCurrency(order.totalAmount)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-[210mm] mx-auto">
            {documentData && (
              <DocumentRenderer data={documentData} layout={previewLayout} config={{ documentType: 'purchase_order', showCompanyLogo: true, showSignature: true, showTerms: true }} />
            )}
          </div>
        )}
      </div>

      <ConfirmationModal isOpen={modalOpen} onClose={onModalCancel} onConfirm={onModalConfirm} title={modalOptions?.title} message={modalOptions?.message ?? ''} confirmText={modalOptions?.confirmText} cancelText={modalOptions?.cancelText} variant={modalOptions?.variant} isLoading={modalLoading} />
    </div>
  );
};

export default PurchaseOrderView;