import { useAccount } from 'wagmi';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import TxStatus from '../wallet/TxStatus';
import { formatUSD } from '../../utils/formatters';
import { MAINNET_TWINS, UNISWAP_LANE_EXPLORER } from '../../data/uniswapLane';
import { useUniswapLaneQuote, useUniswapLaneExecute } from '../../hooks/useUniswapLane';

/**
 * UniswapLaneCard — the Uniswap API secondary-market lane beside the outlet
 * swap widget (docs/02-engine-spec.md §6, production path of the v4 fallback
 * venue). Quotes the demo asset's mainnet production twin live through the
 * Uniswap Trading API for the same size the user typed, compares it against
 * the outlet's best-of quote, and can execute the twin swap end-to-end
 * (approval → quote → permit signature → swap) with the connected wallet.
 */
const UniswapLaneCard = ({ assetId, direction, sendAmount, outletRate }) => {
  const { isConnected } = useAccount();
  const twin = MAINNET_TWINS[assetId];
  const quote = useUniswapLaneQuote(assetId, direction, sendAmount);
  const exec = useUniswapLaneExecute();

  if (!twin) return null;

  const amountNum = Number(sendAmount);
  const hasAmount = Number.isFinite(amountNum) && amountNum > 0;
  const data = quote.data;

  // + means the Uniswap lane pays a better rate than the outlet quote
  const deltaBps =
    data?.available && outletRate
      ? Math.round(
          (((direction === 'exit' ? 1 : -1) * (data.rate - outletRate)) / outletRate) * 10_000,
        )
      : null;

  const routingLabel = data?.gasless ? `${data.routing} · UniswapX (gasless)` : data?.routing;

  return (
    <GlassCard level={1} glow={false}>
      <div style={{ padding: 'var(--spacing-lg)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--primary)',
              margin: 0,
            }}
          >
            Uniswap Secondary Lane
          </h3>
          <Chip variant="pool" value="Trading API · mainnet" size="sm" />
        </div>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--on-surface-variant)',
            marginBottom: 'var(--spacing-md)',
            lineHeight: 1.5,
          }}
        >
          Production twin of this demo asset:{' '}
          <a
            href={`${UNISWAP_LANE_EXPLORER}/token/${twin.address}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--primary-container)' }}
          >
            {twin.symbol} ({twin.issuer}) ↗
          </a>
          {' — '}
          {twin.note} Quoted live via the Uniswap Trading API; the router fills here when it
          beats the outlet pools.
        </p>

        {!hasAmount && (
          <Info>Enter an amount above to compare the Uniswap route for {twin.symbol}/USDC.</Info>
        )}

        {hasAmount && quote.isLoading && <Info>Quoting {twin.symbol}/USDC via Uniswap API…</Info>}

        {hasAmount && quote.isError && (
          <Info>Uniswap API unreachable — check the /api/uniswap proxy and UNISWAP_API_KEY.</Info>
        )}

        {hasAmount && data && !data.available && (
          <Info>
            {data.reason === 'no-key'
              ? 'No Uniswap API key configured — set UNISWAP_API_KEY (developers.uniswap.org) and restart.'
              : `No Uniswap route for ${twin.symbol}/USDC at this size right now.`}
          </Info>
        )}

        {hasAmount && data?.available && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            <Row
              label={direction === 'exit' ? 'You would receive' : 'You would get'}
              value={`${data.out.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${
                direction === 'exit' ? 'USDC' : twin.symbol
              }`}
              strong
            />
            <Row label="Implied rate" value={`${formatUSD(data.rate, 4)} / ${twin.symbol}`} />
            <Row label="Routing" value={routingLabel} />
            <Row
              label="Gas"
              value={data.gasless ? 'paid by filler' : data.gasFeeUSD ? `$${Number(data.gasFeeUSD).toFixed(2)}` : '—'}
            />
            {deltaBps !== null && (
              <Row
                label="vs outlet quote"
                value={
                  <span
                    style={{
                      color: deltaBps > 0 ? 'var(--neon-green, #00ffa3)' : 'var(--neon-gold, #ffd54a)',
                    }}
                  >
                    {deltaBps >= 0 ? '+' : ''}
                    {deltaBps} bps {deltaBps > 0 ? '· Uniswap wins' : '· outlet pools win'}
                  </span>
                }
              />
            )}
          </div>
        )}

        <Button
          variant="secondary"
          size="md"
          fullWidth
          disabled={!isConnected || !hasAmount || !data?.available || exec.status === 'pending'}
          loading={exec.status === 'pending'}
          onClick={() => exec.run({ assetId, direction, amountInput: sendAmount })}
        >
          {!isConnected
            ? 'Connect wallet to swap via Uniswap'
            : !hasAmount
              ? 'Enter an amount above to enable'
              : hasAmount && quote.isLoading
                ? `Quoting ${twin.symbol}/USDC…`
                : data && !data.available
                  ? 'No Uniswap route right now'
                  : direction === 'exit'
                    ? `Sell ${twin.symbol} via Uniswap`
                    : `Buy ${twin.symbol} via Uniswap`}
        </Button>
        <div
          style={{
            marginTop: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--on-surface-variant)',
            textAlign: 'center',
          }}
        >
          executes the twin pair on Ethereum mainnet with your wallet
        </div>

        <div style={{ marginTop: 'var(--spacing-sm)' }}>
          <TxStatus
            status={exec.status}
            step={exec.step}
            errorMessage={exec.errorMessage}
            txHash={exec.txHash}
            successLabel="Uniswap swap executed"
            explorerUrl={UNISWAP_LANE_EXPLORER}
          />
        </div>
      </div>
    </GlassCard>
  );
};

const Info = ({ children }) => (
  <div
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color: 'var(--on-surface-variant)',
      padding: 'var(--spacing-md) 0',
    }}
  >
    {children}
  </div>
);

const Row = ({ label, value, strong = false }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        fontSize: strong ? '15px' : '12px',
        fontWeight: strong ? '700' : '500',
        color: 'var(--primary)',
      }}
    >
      {value}
    </span>
  </div>
);

export default UniswapLaneCard;
