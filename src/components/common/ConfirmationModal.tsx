// src/components/common/ConfirmationModal.tsx
import React from 'react';
import { AlertTriangle, Loader, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'primary',
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
    primary: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
  };

  const variantColors = {
    danger: 'text-red-600',
    warning: 'text-yellow-500',
    primary: 'text-amber-500',
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isLoading]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className="rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200 themed-transition"
        style={{ background: 'var(--card)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="text-center">
          <div
            className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
            style={{ background: 'var(--hover-bg)' }}
          >
            <AlertTriangle className={`h-6 w-6 ${variantColors[variant]}`} />
          </div>

          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
            {title}
          </h3>

          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed themed-transition"
              style={{ color: 'var(--text)', border: '1px solid var(--border)', background: 'var(--card)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--card)'}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                px-4 py-2 text-sm font-medium text-white rounded-lg 
                transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variantStyles[variant]}
              `}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;