import { Link } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';

/**
 * TopBar Component
 * 
 * Features:
 * - Fixed top bar with glassmorphic background
 * - Logo with neon glow effect
 * - Theme toggle switch
 * - Connect Wallet button (stubbed for now)
 * - Responsive design
 */

const TopBar = () => {
  const { theme, toggleTheme } = useTheme();

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

        {/* Center - Page Title (optional) */}
        <div className="topbar-center">
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Aetheric Outlets
          </h1>
        </div>

        {/* Right - Actions */}
        <div className="topbar-right" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)',
        }}>
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Connect Wallet Button (stubbed) */}
          <button
            className="btn btn-ghost"
            onClick={() => alert('Wallet connection coming soon!')}
            style={{
              padding: 'var(--spacing-xs) var(--spacing-md)',
            }}
          >
            <span style={{ fontSize: '14px' }}>👛</span>
            <span>Connect Wallet</span>
          </button>

          {/* Mobile menu button (hamburger is in Sidebar component) */}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
