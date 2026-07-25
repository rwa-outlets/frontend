import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';
import Modal from './Modal';
import GlassCard from './GlassCard';
import { streamChat } from '../../lib/chatApi';

/**
 * ChatbotModal Component
 *
 * Glassmorphic chat over the backend's OpenAI-compatible endpoint
 * (/api/v1/chat/completions). The agent answers from indexed chain state
 * via the subgraph — replies stream in token by token.
 *
 * Props:
 * - isOpen: boolean - Controls modal visibility
 * - onClose: function - Closes the modal
 */

const GREETING = {
  id: 'greeting',
  sender: 'agent',
  text: 'Hi! I’m the RWA Outlets analyst. Ask me about pools, swaps, NAV, redemptions, or vaults — I answer from live indexed chain data.',
};

const AgentAvatar = ({ size = 24 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`,
      borderRadius: '50%',
      background: 'rgba(0, 255, 148, 0.15)',
      border: '1px solid rgba(0, 255, 148, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.round(size * 0.55)}px`,
      lineHeight: 1,
    }}
  >
    ✦
  </div>
);

const ChatbotModal = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([GREETING]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  // Keep the latest message in view as tokens stream in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Abort any in-flight stream when the modal closes/unmounts.
  useEffect(() => {
    if (!isOpen) abortRef.current?.abort();
    return () => abortRef.current?.abort();
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = e.target.message.value.trim();
    if (!text || isStreaming) return;
    e.target.reset();

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text };
    const agentId = `a-${Date.now()}`;
    // History for the API: everything except the canned greeting.
    const history = [...messages, userMsg]
      .filter((m) => m.id !== 'greeting')
      .map((m) => ({ role: m.sender === 'agent' ? 'assistant' : 'user', content: m.text }));

    setMessages((prev) => [...prev, userMsg, { id: agentId, sender: 'agent', text: '' }]);
    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      await streamChat(history, {
        signal: abortRef.current.signal,
        onDelta: (delta) => {
          setMessages((prev) => prev.map(
            (m) => (m.id === agentId ? { ...m, text: m.text + delta } : m),
          ));
        },
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => prev.map(
          (m) => (m.id === agentId && !m.text
            ? { ...m, text: `⚠ ${err.message}`, isError: true }
            : m),
        ));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return (
     <Modal isOpen={isOpen} onClose={onClose} size="lg">
       <div className="chatbot-modal" style={{
         display: 'flex',
         flexDirection: 'column',
         height: '80vh',
         width: '90vw',
         maxWidth: '600px',
         maxHeight: '80vh',
         overflow: 'hidden',
         margin: '0 auto',
       }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md)',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}>
          <AgentAvatar size={32} />
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
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            padding: 'var(--spacing-md)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
          }}
        >
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
               style={{
                 display: 'flex',
                 alignItems: 'flex-start',
                 gap: 'var(--spacing-sm)',
                 maxWidth: '90%',
                 alignSelf: message.sender === 'agent' ? 'flex-start' : 'flex-end',
               }}
            >
              {message.sender === 'agent' && <AgentAvatar />}
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
                  color: message.isError
                    ? 'var(--danger, #ff6b6b)'
                    : message.sender === 'agent' ? 'var(--primary)' : 'var(--text-primary)',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {message.text || (isStreaming ? 'Querying the subgraph…' : '')}
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
              placeholder={isStreaming ? 'Thinking…' : 'Ask about pools, NAV, redemptions…'}
              disabled={isStreaming}
              autoComplete="off"
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
              disabled={isStreaming}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: isStreaming ? 'default' : 'pointer',
                color: 'var(--primary)',
                fontSize: '16px',
                opacity: isStreaming ? 0.5 : 1,
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
