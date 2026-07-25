import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import OutletSVG from '../components/home/OutletSVG';
import Button from '../components/ui/Button';
import { useTheme } from '../theme/ThemeContext';

/**
 * HomePage - Landing Page
 * 
 * Full-screen immersive landing page featuring:
 * - Animated outlet SVG (from design/animated_svg.html and design/code.html)
 * - Hero text overlay
 * - Call-to-action buttons
 * - Subtle particle/grid background
 * - Flow effect (gradient lines)
 */

const HomePage = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isSubtitleHovered, setIsSubtitleHovered] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 150,
        duration: 0.8,
      },
    },
  };

  return (
    <div className="home-page">
      {/* Background effects */}
      <div className="home-background-effects">
        {/* Animated particle grid overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.03) 2px, transparent 2px),
            radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.03) 2px, transparent 2px),
            radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 150px 150px, 200px 200px',
          pointerEvents: 'none',
          animation: 'fadeInUp 2s ease-out forwards',
          opacity: 0,
        }} />
      </div>

      {/* Ambient glow */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 255, 163, 0.08) 0%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Main content */}
      <motion.div
        className="home-content"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Outlet SVG - Centered and animated matching design/animated_svg.html */}
        <motion.div
          variants={itemVariants}
          className="outlet-svg-container"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(0, 255, 163, 0.35))',
          }}
        >
          <OutletSVG size={320} animate={true} glow={true} plugHover={isSubtitleHovered} />
        </motion.div>

        {/* Hero Text */}
        <motion.div
          variants={itemVariants}
          className="hero-title"
        >
          <h1 className="text-display-xl">
            Aetheric Outlets
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="hero-subtitle text-body-md"
          onHoverStart={() => setIsSubtitleHovered(true)}
          onHoverEnd={() => setIsSubtitleHovered(false)}
        >
          Instant liquidity for tokenized real-world assets.Powered by
          <motion.span
            style={{
              color: 'var(--primary-container)',
              fontWeight: '600',
              marginLeft: '6px',
            }}
            whileHover={{
              color: '#00ffa3',
              transition: { duration: 0.3 }
            }}
          >
            The Graph, Uniswap, and 1inch
          </motion.span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="hero-cta"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            <span>Enter App</span>
            <span>→</span>
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate('/pools')}
          >
            <span>Explore Pools</span>
          </Button>
        </motion.div>

        {/* Flow effect - Animated gradient lines */}
        <div className="flow-effect" />
      </motion.div>

      {/* Footer info (minimal) */}
      <motion.div
        className="home-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--on-surface-variant)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        }}
      >
        @2026 ETH Lisbon
      </motion.div>

      {/* Floating action buttons / indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2 }}
          style={{
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--rounded-default)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--on-surface-variant)',
            backdropFilter: 'blur(10px)',
          }}
        >
          v0.1.0
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
