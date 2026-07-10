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
  FileText,
  AlertCircle,
  Info,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchableDropdown, { type DropdownOption } from '../../components/common/Searchabledropdown';
import { useInventoryAdjustmentCreate } from '../../hooks/inventory/useInventoryAdjustmentCreate';
import { useToast } from '../../components/common/Toast';

const InventoryAdjustmentCreate: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
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
    getAvailableItems,
    setShowItemSearch,
    setSearchQuery,
  } = useInventoryAdjustmentCreate();

  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [itemOptions, setItemOptions] = useState<DropdownOption[]>([]);

  // Load available items
  useEffect(() => {
    const loadItems = async () => {
      const items = await getAvailableItems();
      setAvailableItems(items);
      // Convert to dropdown options
      const options = items.map(item => ({
        value: String(item.id),
        label: `${item.code} - ${item.name}`,
        group: item.category || 'Uncategorized'
      }));
      setItemOptions(options);
    };
    loadItems();
  }, [getAvailableItems]);

  // Get item by ID
  const getItemById = (id: string) => {
    return availableItems.find(item => String(item.id) === id);
  };

  // Handle item selection from dropdown
  const handleItemSelect = (option: DropdownOption) => {
    const item = getItemById(option.value);
    if (item) {
      handleAddItem(item);
    }
  };

  const totals = calculateTotals();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error('Please add at least one item before saving.');
      return;
    }

    try {
      const result = await createAdjustment({
        ...formData,
        items: selectedItems,
      });

      if (result.success) {
        toast.success('Inventory adjustment created successfully!');
        navigate('/inventory/adjustments');
      } else {
        toast.error('Failed to create adjustment. Please try again.');
      }
    } catch (error) {
      console.error('Error creating adjustment:', error);
      toast.error('An unexpected error occurred. Please try again.');
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div
      className="p-6 min-h-screen themed-transition"
      style={{ background: 'var(--background)' }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inventory/adjustments')}
            className="p-2 rounded-lg transition-colors themed-transition"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <ArrowLeft className="h-5 w-5 themed-transition" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold themed-transition" style={{ color: 'var(--text)' }}>
              Create Inventory Adjustment
            </h1>
            <p className="text-sm mt-0.5 themed-transition" style={{ color: 'var(--text-secondary)' }}>
              Adjust inventory quantities, weights, or values
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/inventory/adjustments')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors themed-transition"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || selectedItems.length === 0}
            className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
            style={{
              background: 'var(--primary)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!saving && selectedItems.length > 0) {
                e.currentTarget.style.background = 'var(--primary-hover)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
            Save Adjustment
          </button>
        </div>
      </div>

      {/* Error Summary */}
      {errors.submit && (
        <div
          className="mb-6 p-4 rounded-lg flex items-start gap-3 themed-transition"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger)',
          }}
        >
          <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: 'var(--danger)' }} />
          <div>
            <p className="text-sm" style={{ color: 'var(--danger)' }}>{errors.submit}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form - Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div
              className="rounded-xl p-6 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 className="text-lg font-semibold mb-4 themed-transition" style={{ color: 'var(--text)' }}>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 themed-transition" style={{ color: 'var(--text)' }}>
                    Adjustment Type <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div className="flex gap-2">
                    {['quantity', 'weight', 'value'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleFormChange('type', type)}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 themed-transition ${
                          formData.type === type
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                        style={{
                          borderColor: formData.type === type ? 'var(--primary)' : 'var(--border)',
                          background: formData.type === type ? 'var(--primary-light)' : 'transparent',
                          color: formData.type === type ? 'var(--primary)' : 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          if (formData.type !== type) {
                            e.currentTarget.style.background = 'var(--hover-bg)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (formData.type !== type) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        {getTypeIcon(type)}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 themed-transition" style={{ color: 'var(--text)' }}>
                    Date <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 themed-transition"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition ${
                        errors.date ? 'border-red-500' : 'border'
                      }`}
                      style={{
                        border: errors.date ? '1px solid var(--danger)' : '1px solid var(--border)',
                        background: 'var(--card)',
                        color: 'var(--text)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = errors.date ? 'var(--danger)' : 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    {errors.date && (
                      <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.date}</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1.5 themed-transition" style={{ color: 'var(--text)' }}>
                    Notes
                  </label>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-3 h-4 w-4 themed-transition"
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Optional notes..."
                      className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none themed-transition"
                      style={{
                        border: '1px solid var(--border)',
                        background: 'var(--card)',
                        color: 'var(--text)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Selection */}
            <div
              className="rounded-xl p-6 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold themed-transition" style={{ color: 'var(--text)' }}>
                  Items
                </h2>
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
                <div
                  className="mb-4 p-3 rounded-lg flex items-center gap-2 themed-transition"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--danger)',
                  }}
                >
                  <AlertCircle className="h-4 w-4" style={{ color: 'var(--danger)' }} />
                  <span className="text-sm" style={{ color: 'var(--danger)' }}>{errors.items}</span>
                </div>
              )}

              {/* Selected Items List */}
              {selectedItems.length === 0 ? (
                <div
                  className="text-center py-8 border-2 border-dashed rounded-lg themed-transition"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Package
                    className="h-12 w-12 mx-auto mb-2 themed-transition"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <p>No items added yet</p>
                  <p className="text-sm themed-transition" style={{ color: 'var(--text-muted)' }}>
                    Search and select items from the dropdown above
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead
                      className="themed-transition"
                      style={{ background: 'var(--hover-bg)' }}
                    >
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase themed-transition" style={{ color: 'var(--text-muted)' }}>
                          Item
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase themed-transition" style={{ color: 'var(--text-muted)' }}>
                          Previous
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase themed-transition" style={{ color: 'var(--text-muted)' }}>
                          Adjusted
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase themed-transition" style={{ color: 'var(--text-muted)' }}>
                          Difference
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium uppercase themed-transition" style={{ color: 'var(--text-muted)' }}>
                          Reason
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium uppercase themed-transition" style={{ color: 'var(--text-muted)' }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y themed-transition"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {selectedItems.map((item, index) => {
                        const diff = item.difference || 0;
                        const isError = errors[`item_${index}`];
                        
                        return (
                          <tr
                            key={item.itemId}
                            className="themed-transition"
                            style={{
                              background: isError ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                            }}
                          >
                            <td className="px-3 py-2">
                              <div>
                                <p className="font-medium themed-transition" style={{ color: 'var(--text)' }}>
                                  {item.itemName}
                                </p>
                                <p className="text-xs themed-transition" style={{ color: 'var(--text-secondary)' }}>
                                  {item.itemCode}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 py-2 themed-transition" style={{ color: 'var(--text)' }}>
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
                                className={`w-24 px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 themed-transition ${
                                  isError ? 'border-red-500' : 'border'
                                }`}
                                style={{
                                  border: isError ? '1px solid var(--danger)' : '1px solid var(--border)',
                                  background: 'var(--card)',
                                  color: 'var(--text)',
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--primary)';
                                  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = isError ? 'var(--danger)' : 'var(--border)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`font-medium ${
                                  diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''
                                }`}
                                style={{
                                  color: diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--danger)' : 'var(--text-muted)',
                                }}
                              >
                                {diff > 0 ? '+' : ''}{diff}
                              </span>
                              {isError && (
                                <p className="text-xs" style={{ color: 'var(--danger)' }}>
                                  {errors[`item_${index}`]}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={item.reason || ''}
                                onChange={(e) => handleItemChange(item.itemId, 'reason', e.target.value)}
                                placeholder="Reason..."
                                className="w-full px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 themed-transition"
                                style={{
                                  border: '1px solid var(--border)',
                                  background: 'var(--card)',
                                  color: 'var(--text)',
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--primary)';
                                  e.currentTarget.style.boxShadow = 'var(--focus-ring)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--border)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.itemId)}
                                className="p-1 rounded-lg transition-colors"
                                style={{ color: 'var(--danger)' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
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
            <div
              className="rounded-xl p-6 sticky top-6 themed-transition"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4 themed-transition"
                style={{ color: 'var(--text)' }}
              >
                Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="themed-transition" style={{ color: 'var(--text-secondary)' }}>
                    Total Items
                  </span>
                  <span className="font-medium themed-transition" style={{ color: 'var(--text)' }}>
                    {totals.itemCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="themed-transition" style={{ color: 'var(--text-secondary)' }}>
                    Total {formData.type === 'quantity' ? 'Quantity' : formData.type === 'weight' ? 'Weight' : 'Value'}
                  </span>
                  <span className="font-medium themed-transition" style={{ color: 'var(--text)' }}>
                    {formData.type === 'quantity' && totals.totalValue}
                    {formData.type === 'weight' && `${totals.totalValue} kg`}
                    {formData.type === 'value' && `₹${totals.totalValue}`}
                  </span>
                </div>
                
                <div
                  className="pt-3 themed-transition"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--success)' }}>Total Gain</span>
                    <span className="font-medium" style={{ color: 'var(--success)' }}>
                      +{totals.totalGain}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--danger)' }}>Total Loss</span>
                    <span className="font-medium" style={{ color: 'var(--danger)' }}>
                      -{totals.totalLoss}
                    </span>
                  </div>
                  <div
                    className="flex justify-between text-sm font-medium pt-1 mt-1 themed-transition"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <span className="themed-transition" style={{ color: 'var(--text)' }}>
                      Net Change
                    </span>
                    <span
                      className="themed-transition"
                      style={{
                        color: totals.netChange >= 0 ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {totals.netChange >= 0 ? '+' : ''}{totals.netChange}
                    </span>
                  </div>
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div
                  className="mt-4 p-3 rounded-lg flex items-start gap-2 themed-transition"
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid var(--info)',
                  }}
                >
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--info)' }} />
                  <p className="text-xs" style={{ color: 'var(--info)' }}>
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
          </div>
        </div>
      </form>
    </div>
  );
};

export default InventoryAdjustmentCreate;