import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'viem';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import TxStatus from '../components/wallet/TxStatus';
import FaucetButton from '../components/wallet/FaucetButton';
import { formatUSD } from '../utils/formatters';
import { RWA_ASSETS, RWA_LIST, ADDRESSES } from '../lib/contracts';
import { outletRouterAbi, redemptionQueueAbi } from '../lib/abis';
import {
  useSwapQuote,
  useNavs,
  useQueueData,
  useTokenBalances,
  useKyc,
} from '../hooks/useOutletData';
import { useTxFlow } from '../hooks/useTxFlow';

const SLIPPAGE_BPS = 50n;

/**
 * RedeemPage — the app's front door: one Uniswap-style widget with both exit
 * lanes together. Instant fills at the best price across every venue
 * (OutletRouter.quoteInstantAll scans Aqua pools + the Uniswap v4 lane);
 * Delayed queues at full NAV. The better payout is pre-selected automatically.
 */
const RedeemPage = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [assetId, setAssetId] = useState('rwaTBILL');
  const [amount, setAmount] = useState('');
  const [laneOverride, setLaneOverride] = useState(null); // null → auto (best payout)

  const asset = RWA_ASSETS[assetId];
  const { balances } = useTokenBalances();
  const { navs } = useNavs();
  const { data: queue } = useQueueData(assetId);
  const { hasKyc } = useKyc();
  const { data: quote, isFetching: quoting } = useSwapQuote(assetId, 'exit', amount);
  const txFlow = useTxFlow();

  const balance = balances[assetId]?.value ?? 0;
  const nav = navs[assetId]?.nav ?? 0;
  const feeBps = queue?.queueFeeBps ?? 5;
  const amountNum = Number(amount);
  const validAmount = Number.isFinite(amountNum) && amountNum > 0;
  const overBalance = validAmount && amountNum > balance;

  const instantOut = validAmount && quote?.executable ? quote.out : 0;
  const delayedOut = validAmount && nav > 0 ? amountNum * nav * (1 - feeBps / 10_000) : 0;

  // Auto-pick the higher payout; the delayed lane needs the KYC pass to be usable.
  const autoLane = delayedOut > instantOut && hasKyc ? 'delayed' : 'instant';
  const lane = laneOverride ?? autoLane;
  const receiveOut = lane === 'instant' ? instantOut : delayedOut;
  const bestLane = delayedOut > instantOut ? 'delayed' : instantOut > 0 ? 'instant' : null;

  const instantDiscount =
    quote?.executable && nav > 0 ? (quote.rate / nav - 1) * 100 : null;

  const canSubmit =
    isConnected &&
    validAmount &&
    !overBalance &&
    txFlow.status !== 'pending' &&
    (lane === 'instant' ? !!quote?.executable : hasKyc && nav > 0);

  const buttonLabel = !isConnected
    ? 'Connect wallet first'
    : !validAmount
      ? 'Enter an amount'
      : overBalance
        ? 'Insufficient balance'
        : lane === 'instant'
          ? quoting
            ? 'Fetching best price…'
            : quote?.executable
              ? 'Redeem instantly'
              : 'No pool liquidity'
          : !hasKyc
            ? 'KYC pass required'
            : 'Queue at full NAV';

  const execute = async () => {
    if (!canSubmit) return;
    const amountRaw = parseUnits(String(amount), asset.decimals);

    const ok = await txFlow.run(async ({ writeAndWait, ensureAllowance }) => {
      if (lane === 'instant') {
        const minOut = (quote.bestOutRaw * (10_000n - SLIPPAGE_BPS)) / 10_000n;
        await ensureAllowance({
          token: asset.address,
          owner: address,
          spender: ADDRESSES.OutletRouter,
          amount: amountRaw,
          symbol: asset.symbol,
        });
        await writeAndWait(`Selling ${asset.symbol} at the best pool price…`, {
          address: ADDRESSES.OutletRouter,
          abi: outletRouterAbi,
          functionName: 'redeemInstant',
          args: [asset.address, amountRaw, minOut],
        });
      } else {
        await ensureAllowance({
          token: asset.address,
          owner: address,
          spender: asset.queue,
          amount: amountRaw,
          symbol: asset.symbol,
        });
        await writeAndWait(`Queueing ${asset.symbol} for NAV settlement…`, {
          address: asset.queue,
          abi: redemptionQueueAbi,
          functionName: 'requestRedeem',
          args: [amountRaw, address, address],
        });
      }
    });

    if (ok) {
      setAmount('');
      setLaneOverride(null);
      queryClient.invalidateQueries();
    }
  };

  const fmt = (n, d = 4) =>
    n > 0 ? n.toLocaleString('en-US', { maximumFractionDigits: d }) : '0';

  return (
    <div className="page-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '480px', margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
          <h1 className="text-headline-lg">Redeem anytime, either lane.</h1>
          <p
            className="text-body-md"
            style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}
          >
            Instant at the best pool price, or full NAV if you can wait.
          </p>
        </div>

        {/* Sell box */}
        <div style={boxStyle}>
          <div style={boxHeaderStyle}>
            <span>Sell</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              Balance: {fmt(balance)}
              {balance > 0 && (
                <button onClick={() => setAmount(String(balance))} style={maxBtnStyle}>
                  MAX
                </button>
              )}
            </span>
          </div>
          <div style={boxRowStyle}>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              type="number"
              min="0"
              style={bigInputStyle}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              {RWA_LIST.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAssetId(a.id)}
                  style={{
                    ...tokenPillStyle,
                    borderColor:
                      assetId === a.id ? 'var(--primary-container)' : 'var(--border-glass)',
                    background:
                      assetId === a.id ? 'rgba(0, 255, 163, 0.08)' : 'var(--surface-glass)',
                  }}
                >
                  <span>{a.logo}</span>
                  <span>{a.symbol}</span>
                </button>
              ))}
            </div>
          </div>
          {overBalance && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#ffb4ab' }}>
              Insufficient balance
            </div>
          )}
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '-14px 0', position: 'relative', zIndex: 2 }}>
          <div style={arrowStyle}>↓</div>
        </div>

        {/* Receive box */}
        <div style={boxStyle}>
          <div style={boxHeaderStyle}>
            <span>Receive</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              {lane === 'instant' ? 'now' : `after ~${queue?.issuerWindowSec ?? '—'}s settlement`}
            </span>
          </div>
          <div style={boxRowStyle}>
            <div
              style={{
                ...bigInputStyle,
                color: receiveOut > 0 ? 'var(--on-surface)' : 'var(--on-surface-variant)',
              }}
            >
              {fmt(receiveOut, 2)}
            </div>
            <div style={{ ...tokenPillStyle, cursor: 'default' }}>
              <span>💵</span>
              <span>USDC</span>
            </div>
          </div>
        </div>

        {/* Lane selection — auto-selected by best payout, tap to override */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--spacing-sm)',
            margin: 'var(--spacing-md) 0',
          }}
        >
          <LaneTile
            selected={lane === 'instant'}
            onClick={() => setLaneOverride('instant')}
            icon="⚡"
            title="Instant"
            amount={instantOut > 0 ? formatUSD(instantOut) : '—'}
            badge={bestLane === 'instant' ? 'Best price' : null}
            sub={
              quote?.executable
                ? `${quote.rate.toFixed(4)} / ${asset.symbol}${
                    instantDiscount != null ? ` · ${instantDiscount.toFixed(2)}% vs NAV` : ''
                  }${quote.viaV4 ? ' · via Uniswap v4' : ''}`
                : quoting
                  ? 'fetching best pool…'
                  : 'best pool price, settles now'
            }
          />
          <LaneTile
            selected={lane === 'delayed'}
            onClick={() => setLaneOverride('delayed')}
            icon="🕐"
            title="Delayed"
            amount={delayedOut > 0 ? formatUSD(delayedOut) : '—'}
            badge={bestLane === 'delayed' ? 'Best price' : null}
            locked={!hasKyc}
            sub={
              nav > 0
                ? `full NAV ${formatUSD(nav, 4)} − ${feeBps} bps fee${!hasKyc ? ' · needs KYC' : ''}`
                : 'full NAV at settlement'
            }
          />
        </div>

        {/* Delayed lane needs the pass — offer the faucet inline */}
        {lane === 'delayed' && isConnected && !hasKyc && (
          <div style={kycNoteStyle}>
            <span>The NAV settlement lane is compliance-gated.</span>
            <FaucetButton size="sm" />
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canSubmit}
          loading={txFlow.status === 'pending'}
          onClick={execute}
        >
          {txFlow.status === 'pending' && txFlow.step ? txFlow.step : buttonLabel}
        </Button>

        {txFlow.status !== 'idle' && (
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <TxStatus
              status={txFlow.status}
              step={txFlow.step}
              errorMessage={txFlow.errorMessage}
              txHash={txFlow.txHash}
              successLabel={
                lane === 'instant' ? 'Redeemed instantly' : 'Queued for NAV settlement'
              }
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

const LaneTile = ({ selected, onClick, icon, title, amount, sub, badge, locked }) => (
  <button
    onClick={onClick}
    style={{
      textAlign: 'left',
      padding: 'var(--spacing-md)',
      borderRadius: 'var(--rounded-default)',
      border: `1px solid ${selected ? 'var(--primary-container)' : 'var(--border-glass)'}`,
      background: selected ? 'rgba(0, 255, 163, 0.06)' : 'var(--surface-glass)',
      cursor: 'pointer',
      transition: 'all var(--transition-fast)',
      opacity: locked && !selected ? 0.75 : 1,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
        marginBottom: '6px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--on-surface)',
        }}
      >
        {icon} {title}
      </span>
      {badge && (
        <Chip
          variant="default"
          size="sm"
          value={badge}
          style={{
            background: 'rgba(0, 255, 163, 0.1)',
            borderColor: 'rgba(0, 255, 163, 0.5)',
            color: '#00ffa3',
          }}
        />
      )}
    </div>
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        fontWeight: '700',
        color: selected ? 'var(--primary)' : 'var(--on-surface)',
      }}
    >
      {amount}
    </div>
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--on-surface-variant)',
        marginTop: '4px',
        lineHeight: 1.4,
      }}
    >
      {sub}
    </div>
  </button>
);

const boxStyle = {
  background: 'var(--surface-glass)',
  border: '1px solid var(--border-glass)',
  borderRadius: 'var(--rounded-default)',
  padding: 'var(--spacing-md) var(--spacing-lg)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)',
};

const boxHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--on-surface-variant)',
};

const boxRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-md)',
};

const bigInputStyle = {
  flex: 1,
  minWidth: 0,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontFamily: 'var(--font-display)',
  fontSize: '32px',
  fontWeight: '600',
  color: 'var(--on-surface)',
  padding: 0,
};

const tokenPillStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '999px',
  border: '1px solid var(--border-glass)',
  background: 'var(--surface-glass)',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--on-surface)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const arrowStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '10px',
  border: '1px solid var(--border-glass)',
  background: 'var(--surface, #101418)',
  color: 'var(--on-surface)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
};

const kycNoteStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--spacing-md)',
  padding: 'var(--spacing-sm) var(--spacing-md)',
  marginBottom: 'var(--spacing-md)',
  borderRadius: 'var(--rounded-default)',
  border: '1px solid rgba(255, 180, 171, 0.4)',
  background: 'rgba(255, 180, 171, 0.06)',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: '#ffb4ab',
};

export default RedeemPage;
