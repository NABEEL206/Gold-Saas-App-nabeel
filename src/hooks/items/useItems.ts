// src/hooks/items/useItems.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Item } from '../../types/items/Itemstype';

// Mock data for demonstration
const MOCK_ITEMS: Item[] = [
  {
    id: '1',
    itemCode: 'GOLD-RING-001',
    itemName: 'Gold Diamond Ring',
    itemType: 'Gold',
    category: 'Rings',
    brand: 'Luxury Jewelers',
    designCode: 'DR-2024-001',
    metalType: 'Gold',
    purity: '22K',
    grossWeight: 12.5,
    stoneWeight: 1.3,
    netWeight: 11.2,
    unit: 'g',
    diamondPieces: 8,
    caratWeight: 1.5,
    mcType: 'percentage',
    mcValue: 15,
    goldRate: 7500,
    sellingPrice: 125000,
    mrp: 135000,
    currency: 'INR',
    openingStock: 5,
    reorderLevel: 2,
    hsnCode: '71131910',
    gstPercentage: 18,
    description: 'Beautiful 22K gold ring with 8 diamonds.',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'],
    createdBy: 'Admin User',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-20T14:45:00Z',
  },
  {
    id: '2',
    itemCode: 'SILV-NECK-002',
    itemName: 'Silver Chain Necklace',
    itemType: 'Silver',
    category: 'Necklaces',
    brand: 'Silver Craft',
    designCode: 'SN-2024-002',
    metalType: 'Silver',
    purity: '925',
    grossWeight: 25.0,
    stoneWeight: 0.5,
    netWeight: 24.5,
    unit: 'g',
    diamondPieces: 0,
    caratWeight: 0,
    mcType: 'fixed',
    mcValue: 500,
    goldRate: 0,
    sellingPrice: 8500,
    mrp: 9500,
    currency: 'INR',
    openingStock: 12,
    reorderLevel: 3,
    hsnCode: '71131100',
    gstPercentage: 12,
    description: 'Elegant 925 sterling silver chain necklace.',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'],
    createdBy: 'Admin User',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-03-18T16:30:00Z',
  },
  {
    id: '3',
    itemCode: 'DIAM-EARR-003',
    itemName: 'Diamond Stud Earrings',
    itemType: 'Diamond',
    category: 'Earrings',
    brand: 'Diamond Collection',
    designCode: 'DE-2024-003',
    metalType: 'Platinum',
    purity: '950',
    grossWeight: 3.8,
    stoneWeight: 0.6,
    netWeight: 3.2,
    unit: 'g',
    diamondPieces: 4,
    caratWeight: 1.0,
    mcType: 'percentage',
    mcValue: 20,
    goldRate: 0,
    sellingPrice: 280000,
    mrp: 300000,
    currency: 'INR',
    openingStock: 3,
    reorderLevel: 1,
    hsnCode: '71131930',
    gstPercentage: 18,
    description: 'Luxurious platinum stud earrings with diamonds.',
    status: 'low_stock',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'],
    createdBy: 'Admin User',
    createdAt: '2024-02-15T11:45:00Z',
    updatedAt: '2024-03-22T09:20:00Z',
  },
  {
    id: '4',
    itemCode: 'PLAT-BANG-004',
    itemName: 'Platinum Bangle Set',
    itemType: 'Platinum',
    category: 'Bangles',
    brand: 'Platinum Studio',
    designCode: 'PB-2024-004',
    metalType: 'Platinum',
    purity: '950',
    grossWeight: 45.0,
    stoneWeight: 0.8,
    netWeight: 44.2,
    unit: 'g',
    diamondPieces: 6,
    caratWeight: 2.0,
    mcType: 'percentage',
    mcValue: 18,
    goldRate: 0,
    sellingPrice: 450000,
    mrp: 480000,
    currency: 'INR',
    openingStock: 0,
    reorderLevel: 2,
    hsnCode: '71131940',
    gstPercentage: 18,
    description: 'Elegant platinum bangle set with diamond accents.',
    status: 'out_of_stock',
    images: ['https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800'],
    createdBy: 'Admin User',
    createdAt: '2024-03-01T13:00:00Z',
    updatedAt: '2024-03-25T10:15:00Z',
  },
  {
    id: '5',
    itemCode: 'GOLD-PEND-005',
    itemName: 'Gold Pendant with Chain',
    itemType: 'Gold',
    category: 'Pendants',
    brand: 'Gold Heritage',
    designCode: 'GP-2024-005',
    metalType: 'Gold',
    purity: '22K',
    grossWeight: 18.5,
    stoneWeight: 0.7,
    netWeight: 17.8,
    unit: 'g',
    diamondPieces: 3,
    caratWeight: 0.75,
    mcType: 'fixed',
    mcValue: 1500,
    goldRate: 7500,
    sellingPrice: 185000,
    mrp: 195000,
    currency: 'INR',
    openingStock: 2,
    reorderLevel: 3,
    hsnCode: '71131910',
    gstPercentage: 18,
    description: 'Beautiful 22K gold pendant with chain.',
    status: 'inactive',
    images: ['https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800'],
    createdBy: 'Admin User',
    createdAt: '2024-03-10T15:30:00Z',
    updatedAt: '2024-03-28T11:45:00Z',
  },
  {
    id: '6',
    itemCode: 'SILV-RING-006',
    itemName: 'Silver Gemstone Ring',
    itemType: 'Silver',
    category: 'Rings',
    brand: 'Silver Art',
    designCode: 'SR-2024-006',
    metalType: 'Silver',
    purity: '925',
    grossWeight: 8.5,
    stoneWeight: 2.0,
    netWeight: 6.5,
    unit: 'g',
    diamondPieces: 0,
    caratWeight: 0,
    mcType: 'fixed',
    mcValue: 800,
    goldRate: 0,
    sellingPrice: 12000,
    mrp: 15000,
    currency: 'INR',
    openingStock: 8,
    reorderLevel: 2,
    hsnCode: '71131100',
    gstPercentage: 12,
    description: 'Beautiful silver ring with gemstone.',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'],
    createdBy: 'Admin User',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-04-01T12:00:00Z',
  },
  {
    id: '7',
    itemCode: 'GOLD-BRAC-007',
    itemName: 'Gold Chain Bracelet',
    itemType: 'Gold',
    category: 'Bracelets',
    brand: 'Gold Trends',
    designCode: 'GB-2024-007',
    metalType: 'Gold',
    purity: '18K',
    grossWeight: 15.0,
    stoneWeight: 0,
    netWeight: 15.0,
    unit: 'g',
    diamondPieces: 0,
    caratWeight: 0,
    mcType: 'percentage',
    mcValue: 12,
    goldRate: 6500,
    sellingPrice: 75000,
    mrp: 85000,
    currency: 'INR',
    openingStock: 4,
    reorderLevel: 2,
    hsnCode: '71131910',
    gstPercentage: 18,
    description: 'Elegant 18K gold chain bracelet.',
    status: 'low_stock',
    images: ['https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800'],
    createdBy: 'Admin User',
    createdAt: '2024-04-01T09:00:00Z',
    updatedAt: '2024-04-10T14:30:00Z',
  },
  {
    id: '8',
    itemCode: 'PLAT-EARR-008',
    itemName: 'Platinum Drop Earrings',
    itemType: 'Platinum',
    category: 'Earrings',
    brand: 'Platinum Luxe',
    designCode: 'PE-2024-008',
    metalType: 'Platinum',
    purity: '950',
    grossWeight: 6.2,
    stoneWeight: 1.2,
    netWeight: 5.0,
    unit: 'g',
    diamondPieces: 10,
    caratWeight: 2.5,
    mcType: 'percentage',
    mcValue: 25,
    goldRate: 0,
    sellingPrice: 350000,
    mrp: 380000,
    currency: 'INR',
    openingStock: 2,
    reorderLevel: 1,
    hsnCode: '71131940',
    gstPercentage: 18,
    description: 'Luxurious platinum drop earrings with diamonds.',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'],
    createdBy: 'Admin User',
    createdAt: '2024-04-05T11:00:00Z',
    updatedAt: '2024-04-12T16:00:00Z',
  },
];

export const useItems = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [importLoading, setImportLoading] = useState(false);

  // Load mock data
  useEffect(() => {
    const loadItems = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setItems(MOCK_ITEMS);
      setLoading(false);
    };
    loadItems();
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = items;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(query) ||
        item.itemCode.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.metalType?.toLowerCase().includes(query)
      );
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    
    return filtered;
  }, [items, searchQuery, selectedStatus]);

  // Pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  // Ensure current page is valid when total pages change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setItems(MOCK_ITEMS);
    setLoading(false);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  }, []);

  const handleBulkDelete = useCallback(async () => {
    setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  }, [selectedItems]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === currentItems.length && currentItems.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
  }, [selectedItems, currentItems]);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  }, []);

  const handleExport = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Exporting items...', filteredItems);
  }, [filteredItems]);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Import function
  const handleImport = useCallback(async (files: FileList) => {
    setImportLoading(true);
    try {
      // Simulate import delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log the files being imported
      const fileNames: string[] = [];
      for (let i = 0; i < files.length; i++) {
        fileNames.push(files[i].name);
        console.log(`Importing file: ${files[i].name}`);
      }
      
      // TODO: Replace with actual import logic
      // - Read the file content using FileReader
      // - Parse CSV/Excel data using a library like xlsx or papaparse
      // - Validate the data
      // - Transform to Item format
      // - Add items to the system
      
      // For demo: Add a mock imported item
      const newItem: Item = {
        id: `imported-${Date.now()}`,
        itemCode: `IMP-${String(items.length + 1).padStart(3, '0')}`,
        itemName: `Imported Item ${items.length + 1}`,
        itemType: 'Gold',
        category: 'Other',
        brand: 'Imported',
        designCode: `IMP-${Date.now()}`,
        metalType: 'Gold',
        purity: '22K',
        grossWeight: 10,
        stoneWeight: 0,
        netWeight: 10,
        unit: 'g',
        diamondPieces: 0,
        caratWeight: 0,
        mcType: 'percentage',
        mcValue: 10,
        goldRate: 7500,
        sellingPrice: 75000,
        mrp: 85000,
        currency: 'INR',
        openingStock: 10,
        reorderLevel: 5,
        hsnCode: '71131910',
        gstPercentage: 18,
        description: `Imported from ${fileNames.join(', ')}`,
        status: 'active',
        images: [],
        createdBy: 'Import User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setItems(prev => [...prev, newItem]);
      console.log('Import completed successfully');
      
      return { success: true, count: 1 };
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    } finally {
      setImportLoading(false);
    }
  }, [items]);

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
    importLoading,
    setSearchQuery,
    setSelectedStatus,
    setCurrentPage,
    handleRefresh,
    handleDelete,
    handleBulkDelete,
    handleSelectAll,
    handleSelectItem,
    handleExport,
    handleItemsPerPageChange,
    handleImport,
  };
};