import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';
import { tokens, assetColors, poolColors, statusColors } from '../../theme/tokens';

/**
 * Chip Component
 * 
 * Pill-shaped label for asset types, status, categories, etc.
 * 
 * Props:
 * - variant: 'asset' | 'status' | 'pool' | 'default' (default: 'default')
 * - value: string - The value to display (e.g., '$USDC', 'Active', 'Express')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - icon: string - Optional icon/emoji
 * - onClick: function - Optional click handler
 * - className: string - Additional CSS classes
 */

const Chip = ({
  variant = 'default',
  value = '',
  size = 'md',
  icon,
  onClick,
  className = '',
  style = {},
}) => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;

  // Get color scheme based on variant and value
  const getChipColors = () => {
    switch (variant) {
      case 'asset':
        return assetColors[value] || {
          background: currentTokens.surfaceGlass,
          border: currentTokens.borderGlass,
          text: currentTokens.onSurfaceVariant,
        };
      case 'status':
        return statusColors[value.toLowerCase()] || {
          background: currentTokens.surfaceGlass,
          border: currentTokens.borderGlass,
          text: currentTokens.onSurfaceVariant,
        };
      case 'pool':
        return poolColors[value.toLowerCase()] || {
          background: currentTokens.surfaceGlass,
          border: currentTokens.borderGlass,
          text: currentTokens.onSurfaceVariant,
        };
      default:
        return {
          background: currentTokens.surfaceGlass,
          border: currentTokens.borderGlass,
          text: currentTokens.onSurfaceVariant,
        };
    }
  };

  const colors = getChipColors();

  // Size styles
  const sizeStyles = {
    sm: {
      padding: '2px 8px',
      fontSize: '10px',
      gap: '4px',
    },
    md: {
      padding: '2px 12px',
      fontSize: '11px',
      gap: '6px',
    },
    lg: {
      padding: '4px 16px',
      fontSize: '12px',
      gap: '8px',
    },
  };

  return (
    <motion.div
      className={`chip chip-${variant} ${className}`}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--rounded-full)',
        fontFamily: 'var(--font-mono)',
        fontWeight: '500',
        letterSpacing: '0.04em',
        background: colors.background,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)',
        ...sizeStyles[size],
        ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      {value}
    </motion.div>
  );
};

export default Chip;
