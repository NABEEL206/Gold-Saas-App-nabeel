// src/components/common/ReusableTable.tsx
import React, { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText } from 'lucide-react';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableAction<T = any> {
  icon: ReactNode;
  onClick: (item: T) => void;
  label?: string;
  show?: (item: T) => boolean;
  className?: string;
  disabled?: (item: T) => boolean;
}

export interface ReusableTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  selectable?: boolean;
  selectedItems?: string[];
  onSelectAll?: () => void;
  onSelectItem?: (id: string) => void;
  getId?: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  className?: string;
  rowClassName?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
  };
  loadingComponent?: ReactNode;
}

function ReusableTable<T = any>({
  data,
  columns,
  actions = [],
  selectable = false,
  selectedItems = [],
  onSelectAll,
  onSelectItem,
  getId,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  className = '',
  rowClassName = '',
  onRowClick,
  pagination,
  loadingComponent,
}: ReusableTableProps<T>) {
  // Handle loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center min-h-[200px]">
          {loadingComponent || (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle empty state
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
          {emptyIcon || <FileText className="h-12 w-12 text-gray-300 mb-3" />}
          <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === data.length && data.length > 0}
                    onChange={onSelectAll}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const itemId = getId ? getId(item) : (item as any).id;
              const isSelected = selectedItems.includes(itemId);

              return (
                <tr
                  key={itemId || index}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${rowClassName} ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectItem && onSelectItem(itemId)}
                        className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm text-${column.align || 'left'} ${column.className || ''}`}
                    >
                      {column.render ? column.render(item, index) : (item as any)[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        {actions.map((action, actionIndex) => {
                          const shouldShow = action.show ? action.show(item) : true;
                          const isDisabled = action.disabled ? action.disabled(item) : false;

                          if (!shouldShow) return null;

                          return (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              disabled={isDisabled}
                              className={`p-1.5 rounded-lg transition-colors ${
                                action.className || 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={action.label}
                            >
                              {action.icon}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Showing {pagination.startIndex + 1} to {Math.min(pagination.endIndex, pagination.totalItems)} of {pagination.totalItems} Records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReusableTable;