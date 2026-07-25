import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * PageWrapper Component
 * 
 * Wraps page content with Framer Motion AnimatePresence for smooth
 * page-to-page transitions.
 * 
 * Features:
 * - Fade + slide-up entrance animation
 * - Exit animation when navigating away
 * - Staggered children animations
 */

const PageWrapper = ({ children }) => {
  const location = useLocation();

  // Animation variants
  const pageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Container variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Item variants for staggered children
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.div
      key={location.pathname}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageVariants}
      className="page-wrapper"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </motion.div>
  );
};

// Export staggered variants for use in components
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 200,
    },
  },
};

export default PageWrapper;
