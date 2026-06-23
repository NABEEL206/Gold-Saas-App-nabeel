// src/pages/Inventory/InventoryAdjustmentCreate.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Package,
  Scale,
  DollarSign,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  Search,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useInventoryAdjustmentCreate } from '../../hooks/inventory/useInventoryAdjustmentCreate';

const InventoryAdjustmentCreate: React.FC = () => {
  const navigate = useNavigate();
  const {
    formData,
    selectedItems,
    searchQuery,
    showItemSearch,
    errors,
    loading,
    saving,
    handleFormChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    calculateTotals,
    createAdjustment,
    resetForm,
    getAvailableItems,
    getBranches,
    setShowItemSearch,
    setSearchQuery,
  } = useInventoryAdjustmentCreate();

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);

  // Load available items
  useEffect(() => {
    const loadItems = async () => {
      const items = await getAvailableItems();
      setAvailableItems(items);
      setFilteredItems(items);
    };
    loadItems();
  }, [getAvailableItems]);

  // Filter items based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = availableItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(availableItems);
    }
  }, [searchQuery, availableItems]);

  const totals = calculateTotals();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createAdjustment({
        ...formData,
        items: selectedItems,
      });
      
      if (result.success) {
        navigate('/inventory/adjustments');
      }
    } catch (error) {
      console.error('Error creating adjustment:', error);
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quantity': return <Package className="h-4 w-4" />;
      case 'weight': return <Scale className="h-4 w-4" />;
      case 'value': return <DollarSign className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const branches = getBranches();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Create Inventory Adjustment</h1>
            <p className="text-sm text-gray-500 mt-0.5">Adjust inventory quantities, weights, or values</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory/adjustments')}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || selectedItems.length === 0}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
            Save Adjustment
          </button>
        </div>
      </div>

      {/* Error Summary */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm text-red-700">{errors.submit}</p>
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
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={formData.branch}
                      onChange={(e) => handleFormChange('branch', e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        errors.branch ? 'border-red-500' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                    {errors.branch && (
                      <p className="mt-1 text-xs text-red-500">{errors.branch}</p>
                    )}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Notes
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      value={formData.notes}
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
                <button
                  type="button"
                  onClick={() => setShowItemSearch(true)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>

              {errors.items && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">{errors.items}</span>
                </div>
              )}

              {/* Item Search Modal */}
              {showItemSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Add Items</h3>
                      <button
                        onClick={() => {
                          setShowItemSearch(false);
                          setSearchQuery('');
                        }}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search items by name or code..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="max-h-[300px] overflow-y-auto">
                        {filteredItems.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No items found</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                  <p className="text-xs text-gray-500">Code: {item.code} | {item.category}</p>
                                  <p className="text-xs text-gray-500">
                                    Qty: {item.currentQuantity} | Weight: {item.currentWeight}kg | Value: ₹{item.currentValue}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleAddItem(item)}
                                  className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors"
                                >
                                  Add
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Items List */}
              {selectedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No items added yet</p>
                  <p className="text-sm">Click "Add Item" to include items in this adjustment</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Previous</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Adjusted</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Difference</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedItems.map((item, index) => {
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
                            <td className="px-3 py-2">
                              {formData.type === 'quantity' && item.previousQuantity}
                              {formData.type === 'weight' && item.previousWeight}
                              {formData.type === 'value' && item.previousValue}
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
                              />
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
                                <Trash2 className="h-4 w-4" />
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
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <button
                type="button"
                onClick={resetForm}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InventoryAdjustmentCreate;