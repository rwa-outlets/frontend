import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';
import { tokens, statusColors } from '../../theme/tokens';

/**
 * StatusDot Component
 * 
 * Small pulsing neon dot indicator for status display.
 * 
 * Props:
 * - status: 'active' | 'pending' | 'settled' | 'claimable' | 'claimed' | 'error' (default: 'active')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - label: string - Optional text label
 * - pulse: boolean - Enable pulse animation (default: true)
 * - className: string - Additional CSS classes
 */

const StatusDot = ({
  status = 'active',
  size = 'md',
  label,
  pulse = true,
  className = '',
  style = {},
}) => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;

  // Get color based on status
  const colorConfig = statusColors[status] || statusColors.active;

  // Size styles
  const sizeStyles = {
    sm: { width: 6, height: 6, dotSize: 4 },
    md: { width: 8, height: 8, dotSize: 6 },
    lg: { width: 12, height: 12, dotSize: 8 },
  };

  // Pulse animation
  const pulseAnimation = pulse ? {
    animate: {
      opacity: [1, 0.5, 1],
      scale: [1, 1.2, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  } : {};

  return (
    <div
      className={`status-dot-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: label ? '6px' : '0',
        ...style,
      }}
    >
      <motion.div
        className={`status-dot status-${status}`}
        {...pulseAnimation}
        style={{
          width: sizeStyles[size].width,
          height: sizeStyles[size].height,
          minWidth: sizeStyles[size].width,
          borderRadius: '50%',
          background: colorConfig.dot,
          boxShadow: `0 0 10px ${colorConfig.dot}`,
        }}
      />
      {label && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: '500',
          color: colorConfig.text,
          letterSpacing: '0.04em',
          textTransform: 'capitalize',
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default StatusDot;
