import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';
import { tokens } from '../../theme/tokens';

/**
 * GlassCard Component
 * 
 * Reusable frosted-glass card with configurable elevation level.
 * 
 * Props:
 * - level: 1 (default) or 2 - Higher level = more blur and glow
 * - glow: boolean - Adds neon border glow effect
 * - children: React node - Card content
 * - className: string - Additional CSS classes
 * - onClick: function - Click handler (makes card clickable)
 * - padding: string - Custom padding (default: var(--spacing-lg))
 */

const GlassCard = ({
  level = 1,
  glow = false,
  children,
  className = '',
  onClick,
  padding = 'var(--spacing-lg)',
  style = {},
}) => {
  const { isDark } = useTheme();

  // Get theme-appropriate tokens
  const currentTokens = isDark ? tokens.dark : tokens.light;

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    hover: {
      scale: 1.01,
      transition: { duration: 0.2 },
    },
  };

  // Level-specific styles
  const getLevelStyles = () => {
    switch (level) {
      case 2:
        return {
          background: currentTokens.surfaceGlass,
          border: `1px solid ${currentTokens.borderGlass}`,
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: 'var(--rounded-lg)',
          boxShadow: `0 0 40px rgba(0, 255, 163, ${isDark ? 0.15 : 0.1})`,
        };
      default: // Level 1
        return {
          background: currentTokens.surfaceGlass,
          border: `1px solid ${currentTokens.borderGlass}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 'var(--rounded-default)',
        };
    }
  };

  const levelStyles = getLevelStyles();

  // Glow effect
  const glowStyles = glow ? {
    position: 'relative',
    overflow: 'hidden',
    ...levelStyles,
  } : levelStyles;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover={onClick ? 'hover' : undefined}
      variants={cardVariants}
      className={`glass-card ${className}`}
      style={{
        ...(glow ? glowStyles : levelStyles),
        padding,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
    >
      {glow && (
        <motion.div
          className="glass-glow-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            padding: '1px',
            background: `linear-gradient(135deg, ${currentTokens.primaryContainer}, ${currentTokens.neonCyan})`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
      )}
      {children}
    </motion.div>
  );
};

export default GlassCard;
