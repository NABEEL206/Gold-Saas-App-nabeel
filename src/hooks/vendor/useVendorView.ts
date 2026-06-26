// src/hooks/vendor/useVendorView.ts

import { useState, useEffect } from 'react';
import type { Vendor } from '../../types/Vendor/VendorType';

export const useVendorView = (vendor: Vendor | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get full name for display
  const getDisplayName = (): string => {
    if (!vendor) return 'N/A';
    return vendor.name || 'Unnamed Vendor';
  };

  // Get company info
  const getCompanyInfo = (): string => {
    if (!vendor) return '';
    return vendor.company || '';
  };

  // Get contact info
  const getContactInfo = (): { email: string; phone: string } => {
    if (!vendor) return { email: '', phone: '' };
    return {
      email: vendor.email || vendor.contactEmail || '',
      phone: vendor.phone || vendor.contactPhone || ''
    };
  };

  // Get full address
  const getFullAddress = (): string => {
    if (!vendor) return '';
    const parts = [
      vendor.address,
      vendor.city,
      vendor.state,
      vendor.zipCode,
      vendor.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Get status badge color
  const getStatusColor = (): string => {
    if (!vendor) return 'bg-gray-100 text-gray-800';
    switch (vendor.status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label
  const getStatusLabel = (): string => {
    if (!vendor) return 'Unknown';
    return vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : 'Unknown';
  };

  // Check if vendor has complete information
  const isComplete = (): boolean => {
    if (!vendor) return false;
    return !!(vendor.name && vendor.email && vendor.phone && vendor.address);
  };

  // Get summary statistics
  const getSummary = () => {
    if (!vendor) return null;
    return {
      name: vendor.name,
      company: vendor.company,
      email: vendor.email,
      phone: vendor.phone,
      status: vendor.status,
      address: getFullAddress(),
      contactPerson: vendor.contactPerson,
      taxId: vendor.taxId,
      website: vendor.website
    };
  };

  return {
    isLoading,
    error,
    getDisplayName,
    getCompanyInfo,
    getContactInfo,
    getFullAddress,
    getStatusColor,
    getStatusLabel,
    isComplete,
    getSummary,
    setIsLoading,
    setError
  };
};