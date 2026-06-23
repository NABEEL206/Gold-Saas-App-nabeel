// src/hooks/inventory/useInventoryAdjustmentView.ts
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { InventoryAdjustment, AdjustmentItem } from '../../types/inventory/InventoryAdjustmentTypes';

// Mock adjustment data - Replace with actual API call
const MOCK_ADJUSTMENT: InventoryAdjustment = {
  id: '1',
  adjustmentNo: 'ADJ-2024-001',
  date: '2024-01-15',
  type: 'quantity',
  itemCount: 3,
  branch: 'Main Branch',
  value: 1500,
  status: 'draft',
  reason: 'Physical count correction',
  items: [
    {
      id: '1',
      itemId: '1',
      itemCode: 'ITEM001',
      itemName: 'Product A',
      category: 'Electronics',
      previousQuantity: 100,
      adjustedQuantity: 120,
      newQuantity: 120,
      previousWeight: 50,
      adjustedWeight: 55,
      newWeight: 55,
      previousValue: 5000,
      adjustedValue: 6000,
      newValue: 6000,
      difference: 20,
      reason: 'Found extra items',
    },
    {
      id: '2',
      itemId: '2',
      itemCode: 'ITEM002',
      itemName: 'Product B',
      category: 'Clothing',
      previousQuantity: 200,
      adjustedQuantity: 185,
      newQuantity: 185,
      previousWeight: 80,
      adjustedWeight: 75,
      newWeight: 75,
      previousValue: 8000,
      adjustedValue: 7400,
      newValue: 7400,
      difference: -15,
      reason: 'Damaged items',
    },
  ],
  totalGain: 20,
  totalLoss: 15,
  notes: 'Monthly inventory adjustment',
  createdBy: 'John Doe',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T14:20:00Z',
};

export const useInventoryAdjustmentView = (id: string) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adjustment, setAdjustment] = useState<InventoryAdjustment | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'history'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch adjustment data
  const fetchAdjustment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, fetch by ID
      // const response = await api.get(`/inventory/adjustments/${id}`);
      // setAdjustment(response.data);
      
      setAdjustment(MOCK_ADJUSTMENT);
    } catch (err) {
      setError('Failed to load adjustment details');
      console.error('Error fetching adjustment:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load data on mount
  useEffect(() => {
    fetchAdjustment();
  }, [fetchAdjustment]);

  // Navigate to edit
  const handleEdit = useCallback(() => {
    navigate(`/inventory/adjustments/edit/${id}`);
  }, [id, navigate]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In real implementation:
      // await api.delete(`/inventory/adjustments/${id}`);
      
      console.log('Deleting adjustment:', id);
      navigate('/inventory/adjustments');
    } catch (err) {
      console.error('Error deleting adjustment:', err);
      setError('Failed to delete adjustment');
      setDeleteModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  }, [id, navigate]);

  // Handle approve
  const handleApprove = useCallback(async (approvalData?: { notes?: string }) => {
    setActionLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In real implementation:
      // await api.put(`/inventory/adjustments/${id}/approve`, approvalData);
      
      console.log('Approving adjustment:', id, approvalData);
      
      // Update local state
      if (adjustment) {
        setAdjustment({
          ...adjustment,
          status: 'adjusted',
          approvedBy: 'Current User',
          approvedAt: new Date().toISOString(),
        });
      }
      
      setApproveModalOpen(false);
    } catch (err) {
      console.error('Error approving adjustment:', err);
      setError('Failed to approve adjustment');
    } finally {
      setActionLoading(false);
    }
  }, [id, adjustment]);

  // Handle export
  const handleExport = useCallback(async (format: 'pdf' | 'excel') => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Exporting adjustment ${id} as ${format.toUpperCase()}`);
      // In real implementation:
      // const response = await api.get(`/inventory/adjustments/${id}/export/${format}`, {
      //   responseType: 'blob'
      // });
      // downloadFile(response.data, `adjustment-${id}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      alert(`Adjustment exported as ${format.toUpperCase()} successfully!`);
    } catch (err) {
      console.error('Error exporting:', err);
      setError('Failed to export adjustment');
    }
  }, [id]);

  // Handle import
  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      // Simulate import
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Importing file: ${files[0].name}`);
      // In real implementation:
      // const formData = new FormData();
      // formData.append('file', files[0]);
      // await api.post(`/inventory/adjustments/${id}/import`, formData);
      
      alert(`File "${files[0].name}" imported successfully!`);
      
      // Refresh adjustment data
      await fetchAdjustment();
    } catch (err) {
      console.error('Error importing:', err);
      setError('Failed to import file');
    }
  }, [id, fetchAdjustment]);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Get status badge info
  const getStatusInfo = useCallback((status: string) => {
    const statusMap = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: 'FileText', label: 'Draft' },
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: 'Clock', label: 'Pending' },
      adjusted: { color: 'bg-green-100 text-green-700', icon: 'CheckCircle', label: 'Adjusted' },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  }, []);

  // Get type badge info
  const getTypeInfo = useCallback((type: string) => {
    const typeMap = {
      quantity: { color: 'bg-blue-100 text-blue-700', icon: 'Package', label: 'Quantity' },
      weight: { color: 'bg-purple-100 text-purple-700', icon: 'Scale', label: 'Weight' },
      value: { color: 'bg-amber-100 text-amber-700', icon: 'DollarSign', label: 'Value' },
    };
    return typeMap[type as keyof typeof typeMap] || typeMap.quantity;
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  // Format time
  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  // Format datetime
  const formatDateTime = useCallback((dateString: string) => {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
  }, [formatDate, formatTime]);

  return {
    // State
    adjustment,
    loading,
    activeTab,
    isEditing,
    deleteModalOpen,
    approveModalOpen,
    actionLoading,
    error,
    
    // Setters
    setActiveTab,
    setIsEditing,
    setDeleteModalOpen,
    setApproveModalOpen,
    
    // Actions
    fetchAdjustment,
    handleEdit,
    handleDelete,
    handleApprove,
    handleExport,
    handleImport,
    handlePrint,
    
    // Helpers
    getStatusInfo,
    getTypeInfo,
    formatDate,
    formatTime,
    formatDateTime,
  };
};