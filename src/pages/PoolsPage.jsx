import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import StatusDot from '../components/ui/StatusDot';
import { formatUSD, formatAddress } from '../utils/formatters';
import { poolTypes, poolTypeName } from '../data/poolTypes';
import { useLivePools } from '../hooks/useOutletData';
import { useTheme } from '../theme/ThemeContext';
import { tokens } from '../theme/tokens';

/**
 * PoolsPage — live pools read from the deployed contracts:
 * CuratorVault strategies shipped on Aqua + pro-maker listings on OutletRouter.
 */

const PoolsPage = () => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedPoolType, setExpandedPoolType] = useState(null);

  const { data: pools = [], isLoading } = useLivePools();

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 150, duration: 0.6 },
    },
  };

  const filteredPools =
    activeFilter === 'all' ? pools : pools.filter((pool) => pool.type === activeFilter);

  const filterTabs = [
    { id: 'all', label: 'All Pools', count: pools.length },
    { id: 'express', label: 'Express', count: pools.filter((p) => p.type === 'express').length },
    { id: 'patient', label: 'Patient', count: pools.filter((p) => p.type === 'patient').length },
    { id: 'market', label: 'Market', count: pools.filter((p) => p.type === 'market').length },
  ];

  const poolTypeEntries = Object.entries(poolTypes).filter(([id]) => id !== 'bid');

  return (
    <div className="page-content stagger-children">
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-lg)',
          }}
        >
          <div>
            <h1 className="text-headline-lg">Pools</h1>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Live Aqua strategies on Sepolia — trade RWAs through the OutletRouter
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
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            flexWrap: 'wrap',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: 'var(--spacing-md)',
          }}
        >
          {filterTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeFilter === tab.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(tab.id)}
              style={{ padding: 'var(--spacing-xs) var(--spacing-md)' }}
            >
              <span>{tab.label}</span>
              <Chip variant="default" value={tab.count} size="sm" />
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Pool Cards Grid */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)' }}>
        {isLoading ? (
          <GlassCard level={1} glow={false}>
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                Reading pools from Sepolia…
              </p>
            </div>
          </GlassCard>
        ) : filteredPools.length === 0 ? (
          <GlassCard level={1} glow={false}>
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)', opacity: 0.5 }}>🌊</div>
              <h3 className="text-headline-lg" style={{ fontSize: '20px', marginBottom: 'var(--spacing-sm)' }}>
                No Pools Shipped Yet
              </h3>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '520px', margin: '0 auto' }}>
                Pools appear here as soon as the curator agent ships strategies from the
                CuratorVaults to Aqua (or a pro maker lists a resting bid on the router).
                Deposit USDC to the vault to fund the first pools.
              </p>
              <Button variant="primary" size="md" style={{ marginTop: 'var(--spacing-lg)' }}>
                <Link to="/vault" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Deposit to Vault
                </Link>
              </Button>
            </div>
          </GlassCard>
        ) : (
            <div
              className="pool-grid"
              style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--spacing-sm)',
                padding: '0 var(--spacing-xs)',
              }}
          >
            {filteredPools.map((pool, index) => {
              const typeInfo = poolTypes[pool.type] ?? poolTypes.express;
              return (
                <GlassCard key={pool.id} level={1} glow={index === 0}>
                  <Link
                    to={`/pools/${pool.hash}`}
                    style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ fontSize: '32px' }}>{typeInfo.icon}</div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '18px',
                                fontWeight: '700',
                                color: 'var(--primary)',
                                marginBottom: '4px',
                              }}
                            >
                              {poolTypeName(pool.type, pool.asset.symbol)}
                            </h3>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <Chip variant="pool" value={pool.type} size="sm" />
                              <Chip variant="asset" value={pool.asset.symbol} size="sm" />
                            </div>
                          </div>
                          <StatusDot status={pool.active && pool.listed ? 'active' : 'error'} />
                        </div>

                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: 'var(--on-surface-variant)',
                            marginBottom: '12px',
                            lineHeight: '1.5',
                          }}
                        >
                          {typeInfo.description}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                          <PoolStat label="Shipped TVL" value={formatUSD(pool.tvl)} />
                          <PoolStat label="NAV" value={formatUSD(pool.nav, 4)} />
                          <PoolStat
                            label="USDC side"
                            value={formatUSD(pool.usdc)}
                          />
                          <PoolStat
                            label={`${pool.asset.symbol} side`}
                            value={pool.rwa.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                          />
                        </div>

                        <div
                          style={{
                            marginTop: '12px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--on-surface-variant)',
                          }}
                        >
                          maker: {pool.vaultId ? pool.vaultName : formatAddress(pool.maker || pool.hash)}
                          {' · '}
                          {formatAddress(pool.hash, 10, 6)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </GlassCard>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* How Pools Work Section */}
      <motion.div variants={itemVariants}>
        <GlassCard level={1} glow={false}>
          <div style={{ padding: 'var(--spacing-lg)' }}>
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
              <h2 className="text-headline-lg" style={{ fontSize: '24px' }}>
                How Pools Work
              </h2>
              <span style={{ fontSize: '20px', color: 'var(--primary-container)' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    {poolTypeEntries.map(([typeId, typeInfo]) => (
                      <div
                        key={typeId}
                        style={{
                          padding: 'var(--spacing-md)',
                          border: `1px solid ${currentTokens.borderGlass}`,
                          borderRadius: 'var(--rounded-md)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{typeInfo.icon}</span>
                          <div>
                            <h3
                              style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '16px',
                                fontWeight: '700',
                                color: 'var(--primary)',
                                marginBottom: '4px',
                              }}
                            >
                              {typeInfo.name}
                            </h3>
                            <Chip variant="pool" value={typeInfo.riskLevel} size="sm" />
                          </div>
                        </div>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: 'var(--on-surface-variant)',
                            marginTop: '8px',
                            lineHeight: '1.6',
                          }}
                        >
                          {typeInfo.description}
                        </p>
                        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                          <ListRow label="Settlement" value={typeInfo.settlementTime} />
                          <ListRow label="Spread" value={typeInfo.typicalSpread} />
                          <ListRow label="Yield Source" value={typeInfo.yieldSource} />
                          <ListRow label="Suitable For" value={typeInfo.suitableFor} last />
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

const PoolStat = ({ label, value }) => (
  <div>
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--on-surface-variant)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--primary)',
      }}
    >
      {value}
    </div>
  </div>
);

const ListRow = ({ label, value, last = false }) => (
  <li
    style={{
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--on-surface-variant)',
      marginBottom: last ? 0 : '4px',
    }}
  >
    <strong style={{ color: 'var(--primary)' }}>{label}:</strong> {value}
  </li>
);

export default PoolsPage;
