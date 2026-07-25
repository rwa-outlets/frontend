import { Link } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import ConnectButton from '../wallet/ConnectButton';
import FaucetButton from '../wallet/FaucetButton';
import KycBadge from '../wallet/KycBadge';
import GlassCard from '../ui/GlassCard';
import ChatbotModal from '../ui/ChatbotModal';

/**
 * TopBar Component
 * 
 * Features:
 * - Fixed top bar with glassmorphic background
 * - Logo with neon glow effect
 * - Theme toggle switch
 * - Wallet auth (wagmi): connect, network guard, KYC status, faucet
 * - Responsive design
 */

const TopBar = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  
  return (
    <header className="topbar">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0 var(--spacing-xl)',
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Left - Logo (hidden on desktop since sidebar has it) */}
        <div className="topbar-left" style={{
          display: 'none',
        }}>
          <Link to="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            textDecoration: 'none',
          }}>
            <span style={{
              fontSize: '20px',
              color: 'var(--primary-container)',
              textShadow: '0 0 20px var(--primary-container)',
            }}>
              ⚡
            </span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--primary)',
              letterSpacing: '-0.02em',
            }}>
              Aetheric Outlets
            </span>
          </Link>
        </div>

        {/* Center - Search Bar (Chatbot Trigger) */}
        <div className="topbar-center" style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <GlassCard
            level={1}
            glow={false}
            onClick={() => setIsChatbotOpen(true)}
            style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-xs)',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '500px',
            }}
          >
            <span style={{ fontSize: '16px' }}>🔍</span>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}>
              Search with AI
            </span>
          </GlassCard>
        </div>

        {/* Right - Actions */}
        <div className="topbar-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
        }}>
          {/* Compliance status */}
          <KycBadge />

          {/* Demo token faucet (also mints the KYC pass) */}
          <FaucetButton />
          
          {/* Chatbot Modal */}
          <ChatbotModal
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
          />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Wallet auth */}
          <ConnectButton />

          {/* Mobile menu button (hamburger is in Sidebar component) */}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
