// src/hooks/items/useItemDetails.ts
import { useState, useCallback } from 'react';

// Define the Item type
export interface ItemDetails {
  id: string;
  itemCode: string;
  itemName: string;
  itemType?: string;
  category?: string;
  brand?: string;
  designCode?: string;
  metalType?: string;
  purity?: string;
  grossWeight?: number;
  netWeight?: number;
  stoneWeight?: number;
  unit?: string;
  diamondPieces?: number;
  caratWeight?: number;
  sellingPrice: number;
  mrp?: number;
  goldRate?: number;
  mcType?: string;
  mcValue?: number;
  currency?: string;
  openingStock: number;
  reorderLevel?: number;
  hsnCode?: string;
  gstPercentage?: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'low_stock';
  description?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

// Dummy data for items
const dummyItems: Record<string, ItemDetails> = {
  '1': {
    id: '1',
    itemCode: 'JWL-001',
    itemName: 'Gold Chain Necklace',
    itemType: 'Jewelry',
    category: 'Necklaces',
    brand: 'Luxury Gold',
    designCode: 'DES-2024-001',
    metalType: 'Gold',
    purity: '22K',
    grossWeight: 25.5,
    netWeight: 24.8,
    stoneWeight: 2.3,
    unit: 'g',
    diamondPieces: 12,
    caratWeight: 1.5,
    sellingPrice: 45000,
    mrp: 52000,
    goldRate: 7200,
    mcType: 'percentage',
    mcValue: 15,
    currency: 'INR',
    openingStock: 15,
    reorderLevel: 5,
    hsnCode: '71131910',
    gstPercentage: 18,
    status: 'active',
    description: 'Beautiful 22K gold chain necklace with diamond studded pendant. Perfect for special occasions and weddings.',
    images: [
      'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=400',
      'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=400',
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-06-20T14:45:00Z',
    createdBy: 'Admin User',
  },
  '2': {
    id: '2',
    itemCode: 'JWL-002',
    itemName: 'Diamond Ring',
    itemType: 'Jewelry',
    category: 'Rings',
    brand: 'Diamond Elite',
    designCode: 'DES-2024-002',
    metalType: 'Platinum',
    purity: '950',
    grossWeight: 8.2,
    netWeight: 7.8,
    stoneWeight: 1.2,
    unit: 'g',
    diamondPieces: 24,
    caratWeight: 2.0,
    sellingPrice: 125000,
    mrp: 145000,
    goldRate: 0,
    mcType: 'fixed',
    mcValue: 15000,
    currency: 'INR',
    openingStock: 8,
    reorderLevel: 3,
    hsnCode: '71131920',
    gstPercentage: 18,
    status: 'active',
    description: 'Stunning platinum diamond ring with 24 brilliant cut diamonds. Elegant design for engagements and anniversaries.',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    ],
    createdAt: '2024-02-20T09:15:00Z',
    updatedAt: '2024-06-18T16:20:00Z',
    createdBy: 'Admin User',
  },
  '3': {
    id: '3',
    itemCode: 'JWL-003',
    itemName: 'Silver Earrings',
    itemType: 'Jewelry',
    category: 'Earrings',
    brand: 'Silver Shine',
    designCode: 'DES-2024-003',
    metalType: 'Silver',
    purity: '925',
    grossWeight: 12.0,
    netWeight: 11.5,
    stoneWeight: 0,
    unit: 'g',
    diamondPieces: 0,
    caratWeight: 0,
    sellingPrice: 8500,
    mrp: 9900,
    goldRate: 0,
    mcType: 'fixed',
    mcValue: 1200,
    currency: 'INR',
    openingStock: 25,
    reorderLevel: 10,
    hsnCode: '71131100',
    gstPercentage: 12,
    status: 'active',
    description: 'Elegant 925 sterling silver earrings with intricate floral design. Lightweight and perfect for daily wear.',
    images: [
      'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=400',
      'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=400',
    ],
    createdAt: '2024-03-10T11:45:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    createdBy: 'Admin User',
  },
  '4': {
    id: '4',
    itemCode: 'JWL-004',
    itemName: 'Gold Bracelet',
    itemType: 'Jewelry',
    category: 'Bracelets',
    brand: 'Luxury Gold',
    designCode: 'DES-2024-004',
    metalType: 'Gold',
    purity: '18K',
    grossWeight: 18.5,
    netWeight: 18.0,
    stoneWeight: 0,
    unit: 'g',
    diamondPieces: 0,
    caratWeight: 0,
    sellingPrice: 32000,
    mrp: 38000,
    goldRate: 5800,
    mcType: 'percentage',
    mcValue: 18,
    currency: 'INR',
    openingStock: 3,
    reorderLevel: 5,
    hsnCode: '71131910',
    gstPercentage: 18,
    status: 'low_stock',
    description: 'Classic 18K gold bracelet with a sleek design. Perfect for both formal and casual occasions.',
    images: [
      'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=400',
    ],
    createdAt: '2024-04-05T14:20:00Z',
    updatedAt: '2024-06-10T09:15:00Z',
    createdBy: 'Admin User',
  },
  '5': {
    id: '5',
    itemCode: 'JWL-005',
    itemName: 'Gemstone Pendant',
    itemType: 'Jewelry',
    category: 'Pendants',
    brand: 'Gem World',
    designCode: 'DES-2024-005',
    metalType: 'Gold',
    purity: '22K',
    grossWeight: 15.0,
    netWeight: 14.2,
    stoneWeight: 3.8,
    unit: 'g',
    diamondPieces: 0,
    caratWeight: 0,
    sellingPrice: 28000,
    mrp: 32000,
    goldRate: 7200,
    mcType: 'percentage',
    mcValue: 12,
    currency: 'INR',
    openingStock: 0,
    reorderLevel: 5,
    hsnCode: '71131910',
    gstPercentage: 18,
    status: 'out_of_stock',
    description: 'Beautiful 22K gold pendant with a premium gemstone. Available in multiple color options.',
    images: [
      'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=400',
    ],
    createdAt: '2024-05-12T16:00:00Z',
    updatedAt: '2024-06-05T11:30:00Z',
    createdBy: 'Admin User',
  },
};

export const useItemDetails = () => {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the item in dummy data
      const foundItem = dummyItems[id];
      
      if (foundItem) {
        setItem(foundItem);
        setError(null);
      } else {
        setItem(null);
        setError('Item not found');
      }
      
      console.log('Fetched item with id:', id, foundItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate deletion by removing from dummy data
      if (dummyItems[id]) {
        delete dummyItems[id];
        console.log('Deleted item with id:', id);
        setItem(null);
      } else {
        throw new Error('Item not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: 'active' | 'inactive' | 'out_of_stock' | 'low_stock') => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find and update the item in dummy data
      const foundItem = dummyItems[id];
      if (foundItem) {
        dummyItems[id] = { ...foundItem, status };
        setItem(dummyItems[id]);
        console.log('Updated status for item:', id, 'to:', status);
        return dummyItems[id];
      } else {
        throw new Error('Item not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
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