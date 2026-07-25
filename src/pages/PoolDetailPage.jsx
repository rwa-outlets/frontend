import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'viem';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import StatusDot from '../components/ui/StatusDot';
import InputField from '../components/ui/InputField';
import DataTable from '../components/ui/DataTable';
import DirectionChip from '../components/ui/DirectionChip';
import TxStatus from '../components/wallet/TxStatus';
import UniswapLaneCard from '../components/pools/UniswapLaneCard';
import { formatUSD, formatAddress, formatTimeAgo } from '../utils/formatters';
import { poolTypes, poolTypeName } from '../data/poolTypes';
import { ADDRESSES, USDC, EXPLORER_URL } from '../lib/contracts';
import { outletRouterAbi } from '../lib/abis';
import {
  useLivePools,
  useNavs,
  useTokenBalances,
  useSwapQuote,
  useTradeHistory,
} from '../hooks/useOutletData';
import { useTxFlow } from '../hooks/useTxFlow';

/**
 * PoolDetailPage — one live pool (strategyHash) with the instant swap widget.
 *
 * Swaps execute through OutletRouter.redeemInstant()/buy(), which re-quotes all
 * listings and fills the best one — the same best-of quote shown here.
 */

const SLIPPAGE_BPS = 50n;

const PoolDetailPage = () => {
  const { poolId } = useParams();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const { data: pools = [], isLoading: poolsLoading } = useLivePools();
  const { navs } = useNavs();
  const { balances } = useTokenBalances();
  const txFlow = useTxFlow();

  const [sendAmount, setSendAmount] = useState('');
  const [direction, setDirection] = useState('exit');

  const pool = pools.find((p) => p.hash.toLowerCase() === String(poolId).toLowerCase());
  const asset = pool?.asset;
  const navInfo = asset ? navs[asset.id] : null;

  const quote = useSwapQuote(asset?.id, direction, sendAmount);
  const history = useTradeHistory(50);

  if (poolsLoading && !pool) {
    return (
      <div className="page-content">
        <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
          Reading pool from Sepolia…
        </p>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="page-content">
        <h1 className="text-headline-lg">Pool Not Found</h1>
        <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
          No live strategy with hash {formatAddress(poolId, 12, 8)} — it may have been docked.
        </p>
        <Button variant="primary" style={{ marginTop: 'var(--spacing-lg)' }}>
          <Link to="/pools" style={{ color: 'inherit', textDecoration: 'none' }}>
            Back to Pools
          </Link>
        </Button>
      </div>
    );
  }

  const typeInfo = poolTypes[pool.type] ?? poolTypes.express;
  const quoteData = quote.data;
  const amountNum = Number(sendAmount);
  const hasAmount = Number.isFinite(amountNum) && amountNum > 0;

  const sendToken = direction === 'exit' ? asset : USDC;
  const balance = balances[sendToken.id]?.value ?? 0;
  const insufficient = isConnected && hasAmount && amountNum > balance;

  // Discount / premium of the quoted rate vs oracle NAV, in bps
  const rateVsNavBps =
    quoteData?.executable && navInfo?.nav
      ? Math.round(((quoteData.rate - navInfo.nav) / navInfo.nav) * 10_000)
      : null;

  const executeSwap = async () => {
    if (!quoteData?.executable || !address) return;
    const amountRaw = parseUnits(String(sendAmount), sendToken.decimals);
    const minOut = (quoteData.bestOutRaw * (10_000n - SLIPPAGE_BPS)) / 10_000n;

    const ok = await txFlow.run(async ({ writeAndWait, ensureAllowance }) => {
      await ensureAllowance({
        token: sendToken.address,
        owner: address,
        spender: ADDRESSES.OutletRouter,
        amount: amountRaw,
        symbol: sendToken.symbol,
      });
      await writeAndWait(
        direction === 'exit' ? `Selling ${asset.symbol} for USDC…` : `Buying ${asset.symbol}…`,
        {
          address: ADDRESSES.OutletRouter,
          abi: outletRouterAbi,
          functionName: direction === 'exit' ? 'redeemInstant' : 'buy',
          args: [asset.address, amountRaw, minOut],
        },
      );
    });

    if (ok) {
      setSendAmount('');
      queryClient.invalidateQueries();
    }
  };

  const swapDisabledReason = !isConnected
    ? 'Connect wallet to trade'
    : !hasAmount
      ? null
      : insufficient
        ? `Insufficient ${sendToken.symbol} balance`
        : quote.isFetching && !quoteData
          ? null
          : quoteData && !quoteData.executable
            ? direction === 'entry'
              ? 'No entry-side liquidity (needs a Market pool)'
              : 'No executable quote for this size'
            : null;

  const poolTrades = (history.data ?? []).filter(
    (t) => t.orderHash?.toLowerCase() === pool.hash.toLowerCase(),
  );

  const tradeColumns = [
    { key: 'direction', header: 'Direction', sortable: false },
    { key: 'amount', header: 'Amount', sortable: false, align: 'right' },
    { key: 'rate', header: 'Rate', sortable: false, align: 'right' },
    { key: 'time', header: 'Time', sortable: false, align: 'right' },
    { key: 'tx', header: 'Tx', sortable: false, align: 'right' },
  ];

  return (
    <div className="page-content stagger-children">
      {/* Header */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          <Link
            to="/pools"
            style={{ fontSize: '24px', color: 'var(--on-surface-variant)', textDecoration: 'none' }}
          >
            ←
          </Link>
          <div>
            <h1 className="text-headline-lg" style={{ margin: 0 }}>
              {poolTypeName(pool.type, asset.symbol)}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <Chip variant="pool" value={pool.type} size="md" />
              <Chip variant="asset" value={asset.symbol} size="md" />
              <StatusDot status={pool.active && pool.listed ? 'active' : 'error'} />
              <a
                href={`${EXPLORER_URL}/address/${ADDRESSES.OutletRouter}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                }}
              >
                router {formatAddress(ADDRESSES.OutletRouter)} ↗
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 'var(--spacing-xl)',
          marginBottom: 'var(--outlet-gap)',
        }}
      >
        {/* Left Column - Swap Interface */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <GlassCard level={1} glow={true}>
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                Instant Swap
              </h2>

              {/* Direction Toggle */}
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
                <Button
                  variant={direction === 'exit' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setDirection('exit');
                    setSendAmount('');
                    txFlow.reset();
                  }}
                  style={{ flex: 1 }}
                >
                  Exit (Sell {asset.symbol})
                </Button>
                <Button
                  variant={direction === 'entry' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setDirection('entry');
                    setSendAmount('');
                    txFlow.reset();
                  }}
                  style={{ flex: 1 }}
                >
                  Entry (Buy {asset.symbol})
                </Button>
              </div>

              {/* You Send */}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--on-surface-variant)',
                    marginBottom: '6px',
                  }}
                >
                  You Send
                </label>
                <div style={{ position: 'relative' }}>
                  <InputField
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0"
                    suffix={sendToken.symbol}
                    type="number"
                    error={insufficient ? `Insufficient balance` : undefined}
                  />
                  {isConnected && balance > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSendAmount(String(balance))}
                      style={{
                        position: 'absolute',
                        right: '80px',
                        top: '19px',
                        transform: 'translateY(-50%)',
                        fontSize: '11px',
                        padding: '4px 8px',
                      }}
                    >
                      MAX
                    </Button>
                  )}
                </div>
                {isConnected && (
                  <div
                    style={{
                      marginTop: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    Balance: {balance.toLocaleString('en-US', { maximumFractionDigits: 4 })}{' '}
                    {sendToken.symbol}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: 'var(--spacing-md) 0' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--surface-container-low)',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-container)',
                    fontSize: '20px',
                  }}
                >
                  ↓
                </div>
              </div>

              {/* You Receive */}
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--on-surface-variant)',
                    marginBottom: '6px',
                  }}
                >
                  You Receive (router best-of quote)
                </label>
                <InputField
                  value={
                    hasAmount && quoteData?.executable
                      ? quoteData.out.toLocaleString('en-US', {
                          maximumFractionDigits: 6,
                          useGrouping: false,
                        })
                      : ''
                  }
                  onChange={() => {}}
                  placeholder={hasAmount && quote.isFetching ? 'quoting…' : '0'}
                  suffix={direction === 'exit' ? 'USDC' : asset.symbol}
                  type="text"
                  disabled
                />
                {hasAmount && quoteData?.executable && (
                  <div
                    style={{
                      marginTop: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--on-surface-variant)',
                    }}
                  >
                    Rate: {formatUSD(quoteData.rate, 4)} / {asset.symbol}
                    {rateVsNavBps !== null && (
                      <span
                        style={{
                          color:
                            (direction === 'exit' ? rateVsNavBps >= 0 : rateVsNavBps <= 0)
                              ? 'var(--neon-green, #00ffa3)'
                              : 'var(--neon-gold, #ffd54a)',
                        }}
                      >
                        {' '}
                        ({rateVsNavBps >= 0 ? '+' : ''}
                        {rateVsNavBps} bps vs NAV)
                      </span>
                    )}
                    {' · '}max slippage {Number(SLIPPAGE_BPS)} bps
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={
                  !isConnected ||
                  !hasAmount ||
                  insufficient ||
                  !quoteData?.executable ||
                  txFlow.status === 'pending'
                }
                loading={txFlow.status === 'pending' || (hasAmount && quote.isFetching && !quoteData)}
                onClick={executeSwap}
                style={{ marginBottom: 'var(--spacing-sm)' }}
              >
                {direction === 'exit' ? 'Redeem Instantly' : `Buy ${asset.symbol}`}
              </Button>

              {swapDisabledReason && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--on-surface-variant)',
                    textAlign: 'center',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  {swapDisabledReason}
                </div>
              )}

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <TxStatus
                  status={txFlow.status}
                  step={txFlow.step}
                  errorMessage={txFlow.errorMessage}
                  txHash={txFlow.txHash}
                  successLabel="Swap executed"
                />
              </div>

              {/* Queue Option */}
              {direction === 'exit' && (
                <Button variant="ghost" size="lg" fullWidth>
                  <Link to="/queue" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Queue Instead (full NAV, wait {asset.settlement})
                  </Link>
                </Button>
              )}
            </div>
          </GlassCard>

          {/* Uniswap API secondary lane — quotes/executes the asset's mainnet twin */}
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <UniswapLaneCard
              assetId={asset.id}
              direction={direction}
              sendAmount={sendAmount}
              outletRate={quoteData?.executable ? quoteData.rate : null}
            />
          </div>
        </motion.div>

        {/* Right Column - Pool Stats */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <GlassCard level={1} glow={false}>
              <div style={{ padding: 'var(--spacing-lg)' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    marginBottom: 'var(--spacing-lg)',
                  }}
                >
                  Shipped Liquidity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <StatRow label="TVL" value={formatUSD(pool.tvl)} strong />
                  <StatRow label="USDC side" value={formatUSD(pool.usdc)} />
                  <StatRow
                    label={`${asset.symbol} side`}
                    value={pool.rwa.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  />
                  <StatRow label="Maker" value={pool.vaultId ? pool.vaultName : 'Pro maker'} />
                  <StatRow label="Strategy" value={formatAddress(pool.hash, 8, 6)} last />
                </div>
              </div>
            </GlassCard>

            <GlassCard level={1} glow={false}>
              <div style={{ padding: 'var(--spacing-lg)' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    marginBottom: 'var(--spacing-lg)',
                  }}
                >
                  {asset.name} ({asset.symbol})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <StatRow
                    label="Oracle NAV"
                    value={navInfo ? formatUSD(navInfo.nav, 4) : '—'}
                    strong
                  />
                  <StatRow
                    label="NAV updated"
                    value={navInfo ? formatTimeAgo(navInfo.updatedAt * 1000) : '—'}
                  />
                  <StatRow label="Category" value={asset.category} />
                  <StatRow label="Issuer window" value={`${asset.settlement} (compressed demo)`} />
                  <StatRow
                    label="Token"
                    value={
                      <a
                        href={`${EXPLORER_URL}/token/${asset.address}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--primary-container)' }}
                      >
                        {formatAddress(asset.address)} ↗
                      </a>
                    }
                    last
                  />
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>

      {/* Trade History */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <h2 className="text-headline-lg" style={{ fontSize: '24px', marginBottom: 'var(--spacing-lg)' }}>
          Fills Through This Strategy
        </h2>
        <GlassCard level={1} glow={false} padding="0">
          {poolTrades.length === 0 ? (
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                No fills routed through this strategy in the recent block window.
              </p>
            </div>
          ) : (
            <DataTable
              columns={tradeColumns}
              data={poolTrades.map((trade) => ({
                id: trade.id,
                direction: <DirectionChip direction={trade.direction} />,
                amount: `${trade.rwaAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${trade.asset.symbol}`,
                rate: formatUSD(trade.rate, 4),
                time: trade.timestamp ? formatTimeAgo(trade.timestamp * 1000) : '—',
                tx: (
                  <a
                    href={`${EXPLORER_URL}/tx/${trade.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--primary-container)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
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

const StatRow = ({ label, value, strong = false, last = false }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: last ? 0 : 'var(--spacing-sm)',
      borderBottom: last ? 'none' : '1px solid var(--border-glass)',
    }}
  >
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--on-surface-variant)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: strong ? 'var(--font-display)' : 'var(--font-mono)',
        fontSize: strong ? '16px' : '12px',
        fontWeight: strong ? '700' : '500',
        color: 'var(--primary)',
      }}
    >
      {value}
    </span>
  </div>
);

export default PoolDetailPage;
