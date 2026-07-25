import { useTheme } from '../../theme/ThemeContext';
import { motion } from 'framer-motion';

/**
 * OutletSVG Component
 * 
 * Animated SVG of the glassmorphic outlet with plug-in animation.
 * Based on the design/animated_svg.html and design/code.html files.
 * 
 * Props:
 * - size: number - Size in pixels (default: 300)
 * - animate: boolean - Enable animation (default: true)
 * - glow: boolean - Enable neon glow effect (default: true)
 * - className: string - Additional CSS classes
 */

const OutletSVG = ({ size = 300, animate = true, glow = true, className = '', plugHover = false }) => {
  const { isDark } = useTheme();

  // Calculate dimensions based on size
  const viewBox = { width: 200, height: 200 };

  // Animation variants for the plug (continuous 1s alternate loop matching animated_svg.html)
  const plugVariants = animate ? {
    plugged: {
      y: [20, 0],
      opacity: [0.3, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeOut',
      },
    },
  } : {};

  // Hover animation for plug - moves up and flashes cyan-green
  const plugHoverVariants = {
    hovered: {
      y: -10,
      fill: '#00ffa3',
      transition: { duration: 0.3 }
    },
    normal: {
      y: 0,
      fill: isDark ? '#00FF94' : '#005231',
      transition: { duration: 0.3 }
    }
  };

  // Outlet glow effect
  const outletGlow = glow ? {
    filter: isDark 
      ? 'drop-shadow(0 0 25px rgba(0, 255, 163, 0.6))' 
      : 'drop-shadow(0 0 25px rgba(0, 82, 49, 0.6))',
  } : {};

  return (
    <motion.div
      className={`outlet-svg-wrapper ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          ...outletGlow,
        }}
      >
        <defs>
          {/* Glass gradient for the outlet */}
          <linearGradient id="glassGradient" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(255, 255, 255, 0.25)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255, 255, 255, 0.05)', stopOpacity: 1 }} />
          </linearGradient>

          {/* Neon glow for active ports */}
          <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: isDark ? '#00ffa3' : '#005231', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: isDark ? '#00ffa3' : '#005231', stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* The Outlet - Glassmorphic rectangle */}
        <rect
          fill="url(#glassGradient)"
          height="120"
          rx="10"
          stroke={isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 50, 30, 0.3)'}
          strokeWidth="2"
          width="80"
          x="60"
          y="40"
        />

        {/* Outlet ports (circles) */}
        <circle
          cx="85"
          cy="70"
          fill={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 50, 30, 0.1)'}
          r="8"
          stroke={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 50, 30, 0.2)'}
        />
        <circle
          cx="115"
          cy="70"
          fill={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 50, 30, 0.1)'}
          r="8"
          stroke={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 50, 30, 0.2)'}
        />
        <circle
          cx="85"
          cy="130"
          fill={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 50, 30, 0.1)'}
          r="8"
          stroke={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 50, 30, 0.2)'}
        />
        <circle
          cx="115"
          cy="130"
          fill={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 50, 30, 0.1)'}
          r="8"
          stroke={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 50, 30, 0.2)'}
        />

        {/* The Plug (Animated via Framer Motion matching animated_svg.html) */}
        <motion.g
          animate={animate ? "plugged" : undefined}
          variants={plugVariants}
          style={{ y: plugHover ? -10 : 0 }}
        >
          {/* Plug body */}
          <motion.rect
            fill={plugHover ? '#00ffa3' : (isDark ? '#00FF94' : '#005231')}
            height="40"
            rx="5"
            width="50"
            x="75"
            y="170"
            animate={plugHover ? "hovered" : "normal"}
            variants={plugHoverVariants}
          />
          {/* Plug prongs */}
          <motion.rect
            fill={plugHover ? '#00ffa3' : (isDark ? '#00FF94' : '#005231')}
            height="15"
            width="6"
            x="85"
            y="155"
            animate={plugHover ? "hovered" : "normal"}
            variants={plugHoverVariants}
          />
          <motion.rect
            fill={plugHover ? '#00ffa3' : (isDark ? '#00FF94' : '#005231')}
            height="15"
            width="6"
            x="109"
            y="155"
            animate={plugHover ? "hovered" : "normal"}
            variants={plugHoverVariants}
          />
        </motion.g>

        {/* Pulsing glow to ports when plugged in */}
        {animate && glow && (
          <>
            <motion.circle
              cx="85"
              cy="70"
              r="12"
              fill="none"
              stroke="url(#neonGlow)"
              strokeWidth="2"
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.2, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle
              cx="115"
              cy="70"
              r="12"
              fill="none"
              stroke="url(#neonGlow)"
              strokeWidth="2"
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.2, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
};

export default OutletSVG;
