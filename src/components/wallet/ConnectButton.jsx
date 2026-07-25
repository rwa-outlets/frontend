import { useState, useRef, useEffect } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useBalance,
  useEnsName,
  useEnsAvatar,
} from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { formatUnits } from 'viem';
import { normalize } from 'viem/ens';
import Button from '../ui/Button';
import { CHAIN } from '../../lib/wagmi';
import { EXPLORER_URL } from '../../lib/contracts';
import { formatAddress } from '../../utils/formatters';

const safeNormalize = (name) => {
  try {
    return normalize(name);
  } catch {
    return undefined;
  }
};

/**
 * ConnectButton — wallet auth entry point.
 *
 * States:
 * - disconnected → "Connect Wallet" (injected / EIP-6963 wallets)
 * - connected on wrong chain → "Switch to Sepolia"
 * - connected → ENS name (or truncated address) with a small dropdown
 *   (Etherscan, copy, disconnect)
 */
const ConnectButton = () => {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { data: ethBalance } = useBalance({ address, chainId: CHAIN.id });

  // ENS lives on mainnet — resolve there even though the outlet stack runs
  // on Sepolia (wagmi config already includes mainnet for the Uniswap lane).
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });
  const normalizedEnsName = ensName ? safeNormalize(ensName) : undefined;
  const { data: ensAvatar } = useEnsAvatar({
    name: normalizedEnsName,
    chainId: mainnet.id,
    query: { enabled: Boolean(normalizedEnsName) },
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!isConnected) {
    const injectedConnector =
      connectors.find((c) => c.id === 'injected') ?? connectors[0];
    return (
      <Button
        variant="primary"
        size="sm"
        loading={isConnecting}
        onClick={() => {
          if (!injectedConnector) {
            window.open('https://metamask.io/download/', '_blank');
            return;
          }
          connect({ connector: injectedConnector });
        }}
      >
        <span style={{ fontSize: '14px' }}>👛</span>
        <span>Connect Wallet</span>
      </Button>
    );
  }

  if (chainId !== CHAIN.id) {
    return (
      <Button
        variant="danger"
        size="sm"
        loading={isSwitching}
        onClick={() => switchChain({ chainId: CHAIN.id })}
      >
        Switch to Sepolia
      </Button>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <Button variant="ghost" size="sm" onClick={() => setMenuOpen((v) => !v)}>
        {ensAvatar ? (
          <img
            src={ensAvatar}
            alt={`${ensName} avatar`}
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'inline-block',
              objectFit: 'cover',
            }}
          />
        ) : (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--neon-green, #00ffa3)',
              display: 'inline-block',
            }}
          />
        )}
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          {ensName || formatAddress(address)}
        </span>
      </Button>

      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '220px',
            background: 'var(--surface-container-low)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--rounded-md, 12px)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
            padding: 'var(--spacing-sm)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            style={{
              padding: 'var(--spacing-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--on-surface-variant)',
              borderBottom: '1px solid var(--border-glass)',
            }}
          >
            {ensName && (
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--on-surface)',
                  marginBottom: '4px',
                }}
              >
                {ensName}
              </div>
            )}
            <div>{formatAddress(address, 10, 8)}</div>
            <div style={{ marginTop: '4px', color: 'var(--primary-container)' }}>
              {ethBalance
                ? `${Number(formatUnits(ethBalance.value, ethBalance.decimals)).toFixed(4)} ${ethBalance.symbol}`
                : '…'}{' '}
              · Sepolia
            </div>
          </div>

          <MenuItem
            label={copied ? 'Copied ✓' : 'Copy address'}
            onClick={() => {
              navigator.clipboard.writeText(address);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          />
          <MenuItem
            label="View on Etherscan ↗"
            onClick={() => window.open(`${EXPLORER_URL}/address/${address}`, '_blank')}
          />
          <MenuItem
            label="Disconnect"
            danger
            onClick={() => {
              setMenuOpen(false);
              disconnect();
            }}
          />
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    style={{
      display: 'block',
      width: '100%',
      textAlign: 'left',
      padding: 'var(--spacing-sm)',
      background: 'transparent',
      border: 'none',
      borderRadius: 'var(--rounded-sm, 8px)',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: danger ? 'var(--error, #ffb4ab)' : 'var(--on-surface)',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-glass, rgba(255,255,255,0.05))')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    {label}
  </button>
);

export default ConnectButton;
