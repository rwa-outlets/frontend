import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import DataTable from '../components/ui/DataTable';
import DirectionChip from '../components/ui/DirectionChip';
import { formatUSD, formatNumber, formatAddress, formatTimeAgo } from '../utils/formatters';
import { EXPLORER_URL, USDC, RWA_LIST, VAULT_LIST } from '../lib/contracts';
import {
  useNavs,
  useTokenBalances,
  useKyc,
  useVaultData,
  useQueueData,
  useTradeHistory,
} from '../hooks/useOutletData';

/**
 * PortfolioPage — everything the connected wallet holds across the protocol:
 * token balances valued at oracle NAV, vault positions (roEXP/roPAT),
 * redemption-queue requests, and the wallet's own trade history.
 */

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 150, duration: 0.6 },
  },
};

const SectionTitle = ({ children }) => (
  <h2 className="text-headline-lg" style={{ fontSize: '20px', marginBottom: 'var(--spacing-md)' }}>
    {children}
  </h2>
);

const PortfolioPage = () => {
  const { address, isConnected } = useAccount();
  const { navs } = useNavs();
  const { balances, isLoading: balancesLoading } = useTokenBalances();
  const { hasKyc } = useKyc();
  const express = useVaultData('express');
  const patient = useVaultData('patient');
  const tbillQueue = useQueueData('rwaTBILL');
  const creditQueue = useQueueData('rwaCREDIT');
  const trades = useTradeHistory(50);

  // ---------------------------------------------------------- derived values

  const holdings = [USDC, ...RWA_LIST].map((token) => {
    const balance = balances[token.id]?.value ?? 0;
    const price = token.id === 'USDC' ? 1 : navs[token.id]?.nav ?? 1;
    return { token, balance, price, value: balance * price };
  });
  const walletValue = holdings.reduce((sum, h) => sum + h.value, 0);

  const vaultQueries = { express, patient };
  const vaultPositions = VAULT_LIST.map((vault) => {
    const q = vaultQueries[vault.id];
    const user = q.data?.user;
    return {
      vault,
      sharePrice: q.data?.sharePrice ?? 1,
      shares: user?.shares ?? 0,
      value: user?.value ?? 0,
      pendingShares: user?.pendingShares ?? 0,
      claimableShares: user?.claimableShares ?? 0,
    };
  }).filter((p) => p.shares > 0 || p.pendingShares > 0 || p.claimableShares > 0);
  const vaultValue = vaultPositions.reduce((sum, p) => sum + p.value, 0);

  const queueRequests = [
    { assetId: 'rwaTBILL', query: tbillQueue },
    { assetId: 'rwaCREDIT', query: creditQueue },
  ].flatMap(({ query }) => {
    const data = query.data;
    if (!data?.user) return [];
    return data.user.requests.map((r) => ({ ...r, asset: data.asset }));
  });
  const queueValue = queueRequests.reduce(
    (sum, r) => sum + (r.estPayout ?? r.shares * (navs[r.asset.id]?.nav ?? 1)),
    0,
  );

  const totalValue = walletValue + vaultValue + queueValue;

  const myTrades = (trades.data ?? []).filter(
    (t) => address && t.user?.toLowerCase() === address.toLowerCase(),
  );

  // ------------------------------------------------------------------ tables

  const holdingColumns = [
    { key: 'token', header: 'Token', sortable: false },
    { key: 'balance', header: 'Balance', sortable: false, align: 'right' },
    { key: 'price', header: 'NAV / Price', sortable: false, align: 'right' },
    { key: 'value', header: 'Value', sortable: false, align: 'right' },
  ];

  const queueColumns = [
    { key: 'asset', header: 'Asset', sortable: false },
    { key: 'epoch', header: 'Epoch', sortable: false, align: 'right' },
    { key: 'shares', header: 'Shares', sortable: false, align: 'right' },
    { key: 'status', header: 'Status', sortable: false },
    { key: 'payout', header: 'Est. Payout', sortable: false, align: 'right' },
  ];

  const tradeColumns = [
    { key: 'asset', header: 'Asset', sortable: false },
    { key: 'direction', header: 'Direction', sortable: false },
    { key: 'amount', header: 'Amount', sortable: false, align: 'right' },
    { key: 'rate', header: 'Rate', sortable: false, align: 'right' },
    { key: 'time', header: 'Time', sortable: false, align: 'right' },
    { key: 'tx', header: 'Tx', sortable: false, align: 'right' },
  ];

  // ------------------------------------------------------------------ render

  if (!isConnected) {
    return (
      <div className="page-content">
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <GlassCard level={1} glow style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div style={{ fontSize: '40px', marginBottom: 'var(--spacing-sm)' }}>👛</div>
            <h1 className="text-headline-lg">Portfolio</h1>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>
              Connect your wallet (top right) to see balances, vault positions,
              redemption requests, and your trade history.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Total Value',
      value: formatUSD(totalValue),
      hint: 'wallet + vault positions + queued redemptions',
      icon: '💼',
    },
    {
      label: 'Wallet',
      value: formatUSD(walletValue),
      hint: 'USDC + RWAs at oracle NAV',
      icon: '💵',
    },
    {
      label: 'Vault Positions',
      value: formatUSD(vaultValue),
      hint: 'roEXP / roPAT at current share price',
      icon: '🔒',
    },
    {
      label: 'In Redemption Queues',
      value: formatUSD(queueValue),
      hint: 'pending + claimable requests',
      icon: '🕐',
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
            <h1 className="text-headline-lg">Portfolio</h1>
            <p
              className="text-body-md"
              style={{
                color: 'var(--on-surface-variant)',
                marginTop: '4px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {formatAddress(address, 8, 6)}
            </p>
          </div>
          <Chip
            variant="default"
            size="sm"
            value={hasKyc ? 'KYC verified' : 'No KYC pass'}
            style={
              hasKyc
                ? { borderColor: '#00ffa3', color: '#00ffa3' }
                : { borderColor: '#ffb4ab', color: '#ffb4ab' }
            }
          />
        </div>
      </motion.div>

      {/* Stats */}
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
                {balancesLoading ? '…' : stat.value}
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

      {/* Holdings */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)', padding: '0 var(--spacing-xs)' }}>
        <SectionTitle>Holdings</SectionTitle>
        <GlassCard level={1} glow={false}>
          <DataTable
            columns={holdingColumns}
            data={holdings.map((h) => ({
              id: h.token.id,
              token: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>{h.token.logo}</span>
                  <span>{h.token.symbol}</span>
                </span>
              ),
              balance: formatNumber(h.balance, 4),
              price: formatUSD(h.price, 4),
              value: formatUSD(h.value),
            }))}
          />
        </GlassCard>
      </motion.div>

      {/* Vault positions */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)', padding: '0 var(--spacing-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionTitle>Vault Positions</SectionTitle>
          <Button variant="secondary" size="sm">
            <Link to="/vault" style={{ color: 'inherit', textDecoration: 'none' }}>
              Manage Vaults
            </Link>
          </Button>
        </div>
        {vaultPositions.length === 0 ? (
          <GlassCard level={1} glow={false}>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
              No vault positions yet — deposit USDC into a tier vault to start earning
              redemption spreads.
            </p>
          </GlassCard>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--spacing-sm)',
            }}
          >
            {vaultPositions.map((p) => (
              <GlassCard key={p.vault.id} level={1} glow={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      margin: 0,
                    }}
                  >
                    {p.vault.symbol}
                  </h3>
                  <Chip variant="default" size="sm" value={p.vault.name} />
                </div>
                <div
                  className="text-display-xl"
                  style={{ fontSize: '26px', fontWeight: 700, color: 'var(--primary-container)' }}
                >
                  {formatUSD(p.value)}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--on-surface-variant)',
                    marginTop: '6px',
                  }}
                >
                  {formatNumber(p.shares, 4)} shares · share price {p.sharePrice.toFixed(4)}
                  {p.pendingShares > 0 && ` · ${formatNumber(p.pendingShares, 4)} pending exit`}
                  {p.claimableShares > 0 && ` · ${formatNumber(p.claimableShares, 4)} claimable`}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </motion.div>

      {/* Redemption queue requests */}
      <motion.div variants={itemVariants} style={{ marginBottom: 'var(--outlet-gap)', padding: '0 var(--spacing-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionTitle>Redemption Requests</SectionTitle>
          <Button variant="secondary" size="sm">
            <Link to="/queue" style={{ color: 'inherit', textDecoration: 'none' }}>
              Go to Queue
            </Link>
          </Button>
        </div>
        <GlassCard level={1} glow={false}>
          {queueRequests.length === 0 ? (
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
              No open redemption requests — patient exits appear here while they wait for
              issuer settlement.
            </p>
          ) : (
            <DataTable
              columns={queueColumns}
              data={queueRequests.map((r) => ({
                id: `${r.asset.id}-${r.epoch}`,
                asset: <Chip variant="asset" value={r.asset.symbol} size="sm" />,
                epoch: String(r.epoch),
                shares: formatNumber(r.shares, 4),
                status: (
                  <Chip
                    variant="default"
                    size="sm"
                    value={r.status}
                    style={
                      r.status === 'Claimable'
                        ? { borderColor: '#00ffa3', color: '#00ffa3' }
                        : { borderColor: '#ffdc71', color: '#ffdc71' }
                    }
                  />
                ),
                payout: r.estPayout != null ? formatUSD(r.estPayout) : '—',
              }))}
            />
          )}
        </GlassCard>
      </motion.div>

      {/* My activity */}
      <motion.div variants={itemVariants} style={{ padding: '0 var(--spacing-xs)' }}>
        <SectionTitle>My Trades</SectionTitle>
        <GlassCard level={1} glow={false}>
          {myTrades.length === 0 ? (
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
              No trades from this wallet in the recent history — instant exits and buys
              land here.
            </p>
          ) : (
            <DataTable
              columns={tradeColumns}
              data={myTrades.map((trade) => ({
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
                    className="tx-hash"
                    style={{
                      color: 'var(--primary-container)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatAddress(trade.txHash, 6, 4)} ↗
                  </a>
                ),
              }))}
            />
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default PortfolioPage;
