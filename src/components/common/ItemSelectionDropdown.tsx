// src/components/common/ItemSelectionDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Package,
  Tag,
  IndianRupee,
  Box,
  X,
  Clock,
  User,
  Mail,
  Phone,
} from 'lucide-react';

export interface ItemSuggestion {
  id: string;
  name: string;
  code?: string;
  sku?: string;
  category?: string;
  purity?: string;
  price?: number;
  description?: string;
  stock?: number;
  unit?: string;
  email?: string;
  phone?: string;
  isFavorite?: boolean;
  lastUsed?: string;
}

interface ItemSelectionDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  items: ItemSuggestion[];
  onItemSelect: (item: ItemSuggestion) => void;
  position: { top: number; left: number; width: number };
  isLoading?: boolean;
  recentItems?: ItemSuggestion[];
  showRecent?: boolean;
  placeholder?: string;
  title?: string;
  showDetails?: boolean;
}

const ItemSelectionDropdown: React.FC<ItemSelectionDropdownProps> = ({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  items,
  onItemSelect,
  position,
  isLoading = false,
  recentItems = [],
  showRecent = true,
  placeholder = 'Search items...',
  title = 'ITEM DETAILS',
  showDetails = true,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const allItems = getDisplayItems();
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allItems.length) {
          onItemSelect(allItems[selectedIndex]);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, items, recentItems, onItemSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getDisplayItems = (): ItemSuggestion[] => {
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      return items.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.sku?.toLowerCase().includes(lower) ||
        p.category?.toLowerCase().includes(lower) ||
        p.email?.toLowerCase().includes(lower) ||
        p.phone?.includes(lower)
      );
    }
    if (showRecent && recentItems.length > 0) {
      return recentItems;
    }
    return items.slice(0, 10);
  };

  const displayItems = getDisplayItems();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-amber-100 text-amber-800">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: Math.max(position.width, 380),
        maxWidth: 'min(500px, 90vw)',
        maxHeight: '420px',
        animation: 'slideDown 0.15s ease-out',
      }}
    >
      {/* Search Header */}
      <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {displayItems.length} items
        </span>
      </div>

      {/* Title */}
      {title && (
        <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500">Loading items...</span>
        </div>
      )}

      {/* Items List */}
      {!isLoading && (
        <div className="overflow-y-auto max-h-[280px]">
          {!searchTerm.trim() && showRecent && recentItems.length > 0 && (
            <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Recent Items
              </span>
            </div>
          )}

          {displayItems.length > 0 ? (
            <div className="py-1">
              {displayItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onItemSelect(item);
                    onClose();
                  }}
                  className={`w-full px-4 py-2.5 text-left transition-colors duration-150 border-b border-gray-50 last:border-0 ${
                    selectedIndex === index
                      ? 'bg-amber-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {highlightMatch(item.name, searchTerm)}
                      </p>
                      {showDetails && (
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                          {item.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {item.email}
                            </span>
                          )}
                          {item.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {item.phone}
                            </span>
                          )}
                          {(item.sku || item.code) && (
                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                              <Tag className="h-3 w-3" />
                              {item.sku || item.code}
                            </span>
                          )}
                          {item.purity && (
                            <span className="text-amber-600 font-medium">{item.purity}</span>
                          )}
                          {item.category && (
                            <span className="text-gray-400">• {item.category}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      {item.price !== undefined && (
                        <span className="font-semibold text-gray-900 text-sm">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                      {item.stock !== undefined && (
                        <span className={`text-xs ${
                          item.stock > 10 ? 'text-green-600' : 
                          item.stock > 0 ? 'text-amber-600' : 
                          'text-red-500'
                        }`}>
                          <Box className="h-3 w-3 inline mr-1" />
                          {item.stock} {item.unit || 'NOS'}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Package className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No items found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="sticky bottom-0 bg-gray-50/95 px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">↵</kbd>
            Select
          </span>
        </div>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">ESC</kbd>
          Close
        </span>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ItemSelectionDropdown;