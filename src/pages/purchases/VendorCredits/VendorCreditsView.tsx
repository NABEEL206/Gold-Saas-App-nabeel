// src/pages/purchases/VendorCredits/VendorCreditsView.tsx

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
  TrendingDown,
  Hash,
  Tag,
} from 'lucide-react';
import { useVendorCredits } from '../../../hooks/VendorCredits/useVendorCredits';
import { useVendorCreditsView } from '../../../hooks/VendorCredits/useVendorCreditsView';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../../components/common/ThreeDotDropdown';

// Status Badge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-100 text-gray-700', icon: Clock, label: 'Draft' },
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, label: 'Pending' },
    approved: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle, label: 'Approved' },
    used: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Used' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
    expired: { color: 'bg-gray-100 text-gray-500', icon: AlertCircle, label: 'Expired' },
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

// Reason Badge
const ReasonBadge: React.FC<{ reason: string }> = ({ reason }) => {
  const config = {
    return: { color: 'bg-blue-100 text-blue-700', label: 'Return' },
    discount: { color: 'bg-green-100 text-green-700', label: 'Discount' },
    adjustment: { color: 'bg-purple-100 text-purple-700', label: 'Adjustment' },
    damage: { color: 'bg-red-100 text-red-700', label: 'Damage' },
    other: { color: 'bg-gray-100 text-gray-700', label: 'Other' },
  };
  const { color, label } = config[reason as keyof typeof config] || config.other;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const VendorCreditsView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCreditById, deleteCredit } = useVendorCredits();
  const [credit, setCredit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { 
    formatCurrency,
    getItemCount,
    getTotalItems,
    isExpired
  } = useVendorCreditsView(credit);

  useEffect(() => {
    const loadCredit = async () => {
      if (id) {
        setLoading(true);
        try {
          const data = await getCreditById(id);
          if (data) {
            setCredit(data);
          } else {
            setError('Vendor credit not found');
          }
        } catch (err) {
          console.error('Error loading vendor credit:', err);
          setError('Error loading vendor credit');
        } finally {
          setLoading(false);
        }
      }
    };
    loadCredit();
  }, [id, getCreditById]);

  const handleDelete = async () => {
    if (id) {
      setDeleteLoading(true);
      try {
        await deleteCredit(id);
        navigate('/purchases/vendor-credits');
      } catch (error) {
        console.error('Error deleting vendor credit:', error);
        setError('Failed to delete vendor credit');
        setShowDeleteModal(false);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/purchases/vendor-credits/${id}/edit`);
    }
  };

  const dropdownItems = [
    {
      label: 'Edit Credit',
      icon: <Edit className="h-4 w-4 text-amber-500" />,
      onClick: handleEdit,
    },
    {
      label: 'Delete Credit',
      icon: <Trash className="h-4 w-4 text-red-500" />,
      onClick: () => setShowDeleteModal(true),
      danger: true,
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading vendor credit details..." />
      </div>
    );
  }

  if (error || !credit) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
          {error || 'Vendor credit not found'}
        </div>
      </div>
    );
  }

  const expired = isExpired();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/purchases/vendor-credits')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{credit.creditNumber}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Vendor Credit Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Credit
          </button>
          <ThreeDotDropdown
            items={dropdownItems}
            position="right"
          />
        </div>
      </div>

      {/* Status Badges */}
      <div className="mb-6 flex flex-wrap gap-2">
        <StatusBadge status={credit.status} />
        <ReasonBadge reason={credit.reason} />
        {expired && (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700 inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Expired
          </span>
        )}
        <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 inline-flex items-center gap-1">
          <Package className="h-3 w-3" />
          {getItemCount()} items ({getTotalItems()} units)
        </span>
        {credit.billNumber && (
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 inline-flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Bill: {credit.billNumber}
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
                <p className="text-gray-900 font-medium">{credit.vendorName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Vendor ID</label>
                <p className="text-gray-900">{credit.vendorId || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {credit.vendorEmail || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {credit.vendorPhone || 'N/A'}
                </p>
              </div>
              {credit.vendorGST && (
                <div>
                  <label className="text-sm text-gray-500">GST Number</label>
                  <p className="text-gray-900">{credit.vendorGST}</p>
                </div>
              )}
            </div>
          </div>

          {/* Credit Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-gray-500" />
              Credit Items
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
                  {credit.items.map((item: any, index: number) => (
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
                    <td className="py-2 px-3 text-right">{formatCurrency(credit.amount)}</td>
                  </tr>
                  {credit.taxAmount > 0 && (
                    <tr>
                      <td colSpan={5} className="py-1 px-3 text-right text-blue-600 font-medium">Tax</td>
                      <td className="py-1 px-3 text-right text-blue-600">{formatCurrency(credit.taxAmount)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={5} className="py-2 px-3 text-right font-bold text-gray-900">Total Credit</td>
                    <td className="py-2 px-3 text-right font-bold text-amber-700">{formatCurrency(credit.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {credit.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{credit.notes}</p>
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
                <span className="text-sm text-gray-500">Credit ID</span>
                <span className="text-sm font-medium text-gray-900">#{credit.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Credit #</span>
                <span className="text-sm font-medium text-gray-900">{credit.creditNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Credit Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(credit.creditDate).toLocaleDateString()}
                </span>
              </div>
              {credit.expiryDate && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Expiry Date</span>
                  <span className={`text-sm font-medium ${expired ? 'text-red-600' : 'text-gray-900'}`}>
                    {new Date(credit.expiryDate).toLocaleDateString()}
                    {expired && ' (Expired)'}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-sm font-medium">
                  <StatusBadge status={credit.status} />
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total Amount</span>
                <span className="text-sm font-bold text-amber-600">{formatCurrency(credit.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Used Amount</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(credit.usedAmount || 0)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Balance Amount</span>
                <span className={`text-sm font-bold ${(credit.balanceAmount || 0) > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                  {formatCurrency(credit.balanceAmount || 0)}
                </span>
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
                Edit Credit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash className="h-4 w-4" />
                Delete Credit
              </button>
              <button
                onClick={() => navigate('/purchases/vendor-credits')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Credits
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Delete Vendor Credit</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete vendor credit "<span className="font-medium">{credit.creditNumber}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleteLoading ? <LoadingSpinner size="sm" /> : <Trash className="h-4 w-4" />}
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorCreditsView;