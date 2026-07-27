// src/components/common/ErrorSummary.tsx
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export interface ErrorSummaryProps {
  errors: Record<string, string>;
  title?: string;
  className?: string;
  maxDisplay?: number;
  onClose?: () => void;
  showIcon?: boolean;
  variant?: 'error' | 'warning' | 'info';
  showBadge?: boolean;
  badgePosition?: 'inline' | 'header';
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errors,
  title = 'Please fix the following errors:',
  className = '',
  maxDisplay = 5,
  onClose,
  showIcon = true,
  variant = 'error',
  showBadge = false,
  badgePosition = 'inline',
}) => {
  const errorKeys = Object.keys(errors);
  const count = errorKeys.length;

  if (count === 0) {
    return null;
  }

  const displayErrors = errorKeys.slice(0, maxDisplay);
  const remainingCount = count - maxDisplay;
  const hasMore = remainingCount > 0;

  // Badge renderer
  const renderBadge = () => (
    <span className="inline-flex items-center gap-1 text-sm themed-transition"
      style={{ color: 'var(--danger)' }}
    >
      {showIcon && <AlertCircle className="h-4 w-4" />}
      {count} error{count > 1 ? 's' : ''}
    </span>
  );

  // If only showing badge (no details)
  if (badgePosition === 'header' && !showBadge) {
    return renderBadge();
  }

  // If showing badge only (compact mode)
  if (showBadge && badgePosition === 'inline') {
    return renderBadge();
  }

  // Full error summary with details
  return (
    <div 
      className={`mb-6 p-4 rounded-lg border themed-transition ${className}`}
      style={{
        backgroundColor: 'var(--danger-light, rgba(239, 68, 68, 0.1))',
        borderColor: 'var(--danger)',
        color: 'var(--text)',
      }}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <AlertCircle 
            className="h-5 w-5 mt-0.5 flex-shrink-0"
            style={{ color: 'var(--danger)' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
              {title}
              {showBadge && (
                <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
                  ({count} error{count > 1 ? 's' : ''})
                </span>
              )}
            </p>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded hover:bg-opacity-20 transition-colors flex-shrink-0 themed-transition"
                style={{ 
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent',
                }}
                aria-label="Close error summary"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <ul 
            className="mt-1 text-sm list-disc list-inside"
            style={{ color: 'var(--text-secondary)' }}
          >
            {displayErrors.map((key) => (
              <li key={key} className="break-words">
                {errors[key]}
              </li>
            ))}
            {hasMore && (
              <li className="text-xs opacity-75">
                ... and {remainingCount} more error{remainingCount > 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Also export a Badge component for header usage
export const ErrorBadge: React.FC<{
  count: number;
  className?: string;
  showIcon?: boolean;
  variant?: 'error' | 'warning' | 'info';
}> = ({
  count,
  className = '',
  showIcon = true,
  variant = 'error',
}) => {
  if (count === 0) return null;

  return (
    <span 
      className={`inline-flex items-center gap-1 text-sm themed-transition ${className}`}
      style={{ color: 'var(--danger)' }}
    >
      {showIcon && <AlertCircle className="h-4 w-4" />}
      {count} error{count > 1 ? 's' : ''}
    </span>
  );
};

export default ErrorSummary;