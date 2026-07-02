// src/components/common/ItemSelectionTable.tsx
import React, { useMemo } from 'react';
import {
  Plus, Trash2, ChevronDown, AlertCircle,
  X, ImageOff,
} from 'lucide-react';
import SearchableDropdown, { type DropdownOption } from './Searchabledropdown';

// ─── Static options ─────────────────────────────────────────────────────────
export const TAX_RATES = [
  { value: 0,  label: '0%'  }, { value: 3,  label: '3%'  },
  { value: 5,  label: '5%'  }, { value: 12, label: '12%' },
  { value: 18, label: '18%' }, { value: 28, label: '28%' },
];
export const PURITY_OPTIONS = [
  { value: '24K', label: '24K' }, { value: '22K', label: '22K' },
  { value: '18K', label: '18K' }, { value: '14K', label: '14K' },
  { value: '10K', label: '10K' },
];
export const UNIT_OPTIONS = [
  { value: 'Pcs',  label: 'Pcs'  }, { value: 'Gm',   label: 'Gm'   },
  { value: 'Kg',   label: 'Kg'   }, { value: 'Tola', label: 'Tola' },
  { value: 'Gram', label: 'Gram' }, { value: 'Mg',   label: 'Mg'   },
  { value: 'Carat',label: 'Carat'}, { value: 'Set',  label: 'Set'  },
  { value: 'Pair', label: 'Pair' },
];
export const DISCOUNT_TYPES = [
  { value: 'percentage', label: '%' },
  { value: 'fixed',      label: '₹' },
];

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
  simpleMode?: boolean;
  loading?: boolean;
  searchPlaceholder?: string;
  addButtonLabel?: string;
  title?: string;
  className?: string;
  columns?: {
    item?: boolean; purity?: boolean; description?: boolean;
    grossWt?: boolean; stoneWt?: boolean; netWt?: boolean;
    qty?: boolean; unit?: boolean; rate?: boolean;
    making?: boolean; discount?: boolean; tax?: boolean;
    amount?: boolean; action?: boolean;
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

// ─── Shared input styles - SUPER COMPACT ─────────────────────────────────────
const BASE_INPUT =
  'h-7 w-full min-w-[60px] rounded border border-gray-200 bg-white px-2 text-xs ' +
  'text-gray-900 placeholder:text-gray-400 transition-all duration-200 ' +
  'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100/60 ' +
  'disabled:bg-gray-50 disabled:text-gray-400';

const ERR_INPUT = 'border-red-400 focus:border-red-500 focus:ring-red-100/60';

const CELL = 'px-2 py-1 align-top';

// ─── Field components ──────────────────────────────────────────────────────

/** Numeric text field - super compact */
const TF: React.FC<{
  value: number | string | undefined;
  onChange: (raw: string) => void;
  placeholder?: string;
  align?: 'left' | 'right';
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
    className={`${BASE_INPUT} ${error ? ERR_INPUT : ''} ${align === 'right' ? 'text-right tabular-nums' : ''} ${className}`}
  />
);

/** Select with chevron - super compact */
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
      className={`${BASE_INPUT} appearance-none pr-6 cursor-pointer ${error ? ERR_INPUT : ''}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
  </div>
);

/** Discount dropdown with type selector - super compact */
const DiscountInput: React.FC<{
  value: number | string | undefined;
  discountType: 'percentage' | 'fixed';
  onValueChange: (raw: string) => void;
  onTypeChange: (v: 'percentage' | 'fixed') => void;
  error?: boolean;
}> = ({ value, discountType, onValueChange, onTypeChange, error }) => (
  <div className="flex items-center gap-1">
    <div className="relative flex-1 min-w-[60px]">
      <input
        type="number"
        step="any"
        value={value === 0 || value === undefined ? '' : String(value)}
        placeholder="0"
        onChange={(e) => onValueChange(e.target.value)}
        className={`${BASE_INPUT} ${error ? ERR_INPUT : ''} text-right tabular-nums pr-10`}
      />
      <div className="absolute right-0.5 top-1/2 -translate-y-1/2">
        <select
          value={discountType}
          onChange={(e) => onTypeChange(e.target.value as 'percentage' | 'fixed')}
          className="h-5 rounded border-0 bg-transparent px-1 text-[10px] font-medium text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-100"
        >
          {DISCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const ItemSelectionTable: React.FC<ItemSelectionTableProps> = ({
  items,
  onItemsChange,
  onItemAdd,
  onItemRemove,
  onItemUpdate,
  errors = {},
  productSuggestions = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  simpleMode = false,
  loading = false,
  searchPlaceholder = 'Type or click to select an item.',
  addButtonLabel = 'Add Item',
  title = 'Item Table',
  className = '',
  columns,
  showSubtotalSection = true,
  additionalCharges = [],
  headerDiscount = 0,
  headerDiscountType = 'percentage',
  showTotalSection = true,
  unitOptions = UNIT_OPTIONS,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  autoAddDefaultRow: _aar = true,
  addButtonAtBottom = true,
}) => {
  const jewelry = showJewelryFields && !simpleMode;
  const on = (k: keyof NonNullable<typeof columns>, fb: boolean) =>
    columns?.[k] !== undefined ? !!columns[k] : fb;

  const show = {
    item:    on('item',        true),
    purity:  on('purity',      jewelry && showPurity),
    desc:    on('description', showDescription),
    grossWt: on('grossWt',     jewelry && showWeightFields),
    stoneWt: on('stoneWt',     jewelry && showWeightFields),
    netWt:   on('netWt',       jewelry && showWeightFields),
    qty:     on('qty',         true),
    unit:    on('unit',        showUnit),
    rate:    on('rate',        true),
    making:  on('making',      jewelry && showMakingCharges),
    disc:    on('discount',    showDiscount),
    tax:     on('tax',         showTax),
    amount:  on('amount',      true),
    action:  on('action',      true),
  };

  // Convert product suggestions to SearchableDropdown options
  const productOptions: DropdownOption[] = productSuggestions.map((p) => ({
    value: p.id,
    label: p.name,
    group: p.category,
  }));

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

  const updateAmount = (idx: number, raw: string) => {
    const num = raw === '' ? 0 : Number(raw);
    const total = isNaN(num) ? 0 : num;
    if (onItemUpdate) { onItemUpdate(idx, 'total', total); return; }
    onItemsChange(items.map((it, i) => (i === idx ? { ...it, total } : it)));
  };

  const addItem = () => {
    if (onAddCustomItem) { onAddCustomItem(); return; }
    const blank: ItemSelectionItem = {
      productId: `new_${Date.now()}`, productName: '',
      quantity: 1, unit: unitOptions[0]?.value ?? 'Pcs',
      rate: 0, discount: 0, discountType: 'percentage',
      taxRate: 0, taxAmount: 0, total: 0,
    };
    if (onItemAdd) onItemAdd(blank);
    onItemsChange([...items, blank]);
  };

  // Keep exactly one blank row always available at the bottom
  const hasTrailingEmptyRow =
    items.length > 0 && !items[items.length - 1].productName;

  React.useEffect(() => {
    if (loading) return;
    if (items.length === 0 || !hasTrailingEmptyRow) {
      addItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, hasTrailingEmptyRow, loading]);

  // totals
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
    const grand = items.reduce((s, it) => s + (Number(it.total)||0), 0);
    const addCh = additionalCharges.reduce((s, c) => s + (Number(c.value)||0), 0);
    const hd    = headerDiscountType==='fixed'
      ? headerDiscount
      : ((sub - disc) * headerDiscount) / 100;
    return { sub, disc, tax, grand, addCh, hd, final: grand - hd + addCh };
  }, [items, additionalCharges, headerDiscount, headerDiscountType]);

  return (
    <div className={`w-full overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      </div>

      {/* ── Column Headers ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 1200 }}>
          <thead>
            <tr className="border-b bg-gray-50/80 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {show.item    && <th className="border-r px-2 py-1.5 text-left min-w-[320px]">Item Details</th>}
              {show.grossWt && <th className="border-r px-2 py-1.5 text-right w-24">Gross Wt</th>}
              {show.stoneWt && <th className="border-r px-2 py-1.5 text-right w-24">Stone Wt</th>}
              {show.netWt   && <th className="border-r px-2 py-1.5 text-right w-24">Net Wt</th>}
              {show.qty     && <th className="border-r px-2 py-1.5 text-right w-28">Qty</th>}
              {show.unit    && <th className="border-r px-2 py-1.5 text-left w-24">Unit</th>}
              {show.rate    && <th className="border-r px-2 py-1.5 text-right w-32">Rate</th>}
              {show.making  && <th className="border-r px-2 py-1.5 text-right w-32">Making</th>}
              {show.disc    && <th className="border-r px-2 py-1.5 text-right w-36">Discount</th>}
              {show.tax     && <th className="border-r px-2 py-1.5 text-left w-24">Tax</th>}
              {show.amount  && <th className="px-2 py-1.5 text-right w-44">Amount</th>}
            </tr>
          </thead>

          <tbody>
            {/* loading */}
            {loading && [...Array(2)].map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td colSpan={Object.values(show).filter(Boolean).length + 1} className="px-2 py-1">
                  <div className="h-7 w-full animate-pulse rounded bg-gray-100" />
                </td>
              </tr>
            ))}

            {/* rows */}
            {!loading && items.map((item, idx) => {
              const e   = (f: string) => errors[`items.${idx}.${f}`] || errors[`${idx}.${f}`];

              return (
                <tr key={item.id ?? idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/40 transition-colors">

                  {/* ITEM DETAILS */}
                  {show.item && (
                    <td className="border-r px-2 py-1 align-top min-w-[320px]">
                      <div className="flex items-start gap-2">
                        {/* thumbnail - smaller */}
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-100 text-gray-400">
                          <ImageOff size={12} />
                        </div>

                        {/* name + description */}
                        <div className="min-w-0 flex-1">
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
                          />
                          
                          {/* Purity - below item select */}
                          {show.purity && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className="text-[10px] font-medium text-gray-500">Purity:</span>
                              <SF value={item.purity}
                                onChange={(v) => updateItem(idx, 'purity', v)}
                                options={PURITY_OPTIONS} 
                                error={!!e('purity')} 
                                className="max-w-[90px]"
                              />
                            </div>
                          )}

                          {(item.sku || item.stock !== undefined) && (
                            <div className="mt-0.5 flex gap-2 text-[10px] text-gray-400">
                              {item.sku && <span>SKU: {item.sku}</span>}
                              {item.stock !== undefined && <span>· Stock: {item.stock}</span>}
                            </div>
                          )}
                          
                          {/* Description - smaller */}
                          {show.desc && (
                            <div className="mt-1">
                              <textarea
                                value={item.description ?? ''}
                                rows={1}
                                placeholder="Add description"
                                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                className="w-full resize-none rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100/60"
                              />
                            </div>
                          )}
                          {e('productName') && (
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-red-500">
                              <AlertCircle className="h-2.5 w-2.5" />{e('productName')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* GROSS WT */}
                  {show.grossWt && (
                    <td className={`border-r ${CELL} w-24`}>
                      <TF value={toStr(item.grossWt)} placeholder="0"
                        onChange={(v) => updateItem(idx, 'grossWt', v)} error={!!e('grossWt')} step="0.001" />
                    </td>
                  )}

                  {/* STONE WT */}
                  {show.stoneWt && (
                    <td className={`border-r ${CELL} w-24`}>
                      <TF value={toStr(item.stoneWt)} placeholder="0"
                        onChange={(v) => updateItem(idx, 'stoneWt', v)} error={!!e('stoneWt')} step="0.001" />
                    </td>
                  )}

                  {/* NET WT */}
                  {show.netWt && (
                    <td className={`border-r ${CELL} w-24`}>
                      <TF value={toStr(item.netWt)} placeholder="0"
                        onChange={(v) => updateItem(idx, 'netWt', v)} error={!!e('netWt')} step="0.001" />
                    </td>
                  )}

                  {/* QUANTITY */}
                  {show.qty && (
                    <td className={`border-r ${CELL} w-28`}>
                      <TF value={toStr(item.quantity)} placeholder="1"
                        onChange={(v) => updateItem(idx, 'quantity', v)} error={!!e('quantity')} step="any" />
                      {e('quantity') && (
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-red-500">
                          <AlertCircle className="h-2.5 w-2.5" />{e('quantity')}
                        </p>
                      )}
                    </td>
                  )}

                  {/* UNIT */}
                  {show.unit && (
                    <td className={`border-r ${CELL} w-24`}>
                      <SF value={item.unit}
                        onChange={(v) => updateItem(idx, 'unit', v)}
                        options={unitOptions} error={!!e('unit')} />
                    </td>
                  )}

                  {/* RATE */}
                  {show.rate && (
                    <td className={`border-r ${CELL} w-32`}>
                      <TF value={toStr(item.rate)} placeholder="0"
                        onChange={(v) => updateItem(idx, 'rate', v)} error={!!e('rate')} step="any" />
                    </td>
                  )}

                  {/* MAKING */}
                  {show.making && (
                    <td className={`border-r ${CELL} w-32`}>
                      <TF value={toStr(item.makingCharges)} placeholder="0"
                        onChange={(v) => updateItem(idx, 'makingCharges', v)} error={!!e('makingCharges')} step="any" />
                    </td>
                  )}

                  {/* DISCOUNT - with dropdown */}
                  {show.disc && (
                    <td className={`border-r ${CELL} w-36`}>
                      <DiscountInput
                        value={toStr(item.discount)}
                        discountType={item.discountType ?? 'percentage'}
                        onValueChange={(v) => updateItem(idx, 'discount', v)}
                        onTypeChange={(v) => updateItem(idx, 'discountType', v)}
                        error={!!e('discount')}
                      />
                    </td>
                  )}

                  {/* TAX */}
                  {show.tax && (
                    <td className={`border-r ${CELL} w-24`}>
                      <SF value={item.taxRate}
                        onChange={(v) => updateItem(idx, 'taxRate', v)}
                        options={TAX_RATES} error={!!e('taxRate')} />
                    </td>
                  )}

                  {/* AMOUNT + actions */}
                  {show.amount && (
                    <td className={`${CELL} w-44`}>
                      <div className="flex items-center gap-1">
                        <TF
                          value={toStr(item.total)}
                          placeholder="0"
                          onChange={(v) => updateAmount(idx, v)}
                          error={!!e('total')}
                          className="flex-1 !h-7 text-xs font-semibold text-gray-900"
                          step="any"
                        />
                        {show.action && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gray-200 text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Add button ── */}
      {!loading && addButtonAtBottom && (
        <div className="border-t border-gray-100 px-3 py-1.5">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 rounded border border-dashed border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> {addButtonLabel}
          </button>
        </div>
      )}

      {/* ── Totals ── */}
      {showSubtotalSection && items.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50/60 px-3 py-2">
          <div className="flex flex-col items-end gap-1">
            <Row label="Subtotal"       value={`₹${fmt(totals.sub)}`} />
            {totals.disc > 0 && (
              <Row label="Discount" value={`−₹${fmt(totals.disc)}`} valueClass="text-green-600" />
            )}
            {totals.tax > 0 && (
              <Row label="Tax" value={`+₹${fmt(totals.tax)}`} valueClass="text-blue-600" />
            )}
            {additionalCharges.map((c, i) => (
              <Row key={i} label={c.label} value={`+₹${fmt(Number(c.value)||0)}`} />
            ))}
            {headerDiscount > 0 && (
              <Row
                label={`Header Discount (${headerDiscountType==='percentage' ? `${headerDiscount}%` : '₹'+headerDiscount})`}
                value={`−₹${fmt(totals.hd)}`}
                valueClass="text-red-500"
              />
            )}
            {showTotalSection && (
              <div className="mt-1 flex w-64 items-center justify-between rounded border border-amber-200 bg-amber-50 px-3 py-1.5">
                <span className="text-xs font-semibold text-gray-800">Grand Total</span>
                <span className="text-sm font-bold tabular-nums text-amber-600">₹{fmt(totals.final)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// small helper row for totals section
const Row: React.FC<{ label: string; value: string; valueClass?: string }> = ({
  label, value, valueClass = 'text-gray-800',
}) => (
  <div className="flex w-64 items-center justify-between text-xs">
    <span className="text-gray-500">{label}</span>
    <span className={`tabular-nums font-medium ${valueClass}`}>{value}</span>
  </div>
);

export default ItemSelectionTable;