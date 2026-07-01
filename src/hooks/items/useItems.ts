// src/hooks/items/useItems.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type{ Item, ItemFilters } from '../../types/items/Itemstype';

// Mock Data
const MOCK_ITEMS: Item[] = [
  {
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
    images: ['https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Ring'],
    createdBy: 'admin',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-20T14:45:00Z'
  },
  {
    id: '2',
    itemCode: 'SILVER-NECK-002',
    itemName: 'Silver Chain Necklace',
    itemType: 'Silver',
    category: 'Necklaces',
    brand: 'Silver Craft',
    designCode: 'SN-2024-002',
    metalType: 'Silver',
    purity: '925',
    grossWeight: 15.2,
    stoneWeight: 0,
    netWeight: 15.2,
    unit: 'g',
    diamondPieces: 0,
    caratWeight: 0,
    mcType: 'fixed',
    mcValue: 500,
    goldRate: 0,
    sellingPrice: 8500,
    mrp: 10000,
    currency: 'INR',
    openingStock: 10,
    reorderLevel: 3,
    hsnCode: '71179000',
    gstPercentage: 18,
    salesAccount: 'sales',
    salesDescription: 'Silver chain necklace',
    purchasePrice: 6000,
    purchaseDescription: 'Supplier purchase',
    purchaseAccount: 'inventory',
    preferredVendor: 'supplier_a',
    status: 'active',
    description: 'Beautiful silver chain necklace',
    images: ['https://via.placeholder.com/200x200/C0C0C0/FFFFFF?text=Necklace'],
    createdBy: 'admin',
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-03-18T11:20:00Z'
  },
  {
    id: '3',
    itemCode: 'PLAT-EAR-003',
    itemName: 'Platinum Earrings',
    itemType: 'Platinum',
    category: 'Earrings',
    brand: 'Platinum Plus',
    designCode: 'PE-2024-003',
    metalType: 'Platinum',
    purity: '950',
    grossWeight: 4.8,
    stoneWeight: 0.5,
    netWeight: 4.3,
    unit: 'g',
    diamondPieces: 6,
    caratWeight: 0.45,
    mcType: 'percentage',
    mcValue: 15,
    goldRate: 2800,
    sellingPrice: 32000,
    mrp: 38000,
    currency: 'INR',
    openingStock: 0,
    reorderLevel: 2,
    hsnCode: '71131910',
    gstPercentage: 18,
    salesAccount: 'revenue',
    salesDescription: 'Platinum earrings with diamonds',
    purchasePrice: 25000,
    purchaseDescription: 'Direct purchase',
    purchaseAccount: 'cogs',
    preferredVendor: 'supplier_b',
    status: 'out_of_stock',
    description: 'Elegant platinum earrings',
    images: ['https://via.placeholder.com/200x200/E5E4E2/FFFFFF?text=Earrings'],
    createdBy: 'admin',
    createdAt: '2024-01-20T16:45:00Z',
    updatedAt: '2024-03-15T09:30:00Z'
  },
  {
    id: '4',
    itemCode: 'GOLD-BANG-004',
    itemName: 'Gold Bangles Set',
    itemType: 'Gold',
    category: 'Bangles',
    brand: 'Golden Touch',
    designCode: 'GB-2024-004',
    metalType: 'Gold',
    purity: '18K',
    grossWeight: 12.5,
    stoneWeight: 0,
    netWeight: 12.5,
    unit: 'g',
    diamondPieces: 0,
    caratWeight: 0,
    mcType: 'fixed',
    mcValue: 800,
    goldRate: 4500,
    sellingPrice: 55000,
    mrp: 62000,
    currency: 'INR',
    openingStock: 8,
    reorderLevel: 4,
    hsnCode: '71131911',
    gstPercentage: 18,
    salesAccount: 'sales',
    salesDescription: 'Gold bangles set',
    purchasePrice: 46000,
    purchaseDescription: 'Bulk purchase',
    purchaseAccount: 'purchases',
    preferredVendor: 'wholesaler',
    status: 'low_stock',
    description: 'Gold bangles set for special occasions',
    images: ['https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Bangles'],
    createdBy: 'admin',
    createdAt: '2024-03-01T11:00:00Z',
    updatedAt: '2024-03-22T15:00:00Z'
  },
  {
    id: '5',
    itemCode: 'GOLD-PEN-005',
    itemName: 'Gold Pendant',
    itemType: 'Gold',
    category: 'Pendants',
    brand: 'Precious Gold',
    designCode: 'GP-2024-005',
    metalType: 'Gold',
    purity: '22K',
    grossWeight: 3.2,
    stoneWeight: 0.3,
    netWeight: 2.9,
    unit: 'g',
    diamondPieces: 3,
    caratWeight: 0.15,
    mcType: 'percentage',
    mcValue: 12,
    goldRate: 5400,
    sellingPrice: 18000,
    mrp: 21000,
    currency: 'INR',
    openingStock: 15,
    reorderLevel: 5,
    hsnCode: '71131911',
    gstPercentage: 18,
    salesAccount: 'sales',
    salesDescription: 'Gold pendant with diamonds',
    purchasePrice: 14000,
    purchaseDescription: 'Supplier purchase',
    purchaseAccount: 'inventory',
    preferredVendor: 'preferred_vendor',
    status: 'active',
    description: 'Beautiful gold pendant',
    images: ['https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Pendant'],
    createdBy: 'admin',
    createdAt: '2024-02-25T13:20:00Z',
    updatedAt: '2024-03-19T10:45:00Z'
  }
];

export const useItems = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Load mock data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setItems(MOCK_ITEMS);
      setLoading(false);
    }, 500);
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(query) ||
          item.itemCode.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    return filtered;
  }, [items, searchQuery, selectedStatus]);

  // Pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Handlers
  const setSearchQueryWithReset = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const setSelectedStatusWithReset = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setItems([...MOCK_ITEMS]);
    setLoading(false);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  }, []);

  const handleBulkDelete = useCallback(async () => {
    setItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  }, [selectedItems]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(currentItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [currentItems]);

  const handleSelectItem = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    }
  }, []);

  const handleExport = useCallback(async () => {
    console.log('Exporting items...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    alert(`Exported ${filteredItems.length} items`);
  }, [filteredItems]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  return {
    loading,
    items,
    searchQuery,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    currentItems,
    selectedItems,
    selectedStatus,
    itemsPerPage,
    setSearchQuery: setSearchQueryWithReset,
    setSelectedStatus: setSelectedStatusWithReset,
    setCurrentPage,
    handleRefresh,
    handleDelete,
    handleBulkDelete,
    handleSelectAll,
    handleSelectItem,
    handleExport,
    handleItemsPerPageChange,
  };
};