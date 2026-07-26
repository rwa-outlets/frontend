import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import DataTable from '../components/ui/DataTable';
import DirectionChip from '../components/ui/DirectionChip';
import { formatUSD, formatAddress, formatTimeAgo } from '../utils/formatters';
import { poolTypes } from '../data/poolTypes';
import { EXPLORER_URL, RWA_LIST } from '../lib/contracts';
import {
  useNavs,
  useLivePools,
  useVaultData,
  useQueueData,
  useTradeHistory,
} from '../hooks/useOutletData';

/**
 * DashboardPage — live protocol overview read from the Sepolia deployment:
 * vault treasuries, queue settlement cash, shipped pools, oracle NAVs, and
 * recent router fills.
 */

const DashboardPage = () => {
  const { navs } = useNavs();
  const { data: pools = [], isLoading: poolsLoading } = useLivePools();
  const express = useVaultData('express');
  const patient = useVaultData('patient');
  const tbillQueue = useQueueData('rwaTBILL');
  const creditQueue = useQueueData('rwaCREDIT');
  const trades = useTradeHistory(10);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 20, stiffness: 150, duration: 0.6 },
    },
  };

  const vaultTvl = (express.data?.totalAssets ?? 0) + (patient.data?.totalAssets ?? 0);
  const queueCash = (tbillQueue.data?.totalAssets ?? 0) + (creditQueue.data?.totalAssets ?? 0);
  const statsLoading = express.isLoading || patient.isLoading;

  const activePools = pools.filter((p) => p.active && p.listed);
  const queueBacklog =
    (tbillQueue.data?.epochs.find((e) => e.isOpen)?.totalShares ?? 0) * (navs.rwaTBILL?.nav ?? 1) +
    (creditQueue.data?.epochs.find((e) => e.isOpen)?.totalShares ?? 0) * (navs.rwaCREDIT?.nav ?? 1);

  const statsCards = [
    {
      label: 'Protocol TVL',
      value: statsLoading ? '…' : formatUSD(vaultTvl + queueCash),
      hint: 'vault treasuries + queue settlement cash',
      icon: '💰',
    },
    {
      label: 'Live Pools',
      value: poolsLoading ? '…' : String(activePools.length),
      hint: 'Aqua strategies quotable via the router',
      icon: '🏊',
    },
    {
      label: 'Queue Backlog',
      value: formatUSD(queueBacklog),
      hint: 'open-epoch requests at oracle NAV',
      icon: '⏳',
    },
    {
      label: 'Vault Share Prices',
      value: statsLoading
        ? '…'
        : `${(express.data?.sharePrice ?? 1).toFixed(4)} / ${(patient.data?.sharePrice ?? 1).toFixed(4)}`,
      hint: 'roEXP / roPAT — accrues spreads + NAV capture',
      icon: '🎯',
    },
  ];

  const tradeColumns = [
    { key: 'asset', header: 'Asset', sortable: false },
    { key: 'direction', header: 'Direction', sortable: false },
    { key: 'amount', header: 'Amount', sortable: false, align: 'right' },
    { key: 'rate', header: 'Rate', sortable: false, align: 'right' },
    { key: 'time', header: 'Time', sortable: false, align: 'right' },
    { key: 'tx', header: 'Tx', sortable: false, align: 'right' },
  ];

  const yieldStreams = [
    {
      source: 'Redemption Spreads',
      description:
        'Every instant exit pays the pool spread or auction discount to the filling maker; the Market pool earns swap fees both ways.',
    },
    {
      source: 'Aqua Capital Reuse',
      description:
        'Shipped virtual balances let the same USDC back Express, Patient, and Market pools simultaneously — utilization compounds.',
    },
    {
      source: 'NAV Capture',
      description:
        'Inventory bought at a discount is recycled through the RedemptionQueue and settles at full issuer NAV.',
    },
  ];

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
            <h1 className="text-headline-lg">Dashboard</h1>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Live protocol state on Ethereum Sepolia
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
        <motion.div
          variants={itemVariants}
          className="stats-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--outlet-gap)',
            width: '100%',
            overflow: 'hidden',
            padding: '0 var(--spacing-xs)',
          }}
       >
        {statsCards.map((stat, index) => (
          <GlassCard key={stat.label} level={1} glow={index === 0}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                <Chip variant="default" value={stat.label} size="sm" />
              </div>
              <div
                className="text-display-xl"
                style={{ fontSize: '30px', lineHeight: '38px', fontWeight: '700', marginBottom: '4px' }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                }}
              >
                {stat.hint}
              </div>
            </div>
          </GlassCard>
        ))}
      </motion.div>

        {/* NAV Oracle Section */}
        <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)', padding: '0 var(--spacing-xs)' }}>
          <h2 className="text-headline-lg" style={{ fontSize: '20px', marginBottom: 'var(--spacing-md)' }}>
            NAV Oracle
          </h2>
          <div
            className="nav-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--spacing-sm)',
              width: '100%',
              overflow: 'hidden',
            }}
         >
          {RWA_LIST.map((asset) => {
            const navInfo = navs[asset.id];
            const stale = navInfo && Date.now() / 1000 - navInfo.updatedAt > 24 * 3600;
            return (
              <GlassCard key={asset.id} level={1} glow={false}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ fontSize: '28px' }}>{asset.logo}</div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '18px',
                          fontWeight: '700',
                          color: 'var(--primary)',
                        }}
                      >
                        {asset.symbol}
                      </h3>
                      <Chip
                        variant="default"
                        size="sm"
                        value={
                          navInfo ? (stale ? 'stale' : `updated ${formatTimeAgo(navInfo.updatedAt * 1000)}`) : 'not set'
                        }
                        style={
                          stale
                            ? { borderColor: '#ffb4ab', color: '#ffb4ab' }
                            : { borderColor: '#00ffa3', color: '#00ffa3' }
                        }
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '28px',
                        fontWeight: '700',
                        color: 'var(--primary-container)',
                      }}
                    >
                      {navInfo ? formatUSD(navInfo.nav, 4) : '—'}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--on-surface-variant)',
                        marginTop: '4px',
                      }}
                    >
                      {asset.name} · {asset.category} · issuer window {asset.settlement}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </motion.div>

        {/* Pool Summary Section */}
        <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)', padding: '0 var(--spacing-xs)' }}>
          <h2 className="text-headline-lg" style={{ fontSize: '20px', marginBottom: 'var(--spacing-md)' }}>
            Pool Summary
          </h2>
          <div
            className="pool-summary-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--spacing-sm)',
              width: '100%',
              overflow: 'hidden',
            }}
         >
          {['express', 'patient', 'market'].map((type) => {
            const info = poolTypes[type];
            const typePools = pools.filter((p) => p.type === type);
            const tvl = typePools.reduce((sum, p) => sum + p.tvl, 0);
            return (
              <GlassCard key={type} level={1} glow={false}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ fontSize: '28px' }}>{info.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: 'var(--primary)',
                        marginBottom: '8px',
                      }}
                    >
                      {info.name} Pools
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                        {typePools.length} pool{typePools.length !== 1 ? 's' : ''} live
                      </div>
                      <Chip variant="default" value={info.typicalSpread} size="sm" />
                    </div>
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
                        Shipped TVL
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '20px',
                          fontWeight: '700',
                          color: 'var(--primary)',
                        }}
                      >
                        {formatUSD(tvl)}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Trades Section */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-lg)',
            flexWrap: 'wrap',
            gap: 'var(--spacing-md)',
          }}
        >
          <h2 className="text-headline-lg" style={{ fontSize: '24px' }}>
            Recent Router Fills
          </h2>
          <Link
            to="/pools"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--primary-container)',
              textDecoration: 'none',
            }}
          >
            Trade →
          </Link>
        </div>
        <GlassCard level={1} glow={false} padding="0">
          {(trades.data ?? []).length === 0 ? (
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                {trades.isLoading
                  ? 'Scanning recent blocks…'
                  : 'No router fills in the recent block window yet — be the first to trade.'}
              </p>
            </div>
          ) : (
            <DataTable
              columns={tradeColumns}
              data={trades.data.map((trade) => ({
                id: trade.id,
                asset: <Chip variant="asset" value={trade.asset.symbol} size="sm" />,
                direction: <DirectionChip direction={trade.direction} />,
                amount: formatUSD(trade.usdcAmount),
                rate: formatUSD(trade.rate, 4),
                time: trade.timestamp ? formatTimeAgo(trade.timestamp * 1000) : '—',
                tx: (
                   <a
                     href={`${EXPLORER_URL}/tx/${trade.txHash}`}
                     target="_blank"
                     rel="noreferrer"
                     style={{
                       color: 'var(--primary-container)',
                       fontFamily: 'var(--font-mono)',
                       fontSize: '12px',
                       whiteSpace: 'nowrap',
                       overflow: 'hidden',
                       textOverflow: 'ellipsis',
                       maxWidth: '100px',
                       display: 'inline-block',
                     }}
                     className="tx-hash"
                   >
                     {formatAddress(trade.txHash, 6, 4)} ↗
                  </a>
                ),
              }))}
            />
          )}
        </GlassCard>
      </motion.div>

        {/* Yield Streams Section */}
        <motion.div variants={itemVariants} style={{ padding: '0 var(--spacing-xs)' }}>
          <h2 className="text-headline-lg" style={{ fontSize: '20px', marginBottom: 'var(--spacing-md)' }}>
            Yield Streams
          </h2>
          <div
            className="yield-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-sm)',
              width: '100%',
              overflow: 'hidden',
            }}
         >
          {yieldStreams.map((source, index) => (
            <GlassCard key={source.source} level={1} glow={index === 0}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--on-surface)',
                  }}
                >
                  {source.source}
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                  {source.description}
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
