// src/pages/Inventory/InventoryAdjustmentView.tsx
import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  FileSpreadsheet,
  Printer,
  Download,
  Package,
  Scale,
  DollarSign,
  Calendar,
  MapPin,
  User,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  MoreVertical,
  Upload,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ThreeDotDropdown from '../../components/common/ThreeDotDropdown';
import type { ThreeDotDropdownItem } from '../../components/common/ThreeDotDropdown';
import { useInventoryAdjustmentView } from '../../hooks/inventory/useInventoryAdjustmentView';

const InventoryAdjustmentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    adjustment,
    loading,
    activeTab,
    deleteModalOpen,
    approveModalOpen,
    actionLoading,
    error,
    setActiveTab,
    setDeleteModalOpen,
    setApproveModalOpen,
    handleEdit,
    handleDelete,
    handleApprove,
    handleExport,
    handlePrint,
    handleImport,
    getStatusInfo,
    getTypeInfo,
    formatDate,
    formatDateTime,
  } = useInventoryAdjustmentView(id!);

  // Define dropdown items
  const dropdownItems: ThreeDotDropdownItem[] = [
    {
      label: 'Export as PDF',
      icon: <FileText className="h-4 w-4 text-red-500" />,
      onClick: () => handleExport('pdf'),
    },
    {
      label: 'Export as Excel',
      icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
      onClick: () => handleExport('excel'),
    },
    {
      label: 'Print',
      icon: <Printer className="h-4 w-4 text-blue-500" />,
      onClick: handlePrint,
    },
  ];

  // Add edit/delete options if draft
  if (adjustment?.status === 'draft') {
    dropdownItems.push(
      {
        label: 'Edit',
        icon: <Edit className="h-4 w-4 text-amber-500" />,
        onClick: handleEdit,
      },
      {
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4 text-red-500" />,
        onClick: () => setDeleteModalOpen(true),
        danger: true,
      }
    );
  }

  // Add approve option if pending
  if (adjustment?.status === 'pending') {
    dropdownItems.push({
      label: 'Approve',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      onClick: () => setApproveModalOpen(true),
    });
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading adjustment details..." />
      </div>
    );
  }

  if (error || !adjustment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Adjustment</h3>
          <p className="text-sm text-red-600">{error || 'Adjustment not found'}</p>
          <button
            onClick={() => navigate('/inventory/adjustments')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(adjustment.status);
  const typeInfo = getTypeInfo(adjustment.type);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inventory/adjustments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{adjustment.adjustmentNo}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.icon === 'FileText' && <FileText className="h-3 w-3" />}
                {statusInfo.icon === 'Clock' && <Clock className="h-3 w-3" />}
                {statusInfo.icon === 'CheckCircle' && <CheckCircle className="h-3 w-3" />}
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">View adjustment details and manage inventory</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Three Dot Dropdown with all actions */}
          <ThreeDotDropdown 
            items={dropdownItems}
            position="right"
            onImport={handleImport}
            importLabel="Import Adjustment"
            importIcon={<Upload className="h-4 w-4 text-blue-500" />}
            importAccept=".csv,.xlsx,.xls"
            importMultiple={false}
          />

          {/* Quick Action Buttons for primary actions */}
          {adjustment.status === 'draft' && (
            <>
              <button
                onClick={handleEdit}
                className="px-3 py-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
            </>
          )}

          {adjustment.status === 'pending' && (
            <button
              onClick={() => setApproveModalOpen(true)}
              className="px-3 py-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'details'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('items')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'items'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Items ({adjustment.items.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  History
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Adjustment No</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{adjustment.adjustmentNo}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(adjustment.date)}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.icon === 'Package' && <Package className="h-3 w-3" />}
                          {typeInfo.icon === 'Scale' && <Scale className="h-3 w-3" />}
                          {typeInfo.icon === 'DollarSign' && <DollarSign className="h-3 w-3" />}
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Branch</label>
                      <p className="text-sm font-medium text-gray-900 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {adjustment.branch}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Total Items</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">{adjustment.itemCount}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Total Value</label>
                      <p className="text-sm font-medium text-gray-900 mt-1">₹{adjustment.value}</p>
                    </div>
                  </div>

                  {adjustment.notes && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Notes</label>
                      <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">{adjustment.notes}</p>
                    </div>
                  )}

                  {adjustment.reason && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Reason</label>
                      <p className="text-sm text-gray-700 mt-1">{adjustment.reason}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Summary</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-600 font-medium">Total Gain</p>
                        <p className="text-lg font-bold text-green-700">+{adjustment.totalGain}</p>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-xs text-red-600 font-medium">Total Loss</p>
                        <p className="text-lg font-bold text-red-700">-{adjustment.totalLoss}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">Net Change</p>
                        <p className={`text-lg font-bold ${adjustment.totalGain - adjustment.totalLoss >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {adjustment.totalGain - adjustment.totalLoss >= 0 ? '+' : ''}
                          {adjustment.totalGain - adjustment.totalLoss}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Tab */}
              {activeTab === 'items' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Previous</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Adjusted</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">New</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Difference</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {adjustment.items.map((item) => {
                        const diff = item.difference || 0;
                        return (
                          <tr key={item.id}>
                            <td className="px-3 py-2">
                              <div>
                                <p className="font-medium text-gray-900">{item.itemName}</p>
                                <p className="text-xs text-gray-500">{item.itemCode}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600">{item.category}</td>
                            <td className="px-3 py-2 text-right">
                              {adjustment.type === 'quantity' && item.previousQuantity}
                              {adjustment.type === 'weight' && item.previousWeight}
                              {adjustment.type === 'value' && item.previousValue}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {adjustment.type === 'quantity' && item.adjustedQuantity}
                              {adjustment.type === 'weight' && item.adjustedWeight}
                              {adjustment.type === 'value' && item.adjustedValue}
                            </td>
                            <td className="px-3 py-2 text-right font-medium">
                              {adjustment.type === 'quantity' && item.newQuantity}
                              {adjustment.type === 'weight' && item.newWeight}
                              {adjustment.type === 'value' && item.newValue}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <span className={`font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {diff > 0 ? '+' : ''}{diff}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-600 max-w-xs">
                              {item.reason || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Adjustment Created</p>
                      <p className="text-xs text-gray-500">
                        By {adjustment.createdBy} at {formatDateTime(adjustment.createdAt)}
                      </p>
                    </div>
                  </div>

                  {adjustment.status === 'adjusted' && adjustment.approvedBy && (
                    <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Adjustment Approved</p>
                        <p className="text-xs text-gray-500">
                          By {adjustment.approvedBy} at {formatDateTime(adjustment.approvedAt || '')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Last Modified</p>
                      <p className="text-xs text-gray-500">
                        at {formatDateTime(adjustment.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-gray-400" />
                      <p className="text-xs text-gray-500">
                        Status: <span className="font-medium">{statusInfo.label}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Status</h3>
            <div className={`p-4 rounded-lg ${statusInfo.color.replace('text-', 'bg-').replace('text-gray-700', 'bg-gray-100')}`}>
              <div className="flex items-center gap-2">
                {statusInfo.icon === 'FileText' && <FileText className="h-5 w-5" />}
                {statusInfo.icon === 'Clock' && <Clock className="h-5 w-5" />}
                {statusInfo.icon === 'CheckCircle' && <CheckCircle className="h-5 w-5" />}
                <span className="font-medium">{statusInfo.label}</span>
              </div>
            </div>
          </div>

          {/* Created By Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Created By</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{adjustment.createdBy}</p>
                <p className="text-xs text-gray-500">{formatDateTime(adjustment.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {adjustment.status === 'draft' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 text-center">This adjustment is in draft mode</p>
              <div className="mt-2 space-y-2">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Adjustment
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-full px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Adjustment
                </button>
              </div>
            </div>
          )}

          {adjustment.status === 'pending' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 text-center">Awaiting approval</p>
              <button
                onClick={() => setApproveModalOpen(true)}
                className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Adjustment
              </button>
            </div>
          )}

          {adjustment.status === 'adjusted' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Approved</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This adjustment has been approved and applied
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Adjustment</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete adjustment <span className="font-medium">{adjustment.adjustmentNo}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Approve Adjustment</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to approve adjustment <span className="font-medium">{adjustment.adjustmentNo}</span>?
                This will apply the changes to inventory.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Approval Notes (Optional)
                </label>
                <textarea
                  id="approvalNotes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Add any notes about this approval..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setApproveModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const notes = (document.getElementById('approvalNotes') as HTMLTextAreaElement)?.value;
                    handleApprove({ notes });
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : <CheckCircle className="h-4 w-4" />}
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAdjustmentView;