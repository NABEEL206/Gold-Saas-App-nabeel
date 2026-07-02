// src/pages/sales/CreditNotes/CreditNoteView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  Edit,
  Trash2,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  Building2,
  FileText,
  Send,
  Calendar,
  User,
  IndianRupee,
} from 'lucide-react';
import { useCreditNote } from '../../../hooks/CreditNote/useCreditNote';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../../hooks/ToastConfirmModal/useToastAndConfirm';
import type { CreditNote } from '../../../types/creditNote/CreditNoteTypes';

// Status Badge
const StatusBadge: React.FC<{ status: CreditNote['status'] }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: FileText, label: 'Draft' },
    sent: { color: 'bg-blue-100 text-blue-700', icon: Send, label: 'Sent' },
    approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approved' },
    rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
  };
  const { color, icon: Icon, label } = config[status] || config.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

// Generate dummy credit note data
const generateDummyCreditNote = (id: string): CreditNote => {
  const dummyCreditNotes: Record<string, CreditNote> = {
    '1': {
      id: '1',
      creditNoteNumber: 'CN-2024-001',
      creditNoteDate: new Date().toISOString().split('T')[0],
      customerId: '1',
      customerName: 'Rajesh Jewelers',
      customerEmail: 'rajesh@jewelers.com',
      customerPhone: '+91-98765-43210',
      customerGst: '22AAAAA0000A1Z5',
      invoiceId: '1',
      invoiceNumber: 'INV-000001',
      items: [
        {
          id: 'item1',
          creditNoteId: '1',
          itemName: 'Gold Chain',
          description: '22K Gold Chain with pendant',
          quantity: 1,
          unit: 'Pcs',
          rate: 4500,
          discount: 0,
          taxRate: 18,
          taxAmount: 810,
          total: 5310,
          purity: '22K',
          weight: 5.5,
          makingCharges: 400,
        },
      ],
      subtotal: 4500,
      taxRate: 18,
      taxAmount: 810,
      discount: 0,
      discountType: 'percentage',
      total: 5310,
      reason: 'Product damaged during shipping',
      status: 'approved',
      notes: 'Customer returned damaged item',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    '2': {
      id: '2',
      creditNoteNumber: 'CN-2024-002',
      creditNoteDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId: '2',
      customerName: 'Priya Gold House',
      customerEmail: 'priya@goldhouse.com',
      customerPhone: '+91-98765-43211',
      customerGst: '22BBBBB0000B1Z5',
      invoiceId: '2',
      invoiceNumber: 'INV-000002',
      items: [
        {
          id: 'item2',
          creditNoteId: '2',
          itemName: 'Gold Earrings',
          description: '22K Gold Earrings with pearl',
          quantity: 2,
          unit: 'Pcs',
          rate: 3200,
          discount: 0,
          taxRate: 18,
          taxAmount: 1152,
          total: 7552,
          purity: '22K',
          weight: 6.8,
          makingCharges: 400,
        },
      ],
      subtotal: 6400,
      taxRate: 18,
      taxAmount: 1152,
      discount: 0,
      discountType: 'percentage',
      total: 7552,
      reason: 'Quality issue - incorrect purity',
      status: 'sent',
      notes: 'Customer complained about purity mismatch',
      createdBy: 'admin',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    '3': {
      id: '3',
      creditNoteNumber: 'CN-2024-003',
      creditNoteDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      customerId: '3',
      customerName: 'Suresh Gold Mart',
      customerEmail: 'suresh@goldmart.com',
      customerPhone: '+91-98765-43212',
      customerGst: '22CCCCC0000C1Z5',
      invoiceId: '3',
      invoiceNumber: 'INV-000003',
      items: [
        {
          id: 'item3',
          creditNoteId: '3',
          itemName: 'Gold Bracelet',
          description: '22K Gold Bracelet with diamonds',
          quantity: 1,
          unit: 'Pcs',
          rate: 3800,
          discount: 0,
          taxRate: 18,
          taxAmount: 684,
          total: 4484,
          purity: '22K',
          weight: 5.2,
          makingCharges: 700,
        },
      ],
      subtotal: 3800,
      taxRate: 18,
      taxAmount: 684,
      discount: 0,
      discountType: 'percentage',
      total: 4484,
      reason: 'Customer requested cancellation',
      status: 'draft',
      notes: 'Pending approval from management',
      createdBy: 'admin',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    '4': {
      id: '4',
      creditNoteNumber: 'CN-2024-004',
      creditNoteDate: new Date().toISOString().split('T')[0],
      customerId: '4',
      customerName: 'Meera Jewel World',
      customerEmail: 'meera@jewelworld.com',
      customerPhone: '+91-98765-43213',
      customerGst: '22DDDDD0000D1Z5',
      invoiceId: '4',
      invoiceNumber: 'INV-000004',
      items: [
        {
          id: 'item4',
          creditNoteId: '4',
          itemName: 'Diamond Ring',
          description: '18K Diamond Ring with 0.5ct diamond',
          quantity: 1,
          unit: 'Pcs',
          rate: 8500,
          discount: 0,
          taxRate: 18,
          taxAmount: 1530,
          total: 10030,
          purity: '18K',
          weight: 3.2,
          makingCharges: 800,
        },
      ],
      subtotal: 8500,
      taxRate: 18,
      taxAmount: 1530,
      discount: 0,
      discountType: 'percentage',
      total: 10030,
      reason: 'Wrong item delivered',
      status: 'approved',
      notes: 'Replacement sent to customer',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  return dummyCreditNotes[id] || dummyCreditNotes['1'];
};

const CreditNoteView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCreditNote, updateStatus, deleteCreditNote, loading: hookLoading } = useCreditNote();
  
  const [loading, setLoading] = useState(true);
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
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
      loadCreditNote(id);
    } else {
      showError('Invalid credit note ID');
      navigate('/sales/credit-notes');
    }
  }, [id]);

  const loadCreditNote = async (creditNoteId: string) => {
    setLoading(true);
    try {
      const data = await getCreditNote(creditNoteId) as CreditNote;
      if (data) {
        setCreditNote(data);
      } else {
        const dummyData = generateDummyCreditNote(creditNoteId);
        setCreditNote(dummyData);
      }
    } catch (error) {
      console.error('Error loading credit note:', error);
      showError('Failed to load credit note. Loading demo data.');
      const dummyData = generateDummyCreditNote(creditNoteId);
      setCreditNote(dummyData);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: CreditNote['status']) => {
    if (!id) return;
    
    const statusLabels: Record<string, string> = {
      draft: 'Revert to Draft',
      sent: 'Send',
      approved: 'Approve',
      rejected: 'Reject',
    };
    
    const actionLabel = statusLabels[status] || status;
    const variant = status === 'rejected' ? 'danger' as const : status === 'approved' ? 'primary' as const : 'warning' as const;
    
    await withConfirmation(
      {
        title: `${actionLabel} Credit Note`,
        message: `Are you sure you want to ${actionLabel.toLowerCase()} this credit note?`,
        confirmText: actionLabel,
        variant,
      },
      async () => {
        setUpdating(true);
        try {
          await updateStatus(id, status);
          await loadCreditNote(id);
          success(`Credit note ${status === 'approved' ? 'approved' : `status updated to ${status}`} successfully.`);
        } catch (error) {
          console.error('Error updating status:', error);
          showError('Failed to update credit note status. Please try again.');
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
        title: 'Delete Credit Note',
        message: 'Are you sure you want to delete this credit note? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteCreditNote(id);
            navigate('/sales/credit-notes');
          },
          'Deleting credit note...',
          'Credit note deleted successfully.',
          'Failed to delete credit note. Please try again.'
        );
      }
    );
  };

  const handleEdit = () => {
    console.log('Edit clicked - Credit Note ID:', id);
    if (id) {
      navigate(`/sales/credit-notes/${id}/edit`);
    } else {
      showError('Cannot edit: Invalid credit note ID');
    }
  };

  const handlePrint = () => {
    success('Preparing document for printing...');
    setTimeout(() => window.print(), 500);
  };

  const handleDownload = () => {
    warning('Download functionality will be implemented soon.');
  };

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
      show: creditNote?.status === 'draft',
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4 text-red-500" />,
      onClick: handleDelete,
      show: creditNote?.status === 'draft',
    },
    {
      label: 'Send Credit Note',
      icon: <Send className="h-4 w-4 text-blue-500" />,
      onClick: () => handleStatusUpdate('sent'),
      show: creditNote?.status === 'draft',
      disabled: updating,
    },
    {
      label: 'Approve',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => handleStatusUpdate('approved'),
      show: creditNote?.status === 'sent',
      disabled: updating,
    },
    {
      label: 'Reject',
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      onClick: () => handleStatusUpdate('rejected'),
      show: creditNote?.status === 'sent',
      disabled: updating,
    },
  ];

  if (loading || hookLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading credit note..." />
      </div>
    );
  }

  if (!creditNote) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Credit Note not found</p>
          <button
            onClick={() => navigate('/sales/credit-notes')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Credit Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales/credit-notes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Credit Note Details</h1>
              <p className="text-sm text-gray-500">{creditNote.creditNoteNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Direct Edit Button for draft credit notes */}
            {creditNote.status === 'draft' && (
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Credit Note
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
            <StatusBadge status={creditNote.status} />
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

        {/* Credit Note Content */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{creditNote.creditNoteNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date: {new Date(creditNote.creditNoteDate).toLocaleDateString()}
                </p>
                {creditNote.invoiceNumber && (
                  <p className="text-sm text-gray-500">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Against Invoice: {creditNote.invoiceNumber}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Created: {new Date(creditNote.createdAt || creditNote.creditNoteDate).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-3xl font-bold text-amber-600">₹{creditNote.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-amber-500" />
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-900">{creditNote.customerName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" /> {creditNote.customerEmail}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" /> {creditNote.customerPhone}
                </p>
              </div>
              <div>
                {creditNote.customerGst && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> GST: {creditNote.customerGst}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="p-6 border-b border-gray-200 bg-yellow-50">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-yellow-600" />
              Reason for Credit Note
            </h3>
            <p className="text-sm font-medium text-gray-900">{creditNote.reason}</p>
          </div>

          {/* Items Table */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Discount</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tax</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {creditNote.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.itemName}</p>
                        {item.purity && (
                          <span className="text-xs text-amber-600">{item.purity}</span>
                        )}
                        {item.weight && (
                          <span className="text-xs text-gray-500 ml-2">Wt: {item.weight}g</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.description}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">₹{item.rate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{item.discount}%</td>
                      <td className="px-4 py-3 text-right">{item.taxRate}%</td>
                      <td className="px-4 py-3 text-right font-medium">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-right font-medium">Subtotal</td>
                    <td className="px-4 py-2 text-right font-medium">₹{creditNote.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-right font-medium">Tax</td>
                    <td className="px-4 py-2 text-right font-medium">₹{creditNote.taxAmount.toFixed(2)}</td>
                  </tr>
                  {creditNote.discount > 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-2 text-right font-medium">Discount</td>
                      <td className="px-4 py-2 text-right font-medium text-red-600">-₹{creditNote.discount.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={6} className="px-4 py-3 text-right font-bold text-lg">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-amber-600">₹{creditNote.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {creditNote.notes && (
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-500" />
                Notes
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border border-gray-200">
                {creditNote.notes}
              </p>
            </div>
          )}
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

export default CreditNoteView;