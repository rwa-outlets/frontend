import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';
import { tokens } from '../../theme/tokens';

/**
 * Button Component
 * 
 * Primary UI button with multiple variants and sizes.
 * 
 * Props:
 * - variant: 'primary' | 'ghost' | 'danger' | 'glass' (default: 'primary')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - children: React node - Button content
 * - onClick: function - Click handler
 * - disabled: boolean - Disable state
 * - loading: boolean - Loading state (shows spinner)
 * - fullWidth: boolean - 100% width
 * - className: string - Additional CSS classes
 */

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  style = {},
}) => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;

  // Size styles
  const sizeStyles = {
    sm: {
      padding: 'var(--spacing-xs) var(--spacing-md)',
      fontSize: '12px',
    },
    md: {
      padding: 'var(--spacing-sm) var(--spacing-lg)',
      fontSize: '14px',
    },
    lg: {
      padding: 'var(--spacing-md) var(--spacing-xl)',
      fontSize: '16px',
    },
  };

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'ghost':
        return {
          background: 'transparent',
          color: currentTokens.primary,
          border: `1px solid ${currentTokens.borderGlass}`,
          hover: {
            background: currentTokens.surfaceGlass,
            borderColor: currentTokens.primaryFixedDim,
            color: currentTokens.primaryContainer,
            boxShadow: `0 0 20px rgba(0, 255, 163, ${isDark ? 0.1 : 0.08})`,
          },
        };
      case 'danger':
        return {
          background: currentTokens.errorContainer,
          color: currentTokens.onErrorContainer,
          border: 'none',
          hover: {
            background: currentTokens.error,
            boxShadow: `0 0 20px rgba(255, 180, 171, ${isDark ? 0.3 : 0.15})`,
          },
        };
      case 'glass':
        return {
          background: currentTokens.surfaceGlass,
          color: currentTokens.primary,
          border: `1px solid ${currentTokens.borderGlass}`,
          hover: {
            borderColor: currentTokens.primaryFixedDim,
            color: currentTokens.primaryContainer,
            boxShadow: `0 0 20px rgba(0, 255, 163, ${isDark ? 0.1 : 0.08})`,
          },
        };
      default: // primary
        return {
          background: currentTokens.primaryContainer,
          color: currentTokens.onPrimaryContainer,
          border: 'none',
          hover: {
            background: currentTokens.primaryFixed,
            transform: 'translateY(-1px)',
            boxShadow: `0 8px 25px rgba(0, 255, 163, ${isDark ? 0.3 : 0.2})`,
          },
          active: {
            transform: 'translateY(0)',
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Animation for hover effects
  const hoverAnimation = disabled || loading ? {} : {
    whileHover: {
      ...variantStyles.hover,
      transition: { duration: 0.2 },
    },
    whileTap: variantStyles.active || { scale: 0.99 },
  };

  return (
    <motion.button
      className={`btn btn-${variant} ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--spacing-xs)',
        borderRadius: 'var(--rounded-interactive)',
        fontFamily: 'var(--font-body)',
        fontWeight: '500',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        outline: 'none',
        border: 'none',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'all var(--transition-fast)',
        ...sizeStyles[size],
        ...variantStyles,
        ...style,
      }}
      {...hoverAnimation}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'inline-block' }}
        >
          🌀
        </motion.span>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
