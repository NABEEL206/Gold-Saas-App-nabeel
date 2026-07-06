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

const variantStyles = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    textSecondary: 'text-red-600',
    icon: 'text-red-500',
    badge: 'text-red-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    textSecondary: 'text-amber-600',
    icon: 'text-amber-500',
    badge: 'text-amber-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    textSecondary: 'text-blue-600',
    icon: 'text-blue-500',
    badge: 'text-blue-500',
  },
};

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({
  errors,
  title = 'Please fix the following errors:',
  className = '',
  maxDisplay = 5,
  onClose,
  showIcon = true,
  variant = 'warning',
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

  const styles = variantStyles[variant];

  // Badge renderer
  const renderBadge = () => (
    <span className={`inline-flex items-center gap-1 text-sm ${styles.badge}`}>
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
    <div className={`mb-6 p-4 rounded-lg border ${styles.bg} ${styles.border} ${styles.text} ${className}`}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <AlertCircle className={`h-5 w-5 ${styles.icon} mt-0.5 flex-shrink-0`} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${styles.text}`}>
              {title}
              {showBadge && (
                <span className={`ml-2 text-xs ${styles.textSecondary} font-normal`}>
                  ({count} error{count > 1 ? 's' : ''})
                </span>
              )}
            </p>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-900 transition-colors ${styles.text} flex-shrink-0`}
                aria-label="Close error summary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <ul className={`mt-1 text-sm ${styles.textSecondary} list-disc list-inside`}>
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
  variant = 'warning',
}) => {
  if (count === 0) return null;

  const styles = variantStyles[variant];

  return (
    <span className={`inline-flex items-center gap-1 text-sm ${styles.badge} ${className}`}>
      {showIcon && <AlertCircle className="h-4 w-4" />}
      {count} error{count > 1 ? 's' : ''}
    </span>
  );
};

export default ErrorSummary;