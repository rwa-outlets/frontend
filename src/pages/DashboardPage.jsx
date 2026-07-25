import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import StatusDot from '../components/ui/StatusDot';
import DataTable from '../components/ui/DataTable';
import { formatUSD, formatPercent, formatNumber } from '../utils/formatters';
import { dashboardStats, yieldBreakdown, trades, pools } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';

/**
 * DashboardPage - Overview
 * 
 * Displays key protocol metrics:
 * - Top stats row (TVL, Volume, Active Pools, Average APY)
 * - Pool Summary cards (Express, Patient, Market)
 * - Recent Trades table
 * - Yield Breakdown visualization
 */

const DashboardPage = () => {
  const { isDark } = useTheme();

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

  // Top stats cards
  const statsCards = [
    {
      label: 'Total Value Locked',
      value: formatUSD(dashboardStats.totalTVL),
      change: '+12.5%',
      changeType: 'positive',
      icon: '💰',
      color: 'primary',
    },
    {
      label: '24h Volume',
      value: formatUSD(dashboardStats.volume24h),
      change: '+8.3%',
      changeType: 'positive',
      icon: '📈',
      color: 'secondary',
    },
    {
      label: 'Active Pools',
      value: dashboardStats.activePools,
      change: null,
      changeType: null,
      icon: '🏊',
      color: 'tertiary',
    },
    {
      label: 'Average APY',
      value: formatPercent(dashboardStats.averageAPY, 1),
      change: null,
      changeType: null,
      icon: '🎯',
      color: 'primary',
    },
  ];

  // Pool summary by type
  const poolSummary = [
    {
      type: 'express',
      name: 'Express Pools',
      count: pools.filter(p => p.type === 'express').length,
      tvl: pools.filter(p => p.type === 'express').reduce((sum, p) => sum + p.tvl, 0),
      volume24h: pools.filter(p => p.type === 'express').reduce((sum, p) => sum + p.volume24h, 0),
      avgSpread: '5-25 bps',
      color: 'primary',
      icon: '⚡',
    },
    {
      type: 'patient',
      name: 'Patient Pools',
      count: pools.filter(p => p.type === 'patient').length,
      tvl: pools.filter(p => p.type === 'patient').reduce((sum, p) => sum + p.tvl, 0),
      volume24h: pools.filter(p => p.type === 'patient').reduce((sum, p) => sum + p.volume24h, 0),
      avgSpread: '50-300 bps',
      color: 'secondary',
      icon: '⏳',
    },
    {
      type: 'market',
      name: 'Market Pool',
      count: pools.filter(p => p.type === 'market').length,
      tvl: pools.filter(p => p.type === 'market').reduce((sum, p) => sum + p.tvl, 0),
      volume24h: pools.filter(p => p.type === 'market').reduce((sum, p) => sum + p.volume24h, 0),
      avgSpread: '30 bps fee',
      color: 'tertiary',
      icon: '💱',
    },
  ];

  // Recent trades for table
  const recentTrades = [...trades].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  // Trade table columns
  const tradeColumns = [
    { key: 'pool', header: 'Pool', sortable: true },
    { key: 'asset', header: 'Asset', sortable: true },
    { key: 'direction', header: 'Direction', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, align: 'right' },
    { key: 'rate', header: 'Rate vs NAV', sortable: true, align: 'right' },
    { key: 'time', header: 'Time', sortable: true, align: 'right' },
    { key: 'status', header: 'Status', sortable: true },
  ];

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
            <h1 className="text-headline-lg">Dashboard</h1>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Overview of RWA Outlets protocol performance
            </p>
          </div>
          <Button variant="primary" size="md">
            <Link to="/pools" style={{ color: 'inherit', textDecoration: 'none' }}>
              View All Pools
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Top Stats Row */}
      <motion.div variants={itemVariants} className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--outlet-gap)',
      }}>
        {statsCards.map((stat, index) => (
          <GlassCard key={stat.label} level={1} glow={index === 0}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                  <Chip variant="default" value={stat.label} size="sm" />
                </div>
                <div className="text-display-xl" style={{
                  fontSize: '32px',
                  lineHeight: '40px',
                  fontWeight: '700',
                  marginBottom: '4px',
                }}>
                  {stat.value}
                </div>
                {stat.change && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: stat.changeType === 'positive' 
                      ? 'var(--neon-green)' 
                      : stat.changeType === 'negative' 
                        ? 'var(--error)' 
                        : 'var(--on-surface-variant)',
                  }}>
                    <span>{stat.changeType === 'positive' ? '▲' : stat.changeType === 'negative' ? '▼' : '─'}</span>
                    <span>{stat.change}</span>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Pool Summary Section */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)' }}>
        <h2 className="text-headline-lg" style={{
          fontSize: '24px',
          marginBottom: 'var(--spacing-lg)',
        }}>
          Pool Summary
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}>
          {poolSummary.map((pool) => (
            <GlassCard key={pool.type} level={1} glow={false}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
              }}>
                <div style={{
                  fontSize: '28px',
                }}>
                  {pool.icon}
                </div>
                <div style={{
                  flex: 1,
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    marginBottom: '8px',
                  }}>
                    {pool.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--on-surface-variant)',
                    }}>
                      {pool.count} pool{pool.count !== 1 ? 's' : ''}
                    </div>
                    <Chip variant="default" value={pool.avgSpread} size="sm" />
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
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
                        fontSize: '20px',
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
                        24h Volume
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                      }}>
                        {formatUSD(pool.volume24h)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      {/* Recent Trades Section */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)',
        }}>
          <h2 className="text-headline-lg" style={{
            fontSize: '24px',
          }}>
            Recent Trades
          </h2>
          <Link to="/pools" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--primary-container)',
            textDecoration: 'none',
          }}>
            View All →
          </Link>
        </div>
        <GlassCard level={1} glow={false} padding="0">
          <DataTable
            columns={tradeColumns}
            data={recentTrades.map(trade => ({
              id: trade.id,
              pool: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Chip variant="pool" value={trade.poolId.split('-')[0]} size="sm" />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
                    {trade.poolName}
                  </span>
                </div>
              ),
              asset: (
                <Chip variant="asset" value={trade.assetId} size="sm" />
              ),
              direction: (
                <Chip 
                  variant="default" 
                  value={trade.direction.toUpperCase()} 
                  size="sm"
                  style={{
                    background: trade.direction === 'exit' 
                      ? 'rgba(0, 255, 163, 0.1)' 
                      : 'rgba(112, 0, 255, 0.1)',
                    borderColor: trade.direction === 'exit' 
                      ? '#00ffa3' 
                      : '#7000ff',
                    color: trade.direction === 'exit' 
                      ? '#00ffa3' 
                      : '#d1bcff',
                  }}
                />
              ),
              amount: formatUSD(trade.amount),
              rate: formatPercent((trade.amount / (trade.amountToken * trade.rate)) * 100 - 100, 2),
              time: new Date(trade.timestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              status: <StatusDot status={trade.status.toLowerCase()} size="sm" />,
            }))}
          />
        </GlassCard>
      </motion.div>

      {/* Yield Breakdown Section */}
      <motion.div variants={itemVariants}>
        <h2 className="text-headline-lg" style={{
          fontSize: '24px',
          marginBottom: 'var(--spacing-lg)',
        }}>
          Yield Breakdown
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}>
          {yieldBreakdown.map((source, index) => (
            <GlassCard key={source.source} level={1} glow={index === 0}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--on-surface)',
                  }}>
                    {source.source}
                  </span>
                  <Chip variant="default" value={formatPercent(source.value, 1)} size="sm" />
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--on-surface-variant)',
                }}>
                  {source.description}
                </div>
                <div style={{
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
                      width: `${(source.value / 0.073) * 100}%`, // Based on total yield
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(source.value / 0.073) * 100}%` }}
                    transition={{ delay: 0.5 + index * 0.2, duration: 1 }}
                  />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
