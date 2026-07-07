// src/hooks/vendor/useVendor.ts

import { useState, useEffect, useCallback } from 'react';
import type { Vendor, VendorFilters, VendorResponse } from '../../types/Vendor/VendorType';
import { validateVendorForm, formatValidationErrors } from '../../validations/vendor.validation';

// Dummy data with 9 vendors
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
  },
  // New vendors added below
  {
    id: 6,
    name: 'Apex Consulting Group',
    email: 'info@apexconsulting.com',
    phone: '+1 (555) 678-9012',
    company: 'Apex Consulting Group LLC',
    address: '789 Business Park',
    city: 'Boston',
    state: 'MA',
    country: 'USA',
    zipCode: '02110',
    taxId: '23-4567890',
    website: 'https://apexconsulting.com',
    status: 'active',
    contactPerson: 'Emily Davis',
    contactEmail: 'emily@apexconsulting.com',
    contactPhone: '+1 (555) 432-1098',
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15'
  },
  {
    id: 7,
    name: 'Green Energy Solutions',
    email: 'hello@greenenergy.com',
    phone: '+1 (555) 789-0123',
    company: 'Green Energy Solutions Inc.',
    address: '456 Solar Drive',
    city: 'Portland',
    state: 'OR',
    country: 'USA',
    zipCode: '97201',
    taxId: '45-6789012',
    website: 'https://greenenergy.com',
    status: 'active',
    contactPerson: 'Michael Green',
    contactEmail: 'michael@greenenergy.com',
    contactPhone: '+1 (555) 321-0987',
    createdAt: '2024-04-01',
    updatedAt: '2024-04-01'
  },
  {
    id: 8,
    name: 'Digital Marketing Pro',
    email: 'info@digitalmarketingpro.com',
    phone: '+1 (555) 890-1234',
    company: 'Digital Marketing Pro Agency',
    address: '123 Social Media Blvd',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    zipCode: '78701',
    taxId: '67-8901234',
    website: 'https://digitalmarketingpro.com',
    status: 'active',
    contactPerson: 'Jessica Taylor',
    contactEmail: 'jessica@digitalmarketingpro.com',
    contactPhone: '+1 (555) 210-9876',
    createdAt: '2024-04-15',
    updatedAt: '2024-04-15'
  },
  {
    id: 9,
    name: 'Healthcare Equipment Co',
    email: 'sales@healthcareequip.com',
    phone: '+1 (555) 901-2345',
    company: 'Healthcare Equipment Company',
    address: '789 Medical Center Drive',
    city: 'Orlando',
    state: 'FL',
    country: 'USA',
    zipCode: '32801',
    taxId: '89-0123456',
    website: 'https://healthcareequip.com',
    status: 'inactive',
    contactPerson: 'Dr. James Wilson',
    contactEmail: 'james@healthcareequip.com',
    contactPhone: '+1 (555) 109-8765',
    createdAt: '2024-05-01',
    updatedAt: '2024-05-01'
  }
];

export const useVendor = (initialFilters?: VendorFilters) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
      
      // Clear validation errors on successful fetch
      setValidationErrors({});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vendors';
      setError(errorMessage);
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
    
    // Handle both string and number IDs
    const vendor = DUMMY_VENDORS.find(v => String(v.id) === String(id));
    
    if (!vendor) {
      setError(`Vendor with ID ${id} not found`);
    }
    
    return vendor || null;
  }, []);

  // Create new vendor with validation
  const createVendor = useCallback(async (vendorData: any) => {
    // Validate the vendor data first
    const validationResult = validateVendorForm(vendorData);
    
    if (!validationResult.isValid) {
      const formattedErrors = formatValidationErrors(validationResult.errors);
      setValidationErrors(formattedErrors);
      throw new Error('Validation failed. Please check the form for errors.');
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});
    
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to create vendor';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update vendor with validation
  const updateVendor = useCallback(async (id: string | number, vendorData: any) => {
    // Validate the vendor data first
    const validationResult = validateVendorForm(vendorData);
    
    if (!validationResult.isValid) {
      const formattedErrors = formatValidationErrors(validationResult.errors);
      setValidationErrors(formattedErrors);
      throw new Error('Validation failed. Please check the form for errors.');
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});
    
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vendor';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete vendor
  const deleteVendor = useCallback(async (id: string | number) => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vendor';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk delete vendors
  const deleteVendors = useCallback(async (ids: (string | number)[]) => {
    if (!ids || ids.length === 0) {
      setValidationErrors({ selection: 'Please select at least one vendor to delete.' });
      throw new Error('No vendors selected for deletion');
    }

    setLoading(true);
    setError(null);
    setValidationErrors({});
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const deletedIds: (string | number)[] = [];
      for (const id of ids) {
        const index = DUMMY_VENDORS.findIndex(v => String(v.id) === String(id));
        if (index !== -1) {
          DUMMY_VENDORS.splice(index, 1);
          deletedIds.push(id);
        }
      }
      
      setVendors(prev => prev.filter(v => !ids.some(id => String(v.id) === String(id))));
      return deletedIds;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vendors';
      setError(errorMessage);
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
    // Clear errors when filters change
    setError(null);
    setValidationErrors({});
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
    setError(null);
    setValidationErrors({});
  }, [initialFilters]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return {
    vendors,
    loading,
    error,
    validationErrors, // Added validation errors
    filters,
    pagination,
    fetchVendors,
    searchVendors,
    getVendorById,
    createVendor,
    updateVendor,
    deleteVendor,
    deleteVendors, // New bulk delete function
    updateFilters,
    changePage,
    resetFilters,
    setFilters,
    clearErrors // Helper to clear all errors
  };
};