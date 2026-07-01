// src/components/common/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when items per page changes */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /** Options for items per page dropdown */
  itemsPerPageOptions?: number[];
  /** Additional className for the container */
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100, 200],
  className = '',
}) => {
  // Calculate the range of items being shown
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className={`flex items-center justify-end gap-4 px-4 py-3 bg-white border-t border-gray-200 ${className}`}>
      {/* Items per page dropdown and range info */}
      <div className="flex items-center gap-3">
        {onItemsPerPageChange && totalItems > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Range info */}
        {totalItems > 0 && (
          <span className="text-sm text-gray-600">
            {startIndex} - {endIndex}
          </span>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Previous page button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-0.5">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {typeof page === 'number' ? (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      page === currentPage
                        ? 'bg-amber-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ) : (
                  <span className="px-1 text-gray-400 text-sm">…</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next page button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;