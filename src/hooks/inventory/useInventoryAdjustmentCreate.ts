// src/hooks/inventory/useInventoryAdjustmentCreate.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { InventoryAdjustmentFormData, AdjustmentItemFormData } from '../../types/inventory/InventoryAdjustmentTypes';

// Mock items - Replace with actual API call
const MOCK_ITEMS = [
  { id: '1', code: 'ITEM001', name: 'Product A', category: 'Electronics', currentQuantity: 100, currentWeight: 50, currentValue: 5000 },
  { id: '2', code: 'ITEM002', name: 'Product B', category: 'Clothing', currentQuantity: 200, currentWeight: 80, currentValue: 8000 },
  { id: '3', code: 'ITEM003', name: 'Product C', category: 'Food', currentQuantity: 150, currentWeight: 30, currentValue: 3000 },
];

const MOCK_BRANCHES = ['Main Branch', 'East Branch', 'West Branch', 'North Branch', 'South Branch'];

export const useInventoryAdjustmentCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<InventoryAdjustmentFormData>({
    type: 'quantity',
    branch: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    items: [],
  });
  const [selectedItems, setSelectedItems] = useState<AdjustmentItemFormData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch items - Replace with actual API call
  const fetchItems = useCallback(async (search: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter mock items
      const filtered = MOCK_ITEMS.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase())
      );
      return filtered;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all items (for initial load)
  const getAvailableItems = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_ITEMS;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get branches
  const getBranches = useCallback(() => {
    return MOCK_BRANCHES;
  }, []);

  // Add item to adjustment
  const handleAddItem = useCallback((item: any) => {
    const existingItem = selectedItems.find(i => i.itemId === item.id);
    if (existingItem) {
      setErrors(prev => ({
        ...prev,
        items: 'Item already added to adjustment'
      }));
      setTimeout(() => setErrors(prev => ({ ...prev, items: '' })), 3000);
      return false;
    }

    const newItem: AdjustmentItemFormData = {
      itemId: item.id,
      itemCode: item.code,
      itemName: item.name,
      previousQuantity: item.currentQuantity,
      adjustedQuantity: item.currentQuantity,
      previousWeight: item.currentWeight,
      adjustedWeight: item.currentWeight,
      previousValue: item.currentValue,
      adjustedValue: item.currentValue,
      reason: '',
      difference: 0,
    };

    setSelectedItems(prev => [...prev, newItem]);
    setShowItemSearch(false);
    setSearchQuery('');
    return true;
  }, [selectedItems]);

  // Remove item from adjustment
  const handleRemoveItem = useCallback((itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.itemId !== itemId));
  }, []);

  // Update form field
  const handleFormChange = useCallback((field: keyof InventoryAdjustmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Update item adjustment values
  const handleItemChange = useCallback((itemId: string, field: string, value: any) => {
    setSelectedItems(prev =>
      prev.map(item => {
        if (item.itemId !== itemId) return item;

        const updated = { ...item, [field]: value };

        // Auto-calculate differences based on type
        if (field === 'adjustedQuantity' || field === 'adjustedWeight' || field === 'adjustedValue') {
          let diff = 0;
          if (field === 'adjustedQuantity') {
            diff = value - item.previousQuantity;
          } else if (field === 'adjustedWeight') {
            diff = value - item.previousWeight;
          } else {
            diff = value - item.previousValue;
          }
          updated.difference = diff;
        }

        return updated;
      })
    );
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (selectedItems.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    // Validate each item
    selectedItems.forEach((item, index) => {
      const diff = item.difference || 0;
      if (diff === 0) {
        newErrors[`item_${index}`] = 'Adjustment value must be different from current value';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.branch, formData.date, selectedItems]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    let totalGain = 0;
    let totalLoss = 0;
    let totalValue = 0;

    selectedItems.forEach(item => {
      const diff = item.difference || 0;
      if (formData.type === 'quantity') {
        totalValue += item.adjustedQuantity || 0;
        if (diff > 0) totalGain += diff;
        else if (diff < 0) totalLoss += Math.abs(diff);
      } else if (formData.type === 'weight') {
        totalValue += item.adjustedWeight || 0;
        if (diff > 0) totalGain += diff;
        else if (diff < 0) totalLoss += Math.abs(diff);
      } else {
        totalValue += item.adjustedValue || 0;
        if (diff > 0) totalGain += diff;
        else if (diff < 0) totalLoss += Math.abs(diff);
      }
    });

    return { 
      totalGain, 
      totalLoss, 
      totalValue, 
      itemCount: selectedItems.length,
      netChange: totalGain - totalLoss
    };
  }, [formData.type, selectedItems]);

  // Create adjustment
  const createAdjustment = useCallback(async (data: InventoryAdjustmentFormData) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate adjustment number
      const adjustmentNo = `ADJ-${Date.now()}`;
      
      // Calculate totals
      const totals = calculateTotals();
      
      // Prepare final data
      const adjustmentData = {
        ...data,
        adjustmentNo,
        itemCount: data.items.length,
        totalGain: totals.totalGain,
        totalLoss: totals.totalLoss,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Creating adjustment:', adjustmentData);
      
      // Return success
      return { success: true, data: adjustmentData };
    } catch (error) {
      console.error('Error creating adjustment:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [calculateTotals]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      type: 'quantity',
      branch: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      items: [],
    });
    setSelectedItems([]);
    setSearchQuery('');
    setShowItemSearch(false);
    setErrors({});
  }, []);

  return {
    // State
    formData,
    selectedItems,
    searchQuery,
    showItemSearch,
    errors,
    loading,
    saving,
    
    // Actions
    handleFormChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    validateForm,
    calculateTotals,
    createAdjustment,
    resetForm,
    fetchItems,
    getAvailableItems,
    getBranches,
    setShowItemSearch,
    setSearchQuery,
    setErrors,
  };
};