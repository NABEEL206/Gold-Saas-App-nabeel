/**
 * Re-export useTheme from the ThemeProvider so consumers can import
 * from either location without circular dependencies.
 *
 * Usage:
 *   import { useTheme } from '@/hooks/theme/useTheme';
 *   const { theme, toggleTheme, isDark } = useTheme();
 */
export { useTheme } from '../../context/theme/ThemeProvider';
