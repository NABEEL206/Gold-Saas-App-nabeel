// src/components/common/OldGoldTable.tsx
import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { PURITY_OPTIONS } from '../../utils/constants';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface OldGoldItem {
  id?: string;
  description: string;
  grossWt: number;
  lessWastage: number;
  netWt: number;
  purity?: string;
  rate?: number;
  amount: number;
  hsn?: string;
}

export interface OldGoldTableProps {
  items: OldGoldItem[];
  onItemsChange: (items: OldGoldItem[]) => void;
  onItemAdd?: (item: OldGoldItem) => void;
  onItemRemove?: (index: number) => void;
  onItemUpdate?: (index: number, field: string, value: any) => void;
  errors?: Record<string, string>;
  showHSN?: boolean;
  title?: string;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function recalcOldGold(item: OldGoldItem): OldGoldItem {
  const gross = Number(item.grossWt) || 0;
  const lessWastage = Number(item.lessWastage) || 0;
  const netWt = gross - lessWastage;
  const rate = Number(item.rate) || 0;
  const amount = netWt * rate;
  return { ...item, netWt, amount };
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

// ─── Helper to get error for a field ──────────────────────────────────────
const getFieldError = (errors: Record<string, string> | undefined, idx: number, field: string): string | undefined => {
  if (!errors) return undefined;
  const keys = [
    `oldGold.${idx}.${field}`,
    `${idx}.${field}`,
    `oldGold_${idx}_${field}`,
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

// ─── OldGoldTable Component ───────────────────────────────────────────────────
export const OldGoldTable: React.FC<OldGoldTableProps> = ({
  items,
  onItemsChange,
  onItemAdd,
  onItemRemove,
  onItemUpdate,
  errors = {},
  showHSN = false,
  title = 'Old Gold Exchange',
  className = '',
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (idx: number) => {
    setExpandedRows(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const addOldGold = () => {
    const newItem: OldGoldItem = {
      id: `old_${Date.now()}`,
      description: '',
      grossWt: 0,
      lessWastage: 0,
      netWt: 0,
      purity: '91.6',
      rate: 0,
      amount: 0,
      hsn: '',
    };
    if (onItemAdd) onItemAdd(newItem);
    onItemsChange([...items, newItem]);
  };

  const removeOldGold = (idx: number) => {
    if (onItemRemove) onItemRemove(idx);
    onItemsChange(items.filter((_, i) => i !== idx));
  };

  const updateOldGold = (idx: number, field: string, value: any) => {
    const updated = items.map((item, i) => {
      if (i === idx) {
        const newItem = { ...item, [field]: value };
        return recalcOldGold(newItem);
      }
      return item;
    });
    if (onItemUpdate) onItemUpdate(idx, field, value);
    onItemsChange(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const hasErrors = Object.keys(errors).some(key => key.startsWith('oldGold_') || key.includes('oldGold'));

  return (
    <div 
      className={`border-t-2 px-4 py-3 themed-transition ${className}`}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--primary-light)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5" style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>{title}</h3>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{items.length} items</span>
          {hasErrors && (
            <span className="text-xs flex items-center gap-1 ml-2" style={{ color: 'var(--danger)' }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--danger)' }}></span>
              Has errors
            </span>
          )}
        </div>
      </div>

      {/* Old Gold Table - Compact View */}
      <div 
        className="overflow-x-auto border rounded-lg themed-transition"
        style={{ 
          borderColor: 'var(--border)',
          backgroundColor: 'var(--card)',
        }}
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
              <th className="px-2 py-2 text-left min-w-[160px]">Description</th>
              <th className="px-2 py-2 text-center w-24">G.WT</th>
              <th className="px-2 py-2 text-center w-24">N.WT</th>
              <th className="px-2 py-2 text-center w-28">Rate</th>
              <th className="px-2 py-2 text-center w-32">Amount</th>
              <th className="px-2 py-2 text-center w-10">Details</th>
              <th className="px-2 py-2 text-center w-10">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No old gold items added yet. Click "Add Old Gold Item" below to start.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const isExpanded = expandedRows[idx] || false;
                
                const getError = (field: string) => getFieldError(errors, idx, field);
                const hasError = (field: string) => !!getError(field);
                
                const updateField = (field: string, value: any) => {
                  updateOldGold(idx, field, value);
                };

                return (
                  <React.Fragment key={item.id || idx}>
                    {/* Main Row - Compact with Inputs */}
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
                          <input
                            type="text"
                            value={item.description || ''}
                            placeholder="Enter description"
                            onChange={(e) => updateField('description', e.target.value)}
                            className="w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 themed-transition"
                            style={{
                              borderColor: hasError('description') ? 'var(--danger)' : 'var(--border)',
                              backgroundColor: 'var(--card)',
                              color: 'var(--text)',
                            }}
                          />
                          {hasError('description') && (
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{getError('description')}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="relative">
                          <TF value={toStr(item.grossWt)} placeholder="0"
                            onChange={(v) => updateField('grossWt', v)} 
                            error={hasError('grossWt')} step="0.001"
                            className="text-center w-24" />
                          {hasError('grossWt') && (
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{getError('grossWt')}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="text-sm font-medium tabular-nums w-24 inline-block" style={{ color: 'var(--gold)' }}>
                          {fmt(item.netWt || 0)}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <div className="relative">
                          <TF value={toStr(item.rate)} placeholder="0"
                            onChange={(v) => updateField('rate', v)} 
                            error={hasError('rate')} step="any"
                            className="text-center w-28" />
                          {hasError('rate') && (
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{getError('rate')}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="text-sm font-bold tabular-nums w-32 inline-block" style={{ color: 'var(--gold)' }}>
                          ₹{fmt(item.amount || 0)}
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
                          onClick={() => removeOldGold(idx)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded border transition-colors themed-transition"
                          style={{
                            borderColor: 'var(--border)',
                            color: 'var(--danger)',
                          }}
                          title="Remove old gold"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'var(--hover-bg)' }}>
                        <td colSpan={8} className="px-4 py-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* HSN */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>HSN</label>
                              <input
                                type="text"
                                value={item.hsn || ''}
                                placeholder="HSN"
                                onChange={(e) => updateField('hsn', e.target.value)}
                                className="w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 themed-transition"
                                style={{
                                  borderColor: hasError('hsn') ? 'var(--danger)' : 'var(--border)',
                                  backgroundColor: 'var(--card)',
                                  color: 'var(--text)',
                                }}
                              />
                              {hasError('hsn') && (
                                <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{getError('hsn')}</p>
                              )}
                            </div>

                            {/* Less Wastage */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Less W</label>
                              <TF value={toStr(item.lessWastage)} placeholder="0"
                                onChange={(v) => updateField('lessWastage', v)} 
                                error={hasError('lessWastage')} step="0.001" />
                              {hasError('lessWastage') && (
                                <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{getError('lessWastage')}</p>
                              )}
                            </div>

                            {/* Purity */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Purity</label>
                              <SF value={item.purity}
                                onChange={(v) => updateField('purity', v)}
                                options={PURITY_OPTIONS} 
                                error={hasError('purity')}
                                className="w-28" />
                              {hasError('purity') && (
                                <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{getError('purity')}</p>
                              )}
                            </div>

                            {/* Net WT (Display only - auto-calculated) */}
                            <div>
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>N.WT (Auto)</label>
                              <div 
                                className="h-9 w-full rounded border px-3 py-1.5 text-sm tabular-nums"
                                style={{
                                  borderColor: 'var(--border)',
                                  backgroundColor: 'var(--background)',
                                  color: 'var(--text)',
                                }}
                              >
                                {fmt(item.netWt || 0)}
                              </div>
                            </div>

                            {/* Amount (Display only - auto-calculated) */}
                            <div className="col-span-2">
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Amount (Auto)</label>
                              <div 
                                className="h-9 w-full rounded border px-3 py-1.5 text-sm font-bold tabular-nums"
                                style={{
                                  borderColor: 'var(--gold)',
                                  backgroundColor: 'var(--primary-light)',
                                  color: 'var(--gold)',
                                }}
                              >
                                ₹{fmt(item.amount || 0)}
                              </div>
                            </div>

                            {/* Description (Full width in expanded) */}
                            <div className="col-span-2">
                              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Description</label>
                              <input
                                type="text"
                                value={item.description || ''}
                                placeholder="Enter description"
                                onChange={(e) => updateField('description', e.target.value)}
                                className="w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 themed-transition"
                                style={{
                                  borderColor: hasError('description') ? 'var(--danger)' : 'var(--border)',
                                  backgroundColor: 'var(--card)',
                                  color: 'var(--text)',
                                }}
                              />
                              {hasError('description') && (
                                <p className="mt-0.5 text-xs" style={{ color: 'var(--danger)' }}>{getError('description')}</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}

            {/* Add old gold button */}
            <tr>
              <td colSpan={8} className="px-3 py-2" style={{ backgroundColor: 'var(--primary-light)' }}>
                <button
                  type="button"
                  onClick={addOldGold}
                  className="inline-flex items-center gap-1.5 rounded border border-dashed px-4 py-2 text-sm font-medium transition-colors themed-transition"
                  style={{
                    borderColor: 'var(--gold)',
                    color: 'var(--gold)',
                  }}
                >
                  <Plus className="h-4 w-4" /> Add Old Gold Item
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Old Gold Total */}
      {items.length > 0 && (
        <div className="flex justify-end mt-3">
          <div 
            className="flex items-center gap-4 rounded-lg px-4 py-2 themed-transition"
            style={{
              backgroundColor: 'var(--primary-light)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--gold)' }}>Total Exchange Amount:</span>
            <span className="text-lg font-bold" style={{ color: 'var(--gold)' }}>
              ₹{fmt(totalAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OldGoldTable;