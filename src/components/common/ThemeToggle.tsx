import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/theme/ThemeProvider';
import { cn } from '../../utils/cn';

interface ThemeToggleProps {
  /**
   * icon   — plain icon button, inherits header colors via --header-icon
   * header — alias for icon, placed in the header toolbar
   * pill   — rounded pill with "Light / Dark" label, used in dropdowns
   */
  variant?: 'icon' | 'header' | 'pill';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  /* ── Pill variant (inside user-menu dropdown) ── */
  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={label}
        aria-pressed={isDark}
        title={label}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
          'transition-all duration-200 themed-transition',
          'focus:outline-none focus:ring-2',
          className
        )}
        style={{
          border: '1px solid var(--border)',
          backgroundColor: 'var(--card)',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
          (e.currentTarget as HTMLElement).style.color = 'var(--primary)';
          (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--hover-bg)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--card)';
        }}
      >
        {isDark ? <Sun size={13} /> : <Moon size={13} />}
        {isDark ? 'Light' : 'Dark'}
      </button>
    );
  }

  /* ── Icon / Header variant ── */
  return (
    <button
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={cn(
        'p-2 rounded-lg transition-colors flex items-center justify-center themed-transition',
        'focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]',
        className
      )}
      style={{ color: 'var(--header-icon)' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--header-hover)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
    >
      {isDark
        ? <Sun size={18} aria-hidden="true" />
        : <Moon size={18} aria-hidden="true" />
      }
    </button>
  );
};

export default ThemeToggle;