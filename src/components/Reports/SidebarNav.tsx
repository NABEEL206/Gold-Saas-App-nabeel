// src/components/Reports/SidebarNav.tsx

import React from 'react';
import { ChevronRight, FolderOpen } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarNavProps {
  items: SidebarItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ 
  items, 
  selectedId, 
  onSelect,
}) => {
  // First item is "Home", rest are folders
  const homeItem = items[0];
  const folderItems = items.slice(1);

  return (
    <div
      className="w-64 flex flex-col h-full themed-transition"
      style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Reports</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>All your business reports</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Home item */}
        <button
          onClick={() => onSelect(homeItem.id)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
          style={selectedId === homeItem.id
            ? { background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 500 }
            : { color: 'var(--text-secondary)' }
          }
          onMouseEnter={e => { if (selectedId !== homeItem.id) (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
          onMouseLeave={e => { if (selectedId !== homeItem.id) (e.currentTarget as HTMLElement).style.background = ''; }}
        >
          <span className="flex items-center gap-3">
            <span style={{ color: selectedId === homeItem.id ? 'var(--gold)' : 'var(--text-muted)' }}>
              {homeItem.icon}
            </span>
            {homeItem.label}
          </span>
          {selectedId === homeItem.id && (
            <ChevronRight className="h-4 w-4" style={{ color: 'var(--gold)' }} />
          )}
        </button>

        {/* Divider */}
        <div className="h-px my-2" style={{ background: 'var(--border)' }} />

        {/* Folder items */}
        {folderItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
            style={selectedId === item.id
              ? { background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 500 }
              : { color: 'var(--text-secondary)' }
            }
            onMouseEnter={e => { if (selectedId !== item.id) (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'; }}
            onMouseLeave={e => { if (selectedId !== item.id) (e.currentTarget as HTMLElement).style.background = ''; }}
          >
            <span className="flex items-center gap-3">
              <span style={{ color: selectedId === item.id ? 'var(--gold)' : 'var(--text-muted)' }}>
                {item.icon}
              </span>
              {item.label}
            </span>
            {selectedId === item.id && (
              <ChevronRight className="h-4 w-4" style={{ color: 'var(--gold)' }} />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <FolderOpen className="h-3.5 w-3.5" />
          <span>{items.length - 1} folders</span>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;