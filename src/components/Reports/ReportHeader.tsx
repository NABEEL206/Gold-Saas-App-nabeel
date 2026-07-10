// src/components/Reports/ReportHeader.tsx

import React from 'react';
import { Search, LayoutGrid, LayoutList } from 'lucide-react';

interface ReportHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  folderLabel?: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  folderLabel = 'All Reports',
}) => {
  return (
    <div
      className="px-6 py-4 themed-transition"
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={`Search ${folderLabel}...`}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 themed-transition"
              style={{
                border: '1px solid var(--border)',
                background: 'var(--hover-bg)',
                color: 'var(--text)',
              }}
            />
          </div>
          <span className="text-sm hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
            {folderLabel}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--hover-bg)' }}>
            <button
              onClick={() => onViewModeChange('grid')}
              className="p-1.5 rounded transition-colors"
              style={{
                background: viewMode === 'grid' ? 'var(--card)' : 'transparent',
                boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : undefined,
              }}
              title="Grid view"
            >
              <LayoutGrid className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className="p-1.5 rounded transition-colors"
              style={{
                background: viewMode === 'list' ? 'var(--card)' : 'transparent',
                boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : undefined,
              }}
              title="List view"
            >
              <LayoutList className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;