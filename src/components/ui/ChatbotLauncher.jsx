import { useState } from 'react';
import { motion } from 'framer-motion';
import ChatbotModal from './ChatbotModal';

/**
 * ChatbotLauncher Component
 *
 * Floating action button (bottom-right) that opens the AI assistant chat.
 * Mounted once in the App layout so the assistant is reachable everywhere.
 */

const ChatbotLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 900,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: '1px solid rgba(0, 255, 148, 0.4)',
          background: 'rgba(0, 255, 148, 0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 0 20px rgba(0, 255, 148, 0.25)',
          color: 'var(--primary)',
          fontSize: '22px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✦
      </motion.button>
      <ChatbotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatbotLauncher;
