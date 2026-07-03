// src/pages/Inventory/InventoryAdjustmentEdit.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  Package,
  Scale,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  Info,
  RefreshCw,
  X,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchableDropdown, { type DropdownOption } from '../../components/common/Searchabledropdown';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { useToastAndConfirm } from '../../hooks/ToastConfirmModal/useToastAndConfirm';
import { useInventoryAdjustmentEdit } from '../../hooks/inventory/useInventoryAdjustmentEdit';

const InventoryAdjustmentEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
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
    adjustment,
    formData,
    selectedItems,
    errors,
    loading,
    saving,
    refreshing,
    itemOptions,
    availableItems,
    isEditable,
    handleFormChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    calculateTotals,
    updateAdjustment,
    deleteAdjustment,
    handleRefresh,
    loadAdjustment,
  } = useInventoryAdjustmentEdit(id!);

  // Snapshot for unsaved changes detection
  const initialSnapshotRef = useRef<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading && adjustment && initialSnapshotRef.current === null) {
      initialSnapshotRef.current = JSON.stringify({ formData, selectedItems });
    }
    if (initialSnapshotRef.current !== null) {
      setHasChanges(JSON.stringify({ formData, selectedItems }) !== initialSnapshotRef.current);
    }
  }, [formData, selectedItems, loading, adjustment]);

  // Show error toast for load errors
  useEffect(() => {
    if (errors.load) {
      showError(errors.load);
    }
  }, [errors.load, showError]);

  const getItemById = useCallback((itemId: string) => {
    return availableItems.find((item: any) => String(item.id) === itemId);
  }, [availableItems]);

  const handleItemSelect = useCallback((option: DropdownOption) => {
    const item = getItemById(option.value);
    if (item) {
      handleAddItem(item);
      success(`"${item.name}" added to adjustment.`);
    }
  }, [getItemById, handleAddItem, success]);

  const totals = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      showError('Please add at least one item before saving.');
      return;
    }

    await withLoading(
      async () => {
        const result = await updateAdjustment();
        if (!result.success) {
          throw new Error('Failed to update adjustment');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        navigate(`/inventory/adjustments/${id}`);
      },
      'Updating adjustment...',
      `Adjustment "${adjustment?.adjustmentNo}" updated successfully!`,
      'Failed to update adjustment. Please try again.'
    );
  };

  // Delete with confirmation
  const handleDelete = useCallback(async () => {
    if (!adjustment) return;
    
    await withConfirmation(
      {
        title: 'Delete Adjustment',
        message: `Are you sure you want to delete adjustment "${adjustment.adjustmentNo}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
      },
      async () => {
        await withLoading(
          async () => {
            await deleteAdjustment();
            navigate('/inventory/adjustments');
          },
          'Deleting adjustment...',
          `Adjustment "${adjustment.adjustmentNo}" deleted successfully!`,
          'Failed to delete adjustment.'
        );
      }
    );
  }, [adjustment, withConfirmation, withLoading, deleteAdjustment, navigate]);

  // Cancel handler with unsaved changes confirmation
  const handleCancel = useCallback(async () => {
    if (!hasChanges) {
      navigate(`/inventory/adjustments/${id}`);
      return;
    }

    await withConfirmation(
      {
        title: 'Discard Changes',
        message: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmText: 'Discard',
        variant: 'danger',
      },
      async () => {
        navigate(`/inventory/adjustments/${id}`);
      }
    );
  }, [hasChanges, id, navigate, withConfirmation]);

  // Refresh handler with unsaved changes warning
  const handleRefreshWithWarning = useCallback(async () => {
    if (hasChanges) {
      await withConfirmation(
        {
          title: 'Refresh Data',
          message: 'You have unsaved changes. Refreshing will discard all changes. Are you sure?',
          confirmText: 'Refresh',
          variant: 'warning',
        },
        async () => {
          await handleRefresh();
          initialSnapshotRef.current = null;
          success('Data refreshed successfully.');
        }
      );
    } else {
      await handleRefresh();
      success('Data refreshed successfully.');
    }
  }, [hasChanges, handleRefresh, withConfirmation, success]);

  // Reset form handler
  const handleResetForm = useCallback(async () => {
    if (!hasChanges) return;

    await withConfirmation(
      {
        title: 'Reset Form',
        message: 'Are you sure you want to reset all changes to the original values?',
        confirmText: 'Reset',
        variant: 'warning',
      },
      async () => {
        await loadAdjustment();
        initialSnapshotRef.current = null;
        success('Form reset to original values.');
      }
    );
  }, [hasChanges, loadAdjustment, withConfirmation, success]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quantity': return <Package className="h-4 w-4" />;
      case 'weight': return <Scale className="h-4 w-4" />;
      case 'value': return <DollarSign className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading adjustment..." />
      </div>
    );
  }

  if (!adjustment) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Adjustment Not Found</h3>
          <p className="text-sm text-gray-500 mt-1">The adjustment you are trying to edit does not exist.</p>
          <button
            onClick={() => navigate('/inventory/adjustments')}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Adjustments
          </button>
        </div>
      </div>
    );
  }

  if (!isEditable) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Cannot Edit</h3>
          <p className="text-sm text-gray-500 mt-1">
            This adjustment is in <strong>{adjustment.status}</strong> status and cannot be edited.
          </p>
          <button
            onClick={() => navigate(`/inventory/adjustments/${id}`)}
            className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            View Adjustment
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Edit Adjustment</h1>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {adjustment.adjustmentNo}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Status: <span className="font-medium capitalize">{adjustment.status}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefreshWithWarning}
              disabled={refreshing}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {hasChanges && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Reset changes"
              >
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={saving || selectedItems.length === 0 || refreshing}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Update Adjustment'}
            </button>
          </div>
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && Object.keys(errors).some(key => key !== 'load') && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {Object.entries(errors)
                  .filter(([key]) => key !== 'load')
                  .map(([key, value]) => (
                    <li key={key}>{String(value)}</li>
                  ))}
              </ul>
            </div>
          </div>
        )}

        {/* Load Error */}
        {errors.load && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{errors.load}</p>
              <button
                onClick={handleRefreshWithWarning}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - Left 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Adjustment Type <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {['quantity', 'weight', 'value'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleFormChange('type', type)}
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                            formData.type === type
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {getTypeIcon(type)}
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleFormChange('date', e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.date ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {errors.date && (
                        <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Reason
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        value={formData.reason || ''}
                        onChange={(e) => handleFormChange('reason', e.target.value)}
                        placeholder="Reason for adjustment..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Notes
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        placeholder="Optional notes..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Items</h2>
                  <div className="w-64">
                    <SearchableDropdown
                      options={itemOptions}
                      value={null}
                      onChange={handleItemSelect}
                      placeholder="Search items..."
                      triggerPlaceholder="Add item..."
                      className="w-full max-w-full"
                      resetSearchOnOpen={true}
                      showEmptyState={true}
                      emptyStateText="No items found"
                      maxListHeight={280}
                    />
                  </div>
                </div>

                {errors.items && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{errors.items}</span>
                  </div>
                )}

                {/* Selected Items List */}
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No items added yet</p>
                    <p className="text-sm">Search and select items from the dropdown above</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Previous</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adjusted</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">New</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedItems.map((item: any, index: number) => {
                          const diff = item.difference || 0;
                          const isError = errors[`item_${index}`];
                          
                          return (
                            <tr key={item.itemId} className={isError ? 'bg-red-50' : ''}>
                              <td className="px-3 py-2">
                                <div>
                                  <p className="font-medium text-gray-900">{item.itemName}</p>
                                  <p className="text-xs text-gray-500">{item.itemCode}</p>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-600">
                                {formData.type === 'quantity' && item.previousQuantity}
                                {formData.type === 'weight' && `${item.previousWeight} kg`}
                                {formData.type === 'value' && `₹${item.previousValue}`}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={
                                    formData.type === 'quantity' ? item.adjustedQuantity :
                                    formData.type === 'weight' ? item.adjustedWeight :
                                    item.adjustedValue
                                  }
                                  onChange={(e) => {
                                    const value = parseFloat(e.target.value) || 0;
                                    const field = formData.type === 'quantity' ? 'adjustedQuantity' :
                                                  formData.type === 'weight' ? 'adjustedWeight' :
                                                  'adjustedValue';
                                    handleItemChange(item.itemId, field, value);
                                  }}
                                  className={`w-24 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                                    isError ? 'border-red-500' : 'border-gray-200'
                                  }`}
                                  step="0.01"
                                />
                              </td>
                              <td className="px-3 py-2 text-sm font-medium">
                                {formData.type === 'quantity' && item.newQuantity}
                                {formData.type === 'weight' && `${item.newWeight} kg`}
                                {formData.type === 'value' && `₹${item.newValue}`}
                              </td>
                              <td className="px-3 py-2">
                                <span className={`font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                  {diff > 0 ? '+' : ''}{diff}
                                </span>
                                {isError && (
                                  <p className="text-xs text-red-500">{errors[`item_${index}`]}</p>
                                )}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={item.reason || ''}
                                  onChange={(e) => handleItemChange(item.itemId, 'reason', e.target.value)}
                                  placeholder="Reason..."
                                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.itemId)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Right 1/3 */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Items</span>
                    <span className="font-medium text-gray-900">{totals.itemCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total {formData.type === 'quantity' ? 'Quantity' : formData.type === 'weight' ? 'Weight' : 'Value'}</span>
                    <span className="font-medium text-gray-900">
                      {formData.type === 'quantity' && totals.totalValue}
                      {formData.type === 'weight' && `${totals.totalValue} kg`}
                      {formData.type === 'value' && `₹${totals.totalValue}`}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Total Gain</span>
                      <span className="font-medium text-green-600">+{totals.totalGain}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Total Loss</span>
                      <span className="font-medium text-red-600">-{totals.totalLoss}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-1 border-t border-gray-200 mt-1">
                      <span className="text-gray-700">Net Change</span>
                      <span className={totals.netChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {totals.netChange >= 0 ? '+' : ''}{totals.netChange}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      {totals.netChange > 0 ? 
                        `This adjustment will increase inventory by ${totals.netChange} units` :
                        totals.netChange < 0 ?
                        `This adjustment will decrease inventory by ${Math.abs(totals.netChange)} units` :
                        'No net change in inventory'
                      }
                    </p>
                  </div>
                )}

                {/* Warning for non-draft status */}
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700">
                    Only draft adjustments can be edited. Once approved, changes cannot be modified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
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

export default InventoryAdjustmentEdit;