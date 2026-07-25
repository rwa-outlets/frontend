import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../theme/ThemeContext';
import GlassCard from '../components/ui/GlassCard';
import { streamChat } from '../lib/chatApi';

// The design-folder character (design/agent_UI/character.gif), re-encoded to a
// small animated webp + a static frame — see public/agent/.
const AVATAR_ANIMATED = '/agent/character.webp';
const AVATAR_STILL = '/agent/character-still.png';

/**
 * AssistantPage
 *
 * Full-page AI assistant (sidebar tab). Empty state shows a centered greeting
 * with suggestion cards — each one a pre-decided prompt that sends the agent
 * off to query the subgraph via its MCP tools. Once a conversation starts,
 * the thread takes over; replies stream in token by token from
 * /api/v1/chat/completions.
 */

// Icon-tile tints per theme: soft glows on the dark glass, deeper saturated
// washes on light so the tiles stay visible against white cards.
const SUGGESTIONS = [
  {
    icon: '💧',
    tint: { dark: 'rgba(0, 163, 255, 0.18)', light: 'rgba(0, 106, 190, 0.16)' },
    label: 'Where to LP',
    prompt: 'Which pool should I LP into right now — Express or Patient?',
  },
  {
    icon: '⚖️',
    tint: { dark: 'rgba(255, 0, 163, 0.15)', light: 'rgba(190, 0, 120, 0.14)' },
    label: 'Exit strategy',
    prompt: 'Should I exit rwaTBILL instantly or queue a redemption?',
  },
  {
    icon: '📈',
    tint: { dark: 'rgba(255, 196, 0, 0.18)', light: 'rgba(180, 130, 0, 0.18)' },
    label: 'NAV trend',
    prompt: 'How are NAVs trending — is now a good time to sell?',
  },
];

// Animated character for the hero, static frame for message bubbles;
// falls back to the ✦ badge if the asset fails to load.
const AgentAvatar = ({ size = 24, animated = false }) => {
  const [failed, setFailed] = useState(false);
  const frame = {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    borderRadius: '50%',
    background: 'rgba(0, 255, 148, 0.15)',
    border: '1px solid rgba(0, 255, 148, 0.4)',
    boxShadow: animated ? '0 0 24px rgba(0, 255, 148, 0.25)' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (failed) {
    return (
      <div style={{ ...frame, fontSize: `${Math.round(size * 0.5)}px`, lineHeight: 1 }}>✦</div>
    );
  }
  return (
    <div style={frame}>
      <img
        src={animated ? AVATAR_ANIMATED : AVATAR_STILL}
        alt="AI Assistant"
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
};

const AssistantPage = () => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const sendPrompt = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: trimmed };
    const agentId = `a-${Date.now()}`;
    const history = [...messages, userMsg].map((m) => ({
      role: m.sender === 'agent' ? 'assistant' : 'user',
      content: m.text,
    }));

    setDraft('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    sendPrompt(draft);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="assistant-page" style={{
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '860px',
      margin: '0 auto',
      width: '100%',
    }}>
      {/* Thread / empty state */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isEmpty ? 'center' : 'flex-start',
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-lg) var(--spacing-md)',
        }}
      >
        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
            }}
          >
            <AgentAvatar size={96} animated />
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '22px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
              }}>
                Hi, there 👋
              </div>
              <h2 style={{
                margin: 'var(--spacing-xs) 0 0',
                fontFamily: 'var(--font-display)',
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                How can we help?
              </h2>
            </div>

            {/* Suggestion cards */}
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 'var(--spacing-lg)',
            }}>
              {SUGGESTIONS.map((s) => (
                <GlassCard
                  key={s.label}
                  level={1}
                  glow={false}
                  onClick={() => sendPrompt(s.prompt)}
                  style={{
                    width: 'min(240px, 100%)',
                    padding: 'var(--spacing-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 'var(--spacing-md)',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--rounded-md)',
                    background: isDark ? s.tint.dark : s.tint.light,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    {s.icon}
                  </div>
                  <span style={{
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                  }}>
                    {s.prompt}
                  </span>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        ) : (
          messages.map((message) => (
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
              {message.sender === 'agent' && <AgentAvatar />}
              <GlassCard
                level={1}
                glow={false}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: message.sender === 'agent'
                    ? '0 var(--rounded-md) var(--rounded-md) var(--rounded-md)'
                    : 'var(--rounded-md) 0 var(--rounded-md) var(--rounded-md)',
                  background: message.sender === 'agent'
                    ? 'rgba(0, 255, 148, 0.1)'
                    : 'var(--surface-glass)',
                }}
              >
                {message.sender === 'agent' && !message.isError && message.text ? (
                  <div className="chat-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                  </div>
                ) : (
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
                )}
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-md)' }}>
        <GlassCard
          level={1}
          glow={true}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-xs) var(--spacing-xs) var(--spacing-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            borderRadius: '999px',
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isStreaming ? 'Thinking…' : 'Ask me anything…'}
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
            disabled={isStreaming || !draft.trim()}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: 'var(--spacing-xs) var(--spacing-md)',
              background: 'rgba(0, 255, 148, 0.15)',
              color: 'var(--primary)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isStreaming || !draft.trim() ? 'default' : 'pointer',
              opacity: isStreaming || !draft.trim() ? 0.5 : 1,
            }}
          >
            ➤ Send
          </button>
        </GlassCard>
        <p style={{
          textAlign: 'center',
          margin: 'var(--spacing-sm) 0 0',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          opacity: 0.7,
        }}>
          Answers come from live indexed chain data — still, double-check before acting on them.
        </p>
      </form>
    </div>
  );
};

export default AssistantPage;
