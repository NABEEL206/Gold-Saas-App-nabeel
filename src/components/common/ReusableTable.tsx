// src/components/common/ReusableTable.tsx
import React from 'react';
import Pagination, {type PaginationProps } from './Pagination';

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
  const allSelected = data.length > 0 && data.every((item) => selectedItems.includes(getId(item)));

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    }
  };

  const handleSelectItem = (id: string) => {
    if (onSelectItem) {
      onSelectItem(id);
    }
  };

  const getAlignment = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = selectedItems.length > 0 && selectedItems.length < data.length;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${getAlignment(col.align)} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {emptyIcon}
                    <p className="text-sm text-gray-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = getId(item);
                const isSelected = selectedItems.includes(id);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-amber-50/50' : ''}`}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(id)}
                          className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm ${getAlignment(col.align)} ${col.className || ''}`}
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

      {/* Pagination - Bottom Right */}
      {pagination && (
        <Pagination
          {...pagination}
        />
      )}
    </div>
  );
};

export default ReusableTable;