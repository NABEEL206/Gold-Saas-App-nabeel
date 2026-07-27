// src/components/common/ItemSelectionTable.tsx
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronRight, AlertCircle,
  X, ImageOff, RotateCcw, Search,
} from 'lucide-react';
import SearchableDropdown, { type DropdownOption } from './Searchabledropdown';
import OldGoldTable, { type OldGoldItem, recalcOldGold } from './OldGoldTable';
import {
  TAX_RATES,
  PURITY_OPTIONS,
  UNIT_OPTIONS,
} from '../../utils/constants';

// ─── Types ───────────────────────────────────────────────────────────────────
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
  sku?: string;
  stock?: number;
  category?: string;
  weight?: number;
  wastagePercentage?: number;
  hsn?: string;
  [key: string]: any;
}

export interface ItemSelectionTableProps {
  items: ItemSelectionItem[];
  onItemsChange: (items: ItemSelectionItem[]) => void;
  onItemAdd?: (item: ItemSelectionItem) => void;
  onItemRemove?: (index: number) => void;
  onItemUpdate?: (index: number, field: string, value: any) => void;
  errors?: Record<string, string>;
  productSuggestions?: Array<{
    id: string; name: string; code?: string; category?: string;
    purity?: string; price?: number; description?: string;
    sku?: string; stock?: number; unit?: string;
  }>;
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
  showHSN?: boolean;
  simpleMode?: boolean;
  loading?: boolean;
  searchPlaceholder?: string;
  addButtonLabel?: string;
  title?: string;
  className?: string;
  showSubtotalSection?: boolean;
  additionalCharges?: { label: string; value: number }[];
  headerDiscount?: number;
  headerDiscountType?: 'percentage' | 'fixed';
  showTotalSection?: boolean;
  unitOptions?: Array<{ value: string; label: string }>;
  autoAddDefaultRow?: boolean;
  addButtonAtBottom?: boolean;
  columns?: Array<{ key: string; label: string; width?: string }>;
  // Old gold specific
  oldGoldItems?: OldGoldItem[];
  onOldGoldItemsChange?: (items: OldGoldItem[]) => void;
  onOldGoldAdd?: (item: OldGoldItem) => void;
  onOldGoldRemove?: (index: number) => void;
  onOldGoldUpdate?: (index: number, field: string, value: any) => void;
  showOldGoldSection?: boolean;
  oldGoldTitle?: string;
  oldGoldVisible?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function recalc(it: ItemSelectionItem): ItemSelectionItem {
  const qty   = Number(it.quantity)      || 0;
  const rate  = Number(it.rate)          || 0;
  const mc    = Number(it.makingCharges) || 0;
  const sc    = Number(it.stoneCharges)  || 0;
  const gross = qty * rate + mc + sc;
  const d     = Number(it.discount) || 0;
  const disc  = it.discountType === 'fixed' ? d : (gross * d) / 100;
  const after = Math.max(gross - disc, 0);
  const tax   = (after * (Number(it.taxRate) || 0)) / 100;
  return { ...it, taxAmount: tax, total: after + tax };
}

function fmt(n: number) {
  return (Number.isFinite(n) ? n : 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

function toStr(v: number | string | undefined): string {
  if (v === undefined || v === null || v === 0 || v === '') return '';
  return String(v);
}

// ─── Shared input styles ─────────────────────────────────────────────────────
const BASE_INPUT =
  'h-9 w-full rounded border px-3 text-sm ' +
  'placeholder:text-gray-400 transition-all duration-200 ' +
  'focus:outline-none focus:ring-1 ' +
  'disabled:bg-gray-50 disabled:text-gray-400 ' +
  '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ' +
  '[appearance:textfield] themed-transition';

// ─── Field components ──────────────────────────────────────────────────────
const TF: React.FC<{
  value: number | string | undefined;
  onChange: (raw: string) => void;
  placeholder?: string;
  align?: 'left' | 'right' | 'center';
  error?: boolean;
  disabled?: boolean;
  className?: string;
  step?: string;
}> = ({ value, onChange, placeholder = '0', align = 'right', error, disabled, className = '', step = 'any' }) => (
  <input
    type="number"
    step={step}
    value={value === 0 || value === undefined ? '' : String(value)}
    disabled={disabled}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
    className={`${BASE_INPUT} ${align === 'right' ? 'text-right tabular-nums' : align === 'center' ? 'text-center' : ''} ${className}`}
    style={{
      borderColor: error ? 'var(--danger)' : 'var(--border)',
      backgroundColor: 'var(--card)',
      color: 'var(--text)',
    }}
  />
);

const SF: React.FC<{
  value: string | number | undefined;
  onChange: (v: string) => void;
  options: Array<{ value: string | number; label: string }>;
  error?: boolean;
  className?: string;
}> = ({ value, onChange, options, error, className = '' }) => (
  <div className={`relative ${className}`}>
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={`${BASE_INPUT} appearance-none pr-8 cursor-pointer`}
      style={{
        borderColor: error ? 'var(--danger)' : 'var(--border)',
        backgroundColor: 'var(--card)',
        color: 'var(--text)',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
  </div>
);

// ─── Helper to get error for a field ──────────────────────────────────────
const getFieldError = (errors: Record<string, string> | undefined, idx: number, field: string): string | undefined => {
  if (!errors) return undefined;
  const keys = [
    `items.${idx}.${field}`,
    `${idx}.${field}`,
    `item_${idx}_${field}`,
    `${field}_${idx}`,
    field,
  ];
  
  for (const key of keys) {
    if (errors[key]) {
      return errors[key];
    }
  }
  return undefined;
};

// ─── Main component ───────────────────────────────────────────────────────────
export const ItemSelectionTable: React.FC<ItemSelectionTableProps> = ({
  items,
  onItemsChange,
  onItemAdd,
  onItemRemove,
  onItemUpdate,
  oldGoldItems = [],
  onOldGoldItemsChange,
  onOldGoldAdd,
  onOldGoldRemove,
  onOldGoldUpdate,
  errors = {},
  productSuggestions = [],
  productSearch: _ps = '',
  onProductSearchChange,
  onProductSelect,
  onAddCustomItem,
  showJewelryFields = false,
  showDescription = true,
  showUnit = true,
  showDiscount = true,
  showTax = true,
  showMakingCharges = false,
  showWeightFields = false,
  showPurity = false,
  showHSN = false,
  simpleMode = false,
  loading = false,
  searchPlaceholder = 'Search or select item',
  addButtonLabel = 'Add Item',
  title = 'Item Selection',
  className = '',
  showSubtotalSection = true,
  additionalCharges = [],
  headerDiscount = 0,
  headerDiscountType = 'percentage',
  showTotalSection = true,
  unitOptions = UNIT_OPTIONS,
  autoAddDefaultRow = true,
  addButtonAtBottom = true,
  showOldGoldSection = false,
  oldGoldTitle = 'Old Gold Exchange',
  oldGoldVisible = true,
}) => {
  const [showOldGold, setShowOldGold] = useState(oldGoldVisible);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);

  const productOptions: DropdownOption[] = productSuggestions.map((p) => ({
    value: p.id,
    label: p.name,
    group: p.category,
  }));

  const toggleRow = (idx: number) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const updateItem = (idx: number, field: string, raw: string | number) => {
    const num = typeof raw === 'string'
      ? (raw === '' ? 0 : Number(raw))
      : raw;
    const updated = recalc({ ...items[idx], [field]: num });
    if (onItemUpdate) { onItemUpdate(idx, field, num); return; }
    onItemsChange(items.map((it, i) => (i === idx ? updated : it)));
  };

  const removeItem = (idx: number) => {
    if (onItemRemove) { onItemRemove(idx); return; }
    onItemsChange(items.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    if (onAddCustomItem) { onAddCustomItem(); return; }
    const blank: ItemSelectionItem = {
      productId: `new_${Date.now()}`, productName: '',
      quantity: 1, unit: unitOptions[0]?.value ?? 'Pcs',
      rate: 0, discount: 0, discountType: 'percentage',
      taxRate: 0, taxAmount: 0, total: 0,
      grossWt: 0,
      netWt: 0,
      makingCharges: 0,
      hsn: '',
      purity: '',
    };
    if (onItemAdd) onItemAdd(blank);
    onItemsChange([...items, blank]);
    setIsAddingNewRow(true);
  };

  const hasTrailingEmptyRow = items.length > 0 && !items[items.length - 1].productName;

  useEffect(() => {
    if (loading) return;
    if (items.length === 0) {
      addItem();
      return;
    }
    if (hasTrailingEmptyRow) {
      setIsAddingNewRow(false);
      return;
    }
    if (autoAddDefaultRow && !isAddingNewRow) {
      addItem();
    }
    const timer = setTimeout(() => {
      setIsAddingNewRow(false);
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, hasTrailingEmptyRow, loading, autoAddDefaultRow]);

  useEffect(() => {
    if (!hasTrailingEmptyRow) {
      setIsAddingNewRow(false);
    }
  }, [hasTrailingEmptyRow]);

  const totals = useMemo(() => {
    const sub  = items.reduce((s, it) =>
      s + (Number(it.quantity)||0)*(Number(it.rate)||0)
        + (Number(it.makingCharges)||0) + (Number(it.stoneCharges)||0), 0);
    const disc = items.reduce((s, it) => {
      const g = (Number(it.quantity)||0)*(Number(it.rate)||0)
              + (Number(it.makingCharges)||0) + (Number(it.stoneCharges)||0);
      const d = Number(it.discount)||0;
      return s + (it.discountType==='fixed' ? d : (g*d)/100);
    }, 0);
    const tax   = items.reduce((s, it) => s + (Number(it.taxAmount)||0), 0);
    const oldGoldTotal = oldGoldItems.reduce((s, it) => s + (Number(it.amount)||0), 0);
    const grand = items.reduce((s, it) => s + (Number(it.total)||0), 0) + oldGoldTotal;
    const addCh = additionalCharges.reduce((s, c) => s + (Number(c.value)||0), 0);
    const hd    = headerDiscountType==='fixed'
      ? headerDiscount
      : ((sub - disc) * headerDiscount) / 100;
    return { sub, disc, tax, grand, oldGoldTotal, addCh, hd, final: grand - hd + addCh };
  }, [items, oldGoldItems, additionalCharges, headerDiscount, headerDiscountType]);

  const hasItemErrors = useMemo(() => {
    return Object.keys(errors).some(key => key.startsWith('item_') || key.includes('item'));
  }, [errors]);

  return (
    <div 
      className={`w-full overflow-hidden rounded-lg border themed-transition ${className}`}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--card)',
      }}
    >

      {/* ── Header ── */}
      <div 
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-base font-semibold" style={{ color: 'var(--gold)' }}>{title}</h2>
        <div className="flex items-center gap-3">
          {showOldGoldSection && (
            <button
              type="button"
              onClick={() => setShowOldGold(!showOldGold)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors themed-transition`}
              style={{
                backgroundColor: showOldGold ? 'var(--primary-light)' : 'transparent',
                color: showOldGold ? 'var(--primary)' : 'var(--gold)',
                borderColor: showOldGold ? 'transparent' : 'var(--gold)',
                borderWidth: showOldGold ? '0' : '1px',
                borderStyle: showOldGold ? 'none' : 'dashed',
              }}
            >
              <RotateCcw className="h-4 w-4" />
              {showOldGold ? 'Hide Old Gold' : 'Add Old Gold Exchange'}
              {showOldGold ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {hasItemErrors && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--danger)' }}>
              <AlertCircle className="h-3 w-3" />
              Has errors
            </span>
          )}
        </div>
      </div>

      {/* ── NEW ITEMS Section ── */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>New Items</h3>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{items.length} items</span>
        </div>

        {/* Items Table - Compact View */}
        <div 
          className="overflow-x-auto border rounded-lg themed-transition"
          style={{ borderColor: 'var(--border)' }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr 
                className="text-xs font-semibold uppercase tracking-wider border-b themed-transition"
                style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  borderColor: 'var(--border)',
                }}
              >
                <th className="px-2 py-2 text-center w-8">#</th>
                <th className="px-2 py-2 text-left min-w-[180px] max-w-[220px]">Item</th>
                <th className="px-2 py-2 text-center w-24">Qty</th>
                <th className="px-2 py-2 text-center w-16">Unit</th>
                <th className="px-2 py-2 text-center w-28">Rate</th>
                <th className="px-2 py-2 text-center w-28">Purity</th>
                <th className="px-2 py-2 text-center w-20">Tax</th>
                <th className="px-2 py-2 text-center w-28">Amount</th>
                <th className="px-2 py-2 text-center w-10">Details</th>
                <th className="px-2 py-2 text-center w-10">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && [...Array(2)].map((_, i) => (
                <tr 
                  key={i} 
                  className="border-b"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td colSpan={10} className="px-2 py-2">
                    <div 
                      className="h-9 w-full animate-pulse rounded"
                      style={{ backgroundColor: 'var(--primary-light)' }}
                    />
                  </td>
                </tr>
              ))}

              {!loading && items.map((item, idx) => {
                const itemError = (field: string) => getFieldError(errors, idx, field);
                const hasError = (field: string) => !!itemError(field);
                const isExpanded = !!expandedRows[idx];

                return (
                  <React.Fragment key={item.id ?? idx}>
                    {/* Main Row - Compact */}
                    <tr 
                      className="border-b transition-colors themed-transition"
                      style={{ 
                        borderColor: 'var(--border)',
                        backgroundColor: isExpanded ? 'var(--hover-bg)' : 'transparent',
                      }}
                    >
                      <td className="px-2 py-2 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        {idx + 1}
                      </td>
                      
                      <td className="px-2 py-2">
                        <div className="relative">
                          <SearchableDropdown
                            options={productOptions}
                            value={
                              item.productId && productOptions.some(o => o.value === item.productId)
                                ? item.productId
                                : null
                            }
                            onChange={(opt) => {
                              const prod = productSuggestions.find((p) => p.id === opt.value);
                              if (prod) {
                                const filled = recalc({
                                  ...item,
                                  productId:   prod.id,
                                  productName: prod.name,
                                  description: prod.description ?? item.description ?? '',
                                  unit:        prod.unit ?? item.unit ?? 'Pcs',
                                  rate:        prod.price ?? item.rate,
                                  purity:      prod.purity ?? item.purity,
                                  sku:         prod.code ?? item.sku,
                                  stock:       prod.stock ?? item.stock,
                                });
                                onItemsChange(items.map((it, i) => i === idx ? filled : it));
                                onProductSelect?.(prod);
                                onProductSearchChange?.('');
                              }
                            }}
                            placeholder={searchPlaceholder}
                            triggerPlaceholder={item.productName || searchPlaceholder}
                            resetSearchOnOpen
                            showEmptyState
                            emptyStateText="No matching items"
                            className="min-w-[160px] max-w-[200px]"
                          />
                          {hasError('productName') && (
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{itemError('productName')}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <div className="relative">
                          <TF value={toStr(item.quantity)} placeholder="1"
                            onChange={(v) => updateItem(idx, 'quantity', v)} 
                            error={hasError('quantity')} step="any"
                            className="text-center w-24" />
                          {hasError('quantity') && (
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{itemError('quantity')}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <SF value={item.unit}
                          onChange={(v) => updateItem(idx, 'unit', v)}
                          options={unitOptions} 
                          error={hasError('unit')}
                          className="w-16 mx-auto" />
                      </td>

                      <td className="px-2 py-2 text-center">
                        <div className="relative">
                          <TF value={toStr(item.rate)} placeholder="0"
                            onChange={(v) => updateItem(idx, 'rate', v)} 
                            error={hasError('rate')} step="any"
                            className="text-center w-28" />
                          {hasError('rate') && (
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{itemError('rate')}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <SF value={item.purity}
                          onChange={(v) => updateItem(idx, 'purity', v)}
                          options={PURITY_OPTIONS} 
                          error={hasError('purity')}
                          className="w-28 mx-auto" />
                      </td>

                      <td className="px-2 py-2 text-center">
                        <SF value={item.taxRate}
                          onChange={(v) => updateItem(idx, 'taxRate', v)}
                          options={TAX_RATES} 
                          error={hasError('taxRate')}
                          className="w-20 mx-auto" />
                      </td>

                      <td className="px-2 py-2 text-center">
                        <span className="text-sm font-semibold w-28 inline-block" style={{ color: 'var(--gold)' }}>
                          ₹{fmt(item.total || 0)}
                        </span>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRow(idx)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded border transition-colors themed-transition"
                          style={{
                            borderColor: 'var(--border)',
                            color: 'var(--text-muted)',
                          }}
                          title={isExpanded ? 'Hide details' : 'Show details'}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      </td>

                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded border transition-colors themed-transition"
                          style={{
                            borderColor: 'var(--border)',
                            color: 'var(--danger)',
                          }}
                          title="Delete row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'var(--hover-bg)' }}>
                        <td colSpan={10} className="px-4 py-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* HSN */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>HSN</label>
                              <input
                                type="text"
                                value={item.hsn || ''}
                                placeholder="HSN"
                                onChange={(e) => updateItem(idx, 'hsn', e.target.value)}
                                className="w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 themed-transition"
                                style={{
                                  borderColor: hasError('hsn') ? 'var(--danger)' : 'var(--border)',
                                  backgroundColor: 'var(--card)',
                                  color: 'var(--text)',
                                }}
                              />
                            </div>

                            {/* G.WT */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>G.WT</label>
                              <TF value={toStr(item.grossWt)} placeholder="0"
                                onChange={(v) => updateItem(idx, 'grossWt', v)} 
                                error={hasError('grossWt')} step="0.001" />
                            </div>

                            {/* N.WT */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>N.WT</label>
                              <TF value={toStr(item.netWt)} placeholder="0"
                                onChange={(v) => updateItem(idx, 'netWt', v)} 
                                error={hasError('netWt')} step="0.001" />
                            </div>

                            {/* MC */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>MC</label>
                              <TF value={toStr(item.makingCharges)} placeholder="0"
                                onChange={(v) => updateItem(idx, 'makingCharges', v)} 
                                error={hasError('makingCharges')} step="any" />
                            </div>

                            {/* Discount */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Discount</label>
                              <div className="flex items-center gap-1">
                                <TF value={toStr(item.discount)} placeholder="0"
                                  onChange={(v) => updateItem(idx, 'discount', v)} 
                                  error={hasError('discount')} step="any"
                                  className="flex-1" />
                                <select
                                  value={item.discountType || 'percentage'}
                                  onChange={(e) => updateItem(idx, 'discountType', e.target.value)}
                                  className="h-9 w-16 rounded border px-2 text-sm focus:outline-none focus:ring-1 themed-transition"
                                  style={{
                                    borderColor: 'var(--border)',
                                    backgroundColor: 'var(--card)',
                                    color: 'var(--text)',
                                  }}
                                >
                                  <option value="percentage">%</option>
                                  <option value="fixed">₹</option>
                                </select>
                              </div>
                            </div>

                            {/* Description */}
                            {showDescription && (
                              <div className="col-span-3">
                                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Description</label>
                                <input
                                  type="text"
                                  value={item.description || ''}
                                  placeholder="Add description"
                                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                  className="w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 themed-transition"
                                  style={{
                                    borderColor: hasError('description') ? 'var(--danger)' : 'var(--border)',
                                    backgroundColor: 'var(--card)',
                                    color: 'var(--text)',
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add item button */}
        {!loading && (items.length === 0 || !hasTrailingEmptyRow) && (
          <div className="mt-2">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 rounded border border-dashed px-4 py-2 text-sm font-medium transition-colors themed-transition"
              style={{
                borderColor: 'var(--gold)',
                color: 'var(--gold)',
              }}
            >
              <Plus className="h-4 w-4" /> {addButtonLabel}
            </button>
          </div>
        )}
      </div>

      {/* ── OLD GOLD EXCHANGE Section ── */}
      {showOldGoldSection && showOldGold && (
        <OldGoldTable
          items={oldGoldItems}
          onItemsChange={onOldGoldItemsChange || (() => {})}
          onItemAdd={onOldGoldAdd}
          onItemRemove={onOldGoldRemove}
          onItemUpdate={onOldGoldUpdate}
          errors={errors}
          showHSN={showHSN}
          title={oldGoldTitle}
        />
      )}

      {/* ── Totals ── */}
      {showSubtotalSection && items.length > 0 && (
        <div 
          className="border-t px-4 py-3 themed-transition"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--primary-light)',
          }}
        >
          <div className="flex flex-col items-end gap-1">
            <Row label="Subtotal" value={`₹${fmt(totals.sub)}`} />
            {totals.oldGoldTotal > 0 && (
              <Row label="Old Gold Exchange" value={`₹${fmt(totals.oldGoldTotal)}`} valueColor="var(--gold)" />
            )}
            {totals.disc > 0 && (
              <Row label="Discount" value={`−₹${fmt(totals.disc)}`} valueColor="var(--success)" />
            )}
            {totals.tax > 0 && (
              <Row label="Tax" value={`+₹${fmt(totals.tax)}`} valueColor="var(--info)" />
            )}
            {additionalCharges.map((c, i) => (
              <Row key={i} label={c.label} value={`+₹${fmt(Number(c.value)||0)}`} />
            ))}
            {headerDiscount > 0 && (
              <Row
                label={`Header Discount (${headerDiscountType==='percentage' ? `${headerDiscount}%` : '₹'+headerDiscount})`}
                value={`−₹${fmt(totals.hd)}`}
                valueColor="var(--danger)"
              />
            )}
            {showTotalSection && (
              <div 
                className="mt-1 flex w-72 items-center justify-between rounded-lg border px-4 py-2 themed-transition"
                style={{
                  borderColor: 'var(--gold)',
                  backgroundColor: 'var(--card)',
                }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Grand Total</span>
                <span className="text-lg font-bold tabular-nums" style={{ color: 'var(--gold)' }}>
                  ₹{fmt(totals.final)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// small helper row for totals section
const Row: React.FC<{ 
  label: string; 
  value: string; 
  valueColor?: string;
}> = ({
  label, 
  value, 
  valueColor,
}) => (
  <div className="flex w-72 items-center justify-between text-sm">
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span 
      className="tabular-nums font-medium"
      style={{ color: valueColor || 'var(--text)' }}
    >
      {value}
    </span>
  </div>
);

export default ItemSelectionTable;