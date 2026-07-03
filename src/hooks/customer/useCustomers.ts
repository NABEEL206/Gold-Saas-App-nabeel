// src/hooks/customer/useCustomers.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Customer, CustomerFilters, CustomerStats, CustomerFormData } from '../../types/customer/CustomerTypes';

// Mock data - Replace with actual API calls
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    customerCode: 'CUST-001',
    salutation: 'Mr.',
    firstName: 'Rahul',
    lastName: 'Sharma',
    displayName: 'Rahul Sharma',
    customerType: 'individual',
    email: 'rahul.sharma@email.com',
    workPhone: '022-1234567',
    mobileNumber: '9876543210',
    billingAddress: '123, Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400093',
    country: 'India',
    openingBalance: 0,
    creditLimit: 50000,
    gstNumber: '27AABCU1234D1Z1',
    panNumber: 'ABCDE1234F',
    notes: 'Regular customer',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    createdBy: 'Admin',
  },
  {
    id: '2',
    customerCode: 'CUST-002',
    salutation: 'Ms.',
    firstName: 'Priya',
    lastName: 'Patel',
    displayName: 'Priya Patel',
    customerType: 'business',
    email: 'priya.patel@company.com',
    workPhone: '022-7654321',
    mobileNumber: '9876543211',
    billingAddress: '456, BKC, Bandra East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    country: 'India',
    openingBalance: 10000,
    creditLimit: 100000,
    gstNumber: '27BBBCU5678D1Z1',
    panNumber: 'FGHIJ5678K',
    notes: 'Bulk order customer',
    status: 'active',
    createdAt: '2024-02-20T14:20:00Z',
    updatedAt: '2024-02-20T14:20:00Z',
    createdBy: 'Admin',
  },
  {
    id: '3',
    customerCode: 'CUST-003',
    salutation: 'Dr.',
    firstName: 'Amit',
    lastName: 'Kumar',
    displayName: 'Dr. Amit Kumar',
    customerType: 'individual',
    email: 'amit.kumar@clinic.com',
    workPhone: '011-9876543',
    mobileNumber: '9876543212',
    billingAddress: '789, Defence Colony',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110024',
    country: 'India',
    openingBalance: 0,
    creditLimit: 25000,
    gstNumber: '',
    panNumber: 'LMNOP9012Q',
    notes: 'Medical professional',
    status: 'inactive',
    createdAt: '2024-03-10T09:15:00Z',
    updatedAt: '2024-03-10T09:15:00Z',
    createdBy: 'Admin',
  },
];

export const useCustomers = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentItems, setCurrentItems] = useState<Customer[]>([]);
  const [filters, setFilters] = useState<CustomerFilters>({
    searchQuery: '',
    customerType: 'all',
    status: 'all',
    dateRange: { start: '', end: '' },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const [stats, setStats] = useState<CustomerStats>({
    total: 0,
    totalCustomers: 0,
    active: 0,
    inactive: 0,
    totalOpeningBalance: 0,
    totalCreditLimit: 0,
  });

  // Use ref to track if initial fetch has been done
  const isInitialFetchDone = useRef(false);

  // Calculate pagination - computed values
  const startIndex = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calculate stats
  const calculateStats = useCallback((data: Customer[]) => {
    return setStats({
      total: data.length,
      totalCustomers: data.length,
      active: data.filter(c => c.status === 'active').length,
      inactive: data.filter(c => c.status === 'inactive').length,
      totalOpeningBalance: data.reduce((sum, c) => sum + (c.openingBalance || 0), 0),
      totalCreditLimit: data.reduce((sum, c) => sum + (c.creditLimit || 0), 0),
    });
  }, []);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setCustomers(MOCK_CUSTOMERS);
      calculateStats(MOCK_CUSTOMERS);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // Get customer by ID
  const getCustomer = useCallback((id: string): Customer | null => {
    const found = customers.find(c => c.id === id);
    return found || null;
  }, [customers]);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...customers];

    // Search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.displayName?.toLowerCase().includes(query) ||
        c.customerCode?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.mobileNumber?.includes(query) ||
        c.firstName?.toLowerCase().includes(query) ||
        c.lastName?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (filters.customerType !== 'all') {
      filtered = filtered.filter(c => c.customerType === filters.customerType);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    // Date range
    if (filters.dateRange?.start) {
      filtered = filtered.filter(c => c.createdAt >= filters.dateRange.start);
    }
    if (filters.dateRange?.end) {
      filtered = filtered.filter(c => c.createdAt <= filters.dateRange.end + 'T23:59:59Z');
    }

    setTotalItems(filtered.length);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setCurrentItems(filtered.slice(start, end));
  }, [customers, filters, currentPage, itemsPerPage]);

  // Create customer
  const createCustomer = useCallback(async (data: CustomerFormData): Promise<{ success: boolean; data?: Customer; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newCustomer: Customer = {
        id: Date.now().toString(),
        customerCode: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        ...data,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin',
      };
      setCustomers(prev => [...prev, newCustomer]);
      return { success: true, data: newCustomer };
    } catch (error) {
      console.error('Error creating customer:', error);
      return { success: false, error: 'Failed to create customer' };
    }
  }, [customers.length]);

  // Update customer
  const updateCustomer = useCallback(async (id: string, data: Partial<CustomerFormData>): Promise<{ success: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCustomers(prev => prev.map(c =>
        c.id === id
          ? { ...c, ...data, updatedAt: new Date().toISOString() }
          : c
      ));
      return { success: true };
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error: 'Failed to update customer' };
    }
  }, []);

  // Delete customer
  const deleteCustomer = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCustomers(prev => prev.filter(c => c.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error: 'Failed to delete customer' };
    }
  }, []);

  // Bulk delete
  const handleBulkDelete = useCallback(async (ids: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCustomers(prev => prev.filter(c => !ids.includes(c.id)));
      return { success: true };
    } catch (error) {
      console.error('Error bulk deleting customers:', error);
      return { success: false, error: 'Failed to delete customers' };
    }
  }, []);

  // Export
  const handleExport = useCallback(async (format: 'excel' | 'pdf'): Promise<{ success: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Exporting customers as ${format.toUpperCase()}`);
      return { success: true };
    } catch (error) {
      console.error('Error exporting:', error);
      return { success: false, error: 'Export failed' };
    }
  }, []);

  // Import
  const handleImport = useCallback(async (files: FileList): Promise<{ success: boolean; count?: number; error?: string }> => {
    setImportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Importing ${files.length} file(s)`);
      
      const fileNames: string[] = [];
      for (let i = 0; i < files.length; i++) {
        fileNames.push(files[i].name);
      }
      
      const newCustomer: Customer = {
        id: `imported-${Date.now()}`,
        customerCode: `CUST-IMP-${String(customers.length + 1).padStart(3, '0')}`,
        salutation: 'Mr.',
        firstName: 'Imported',
        lastName: 'Customer',
        displayName: 'Imported Customer',
        customerType: 'individual',
        email: 'imported@example.com',
        workPhone: '',
        mobileNumber: '9999999999',
        billingAddress: 'Imported Address',
        city: 'Imported City',
        state: 'Imported State',
        pincode: '000000',
        country: 'India',
        openingBalance: 0,
        creditLimit: 0,
        gstNumber: '',
        panNumber: '',
        notes: `Imported from ${fileNames.join(', ')}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Import User',
      };
      
      setCustomers(prev => [...prev, newCustomer]);
      return { success: true, count: files.length };
    } catch (error) {
      console.error('Error importing:', error);
      return { success: false, error: 'Import failed' };
    } finally {
      setImportLoading(false);
    }
  }, [customers.length]);

  // Refresh
  const handleRefresh = useCallback(async (): Promise<void> => {
    await fetchCustomers();
  }, [fetchCustomers]);

  // Change items per page
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Update status
  const handleStatusUpdate = useCallback(async (id: string, status: Customer['status']): Promise<{ success: boolean; error?: string }> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCustomers(prev => prev.map(c =>
        c.id === id
          ? { ...c, status, updatedAt: new Date().toISOString() }
          : c
      ));
      return { success: true };
    } catch (error) {
      console.error('Error updating status:', error);
      return { success: false, error: 'Failed to update status' };
    }
  }, []);

  // Initial fetch - only runs once
  useEffect(() => {
    if (!isInitialFetchDone.current) {
      isInitialFetchDone.current = true;
      fetchCustomers();
    }
  }, [fetchCustomers]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (customers.length > 0) {
      applyFilters();
    }
  }, [customers, filters, currentPage, itemsPerPage, applyFilters]);

  return {
    // State
    loading,
    customers,
    currentItems,
    stats,
    filters,
    currentPage,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    totalPages,
    importLoading,
    
    // Setters
    setFilters,
    setCurrentPage,
    setItemsPerPage: handleItemsPerPageChange,
    
    // Actions
    createCustomer,
    updateCustomer,
    deleteCustomer,
    handleBulkDelete,
    handleExport,
    handleImport,
    handleRefresh,
    getCustomer,
    handleStatusUpdate,
    fetchCustomers,
  };
};