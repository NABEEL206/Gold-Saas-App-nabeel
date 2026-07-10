// src/components/common/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'amber-500',
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

  const colorClasses: Record<string, string> = {
    'amber-500': 'border-amber-500',
    'blue-500': 'border-blue-500',
    'green-500': 'border-green-500',
    'red-500': 'border-red-500',
    'purple-500': 'border-purple-500',
    'gray-500': 'border-gray-500',
    'white': 'border-white',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color] || colorClasses['amber-500']} rounded-full border-t-transparent animate-spin`}
      />
  {text && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50"
        style={{ background: 'rgba(var(--background), 0.8)' }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;