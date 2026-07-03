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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-xs text-gray-400 mt-0.5">All your business reports</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Home item */}
        <button
          onClick={() => onSelect(homeItem.id)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200
            ${selectedId === homeItem.id 
              ? 'bg-amber-50 text-amber-700 font-medium' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <span className="flex items-center gap-3">
            <span className={selectedId === homeItem.id ? 'text-amber-500' : 'text-gray-400'}>
              {homeItem.icon}
            </span>
            {homeItem.label}
          </span>
          {selectedId === homeItem.id && (
            <ChevronRight className="h-4 w-4 text-amber-500" />
          )}
        </button>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-2"></div>

        {/* Folder items */}
        {folderItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`
              w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200
              ${selectedId === item.id 
                ? 'bg-amber-50 text-amber-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <span className="flex items-center gap-3">
              <span className={selectedId === item.id ? 'text-amber-500' : 'text-gray-400'}>
                {item.icon}
              </span>
              {item.label}
            </span>
            {selectedId === item.id && (
              <ChevronRight className="h-4 w-4 text-amber-500" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <FolderOpen className="h-3.5 w-3.5" />
          <span>{items.length - 1} folders</span>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;