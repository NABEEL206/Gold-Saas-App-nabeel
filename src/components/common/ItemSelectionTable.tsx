// src/components/common/ItemSelectionTable.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import ItemSelectionDropdown from './ItemSelectionDropdown';
import type { ItemSuggestion } from './ItemSelectionDropdown';

// Tax rate options
export const TAX_RATES = [
  { value: 0, label: '0%' },
  { value: 3, label: '3%' },
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18%' },
  { value: 28, label: '28%' },
];

// Purity options for jewelry
export const PURITY_OPTIONS = [
  { value: '24K', label: '24K' },
  { value: '22K', label: '22K' },
  { value: '18K', label: '18K' },
  { value: '14K', label: '14K' },
  { value: '10K', label: '10K' },
];

// Unit options
export const UNIT_OPTIONS = [
  { value: 'Pcs', label: 'Pcs' },
  { value: 'Gm', label: 'Gm' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Tola', label: 'Tola' },
  { value: 'Gram', label: 'Gram' },
  { value: 'Mg', label: 'Mg' },
  { value: 'Carat', label: 'Carat' },
  { value: 'Ratti', label: 'Ratti' },
  { value: 'Mtr', label: 'Mtr' },
  { value: 'Set', label: 'Set' },
  { value: 'Pair', label: 'Pair' },
];

// Discount type options
export const DISCOUNT_TYPES = [
  { value: 'percentage', label: '%' },
  { value: 'fixed', label: '₹' },
];

export interface ItemSelectionItem {
  id?: string;
  productId: string;
  productName: string;
  description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discount: number;
  discountType?: 'percentage' | 'fixed';
  taxRate: number;
  taxAmount: number;
  total: number;
  purity?: string;
  grossWt?: number;
  stoneWt?: number;
  netWt?: number;
  makingCharges?: number;
  stoneCharges?: number;
  [key: string]: any;
}

export interface ItemSelectionTableProps {
  items: ItemSelectionItem[];
  onItemsChange: (items: ItemSelectionItem[]) => void;
  onItemAdd?: (item: ItemSelectionItem) => void;
  onItemRemove?: (index: number) => void;
  onItemUpdate?: (index: number, field: string, value: any) => void;
  errors?: Record<string, string>;
  productSuggestions?: Array<{ id: string; name: string; code?: string; category?: string; purity?: string; price?: number; description?: string; sku?: string; stock?: number; unit?: string; email?: string; phone?: string }>;
  productSearch?: string;
  onProductSearchChange?: (value: string) => void;
  onProductSelect?: (product: any) => void;
  onAddCustomItem?: () => void;
  showJewelryFields?: boolean;
  showDescription?: boolean;
  showUnit?: boolean;
  showDiscount?: boolean;
  showTax?: boolean;
  showMakingCharges?: boolean;
  showWeightFields?: boolean;
  showPurity?: boolean;
  simpleMode?: boolean;
  loading?: boolean;
  searchPlaceholder?: string;
  addButtonLabel?: string;
  title?: string;
  className?: string;
  columns?: {
    item?: boolean;
    purity?: boolean;
    description?: boolean;
    grossWt?: boolean;
    stoneWt?: boolean;
    netWt?: boolean;
    qty?: boolean;
    unit?: boolean;
    rate?: boolean;
    making?: boolean;
    discount?: boolean;
    tax?: boolean;
    amount?: boolean;
    action?: boolean;
  };
  showSubtotalSection?: boolean;
  additionalCharges?: { label: string; value: number }[];
  headerDiscount?: number;
  headerDiscountType?: 'percentage' | 'fixed';
  showTotalSection?: boolean;
  unitOptions?: Array<{ value: string; label: string }>;
  autoAddDefaultRow?: boolean;
  addButtonAtBottom?: boolean;
}

export const ItemSelectionTable: React.FC<ItemSelectionTableProps> = ({
  items,
  onItemsChange,
  onItemAdd,
  onItemRemove,
  onItemUpdate,
  errors = {},
  productSuggestions = [],
  productSearch: externalProductSearch = '',
  onProductSearchChange,
  onProductSelect,
  onAddCustomItem,
  showJewelryFields = false,
  showDescription = false,
  showUnit = true,
  showDiscount = true,
  showTax = true,
  showMakingCharges = false,
  showWeightFields = false,
  showPurity = true,
  simpleMode = false,
  loading = false,
  searchPlaceholder = 'Select or add a item',
  addButtonLabel = 'Add Item',
  title = 'Items',
  className = '',
  columns: customColumns,
  showSubtotalSection = true,
  additionalCharges = [],
  headerDiscount = 0,
  headerDiscountType = 'percentage',
  showTotalSection = true,
  unitOptions = UNIT_OPTIONS,
  autoAddDefaultRow = true,
  addButtonAtBottom = true,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [localSearch, setLocalSearch] = useState(externalProductSearch || '');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Auto add default row when items is empty
  useEffect(() => {
    if (autoAddDefaultRow && !hasInitialized && items.length === 0 && !loading) {
      const defaultItem: ItemSelectionItem = {
        productId: `default_${Date.now()}`,
        productName: '',
        description: '',
        quantity: 1,
        unit: 'Pcs',
        rate: 0,
        discount: 0,
        discountType: 'percentage',
        taxRate: 18,
        taxAmount: 0,
        total: 0,
        purity: '22K',
      };
      
      if (showJewelryFields) {
        defaultItem.grossWt = 0;
        defaultItem.stoneWt = 0;
        defaultItem.netWt = 0;
        defaultItem.makingCharges = 0;
        defaultItem.stoneCharges = 0;
      }
      
      onItemsChange([defaultItem]);
      setHasInitialized(true);
    }
  }, [autoAddDefaultRow, items.length, loading, showJewelryFields, onItemsChange, hasInitialized]);

  // Reset initialization when items become empty
  useEffect(() => {
    if (items.length === 0) {
      setHasInitialized(false);
    }
  }, [items.length]);

  // Sync local search with external prop
  useEffect(() => {
    if (externalProductSearch !== localSearch) {
      setLocalSearch(externalProductSearch);
    }
  }, [externalProductSearch]);

  const calculateItemBreakdown = (item: ItemSelectionItem) => {
    let baseAmount = 0;
    
    if (showJewelryFields && item.netWt !== undefined) {
      baseAmount = (item.netWt || 0) * (item.rate || 0) + (item.makingCharges || 0);
    } else {
      baseAmount = (item.quantity || 1) * (item.rate || 0);
    }
    
    let discountAmount = 0;
    if (item.discountType === 'fixed') {
      discountAmount = item.discount || 0;
    } else {
      discountAmount = baseAmount * ((item.discount || 0) / 100);
    }
    
    const afterDiscount = baseAmount - discountAmount;
    const taxAmount = afterDiscount * ((item.taxRate || 0) / 100);
    const total = afterDiscount + taxAmount;
    
    return { baseAmount, discountAmount, taxAmount, total };
  };

  const calculateItemTotal = (item: ItemSelectionItem): number => {
    const breakdown = calculateItemBreakdown(item);
    return breakdown.total;
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...items];
    const item = { ...updatedItems[index] };
    
    (item as any)[field] = value;
    
    if (showJewelryFields) {
      if (field === 'grossWt' || field === 'stoneWt') {
        const grossWt = field === 'grossWt' ? parseFloat(value) || 0 : item.grossWt || 0;
        const stoneWt = field === 'stoneWt' ? parseFloat(value) || 0 : item.stoneWt || 0;
        item.netWt = grossWt - stoneWt;
      }
    }
    
    if (!item.discountType) {
      item.discountType = 'percentage';
    }
    
    item.taxAmount = 0;
    item.total = calculateItemTotal(item);
    
    updatedItems[index] = item;
    onItemsChange(updatedItems);
    
    if (onItemUpdate) {
      onItemUpdate(index, field, value);
    }
  };

  const handleProductSelect = (product: any, index: number) => {
    const newItem: ItemSelectionItem = {
      productId: product.id,
      productName: product.name,
      description: product.description || '',
      quantity: 1,
      unit: product.unit || 'Pcs',
      rate: product.price || 0,
      discount: 0,
      discountType: 'percentage',
      taxRate: 18,
      taxAmount: 0,
      total: 0,
      purity: product.purity || '22K',
    };
    
    if (showJewelryFields) {
      newItem.grossWt = 0;
      newItem.stoneWt = 0;
      newItem.netWt = 0;
      newItem.makingCharges = 0;
      newItem.stoneCharges = 0;
    }
    
    newItem.total = calculateItemTotal(newItem);
    
    const updatedItems = [...items];
    updatedItems[index] = newItem;
    onItemsChange(updatedItems);
    
    if (onItemAdd) {
      onItemAdd(newItem);
    }
    if (onProductSelect) {
      onProductSelect(product);
    }
    
    if (onProductSearchChange) {
      onProductSearchChange('');
    }
    
    setLocalSearch('');
    setIsDropdownOpen(false);
    setActiveRowIndex(null);
  };

  const handleAddCustomItem = () => {
    if (onAddCustomItem) {
      onAddCustomItem();
      return;
    }
    
    const newItem: ItemSelectionItem = {
      productId: `custom_${Date.now()}`,
      productName: '',
      description: '',
      quantity: 1,
      unit: 'Pcs',
      rate: 0,
      discount: 0,
      discountType: 'percentage',
      taxRate: 18,
      taxAmount: 0,
      total: 0,
      purity: '22K',
    };
    
    if (showJewelryFields) {
      newItem.grossWt = 0;
      newItem.stoneWt = 0;
      newItem.netWt = 0;
      newItem.makingCharges = 0;
      newItem.stoneCharges = 0;
    }
    
    const updatedItems = [...items, newItem];
    onItemsChange(updatedItems);
    
    setTimeout(() => {
      const newIndex = updatedItems.length - 1;
      const input = inputRefs.current[newIndex];
      if (input) {
        input.focus();
      }
    }, 100);
  };

  const handleRemoveItem = (index: number) => {
    if (autoAddDefaultRow && items.length <= 1) {
      const updatedItems = [...items];
      const clearedItem = { ...updatedItems[index] };
      clearedItem.productName = '';
      clearedItem.rate = 0;
      clearedItem.discount = 0;
      clearedItem.quantity = 1;
      clearedItem.total = 0;
      clearedItem.taxAmount = 0;
      
      if (showJewelryFields) {
        clearedItem.grossWt = 0;
        clearedItem.stoneWt = 0;
        clearedItem.netWt = 0;
        clearedItem.makingCharges = 0;
        clearedItem.stoneCharges = 0;
      }
      
      updatedItems[index] = clearedItem;
      onItemsChange(updatedItems);
      return;
    }
    
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
    if (onItemRemove) {
      onItemRemove(index);
    }
  };

  const handleSearchFocus = (index: number) => {
    setActiveRowIndex(index);
    setIsDropdownOpen(true);
    setTimeout(() => {
      const input = inputRefs.current[index];
      if (input && containerRef.current) {
        const rect = input.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: Math.max(rect.width, 320),
        });
      }
    }, 10);
  };

  const handleSearchChange = (index: number, value: string) => {
    setLocalSearch(value);
    handleItemChange(index, 'productName', value);
    if (onProductSearchChange) {
      onProductSearchChange(value);
    }
    setActiveRowIndex(index);
    setIsDropdownOpen(true);
    setTimeout(() => {
      const input = inputRefs.current[index];
      if (input && containerRef.current) {
        const rect = input.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: Math.max(rect.width, 320),
        });
      }
    }, 10);
  };

  const subtotal = items.reduce((sum, item) => {
    const breakdown = calculateItemBreakdown(item);
    return sum + breakdown.baseAmount;
  }, 0);
  
  const totalDiscount = items.reduce((sum, item) => {
    const breakdown = calculateItemBreakdown(item);
    return sum + breakdown.discountAmount;
  }, 0);
  
  const totalTax = items.reduce((sum, item) => {
    const breakdown = calculateItemBreakdown(item);
    return sum + breakdown.taxAmount;
  }, 0);
  
  const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  let headerDiscountAmount = 0;
  if (headerDiscount > 0) {
    if (headerDiscountType === 'fixed') {
      headerDiscountAmount = headerDiscount;
    } else {
      headerDiscountAmount = grandTotal * (headerDiscount / 100);
    }
  }

  const additionalChargesTotal = additionalCharges.reduce((sum, charge) => sum + charge.value, 0);
  const finalTotal = grandTotal - headerDiscountAmount + additionalChargesTotal;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatWeight = (value: number) => {
    if (value === undefined || value === null) return '0.000';
    return value.toFixed(3);
  };

  const getVisibleColumns = () => {
    if (customColumns) {
      return {
        item: customColumns.item !== undefined ? customColumns.item : true,
        purity: customColumns.purity !== undefined ? customColumns.purity : (showJewelryFields && showPurity),
        description: customColumns.description !== undefined ? customColumns.description : showDescription,
        grossWt: customColumns.grossWt !== undefined ? customColumns.grossWt : (showWeightFields && showJewelryFields),
        stoneWt: customColumns.stoneWt !== undefined ? customColumns.stoneWt : (showWeightFields && showJewelryFields),
        netWt: customColumns.netWt !== undefined ? customColumns.netWt : (showWeightFields && showJewelryFields),
        qty: customColumns.qty !== undefined ? customColumns.qty : true,
        unit: customColumns.unit !== undefined ? customColumns.unit : showUnit,
        rate: customColumns.rate !== undefined ? customColumns.rate : true,
        making: customColumns.making !== undefined ? customColumns.making : (showMakingCharges && showJewelryFields),
        discount: customColumns.discount !== undefined ? customColumns.discount : showDiscount,
        tax: customColumns.tax !== undefined ? customColumns.tax : showTax,
        amount: customColumns.amount !== undefined ? customColumns.amount : true,
        action: customColumns.action !== undefined ? customColumns.action : true,
      };
    }

    if (simpleMode) {
      return {
        item: true,
        purity: showPurity,
        description: false,
        grossWt: false,
        stoneWt: false,
        netWt: false,
        qty: true,
        unit: showUnit,
        rate: true,
        making: false,
        discount: showDiscount,
        tax: showTax,
        amount: true,
        action: true,
      };
    }
    
    return {
      item: true,
      purity: showJewelryFields && showPurity,
      description: showDescription,
      grossWt: showWeightFields && showJewelryFields,
      stoneWt: showWeightFields && showJewelryFields,
      netWt: showWeightFields && showJewelryFields,
      qty: true,
      unit: showUnit,
      rate: true,
      making: showMakingCharges && showJewelryFields,
      discount: showDiscount,
      tax: showTax,
      amount: true,
      action: true,
    };
  };

  const columns = getVisibleColumns();

  // Convert to ItemSuggestion format for dropdown
  const dropdownItems: ItemSuggestion[] = productSuggestions.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku || p.code,
    category: p.category,
    purity: p.purity,
    price: p.price,
    stock: p.stock || 0,
    unit: p.unit || 'NOS',
    description: p.description,
    email: p.email,
    phone: p.phone,
  }));

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`} ref={containerRef}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>{title}</span>
          {items.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({items.length} items)
            </span>
          )}
        </h2>
      )}

      {errors.items && (
        <p className="mb-4 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {errors.items}
        </p>
      )}

      {/* Items Table */}
      {items.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  {columns.item && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '200px' }}>
                      Item
                    </th>
                  )}
                  {columns.purity && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '70px' }}>
                      Purity
                    </th>
                  )}
                  {columns.description && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '120px' }}>
                      Description
                    </th>
                  )}
                  {columns.grossWt && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '80px' }}>
                      Gross Wt
                    </th>
                  )}
                  {columns.stoneWt && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '80px' }}>
                      Stone Wt
                    </th>
                  )}
                  {columns.netWt && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '80px' }}>
                      Net Wt
                    </th>
                  )}
                  {columns.qty && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '100px' }}>
                      Qty
                    </th>
                  )}
                  {columns.rate && !columns.unit && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '90px' }}>
                      Rate
                    </th>
                  )}
                  {columns.making && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '80px' }}>
                      Making
                    </th>
                  )}
                  {columns.discount && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '100px' }}>
                      Discount
                    </th>
                  )}
                  {columns.tax && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '70px' }}>
                      Tax %
                    </th>
                  )}
                  {columns.amount && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '110px' }}>
                      Amount
                    </th>
                  )}
                  {columns.action && (
                    <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap" style={{ minWidth: '40px' }}>
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, index) => {
                  const itemTotal = calculateItemTotal(item);
                  const errorKey = `item_${index}`;
                  const hasError = errors[errorKey] || errors[`${errorKey}_productName`] || errors[`${errorKey}_quantity`];
                  
                  return (
                    <tr key={index} className={`hover:bg-gray-50 transition-colors ${hasError ? 'bg-red-50' : ''}`}>
                      {columns.item && (
                        <td className="px-2 py-2 relative">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <input
                              ref={(el) => {
                                inputRefs.current[index] = el;
                              }}
                              type="text"
                              value={item.productName}
                              onChange={(e) => handleSearchChange(index, e.target.value)}
                              onFocus={() => handleSearchFocus(index)}
                              className={`w-full pl-7 pr-7 py-1.5 border rounded text-left focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm ${
                                errors[`${errorKey}_productName`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder={searchPlaceholder}
                              autoComplete="off"
                            />
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                          </div>
                          {errors[`${errorKey}_productName`] && (
                            <p className="mt-1 text-xs text-red-500">{errors[`${errorKey}_productName`]}</p>
                          )}
                        </td>
                      )}
                      
                      {columns.purity && (
                        <td className="px-2 py-2">
                          <select
                            value={item.purity || '22K'}
                            onChange={(e) => handleItemChange(index, 'purity', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                          >
                            {PURITY_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                      )}
                      
                      {columns.description && (
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                            placeholder="Description"
                          />
                        </td>
                      )}
                      
                      {columns.grossWt && (
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={item.grossWt !== undefined ? item.grossWt : ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              handleItemChange(index, 'grossWt', val);
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                            step="0.001"
                            placeholder="0.000"
                          />
                        </td>
                      )}
                      
                      {columns.stoneWt && (
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={item.stoneWt !== undefined ? item.stoneWt : ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              handleItemChange(index, 'stoneWt', val);
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                            step="0.001"
                            placeholder="0.000"
                          />
                        </td>
                      )}
                      
                      {columns.netWt && (
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={formatWeight(item.netWt || 0)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-center bg-gray-50 text-gray-700 font-medium text-sm"
                            disabled
                          />
                        </td>
                      )}
                      
                      {columns.qty && (
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 1;
                                handleItemChange(index, 'quantity', val);
                              }}
                              className={`w-full min-w-[50px] px-2 py-1.5 border rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm ${
                                errors[`${errorKey}_quantity`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              min="1"
                              step="1"
                              placeholder="0"
                            />
                            {showUnit && (
                              <select
                                value={item.unit || 'Pcs'}
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                className="w-14 px-1 py-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm bg-white"
                              >
                                {unitOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            )}
                          </div>
                          {errors[`${errorKey}_quantity`] && (
                            <p className="mt-1 text-xs text-red-500">{errors[`${errorKey}_quantity`]}</p>
                          )}
                        </td>
                      )}
                      
                      {columns.rate && !columns.unit && (
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={item.rate || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              handleItemChange(index, 'rate', val);
                            }}
                            className={`w-full px-2 py-1.5 border rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm ${
                              errors[`${errorKey}_rate`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            step="0.01"
                            placeholder="0.00"
                          />
                          {errors[`${errorKey}_rate`] && (
                            <p className="mt-1 text-xs text-red-500">{errors[`${errorKey}_rate`]}</p>
                          )}
                        </td>
                      )}
                      
                      {columns.making && (
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={item.makingCharges !== undefined ? item.makingCharges : ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              handleItemChange(index, 'makingCharges', val);
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                      )}
                      
                      {columns.discount && (
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={item.discount || ''}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                handleItemChange(index, 'discount', val);
                              }}
                              className="w-full min-w-[50px] px-2 py-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                              min="0"
                              step="0.01"
                              placeholder="0"
                            />
                            <select
                              value={item.discountType || 'percentage'}
                              onChange={(e) => {
                                const val = e.target.value as 'percentage' | 'fixed';
                                handleItemChange(index, 'discountType', val);
                              }}
                              className="w-10 px-1 py-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm bg-white"
                            >
                              {DISCOUNT_TYPES.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      )}
                      
                      {columns.tax && (
                        <td className="px-2 py-2">
                          <select
                            value={item.taxRate || 0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              handleItemChange(index, 'taxRate', val);
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm"
                          >
                            {TAX_RATES.map((tax) => (
                              <option key={tax.value} value={tax.value}>
                                {tax.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                      
                      {columns.amount && (
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={formatCurrency(itemTotal)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-center bg-amber-50 text-amber-700 font-semibold text-sm"
                            disabled
                          />
                        </td>
                      )}
                      
                      {columns.action && (
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Subtotal Section */}
          {showSubtotalSection && items.length > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-gray-300">
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-8 text-sm">
                  <span className="text-gray-600 font-medium">Subtotal:</span>
                  <span className="font-semibold text-gray-900 min-w-[130px] text-right">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                
                {totalDiscount > 0 && (
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-green-600 font-medium">Total Discount:</span>
                    <span className="font-semibold text-green-600 min-w-[130px] text-right">
                      -{formatCurrency(totalDiscount)}
                    </span>
                  </div>
                )}
                
                {totalTax > 0 && (
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-blue-600 font-medium">Total Tax:</span>
                    <span className="font-semibold text-blue-600 min-w-[130px] text-right">
                      {formatCurrency(totalTax)}
                    </span>
                  </div>
                )}

                {additionalCharges.map((charge, index) => (
                  <div key={index} className="flex items-center gap-8 text-sm">
                    <span className="text-gray-600 font-medium">{charge.label}:</span>
                    <span className="font-semibold text-gray-900 min-w-[130px] text-right">
                      {formatCurrency(charge.value)}
                    </span>
                  </div>
                ))}

                {headerDiscount > 0 && (
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-red-600 font-medium">
                      Discount ({headerDiscountType === 'percentage' ? `${headerDiscount}%` : 'Fixed'}):
                    </span>
                    <span className="font-semibold text-red-600 min-w-[130px] text-right">
                      -{formatCurrency(headerDiscountAmount)}
                    </span>
                  </div>
                )}

                {showTotalSection && (
                  <div className="flex items-center gap-8 pt-2 border-t-2 border-gray-200 mt-1">
                    <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                    <span className="text-lg font-bold text-amber-600 min-w-[130px] text-right">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Add Item Button - Bottom */}
          {addButtonAtBottom && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddCustomItem}
                className="px-4 py-2 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {addButtonLabel}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State with Add Button */}
      {items.length === 0 && !loading && (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500">No items added yet</p>
          <p className="text-sm text-gray-400 mt-1">Click the button below to add an item</p>
          <button
            type="button"
            onClick={handleAddCustomItem}
            className="mt-4 px-4 py-2 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      )}

      {/* Item Selection Dropdown */}
      <ItemSelectionDropdown
        isOpen={isDropdownOpen}
        onClose={() => {
          setIsDropdownOpen(false);
          setActiveRowIndex(null);
        }}
        searchTerm={localSearch}
        onSearchChange={(value) => {
          setLocalSearch(value);
          if (onProductSearchChange) {
            onProductSearchChange(value);
          }
        }}
        items={dropdownItems}
        onItemSelect={(item) => {
          if (activeRowIndex !== null) {
            handleProductSelect(item, activeRowIndex);
          }
        }}
        position={dropdownPosition}
        isLoading={loading}
        showRecent={true}
        recentItems={dropdownItems.slice(0, 5)}
        placeholder={searchPlaceholder}
        title="ITEM DETAILS"
        showDetails={true}
      />
    </div>
  );
};

export default ItemSelectionTable;