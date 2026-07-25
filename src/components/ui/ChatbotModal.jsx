import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';
import Modal from './Modal';
import GlassCard from './GlassCard';

/**
 * ChatbotModal Component
 * 
 * A glassmorphic popover for AI-powered chat interactions.
 * 
 * Props:
 * - isOpen: boolean - Controls modal visibility
 * - onClose: function - Closes the modal
 */

const ChatbotModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  
  // Mock messages for static UI
  const mockMessages = [
    {
      id: 1,
      text: "Hi! I am here to help you for your RWAs transactions: immediate or delayed ones.",
      sender: 'agent',
      avatar: '/design/agent_UI/character.gif', // Replace with actual path
    },
  ];
  
  // Handle user message submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    const message = e.target.message.value.trim();
    if (!message) return;
    
    // TODO: Replace with real API call (e.g., OpenAI, custom NLP service)
    // Example: const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message }) });
    
    // Mock response for demo
    setTimeout(() => {
      console.log('Mock response for:', message);
    }, 500);
    
    e.target.reset();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        width: '90vw',
        maxWidth: '400px',
        maxHeight: '600px',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md)',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}>
          <img
            src="/design/agent_UI/character.gif"
            alt="AI Assistant"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
            }}
          />
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--primary)',
            margin: 0,
          }}>
            AI Assistant
          </h3>
        </div>
        
        {/* Messages */}
        <div style={{
          flex: 1,
          padding: 'var(--spacing-md)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-sm)',
        }}>
          {mockMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--spacing-sm)',
                maxWidth: '80%',
                alignSelf: message.sender === 'agent' ? 'flex-start' : 'flex-end',
              }}
            >
              {message.sender === 'agent' && (
                <img
                  src={message.avatar}
                  alt="AI Assistant"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                  }}
                />
              )}
              <GlassCard
                level={1}
                glow={false}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: message.sender === 'agent' ? '0 var(--rounded-md) var(--rounded-md) var(--rounded-md)' : 'var(--rounded-md) 0 var(--rounded-md) var(--rounded-md)',
                  background: message.sender === 'agent'
                    ? 'rgba(0, 255, 148, 0.1)'
                    : 'var(--surface-glass)',
                }}
              >
                <p style={{
                  margin: 0,
                  color: message.sender === 'agent' ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '14px',
                }}>
                  {message.text}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
        
        {/* Input */}
        <form onSubmit={handleSendMessage} style={{
          padding: 'var(--spacing-md)',
          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}>
          <GlassCard
            level={1}
            glow={true}
            style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <input
              type="text"
              name="message"
              placeholder="Type your message..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '14px',
                padding: 'var(--spacing-xs) 0',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary)',
                fontSize: '16px',
              }}
            >
              →
            </button>
          </GlassCard>
        </form>
      </div>
    </Modal>
  );
};

export default ChatbotModal;