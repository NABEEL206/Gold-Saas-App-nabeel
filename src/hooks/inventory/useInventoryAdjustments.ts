// src/hooks/inventory/useInventoryAdjustments.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  InventoryAdjustment, 
  InventoryAdjustmentFilters, 
  InventoryAdjustmentStats,
  AdjustmentStatus 
} from '../../types/inventory/InventoryAdjustmentTypes';

// Mock data with 3 statuses - 15 items to show pagination
const MOCK_ADJUSTMENTS: InventoryAdjustment[] = [
  {
    id: '1',
    adjustmentNo: 'IA-00001',
    date: '2026-06-17T10:30:00Z',
    type: 'quantity',
    itemCount: 5,
    branch: 'Main Store',
    value: 8500,
    status: 'adjusted',
    reason: 'Stock count adjustment - Physical count lower than system',
    items: [],
    totalGain: 0,
    totalLoss: 8500,
    createdBy: 'Admin User',
    createdAt: '2026-06-17T10:30:00Z',
    updatedAt: '2026-06-17T14:30:00Z',
    approvedBy: 'Manager',
    approvedAt: '2026-06-17T14:30:00Z',
    notes: 'Stock count adjustment'
  },
  {
    id: '2',
    adjustmentNo: 'IA-00002',
    date: '2026-06-18T09:15:00Z',
    type: 'weight',
    itemCount: 2,
    branch: 'Branch A',
    value: 3200,
    status: 'draft',
    reason: 'Weight adjustment for gold items',
    items: [],
    totalGain: 3200,
    totalLoss: 0,
    createdBy: 'Staff User',
    createdAt: '2026-06-18T09:15:00Z',
    updatedAt: '2026-06-18T09:15:00Z',
    notes: 'Weight adjustment for gold items'
  },
  {
    id: '3',
    adjustmentNo: 'IA-00003',
    date: '2026-06-18T11:45:00Z',
    type: 'value',
    itemCount: 1,
    branch: 'Branch B',
    value: 1500,
    status: 'pending',
    reason: 'Value adjustment for damaged item',
    items: [],
    totalGain: 0,
    totalLoss: 1500,
    createdBy: 'Admin User',
    createdAt: '2026-06-18T11:45:00Z',
    updatedAt: '2026-06-18T13:00:00Z',
    notes: 'Pending approval for value adjustment'
  },
  {
    id: '4',
    adjustmentNo: 'IA-00004',
    date: '2026-06-18T14:20:00Z',
    type: 'quantity',
    itemCount: 3,
    branch: 'Main Store',
    value: 4500,
    status: 'draft',
    reason: 'Quantity adjustment for new stock received',
    items: [],
    totalGain: 4500,
    totalLoss: 0,
    createdBy: 'Staff User',
    createdAt: '2026-06-18T14:20:00Z',
    updatedAt: '2026-06-18T14:20:00Z',
    notes: 'New stock received'
  },
  {
    id: '5',
    adjustmentNo: 'IA-00005',
    date: '2026-06-19T08:30:00Z',
    type: 'weight',
    itemCount: 1,
    branch: 'Main Store',
    value: 7500,
    status: 'pending',
    reason: 'Weight discrepancy found during audit',
    items: [],
    totalGain: 0,
    totalLoss: 7500,
    createdBy: 'Staff User',
    createdAt: '2026-06-19T08:30:00Z',
    updatedAt: '2026-06-19T10:00:00Z',
    notes: 'Pending verification'
  },
  {
    id: '6',
    adjustmentNo: 'IA-00006',
    date: '2026-06-19T13:15:00Z',
    type: 'value',
    itemCount: 2,
    branch: 'Branch A',
    value: 2800,
    status: 'adjusted',
    reason: 'Price correction for items',
    items: [],
    totalGain: 0,
    totalLoss: 2800,
    createdBy: 'Admin User',
    createdAt: '2026-06-19T13:15:00Z',
    updatedAt: '2026-06-19T15:30:00Z',
    approvedBy: 'Manager',
    approvedAt: '2026-06-19T15:30:00Z',
    notes: 'Adjusted after approval'
  },
  {
    id: '7',
    adjustmentNo: 'IA-00007',
    date: '2026-06-20T09:00:00Z',
    type: 'quantity',
    itemCount: 4,
    branch: 'Branch B',
    value: 12000,
    status: 'draft',
    reason: 'Quarterly stock count adjustment',
    items: [],
    totalGain: 12000,
    totalLoss: 0,
    createdBy: 'Staff User',
    createdAt: '2026-06-20T09:00:00Z',
    updatedAt: '2026-06-20T09:00:00Z',
    notes: 'Quarterly count'
  },
  {
    id: '8',
    adjustmentNo: 'IA-00008',
    date: '2026-06-20T11:30:00Z',
    type: 'weight',
    itemCount: 3,
    branch: 'Main Store',
    value: 5600,
    status: 'pending',
    reason: 'Weight adjustment for silver items',
    items: [],
    totalGain: 5600,
    totalLoss: 0,
    createdBy: 'Admin User',
    createdAt: '2026-06-20T11:30:00Z',
    updatedAt: '2026-06-20T11:30:00Z',
    notes: 'Pending approval'
  },
  {
    id: '9',
    adjustmentNo: 'IA-00009',
    date: '2026-06-21T10:00:00Z',
    type: 'value',
    itemCount: 1,
    branch: 'Branch A',
    value: 3500,
    status: 'adjusted',
    reason: 'Market price adjustment',
    items: [],
    totalGain: 3500,
    totalLoss: 0,
    createdBy: 'Admin User',
    createdAt: '2026-06-21T10:00:00Z',
    updatedAt: '2026-06-21T12:00:00Z',
    approvedBy: 'Manager',
    approvedAt: '2026-06-21T12:00:00Z',
    notes: 'Price updated'
  },
  {
    id: '10',
    adjustmentNo: 'IA-00010',
    date: '2026-06-21T14:30:00Z',
    type: 'quantity',
    itemCount: 2,
    branch: 'Branch B',
    value: 9000,
    status: 'draft',
    reason: 'Damaged items returned',
    items: [],
    totalGain: 0,
    totalLoss: 9000,
    createdBy: 'Staff User',
    createdAt: '2026-06-21T14:30:00Z',
    updatedAt: '2026-06-21T14:30:00Z',
    notes: 'Returned items'
  },
  {
    id: '11',
    adjustmentNo: 'IA-00011',
    date: '2026-06-22T08:00:00Z',
    type: 'weight',
    itemCount: 2,
    branch: 'Main Store',
    value: 4300,
    status: 'pending',
    reason: 'Weight correction for diamond items',
    items: [],
    totalGain: 4300,
    totalLoss: 0,
    createdBy: 'Admin User',
    createdAt: '2026-06-22T08:00:00Z',
    updatedAt: '2026-06-22T08:00:00Z',
    notes: 'Diamond weight correction'
  },
  {
    id: '12',
    adjustmentNo: 'IA-00012',
    date: '2026-06-22T13:45:00Z',
    type: 'value',
    itemCount: 1,
    branch: 'Branch A',
    value: 2500,
    status: 'adjusted',
    reason: 'Discount adjustment',
    items: [],
    totalGain: 0,
    totalLoss: 2500,
    createdBy: 'Staff User',
    createdAt: '2026-06-22T13:45:00Z',
    updatedAt: '2026-06-22T16:00:00Z',
    approvedBy: 'Manager',
    approvedAt: '2026-06-22T16:00:00Z',
    notes: 'Discount applied'
  },
  {
    id: '13',
    adjustmentNo: 'IA-00013',
    date: '2026-06-23T09:30:00Z',
    type: 'quantity',
    itemCount: 5,
    branch: 'Branch B',
    value: 15000,
    status: 'draft',
    reason: 'Monthly stock adjustment',
    items: [],
    totalGain: 15000,
    totalLoss: 0,
    createdBy: 'Admin User',
    createdAt: '2026-06-23T09:30:00Z',
    updatedAt: '2026-06-23T09:30:00Z',
    notes: 'Monthly adjustment'
  },
  {
    id: '14',
    adjustmentNo: 'IA-00014',
    date: '2026-06-23T15:20:00Z',
    type: 'weight',
    itemCount: 1,
    branch: 'Main Store',
    value: 6800,
    status: 'pending',
    reason: 'Gold weight correction',
    items: [],
    totalGain: 0,
    totalLoss: 6800,
    createdBy: 'Staff User',
    createdAt: '2026-06-23T15:20:00Z',
    updatedAt: '2026-06-23T15:20:00Z',
    notes: 'Gold weight correction'
  },
  {
    id: '15',
    adjustmentNo: 'IA-00015',
    date: '2026-06-24T11:00:00Z',
    type: 'value',
    itemCount: 2,
    branch: 'Branch A',
    value: 18000,
    status: 'adjusted',
    reason: 'Bulk price update',
    items: [],
    totalGain: 18000,
    totalLoss: 0,
    createdBy: 'Admin User',
    createdAt: '2026-06-24T11:00:00Z',
    updatedAt: '2026-06-24T14:00:00Z',
    approvedBy: 'Manager',
    approvedAt: '2026-06-24T14:00:00Z',
    notes: 'Bulk price update completed'
  },
];

export const useInventoryAdjustments = () => {
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [filters, setFilters] = useState<InventoryAdjustmentFilters>({
    searchQuery: '',
    status: 'all',
    type: 'all',
    branch: 'all',
    dateRange: {
      start: '',
      end: '',
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [importLoading, setImportLoading] = useState(false);

  // Load mock data
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setAdjustments(MOCK_ADJUSTMENTS);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter adjustments
  const filteredAdjustments = useMemo(() => {
    let filtered = adjustments;

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        adj =>
          adj.adjustmentNo.toLowerCase().includes(query) ||
          (adj.reason && adj.reason.toLowerCase().includes(query)) ||
          (adj.notes && adj.notes.toLowerCase().includes(query))
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(adj => adj.status === filters.status);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(adj => adj.type === filters.type);
    }

    if (filters.branch !== 'all') {
      filtered = filtered.filter(adj => adj.branch === filters.branch);
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(
        adj => new Date(adj.date) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(
        adj => new Date(adj.date) <= new Date(filters.dateRange.end)
      );
    }

    return filtered;
  }, [adjustments, filters]);

  // Pagination
  const totalItems = filteredAdjustments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredAdjustments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchQuery, filters.status, filters.type, filters.branch, filters.dateRange.start, filters.dateRange.end]);

  // Ensure current page is valid when total pages change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Stats
  const stats = useMemo((): InventoryAdjustmentStats => {
    const total = adjustments.length;
    const draft = adjustments.filter(a => a.status === 'draft').length;
    const pending = adjustments.filter(a => a.status === 'pending').length;
    const adjusted = adjustments.filter(a => a.status === 'adjusted').length;
    const totalGain = adjustments.reduce((sum, a) => sum + a.totalGain, 0);
    const totalLoss = adjustments.reduce((sum, a) => sum + a.totalLoss, 0);

    return {
      totalAdjustments: total,
      draft,
      pending,
      adjusted,
      totalGain,
      totalLoss,
      netAdjustment: totalGain - totalLoss,
    };
  }, [adjustments]);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setAdjustments(MOCK_ADJUSTMENTS);
    setLoading(false);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setAdjustments(prev => prev.filter(adj => adj.id !== id));
  }, []);

  const handleBulkDelete = useCallback(async (ids: string[]) => {
    setAdjustments(prev => prev.filter(adj => !ids.includes(adj.id)));
  }, []);

  const handleExport = useCallback(async (format: 'excel' | 'pdf') => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Exporting as ${format}:`, filteredAdjustments);
    setLoading(false);
  }, [filteredAdjustments]);

  const handleStatusUpdate = useCallback(async (id: string, status: AdjustmentStatus) => {
    setAdjustments(prev =>
      prev.map(adj =>
        adj.id === id
          ? {
              ...adj,
              status,
              updatedAt: new Date().toISOString(),
              approvedBy: status === 'adjusted' ? 'Current User' : adj.approvedBy,
              approvedAt: status === 'adjusted' ? new Date().toISOString() : adj.approvedAt,
            }
          : adj
      )
    );
  }, []);

  const getAdjustmentById = useCallback((id: string) => {
    return adjustments.find(adj => adj.id === id);
  }, [adjustments]);

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
      // - Transform to InventoryAdjustment format
      // - Add adjustments to the system
      
      // For demo: Create a mock imported adjustment
      const newAdjustment: InventoryAdjustment = {
        id: `imported-${Date.now()}`,
        adjustmentNo: `IA-IMP-${String(adjustments.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        type: 'quantity',
        itemCount: 3,
        branch: 'Main Store',
        value: 5000,
        status: 'draft',
        reason: `Imported from ${fileNames.join(', ')}`,
        items: [],
        totalGain: 5000,
        totalLoss: 0,
        createdBy: 'Import User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Imported adjustment'
      };
      
      setAdjustments(prev => [...prev, newAdjustment]);
      console.log('Import completed successfully');
      
      return { success: true, count: 1 };
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    } finally {
      setImportLoading(false);
    }
  }, [adjustments]);

  return {
    loading,
    adjustments,
    filteredAdjustments,
    currentItems,
    filters,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    itemsPerPage,
    importLoading,
    stats,
    setFilters,
    setCurrentPage,
    handleRefresh,
    handleDelete,
    handleBulkDelete,
    handleExport,
    handleStatusUpdate,
    getAdjustmentById,
    handleItemsPerPageChange,
    handleImport,
  };
};