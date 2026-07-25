import { useTheme } from '../../theme/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/**
 * ThemeToggle Component
 * 
 * Animated toggle switch for dark/light mode with sun/moon icons.
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - className: string - Additional CSS classes
 */

const ThemeToggle = ({ size = 'md', className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Size styles
  const sizeStyles = {
    sm: {
      width: 44,
      height: 22,
      thumbSize: 18,
      iconSize: 12,
    },
    md: {
      width: 56,
      height: 28,
      thumbSize: 24,
      iconSize: 14,
    },
    lg: {
      width: 68,
      height: 34,
      thumbSize: 30,
      iconSize: 16,
    },
  };

  const styles = sizeStyles[size];

  // Calculate thumb position
  const thumbPosition = isDark ? 0 : styles.width - styles.thumbSize - 4;

  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        position: 'relative',
        width: styles.width,
        height: styles.height,
        background: 'var(--surface-container-low)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--rounded-full)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        overflow: 'hidden',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Animated thumb */}
      <motion.div
        className="theme-toggle-thumb"
        initial={false}
        animate={{ x: thumbPosition }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'absolute',
          left: 2,
          width: styles.thumbSize,
          height: styles.thumbSize,
          background: isDark ? 'var(--neon-gold)' : 'var(--primary-container)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          boxShadow: isHovered ? `0 0 15px ${isDark ? 'rgba(255, 221, 103, 0.5)' : 'rgba(0, 255, 163, 0.5)'}` : 'none',
          transition: 'box-shadow var(--transition-fast)',
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: styles.iconSize,
                color: isDark ? 'var(--on-background)' : 'var(--on-primary-container)',
              }}
            >
              🌙
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: styles.iconSize,
                color: 'var(--on-primary-container)',
              }}
            >
              ☀️
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Background icons */}
      <div style={{
        position: 'absolute',
        right: 6,
        fontSize: styles.iconSize,
        color: 'var(--on-surface-variant)',
        opacity: 0.6,
      }}>
        ☀️
      </div>
      <div style={{
        position: 'absolute',
        left: 6,
        fontSize: styles.iconSize,
        color: 'var(--on-surface-variant)',
        opacity: 0.6,
      }}>
        🌙
      </div>
    </button>
  );
};

export default ThemeToggle;
