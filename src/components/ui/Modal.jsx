import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import { useTheme } from '../../theme/ThemeContext';
import { tokens } from '../../theme/tokens';

/**
 * Modal Component
 * 
 * Level 2 glassmorphic modal with:
 * - Backdrop blur
 * - Smooth animations
 * - Close button
 * - Optional title, content, and footer
 * 
 * Props:
 * - isOpen: boolean - Modal visibility
 * - onClose: function - Close handler
 * - title: string - Modal title
 * - children: React node - Modal content
 * - footer: React node - Modal footer content
 * - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - closeOnBackdrop: boolean - Close when clicking backdrop (default: true)
 * - showCloseButton: boolean - Show close button (default: true)
 */

const Modal = ({
  isOpen = false,
  onClose = () => {},
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  showCloseButton = true,
}) => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;

  // Size styles
  const sizeStyles = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1000px' },
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Modal content
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget && closeOnBackdrop) {
              onClose();
            }
          }}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              background: currentTokens.surfaceContainerLow,
              border: `1px solid ${currentTokens.borderGlass}`,
              borderRadius: 'var(--rounded-lg)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              boxShadow: `0 0 40px rgba(0, 255, 163, ${isDark ? 0.15 : 0.1})`,
              maxHeight: '90vh',
              overflowY: 'auto',
              ...sizeStyles[size],
            }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="modal-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-lg)',
                borderBottom: `1px solid ${currentTokens.borderGlass}`,
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  margin: 0,
                }}>
                  {title}
                </h2>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    style={{
                      padding: '6px 12px',
                      minWidth: 'auto',
                    }}
                  >
                    ✕
                  </Button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="modal-body" style={{
              padding: 'var(--spacing-lg)',
            }}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="modal-footer" style={{
                padding: 'var(--spacing-lg)',
                borderTop: `1px solid ${currentTokens.borderGlass}`,
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal outside of the component hierarchy
  return createPortal(
    modalContent,
    document.body
  );
};

export default Modal;
