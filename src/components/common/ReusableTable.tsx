// src/components/common/ReusableTable.tsx
import React from 'react';
import Pagination, { type PaginationProps } from './Pagination';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface ReusableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  selectable?: boolean;
  selectedItems?: string[];
  onSelectAll?: () => void;
  onSelectItem?: (id: string) => void;
  getId: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  pagination?: PaginationProps;
  className?: string;
}

const ReusableTable = <T,>({
  data,
  columns,
  selectable = false,
  selectedItems = [],
  onSelectAll,
  onSelectItem,
  getId,
  onRowClick,
  emptyMessage = 'No data available',
  emptyIcon,
  pagination,
  className = '',
}: ReusableTableProps<T>) => {
  const allSelected =
    data.length > 0 && data.every((item) => selectedItems.includes(getId(item)));

  const getAlignment = (align?: string) => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right':  return 'text-right';
      default:       return 'text-left';
    }
  };

  return (
    <div
      className={`rounded-xl overflow-hidden themed-transition ${className}`}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* ── Head ── */}
          <thead>
            <tr style={{ background: 'var(--hover-bg)', borderBottom: '2px solid var(--border)' }}>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate =
                        selectedItems.length > 0 && selectedItems.length < data.length;
                    }}
                    onChange={() => onSelectAll?.()}
                    className="h-4 w-4 rounded cursor-pointer accent-[var(--primary)]"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap
                    ${getAlignment(col.align)} ${col.className || ''}`}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center"
                  style={{ background: 'var(--card)' }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {emptyIcon}
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => {
                const id = getId(item);
                const isSelected = selectedItems.includes(id);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(item)}
                    className={`reusable-table-row themed-transition ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isSelected ? 'is-selected' : ''}`}
                    style={{
                      // explicit card bg so "transparent" never bleeds through
                      background: isSelected ? 'var(--active-bg)' : 'var(--card)',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.background = 'var(--card)';
                    }}
                  >
                    {selectable && (
                      <td
                        className="px-4 py-3"
                        style={{ background: 'inherit' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectItem?.(id)}
                          className="h-4 w-4 rounded cursor-pointer accent-[var(--primary)]"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm ${getAlignment(col.align)} ${col.className || ''}`}
                        style={{
                          color: 'var(--text)',
                          background: 'inherit', // inherit from <tr> so row bg applies
                        }}
                      >
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && <Pagination {...pagination} />}
    </div>
  );
};

export default ReusableTable;
