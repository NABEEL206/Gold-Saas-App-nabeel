// src/components/Dropdowns/Vendor/VendorDropdown.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import type { Vendor } from '../../../types/Vendor/VendorType';

interface VendorDropdownProps {
  value?: string | number;
  onChange: (vendorId: string | number, vendor: Vendor) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  fetchVendors?: (searchTerm: string) => Promise<Vendor[]>;
  initialVendors?: Vendor[];
  onSearch?: (searchTerm: string) => void;
  isLoading?: boolean;
}

const VendorDropdown: React.FC<VendorDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Search and select vendor...',
  className = '',
  disabled = false,
  required = false,
  error = '',
  label = 'Vendor',
  fetchVendors,
  initialVendors = [],
  onSearch,
  isLoading: externalLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load vendors on mount or when search term changes
  useEffect(() => {
    if (fetchVendors) {
      const loadVendors = async () => {
        setIsLoading(true);
        try {
          const result = await fetchVendors(searchTerm);
          setVendors(result);
        } catch (error) {
          console.error('Error fetching vendors:', error);
          setVendors([]);
        } finally {
          setIsLoading(false);
        }
      };

      const debounceTimer = setTimeout(loadVendors, 300);
      return () => clearTimeout(debounceTimer);
    } else if (searchTerm && onSearch) {
      onSearch(searchTerm);
    }
  }, [searchTerm, fetchVendors, onSearch]);

  // Set selected vendor when value changes externally
  useEffect(() => {
    if (value && vendors.length > 0) {
      const found = vendors.find(v => v.id === value);
      if (found) {
        setSelectedVendor(found);
        setSearchTerm(found.name);
      }
    } else if (!value) {
      setSelectedVendor(null);
      setSearchTerm('');
    }
  }, [value, vendors]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < vendors.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelectVendor(vendors[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, vendors, highlightedIndex]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setSearchTerm(vendor.name);
    onChange(vendor.id, vendor);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVendor(null);
    setSearchTerm('');
    onChange('', null as any);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  };

  const getDisplayName = (vendor: Vendor) => {
    let display = vendor.name;
    if (vendor.company) {
      display += ` (${vendor.company})`;
    }
    return display;
  };

  const getVendorDetails = (vendor: Vendor) => {
    const details = [];
    if (vendor.email) details.push(vendor.email);
    if (vendor.phone) details.push(vendor.phone);
    return details.join(' • ');
  };

  const loading = externalLoading || isLoading;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`relative cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onClick={toggleDropdown}
      >
        <div
          className={`w-full bg-white border rounded-lg shadow-sm transition-all duration-200 ${
            error
              ? 'border-red-500 ring-2 ring-red-200'
              : isOpen
              ? 'border-blue-500 ring-2 ring-blue-200'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'bg-gray-50' : 'bg-white'}`}
        >
          <div className="flex items-center p-2">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              placeholder={selectedVendor ? getDisplayName(selectedVendor) : placeholder}
              className="w-full px-2 py-1 outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
              disabled={disabled}
              autoComplete="off"
            />
            {selectedVendor && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                disabled={disabled}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div ref={listRef} className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : vendors.length > 0 ? (
              vendors.map((vendor, index) => (
                <div
                  key={vendor.id}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50 ${
                    highlightedIndex === index ? 'bg-blue-50' : ''
                  } ${selectedVendor?.id === vendor.id ? 'bg-blue-100' : ''}`}
                  onClick={() => handleSelectVendor(vendor)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="font-medium text-gray-900">{vendor.name}</div>
                  {getVendorDetails(vendor) && (
                    <div className="text-sm text-gray-500">{getVendorDetails(vendor)}</div>
                  )}
                  {vendor.company && (
                    <div className="text-sm text-gray-400">{vendor.company}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No vendors found</p>
                <p className="text-sm mt-1">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDropdown;