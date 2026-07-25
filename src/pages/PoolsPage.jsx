import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import StatusDot from '../components/ui/StatusDot';
import { formatUSD, formatPercent, formatNumber } from '../utils/formatters';
import { pools, poolTypes } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { tokens } from '../theme/tokens';

/**
 * PoolsPage
 * 
 * Displays all available pools with filtering and sorting:
 * - Filter tabs (All / Express / Patient / Market)
 * - Pool cards grid
 * - "How Pools Work" expandable section
 */

const PoolsPage = () => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedPoolType, setExpandedPoolType] = useState(null);

  // Animation variants
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 150,
        duration: 0.6,
      },
    },
  };

  // Filter pools
  const filteredPools = activeFilter === 'all' 
    ? pools 
    : pools.filter(pool => pool.type === activeFilter);

  // Filter tabs
  const filterTabs = [
    { id: 'all', label: 'All Pools', count: pools.length },
    { id: 'express', label: 'Express', count: pools.filter(p => p.type === 'express').length },
    { id: 'patient', label: 'Patient', count: pools.filter(p => p.type === 'patient').length },
    { id: 'market', label: 'Market', count: pools.filter(p => p.type === 'market').length },
  ];

  // Pool type info for "How Pools Work" section
  const poolTypeEntries = Object.entries(poolTypes);

  return (
    <div className="page-content stagger-children">
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-lg)',
        }}>
          <div>
            <h1 className="text-headline-lg">Pools</h1>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Trade RWAs with different risk/liquidity profiles
            </p>
          </div>
          <Button variant="primary" size="md">
            <Link to="/vault" style={{ color: 'inherit', textDecoration: 'none' }}>
              Deposit to Vault
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: 'var(--spacing-md)',
        }}>
          {filterTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeFilter === tab.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
              }}
            >
              <span>{tab.label}</span>
              <Chip variant="default" value={tab.count} size="sm" />
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Pool Cards Grid */}
      <motion.div variants={itemVariants} className="pool-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--outlet-gap)',
      }}>
        {filteredPools.map((pool, index) => (
          <GlassCard 
            key={pool.id} 
            level={1} 
            glow={index === 0}
            onClick={() => {}}
          >
            <Link to={`/pools/${pool.id}`} style={{
              color: 'inherit',
              textDecoration: 'none',
              display: 'block',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
              }}>
                {/* Pool Icon */}
                <div style={{
                  fontSize: '32px',
                }}>
                  {poolTypes[pool.type].icon}
                </div>
                
                {/* Pool Info */}
                <div style={{
                  flex: 1,
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        marginBottom: '4px',
                      }}>
                        {pool.name}
                      </h3>
                      <Chip variant="pool" value={pool.type} size="sm" />
                    </div>
                    <StatusDot status={pool.isActive ? 'active' : 'error'} />
                  </div>
                  
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--on-surface-variant)',
                    marginBottom: '12px',
                    lineHeight: '1.5',
                  }}>
                    {pool.description}
                  </p>
                  
                  {/* Pool Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                  }}>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--on-surface-variant)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}>
                        TVL
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                      }}>
                        {formatUSD(pool.tvl)}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--on-surface-variant)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}>
                        Volume (24h)
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                      }}>
                        {formatUSD(pool.volume24h)}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--on-surface-variant)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}>
                        Spread
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                      }}>
                        {pool.type === 'market' 
                          ? `${pool.fee} bps fee` 
                          : pool.type === 'patient'
                            ? `${pool.spreadFloor}-${pool.spreadInitial} bps`
                            : `${pool.spreadMin}-${pool.spreadMax} bps`}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--on-surface-variant)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}>
                        Utilization
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: pool.utilization > 0.8 
                          ? 'var(--neon-gold)' 
                          : pool.utilization > 0.5 
                            ? 'var(--primary-container)' 
                            : 'var(--on-surface)',
                      }}>
                        {formatPercent(pool.utilization)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar for utilization */}
                  <div style={{
                    marginTop: '12px',
                    height: '4px',
                    background: 'var(--surface-container-low)',
                    borderRadius: 'var(--rounded-full)',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-container), var(--neon-cyan))',
                        borderRadius: 'var(--rounded-full)',
                        width: `${pool.utilization * 100}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pool.utilization * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </GlassCard>
        ))}
      </motion.div>

      {/* How Pools Work Section */}
      <motion.div variants={itemVariants}>
        <GlassCard level={1} glow={false}>
          <div style={{
            padding: 'var(--spacing-lg)',
          }}>
            <button
              onClick={() => setExpandedPoolType(expandedPoolType ? null : poolTypeEntries[0][0])}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                marginBottom: expandedPoolType ? 'var(--spacing-lg)' : 0,
              }}
            >
              <h2 className="text-headline-lg" style={{
                fontSize: '24px',
              }}>
                How Pools Work
              </h2>
              <span style={{
                fontSize: '20px',
                color: 'var(--primary-container)',
              }}>
                {expandedPoolType ? '−' : '+'}
              </span>
            </button>

            {expandedPoolType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard level={2} glow={false} padding="var(--spacing-lg)">
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-lg)',
                  }}>
                    {poolTypeEntries.map(([typeId, typeInfo]) => (
                      <div key={typeId} style={{
                        padding: 'var(--spacing-md)',
                        border: `1px solid ${currentTokens.borderGlass}`,
                        borderRadius: 'var(--rounded-md)',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                        }}>
                          <span style={{ fontSize: '24px' }}>{typeInfo.icon}</span>
                          <div>
                            <h3 style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '16px',
                              fontWeight: '700',
                              color: 'var(--primary)',
                              marginBottom: '4px',
                            }}>
                              {typeInfo.name}
                            </h3>
                            <Chip variant="pool" value={typeInfo.riskLevel} size="sm" />
                          </div>
                        </div>
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                          color: 'var(--on-surface-variant)',
                          marginTop: '8px',
                          lineHeight: '1.6',
                        }}>
                          {typeInfo.description}
                        </p>
                        <ul style={{
                          marginTop: '8px',
                          paddingLeft: '20px',
                        }}>
                          <li style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: 'var(--on-surface-variant)',
                            marginBottom: '4px',
                          }}>
                            <strong style={{ color: 'var(--primary)' }}>Settlement:</strong> {typeInfo.settlementTime}
                          </li>
                          <li style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: 'var(--on-surface-variant)',
                            marginBottom: '4px',
                          }}>
                            <strong style={{ color: 'var(--primary)' }}>Spread:</strong> {typeInfo.typicalSpread}
                          </li>
                          <li style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: 'var(--on-surface-variant)',
                            marginBottom: '4px',
                          }}>
                            <strong style={{ color: 'var(--primary)' }}>Yield Source:</strong> {typeInfo.yieldSource}
                          </li>
                          <li style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: 'var(--on-surface-variant)',
                          }}>
                            <strong style={{ color: 'var(--primary)' }}>Suitable For:</strong> {typeInfo.suitableFor}
                          </li>
                        </ul>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default PoolsPage;
