// src/components/common/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'gold' | 'danger' | 'success' | 'info' | 'muted';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'gold',
  fullScreen = false,
  text = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-14 w-14 border-3',
    xl: 'h-20 w-20 border-4',
  };

  const variantColors: Record<string, string> = {
    primary: 'var(--primary)',
    gold: 'var(--gold)',
    danger: 'var(--danger)',
    success: 'var(--success)',
    info: 'var(--info)',
    muted: 'var(--text-muted)',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-t-transparent animate-spin themed-transition`}
        style={{ 
          borderColor: variantColors[variant] || variantColors.gold,
          borderTopColor: 'transparent',
        }}
      />
      {text && (
        <p 
          className="text-sm themed-transition" 
          style={{ color: 'var(--text-secondary)' }}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 themed-transition"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;