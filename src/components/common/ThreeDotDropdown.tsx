// src/components/common/ThreeDotDropdown.tsx
import React, { useState, type ReactNode, useRef, useEffect } from 'react';
import { MoreVertical, Upload, FileSpreadsheet, File, Printer } from 'lucide-react';

export interface ThreeDotDropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface ThreeDotDropdownProps {
  items: ThreeDotDropdownItem[];
  position?: 'left' | 'right';
  className?: string;
  onImport?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  importLabel?: string;
  importIcon?: ReactNode;
  importAccept?: string;
  importMultiple?: boolean;
}

const ThreeDotDropdown: React.FC<ThreeDotDropdownProps> = ({
  items,
  position = 'right',
  className = '',
  onImport,
  importLabel = 'Import',
  importIcon,
  importAccept = '.csv,.xlsx,.xls',
  importMultiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleItemClick = (onClick: () => void) => {
    onClick();
    handleClose();
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    handleClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onImport) {
      onImport(event);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = '';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
        }}
        title="More options"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept={importAccept}
        multiple={importMultiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={handleClose} />
          
          {/* Dropdown Menu */}
          <div
            className={`absolute ${position === 'right' ? 'right-0' : 'left-0'} mt-2 w-48 rounded-lg py-1 z-20 themed-transition`}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Import option */}
            {onImport && (
              <button
                onClick={handleImportClick}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{ color: 'var(--text)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
              >
                <span className="flex-shrink-0">
                  {importIcon || <Upload className="h-4 w-4 text-blue-500" />}
                </span>
                {importLabel}
              </button>
            )}

            {onImport && items.length > 0 && (
              <div className="my-1" style={{ borderTop: '1px solid var(--border)' }} />
            )}

            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleItemClick(item.onClick)}
                disabled={item.disabled}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: item.danger ? 'var(--danger)' : 'var(--text)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = item.danger ? 'rgba(239,68,68,0.08)' : 'var(--hover-bg)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ThreeDotDropdown;