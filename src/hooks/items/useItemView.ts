// src/hooks/items/useItemView.ts
import { useState, useCallback } from 'react';
import type{ Item } from '../../types/items/Itemstype';

// Mock item for view
const MOCK_ITEM: Item = {
  id: '1',
  itemCode: 'GOLD-RING-001',
  itemName: 'Gold Diamond Ring',
  itemType: 'Gold',
  category: 'Rings',
  brand: 'Luxury Gold',
  designCode: 'GR-2024-001',
  metalType: 'Gold',
  purity: '22K',
  grossWeight: 8.5,
  stoneWeight: 1.2,
  netWeight: 7.3,
  unit: 'g',
  diamondPieces: 12,
  caratWeight: 0.75,
  mcType: 'percentage',
  mcValue: 10,
  goldRate: 5400,
  sellingPrice: 45000,
  mrp: 52000,
  currency: 'INR',
  openingStock: 25,
  reorderLevel: 5,
  hsnCode: '71131911',
  gstPercentage: 18,
  salesAccount: 'sales',
  salesDescription: 'Beautiful gold ring with diamonds',
  purchasePrice: 38000,
  purchaseDescription: 'Bulk purchase from supplier',
  purchaseAccount: 'cogs',
  preferredVendor: 'preferred_vendor',
  status: 'active',
  description: 'Elegant gold ring with diamond setting',
  images: [
    'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Ring+1',
    'https://via.placeholder.com/400x400/FFC700/FFFFFF?text=Ring+2',
    'https://via.placeholder.com/400x400/FFB700/FFFFFF?text=Ring+3',
  ],
  createdBy: 'admin',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-03-20T14:45:00Z'
};

export const useItemDetails = () => {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Return mock item
      setItem(MOCK_ITEM);
    } catch (err) {
      setError('Failed to fetch item details');
      console.error('Error fetching item:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Deleted item:', id);
    } catch (err) {
      console.error('Error deleting item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: 'active' | 'inactive') => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setItem((prev) => prev ? { ...prev, status } : null);
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    item,
    error,
    fetchItem,
    deleteItem,
    updateStatus,
  };
};