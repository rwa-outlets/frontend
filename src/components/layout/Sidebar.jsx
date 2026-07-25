import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeContext';

/**
 * Sidebar Navigation Component
 * 
 * Features:
 * - Glassmorphic background (Level 1)
 * - Navigation links with neon glow on active state
 * - Collapsible on mobile
 * - Animated active indicator
 */

const navItems = [
  { path: '/redeem', label: 'Redeem', icon: '🔁' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/pools', label: 'Pools', icon: '🏊' },
  { path: '/queue', label: 'Delayed Redemptions', icon: '🕐' },
  { path: '/vault', label: 'Vault', icon: '🔒' },
];

const Sidebar = () => {
  const location = useLocation();
  const { isDark } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      if (window.innerWidth >= 992) {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      const handleClickOutside = (e) => {
        if (!e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
          setIsCollapsed(true);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, isCollapsed]);

  return (
    <>
      {/* Mobile hamburger button (shown in topbar on mobile) */}
      {isMobile && (
        <button
          className="hamburger"
          onClick={toggleCollapse}
          style={{
            position: 'fixed',
            left: '16px',
            top: '16px',
            zIndex: 1000,
            background: 'transparent',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '24px',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--rounded-default)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {isCollapsed ? '☰' : '✕'}
        </button>
      )}

      <motion.aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
        initial={false}
        animate={{ x: isCollapsed && isMobile ? -280 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Logo */}
        <div className="sidebar-header" style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}>
          {!isCollapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}>
              <span style={{
                fontSize: '20px',
                color: 'var(--primary-container)',
              }}>
                ⚡
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--primary)',
                letterSpacing: '-0.02em',
              }}>
                Aetheric
              </span>
            </div>
          )}
          {isCollapsed && (
            <span style={{
              fontSize: '24px',
              color: 'var(--primary-container)',
              display: 'block',
              textAlign: 'center',
            }}>
              ⚡
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" style={{
          padding: 'var(--spacing-md) 0',
        }}>
          <ul style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => isMobile && setIsCollapsed(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm) var(--spacing-lg)',
                      color: 'var(--on-surface-variant)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: '500',
                      borderLeft: isActive ? '3px solid var(--primary-container)' : '3px solid transparent',
                      background: isActive ? 'rgba(0, 255, 163, 0.05)' : 'transparent',
                      transition: 'all var(--transition-fast)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    {!isCollapsed && <span>{item.label}</span>}
                    
                    {/* Active glow effect */}
                    {isActive && (
                      <motion.div
                        className="active-glow"
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: '2px',
                          background: 'linear-gradient(to bottom, var(--primary-container), transparent)',
                        }}
                      />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="sidebar-footer" style={{
          padding: 'var(--spacing-lg)',
          borderTop: '1px solid var(--border-glass)',
          background: 'rgba(255, 255, 255, 0.02)',
          marginTop: 'auto',
        }}>
          {!isCollapsed && (
            <div style={{
              color: 'var(--on-surface-variant)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
            }}>
              <div>RWA Outlets</div>
              <div style={{ fontSize: '10px', opacity: 0.6 }}>v0.1.0</div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
