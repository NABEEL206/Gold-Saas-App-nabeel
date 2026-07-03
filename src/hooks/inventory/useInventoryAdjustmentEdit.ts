// src/hooks/inventory/useInventoryAdjustmentEdit.ts

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { 
  InventoryAdjustment, 
  AdjustmentItem, 
  AdjustmentItemFormData,
  InventoryAdjustmentFormData 
} from '../../types/inventory/InventoryAdjustmentTypes';
import type { DropdownOption } from '../../components/common/Searchabledropdown';

// Mock data - Replace with actual API calls
const MOCK_ADJUSTMENTS: Record<string, InventoryAdjustment> = {
  '1': {
    id: '1',
    adjustmentNo: 'ADJ-2024-001',
    date: '2024-03-15',
    type: 'quantity',
    itemCount: 3,
    branch: 'Main Branch',
    value: 25000,
    status: 'draft',
    reason: 'Stock count discrepancy',
    items: [
      {
        id: 'item-1',
        itemId: 'prod-1',
        itemCode: 'GR-001',
        itemName: 'Gold Ring 22K',
        category: 'Rings',
        previousQuantity: 10,
        adjustedQuantity: 12,
        newQuantity: 12,
        previousWeight: 50,
        adjustedWeight: 60,
        newWeight: 60,
        previousValue: 75000,
        adjustedValue: 90000,
        newValue: 90000,
        difference: 2,
        reason: 'Found additional stock',
      },
      {
        id: 'item-2',
        itemId: 'prod-2',
        itemCode: 'GC-001',
        itemName: 'Gold Chain 22K',
        category: 'Chains',
        previousQuantity: 5,
        adjustedQuantity: 4,
        newQuantity: 4,
        previousWeight: 100,
        adjustedWeight: 80,
        newWeight: 80,
        previousValue: 45000,
        adjustedValue: 36000,
        newValue: 36000,
        difference: -1,
        reason: 'Damaged item removed',
      },
      {
        id: 'item-3',
        itemId: 'prod-3',
        itemCode: 'GE-001',
        itemName: 'Gold Earrings',
        category: 'Earrings',
        previousQuantity: 20,
        adjustedQuantity: 22,
        newQuantity: 22,
        previousWeight: 40,
        adjustedWeight: 44,
        newWeight: 44,
        previousValue: 64000,
        adjustedValue: 70400,
        newValue: 70400,
        difference: 2,
        reason: 'Miscount correction',
      },
    ],
    totalGain: 4,
    totalLoss: 1,
    notes: 'Quarterly stock audit adjustment',
    createdBy: 'John Doe',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T12:00:00Z',
  },
  '2': {
    id: '2',
    adjustmentNo: 'ADJ-2024-002',
    date: '2024-03-20',
    type: 'weight',
    itemCount: 2,
    branch: 'Main Branch',
    value: 15000,
    status: 'draft',
    items: [
      {
        id: 'item-4',
        itemId: 'prod-4',
        itemCode: 'GB-001',
        itemName: 'Gold Bracelet',
        category: 'Bracelets',
        previousQuantity: 8,
        adjustedQuantity: 8,
        newQuantity: 8,
        previousWeight: 120,
        adjustedWeight: 125,
        newWeight: 125,
        previousValue: 45600,
        adjustedValue: 47500,
        newValue: 47500,
        difference: 5,
        reason: 'Weight recalibration',
      },
    ],
    totalGain: 5,
    totalLoss: 0,
    notes: 'Weight recalibration after scale maintenance',
    createdBy: 'Jane Smith',
    createdAt: '2024-03-20T09:00:00Z',
    updatedAt: '2024-03-20T09:00:00Z',
  },
};

// Mock available items for dropdown
const MOCK_AVAILABLE_ITEMS = [
  { id: 'prod-1', code: 'GR-001', name: 'Gold Ring 22K', category: 'Rings', quantity: 10, weight: 50, value: 75000 },
  { id: 'prod-2', code: 'GC-001', name: 'Gold Chain 22K', category: 'Chains', quantity: 5, weight: 100, value: 45000 },
  { id: 'prod-3', code: 'GE-001', name: 'Gold Earrings', category: 'Earrings', quantity: 20, weight: 40, value: 64000 },
  { id: 'prod-4', code: 'GB-001', name: 'Gold Bracelet', category: 'Bracelets', quantity: 8, weight: 120, value: 45600 },
  { id: 'prod-5', code: 'DR-001', name: 'Diamond Ring 18K', category: 'Rings', quantity: 15, weight: 30, value: 127500 },
  { id: 'prod-6', code: 'SN-001', name: 'Silver Necklace', category: 'Necklaces', quantity: 25, weight: 200, value: 70000 },
];

export const useInventoryAdjustmentEdit = (id: string) => {
  const navigate = useNavigate();
  
  // State
  const [adjustment, setAdjustment] = useState<InventoryAdjustment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableItems, setAvailableItems] = useState<any[]>([]);
  const [itemOptions, setItemOptions] = useState<DropdownOption[]>([]);

  // Form state
  const [formData, setFormData] = useState<InventoryAdjustmentFormData>({
    type: 'quantity',
    branch: 'Main Branch',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    reason: '',
    items: [],
  });

  const [selectedItems, setSelectedItems] = useState<AdjustmentItemFormData[]>([]);

  // Load adjustment data
  const loadAdjustment = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await api.getAdjustmentById(id);
      
      // Using mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = MOCK_ADJUSTMENTS[id];
      
      if (data) {
        setAdjustment(data);
        setFormData({
          type: data.type,
          branch: data.branch,
          date: data.date,
          notes: data.notes || '',
          reason: data.reason || '',
          items: [],
        });
        
        // Convert items to form data format
        const items: AdjustmentItemFormData[] = data.items.map(item => ({
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          previousQuantity: item.previousQuantity,
          adjustedQuantity: item.adjustedQuantity,
          previousWeight: item.previousWeight,
          adjustedWeight: item.adjustedWeight,
          previousValue: item.previousValue,
          adjustedValue: item.adjustedValue,
          reason: item.reason || '',
          difference: item.difference,
        }));
        
        setSelectedItems(items);
        setErrors({});
      } else {
        setErrors({ load: 'Adjustment not found' });
      }
    } catch (error) {
      console.error('Error loading adjustment:', error);
      setErrors({ load: 'Failed to load adjustment data. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load available items
  const loadAvailableItems = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const items = await api.getAvailableItems();
      
      // Using mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = MOCK_AVAILABLE_ITEMS;
      setAvailableItems(items);
      
      // Convert to dropdown options
      const options: DropdownOption[] = items.map((item: any) => ({
        value: String(item.id),
        label: `${item.code} - ${item.name}`,
        group: item.category || 'Uncategorized',
      }));
      setItemOptions(options);
    } catch (error) {
      console.error('Error loading available items:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAdjustment();
    loadAvailableItems();
  }, [loadAdjustment, loadAvailableItems]);

  // Handle form field changes
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Add item to adjustment
  const handleAddItem = useCallback((item: any) => {
    const existingItem = selectedItems.find(i => i.itemId === String(item.id));
    if (existingItem) {
      return; // Item already added
    }

    const newItem: AdjustmentItemFormData = {
      itemId: String(item.id),
      itemCode: item.code || '',
      itemName: item.name || '',
      previousQuantity: item.quantity || 0,
      adjustedQuantity: item.quantity || 0,
      previousWeight: item.weight || 0,
      adjustedWeight: item.weight || 0,
      previousValue: item.value || 0,
      adjustedValue: item.value || 0,
      reason: '',
      difference: 0,
    };

    setSelectedItems(prev => [...prev, newItem]);
    
    // Clear items error
    if (errors.items) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  }, [selectedItems, errors]);

  // Remove item from adjustment
  const handleRemoveItem = useCallback((itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.itemId !== itemId));
  }, []);

  // Handle item field changes
  const handleItemChange = useCallback((itemId: string, field: string, value: any) => {
    setSelectedItems(prev => 
      prev.map(item => {
        if (item.itemId === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Calculate difference based on adjustment type
          if (field === 'adjustedQuantity') {
            updatedItem.difference = value - updatedItem.previousQuantity;
          }
          if (field === 'adjustedWeight') {
            updatedItem.difference = value - updatedItem.previousWeight;
          }
          if (field === 'adjustedValue') {
            updatedItem.difference = value - updatedItem.previousValue;
          }
          
          return updatedItem;
        }
        return item;
      })
    );

    // Clear item-specific error
    const errorKey = `item_${itemId}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  }, [errors]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const totals = {
      itemCount: selectedItems.length,
      totalValue: 0,
      totalGain: 0,
      totalLoss: 0,
      netChange: 0,
    };

    selectedItems.forEach(item => {
      const diff = item.difference || 0;
      totals.totalValue += formData.type === 'quantity' 
        ? item.adjustedQuantity 
        : formData.type === 'weight' 
        ? item.adjustedWeight 
        : item.adjustedValue;
      
      if (diff > 0) {
        totals.totalGain += diff;
      } else {
        totals.totalLoss += Math.abs(diff);
      }
    });

    totals.netChange = totals.totalGain - totals.totalLoss;
    return totals;
  }, [selectedItems, formData.type]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Adjustment type is required';
    }

    if (selectedItems.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    // Validate each item
    selectedItems.forEach((item, index) => {
      const key = `item_${index}`;
      if (formData.type === 'quantity' && item.adjustedQuantity < 0) {
        newErrors[key] = 'Quantity cannot be negative';
      }
      if (formData.type === 'weight' && item.adjustedWeight < 0) {
        newErrors[key] = 'Weight cannot be negative';
      }
      if (formData.type === 'value' && item.adjustedValue < 0) {
        newErrors[key] = 'Value cannot be negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedItems]);

  // Update adjustment
  const updateAdjustment = useCallback(async (): Promise<{ success: boolean }> => {
    if (!id || !adjustment) {
      return { success: false };
    }

    if (!validateForm()) {
      return { success: false };
    }

    setSaving(true);
    try {
      // TODO: Replace with actual API call
      // const result = await api.updateAdjustment(id, { ...formData, items: selectedItems });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Updating adjustment:', {
        id,
        ...formData,
        items: selectedItems,
      });

      // Update local state
      setAdjustment(prev => prev ? {
        ...prev,
        ...formData,
        items: selectedItems.map(item => ({
          id: item.itemId,
          itemId: item.itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          category: '',
          previousQuantity: item.previousQuantity,
          adjustedQuantity: item.adjustedQuantity,
          newQuantity: item.previousQuantity + (item.adjustedQuantity - item.previousQuantity),
          previousWeight: item.previousWeight,
          adjustedWeight: item.adjustedWeight,
          newWeight: item.previousWeight + (item.adjustedWeight - item.previousWeight),
          previousValue: item.previousValue,
          adjustedValue: item.adjustedValue,
          newValue: item.previousValue + (item.adjustedValue - item.previousValue),
          difference: item.difference || 0,
          reason: item.reason,
        })),
        itemCount: selectedItems.length,
        updatedAt: new Date().toISOString(),
      } : null);

      return { success: true };
    } catch (error) {
      console.error('Error updating adjustment:', error);
      setErrors({ submit: 'Failed to update adjustment. Please try again.' });
      return { success: false };
    } finally {
      setSaving(false);
    }
  }, [id, adjustment, formData, selectedItems, validateForm]);

  // Delete adjustment
  const deleteAdjustment = useCallback(async () => {
    if (!id) return;

    try {
      // TODO: Replace with actual API call
      // await api.deleteAdjustment(id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Deleting adjustment:', id);
    } catch (error) {
      console.error('Error deleting adjustment:', error);
      throw error;
    }
  }, [id]);

  // Refresh data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAdjustment();
      await loadAvailableItems();
    } finally {
      setRefreshing(false);
    }
  }, [loadAdjustment, loadAvailableItems]);

  // Check if editable (only draft adjustments can be edited)
  const isEditable = adjustment?.status === 'draft';

  return {
    // State
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

    // Actions
    handleFormChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    calculateTotals,
    updateAdjustment,
    deleteAdjustment,
    handleRefresh,
    loadAdjustment,
    validateForm,
  };
};