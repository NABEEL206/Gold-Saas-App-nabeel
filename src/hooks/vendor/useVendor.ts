// src/hooks/vendor/useVendor.ts

import { useState, useEffect, useCallback } from 'react';
import type{ Vendor, VendorFilters, VendorResponse } from '../../types/Vendor/VendorType';

// Dummy data
const DUMMY_VENDORS: Vendor[] = [
  {
    id: 1,
    name: 'Tech Solutions Inc.',
    email: 'info@techsolutions.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Solutions Inc.',
    address: '123 Tech Park',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    zipCode: '94105',
    taxId: '12-3456789',
    website: 'https://techsolutions.com',
    status: 'active',
    contactPerson: 'John Doe',
    contactEmail: 'john@techsolutions.com',
    contactPhone: '+1 (555) 987-6543',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Global Supplies Ltd',
    email: 'contact@globalsupplies.com',
    phone: '+1 (555) 234-5678',
    company: 'Global Supplies Ltd',
    address: '456 Supply Chain Blvd',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    zipCode: '10001',
    taxId: '98-7654321',
    website: 'https://globalsupplies.com',
    status: 'active',
    contactPerson: 'Jane Smith',
    contactEmail: 'jane@globalsupplies.com',
    contactPhone: '+1 (555) 876-5432',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 3,
    name: 'Quality Products Co',
    email: 'sales@qualityproducts.com',
    phone: '+1 (555) 345-6789',
    company: 'Quality Products Co',
    address: '789 Industrial Way',
    city: 'Chicago',
    state: 'IL',
    country: 'USA',
    zipCode: '60601',
    taxId: '34-5678901',
    website: 'https://qualityproducts.com',
    status: 'inactive',
    contactPerson: 'Mike Johnson',
    contactEmail: 'mike@qualityproducts.com',
    contactPhone: '+1 (555) 765-4321',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 4,
    name: 'Premier Logistics',
    email: 'info@premierlogistics.com',
    phone: '+1 (555) 456-7890',
    company: 'Premier Logistics LLC',
    address: '321 Transport Ave',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    zipCode: '90001',
    taxId: '56-7890123',
    website: 'https://premierlogistics.com',
    status: 'active',
    contactPerson: 'Sarah Wilson',
    contactEmail: 'sarah@premierlogistics.com',
    contactPhone: '+1 (555) 654-3210',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15'
  },
  {
    id: 5,
    name: 'Industrial Parts Ltd',
    email: 'parts@industrialltd.com',
    phone: '+1 (555) 567-8901',
    company: 'Industrial Parts Ltd',
    address: '654 Factory Road',
    city: 'Houston',
    state: 'TX',
    country: 'USA',
    zipCode: '77001',
    taxId: '78-9012345',
    website: 'https://industrialltd.com',
    status: 'inactive',
    contactPerson: 'Robert Brown',
    contactEmail: 'robert@industrialltd.com',
    contactPhone: '+1 (555) 543-2109',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01'
  }
];

export const useVendor = (initialFilters?: VendorFilters) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<VendorFilters>(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10
  });

  // Fetch vendors with filters (dummy implementation)
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      let filteredVendors = [...DUMMY_VENDORS];

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredVendors = filteredVendors.filter(v =>
          v.name.toLowerCase().includes(searchLower) ||
          v.company?.toLowerCase().includes(searchLower) ||
          v.email?.toLowerCase().includes(searchLower) ||
          v.phone?.includes(filters.search!)
        );
      }

      // Apply status filter
      if (filters?.status) {
        filteredVendors = filteredVendors.filter(v => v.status === filters.status);
      }

      // Apply company filter
      if (filters?.company) {
        filteredVendors = filteredVendors.filter(v =>
          v.company?.toLowerCase().includes(filters.company!.toLowerCase())
        );
      }

      // Sorting
      if (filters?.sortBy) {
        filteredVendors.sort((a: any, b: any) => {
          const aVal = a[filters.sortBy!] || '';
          const bVal = b[filters.sortBy!] || '';
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return filters.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredVendors.slice(startIndex, endIndex);

      setVendors(paginatedData);
      setPagination({
        page: page,
        total: filteredVendors.length,
        totalPages: Math.ceil(filteredVendors.length / limit),
        limit: limit
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Search vendors by term (for dropdown)
  const searchVendors = useCallback(async (searchTerm: string): Promise<Vendor[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!searchTerm.trim()) {
      return DUMMY_VENDORS;
    }

    const searchLower = searchTerm.toLowerCase();
    return DUMMY_VENDORS.filter(v =>
      v.name.toLowerCase().includes(searchLower) ||
      v.company?.toLowerCase().includes(searchLower) ||
      v.email?.toLowerCase().includes(searchLower) ||
      v.phone?.includes(searchTerm)
    );
  }, []);

  // Get single vendor by ID
  const getVendorById = useCallback(async (id: string | number): Promise<Vendor | null> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('getVendorById called with ID:', id);
    console.log('Searching in DUMMY_VENDORS:', DUMMY_VENDORS);
    
    // Handle both string and number IDs
    const vendor = DUMMY_VENDORS.find(v => String(v.id) === String(id));
    console.log('Found vendor:', vendor);
    
    return vendor || null;
  }, []);

  // Create new vendor
  const createVendor = useCallback(async (vendorData: any) => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const newVendor: Vendor = {
        ...vendorData,
        id: DUMMY_VENDORS.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DUMMY_VENDORS.push(newVendor);
      setVendors(prev => [newVendor, ...prev]);
      return newVendor;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vendor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update vendor
  const updateVendor = useCallback(async (id: string | number, vendorData: any) => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_VENDORS.findIndex(v => String(v.id) === String(id));
      if (index === -1) {
        throw new Error('Vendor not found');
      }
      
      const updatedVendor: Vendor = {
        ...DUMMY_VENDORS[index],
        ...vendorData,
        updatedAt: new Date().toISOString()
      };
      DUMMY_VENDORS[index] = updatedVendor;
      
      setVendors(prev => prev.map(v => String(v.id) === String(id) ? updatedVendor : v));
      return updatedVendor;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vendor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete vendor
  const deleteVendor = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const index = DUMMY_VENDORS.findIndex(v => String(v.id) === String(id));
      if (index === -1) {
        throw new Error('Vendor not found');
      }
      DUMMY_VENDORS.splice(index, 1);
      setVendors(prev => prev.filter(v => String(v.id) !== String(id)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vendor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<VendorFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  // Change page
  const changePage = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters || { page: 1, limit: 10 });
  }, [initialFilters]);

  // Initial fetch
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return {
    vendors,
    loading,
    error,
    filters,
    pagination,
    fetchVendors,
    searchVendors,
    getVendorById,
    createVendor,
    updateVendor,
    deleteVendor,
    updateFilters,
    changePage,
    resetFilters,
    setFilters
  };
};