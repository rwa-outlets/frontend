import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'viem';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import StatusDot from '../components/ui/StatusDot';
import InputField from '../components/ui/InputField';
import Modal from '../components/ui/Modal';
import TxStatus from '../components/wallet/TxStatus';
import { formatUSD, formatAddress } from '../utils/formatters';
import { VAULT_LIST, VAULTS, USDC, EXPLORER_URL } from '../lib/contracts';
import { curatorVaultAbi } from '../lib/abis';
import { poolTypes, poolTypeName } from '../data/poolTypes';
import { useVaultData, useLivePools, useTokenBalances } from '../hooks/useOutletData';
import { useTxFlow } from '../hooks/useTxFlow';

/**
 * VaultPage — CuratorVault per risk tier (ERC-4626 in / ERC-7540 out).
 *
 * LPs deposit USDC only; the curator (AI agent) ships pool strategies to Aqua
 * from the vault treasury. Exits are async: requestRedeem escrows shares into
 * the open epoch, the curator frees capital and fulfills, then redeem() claims.
 */

const VaultPage = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [activeTier, setActiveTier] = useState('express');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');

  const vaultMeta = VAULTS[activeTier];
  const { data: vaultData, isLoading } = useVaultData(activeTier);
  const { data: allPools = [] } = useLivePools();
  const { balances } = useTokenBalances();
  const depositFlow = useTxFlow();
  const withdrawFlow = useTxFlow();
  const claimFlow = useTxFlow();

  const usdcBalance = balances.USDC?.value ?? 0;
  const sharePrice = vaultData?.sharePrice ?? 1;
  const user = vaultData?.user;

  const vaultPools = allPools.filter((p) => p.vaultId === activeTier);

  const depositNum = Number(depositAmount);
  const validDeposit = Number.isFinite(depositNum) && depositNum > 0 && depositNum <= usdcBalance;

  const withdrawNum = Number(withdrawShares);
  const validWithdraw =
    Number.isFinite(withdrawNum) && withdrawNum > 0 && user && withdrawNum <= user.shares;

  const doDeposit = async () => {
    if (!validDeposit || !address) return;
    const assetsRaw = parseUnits(String(depositAmount), USDC.decimals);

    const ok = await depositFlow.run(async ({ writeAndWait, ensureAllowance }) => {
      await ensureAllowance({
        token: USDC.address,
        owner: address,
        spender: vaultMeta.address,
        amount: assetsRaw,
        symbol: 'USDC',
      });
      await writeAndWait(`Depositing USDC into ${vaultMeta.symbol}…`, {
        address: vaultMeta.address,
        abi: curatorVaultAbi,
        functionName: 'deposit',
        args: [assetsRaw, address],
      });
    });

    if (ok) {
      setDepositAmount('');
      queryClient.invalidateQueries();
      setTimeout(() => {
        setIsDepositModalOpen(false);
        depositFlow.reset();
      }, 2000);
    }
  };

  const doRequestWithdraw = async () => {
    if (!validWithdraw || !address) return;
    const sharesRaw = parseUnits(String(withdrawShares), 18);

    const ok = await withdrawFlow.run(async ({ writeAndWait }) => {
      await writeAndWait('Filing redemption request into the open epoch…', {
        address: vaultMeta.address,
        abi: curatorVaultAbi,
        functionName: 'requestRedeem',
        args: [sharesRaw, address, address],
      });
    });

    if (ok) {
      setWithdrawShares('');
      queryClient.invalidateQueries();
      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        withdrawFlow.reset();
      }, 2000);
    }
  };

  const doClaim = async () => {
    if (!user?.claimableSharesRaw || !address) return;
    const ok = await claimFlow.run(async ({ writeAndWait }) => {
      await writeAndWait('Claiming fulfilled USDC…', {
        address: vaultMeta.address,
        abi: curatorVaultAbi,
        functionName: 'redeem',
        args: [user.claimableSharesRaw, address, address],
      });
    });
    if (ok) queryClient.invalidateQueries();
  };

  return (
    <div className="page-content stagger-children">
      {/* Header */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h1 className="text-headline-lg">Vault</h1>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            Deposit USDC; the curator agent runs the tier&apos;s pools off one shared treasury
          </p>
        </div>
      </motion.div>

      {/* Tier Selector Tabs */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-xl)',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: 'var(--spacing-md)',
            flexWrap: 'wrap',
          }}
        >
          {VAULT_LIST.map((v) => (
            <Button
              key={v.id}
              variant={activeTier === v.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTier(v.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Chip variant="pool" value={v.id} size="sm" />
              <span>{v.name}</span>
              <Chip variant="default" value={v.symbol} size="sm" />
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Deposit Section */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <GlassCard level={1} glow={true}>
          <div
            style={{
              padding: 'var(--spacing-lg)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 'var(--spacing-lg)',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: '260px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  marginBottom: '4px',
                }}
              >
                {vaultMeta.name} ({vaultMeta.symbol})
              </h2>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                {vaultMeta.description}
              </p>

              <div
                style={{
                  margin: 'var(--spacing-lg) 0 0',
                  display: 'flex',
                  gap: 'var(--spacing-xl)',
                  flexWrap: 'wrap',
                }}
              >
                <HeroStat
                  label="Share Price"
                  value={isLoading ? '…' : formatUSD(sharePrice, 4)}
                  accent
                />
                <HeroStat
                  label="Total Assets"
                  value={isLoading ? '…' : formatUSD(vaultData?.totalAssets ?? 0)}
                />
                <HeroStat
                  label="Shares Outstanding"
                  value={
                    isLoading
                      ? '…'
                      : (vaultData?.totalSupplyShares ?? 0).toLocaleString('en-US', {
                          maximumFractionDigits: 0,
                        })
                  }
                />
              </div>
              <div
                style={{
                  marginTop: 'var(--spacing-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                }}
              >
                Share price accrues spreads, AMM fees, and NAV capture across the tier&apos;s pools.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  depositFlow.reset();
                  setIsDepositModalOpen(true);
                }}
                disabled={!isConnected}
              >
                + Deposit USDC
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  withdrawFlow.reset();
                  setIsWithdrawModalOpen(true);
                }}
                disabled={!isConnected || !user || user.shares <= 0}
              >
                → Request Withdrawal
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* My Position Section */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        style={{ margin: 'var(--outlet-gap) 0' }}
      >
        <h2 className="text-headline-lg" style={{ fontSize: '24px', marginBottom: 'var(--spacing-lg)' }}>
          My Position
        </h2>

        {!isConnected ? (
          <GlassCard level={1} glow={false}>
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)', opacity: 0.5 }}>👛</div>
              <h3 className="text-headline-lg" style={{ fontSize: '20px', marginBottom: 'var(--spacing-sm)' }}>
                Connect Your Wallet
              </h3>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                Connect a wallet to view your vault position and deposit USDC.
              </p>
            </div>
          </GlassCard>
        ) : user && (user.shares > 0 || user.pendingShares > 0 || user.claimableShares > 0) ? (
          <GlassCard level={1} glow={false}>
            <div
              style={{
                padding: 'var(--spacing-lg)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--spacing-lg)',
              }}
            >
              <div>
                <PositionLabel text="My Shares" />
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '32px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                  }}
                >
                  {user.shares.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <Chip variant="default" value={vaultMeta.symbol} size="sm" />
              </div>

              <div>
                <PositionLabel text="Current Value" />
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '32px',
                    fontWeight: '700',
                    color: 'var(--primary-container)',
                  }}
                >
                  {formatUSD(user.value)}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--on-surface-variant)',
                    marginTop: '4px',
                  }}
                >
                  at {formatUSD(sharePrice, 4)} / share
                </div>
              </div>

              <div>
                <PositionLabel text="Pending Withdrawal" />
                {user.pendingShares > 0 ? (
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'var(--neon-gold, #ffdd67)',
                      }}
                    >
                      {user.pendingShares.toLocaleString('en-US', { maximumFractionDigits: 2 })} shares
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--on-surface-variant)',
                        marginTop: '4px',
                      }}
                    >
                      epoch #{vaultData?.currentEpoch} — waiting for curator fulfillment
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                    None
                  </div>
                )}
              </div>

              <div>
                <PositionLabel text="Claimable" />
                {user.claimableShares > 0 ? (
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: 'var(--neon-green, #00ffa3)',
                      }}
                    >
                      {user.claimableShares.toLocaleString('en-US', { maximumFractionDigits: 2 })} shares
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={doClaim}
                      loading={claimFlow.status === 'pending'}
                      style={{ marginTop: '8px', width: '100%' }}
                    >
                      Claim USDC
                    </Button>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                    None
                  </div>
                )}
              </div>
            </div>

            {claimFlow.status !== 'idle' && (
              <div style={{ padding: '0 var(--spacing-lg) var(--spacing-lg)' }}>
                <TxStatus
                  status={claimFlow.status}
                  step={claimFlow.step}
                  errorMessage={claimFlow.errorMessage}
                  txHash={claimFlow.txHash}
                  successLabel="USDC claimed"
                />
              </div>
            )}
          </GlassCard>
        ) : (
          <GlassCard level={1} glow={false}>
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)', opacity: 0.5 }}>💰</div>
              <h3 className="text-headline-lg" style={{ fontSize: '20px', marginBottom: 'var(--spacing-sm)' }}>
                No Position Yet
              </h3>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                Deposit USDC to mint {vaultMeta.symbol} shares at the NAV-based share price.
              </p>
              <Button
                variant="primary"
                size="md"
                style={{ marginTop: 'var(--spacing-lg)' }}
                onClick={() => setIsDepositModalOpen(true)}
              >
                Deposit USDC
              </Button>
            </div>
          </GlassCard>
        )}
      </motion.div>

      {/* Vault Stats */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        style={{ marginBottom: 'var(--outlet-gap)' }}
      >
        <h2 className="text-headline-lg" style={{ fontSize: '24px', marginBottom: 'var(--spacing-lg)' }}>
          {vaultMeta.name} Stats
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)',
          }}
        >
          <VaultStatCard label="Total Assets" value={formatUSD(vaultData?.totalAssets ?? 0)} />
          {(vaultData?.perAsset ?? vaultMeta.mandateAssets.map((a) => ({ asset: a, shipped: 0, cap: 0 }))).map(
            (pa) => (
              <VaultStatCard
                key={pa.asset.id}
                label={`Shipped → ${pa.asset.symbol} pools`}
                value={formatUSD(pa.shipped)}
                hint={pa.cap > 0 ? `cap ${formatUSD(pa.cap, 0)}` : undefined}
              />
            ),
          )}
          <VaultStatCard
            label="Open LP Epoch"
            value={vaultData ? `#${vaultData.currentEpoch}` : '…'}
            hint="exits fulfill at realized values"
          />
          <VaultStatCard
            label="Curator (AI agent)"
            value={vaultData?.curator ? formatAddress(vaultData.curator) : '…'}
            hint={`ops fee ${vaultData?.curatorFeeBps ?? '—'} bps · vault ${formatAddress(vaultMeta.address)}`}
            link={`${EXPLORER_URL}/address/${vaultMeta.address}`}
          />
        </div>
      </motion.div>

      {/* Active Pools under this vault */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <h2 className="text-headline-lg" style={{ fontSize: '24px', marginBottom: 'var(--spacing-lg)' }}>
          Active Pools under {vaultMeta.name}
        </h2>

        {vaultPools.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 'var(--spacing-lg)',
            }}
          >
            {vaultPools.map((pool, index) => (
              <GlassCard key={pool.id} level={1} glow={index === 0}>
                <Link
                  to={`/pools/${pool.hash}`}
                  style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}
                >
                  <div style={{ padding: 'var(--spacing-lg)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ fontSize: '28px' }}>{(poolTypes[pool.type] ?? poolTypes.express).icon}</div>
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
                            fontSize: '16px',
                            fontWeight: '700',
                            color: 'var(--primary)',
                          }}
                        >
                          {poolTypeName(pool.type, pool.asset.symbol)}
                        </h3>
                        <StatusDot status={pool.active && pool.listed ? 'active' : 'error'} />
                      </div>
                      <Chip variant="pool" value={pool.type} size="sm" />
                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <PositionLabel text="Shipped TVL" />
                          <div
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '16px',
                              fontWeight: '700',
                              color: 'var(--primary)',
                            }}
                          >
                            {formatUSD(pool.tvl)}
                          </div>
                        </div>
                        <div>
                          <PositionLabel text="USDC / RWA" />
                          <div
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '16px',
                              fontWeight: '700',
                              color: 'var(--neon-green, #00ffa3)',
                            }}
                          >
                            {formatUSD(pool.usdc, 0)} /{' '}
                            {pool.rwa.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard level={1} glow={false}>
            <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                No active pools yet. The curator agent creates pools (createPool → Aqua ship) as
                deposits arrive and opportunities arise.
              </p>
            </div>
          </GlassCard>
        )}
      </motion.div>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setDepositAmount('');
        }}
        title={`Deposit to ${vaultMeta.name}`}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
            Sync ERC-4626 deposit: mints {vaultMeta.symbol} at the current NAV-based share price.
            Reverts while any held RWA&apos;s NAV is stale — you can never mint against mispriced
            inventory.
          </p>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--on-surface)',
                marginBottom: '6px',
              }}
            >
              Amount
            </label>
            <InputField
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0"
              suffix="USDC"
              type="number"
              error={
                depositAmount && depositNum > usdcBalance ? 'Insufficient USDC balance' : undefined
              }
            />
            <div
              style={{
                marginTop: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--on-surface-variant)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Balance: {usdcBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC</span>
              {usdcBalance > 0 && (
                <button
                  onClick={() => setDepositAmount(String(usdcBalance))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-container)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    padding: 0,
                  }}
                >
                  MAX
                </button>
              )}
            </div>
          </div>

          {validDeposit && (
            <GlassCard level={2} glow={false}>
              <div
                style={{
                  padding: 'var(--spacing-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                  You will receive ≈
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--primary-container)',
                  }}
                >
                  {(depositNum / sharePrice).toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
                  {vaultMeta.symbol}
                </span>
              </div>
            </GlassCard>
          )}

          <TxStatus
            status={depositFlow.status}
            step={depositFlow.step}
            errorMessage={depositFlow.errorMessage}
            txHash={depositFlow.txHash}
            successLabel="Deposited"
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isConnected || !validDeposit || depositFlow.status === 'pending'}
            loading={depositFlow.status === 'pending'}
            onClick={doDeposit}
          >
            Deposit USDC
          </Button>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setWithdrawShares('');
        }}
        title={`Withdraw from ${vaultMeta.name}`}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
            Async ERC-7540 exit: your shares are escrowed into epoch #{vaultData?.currentEpoch}.
            The curator frees capital and fulfills the epoch at realized values, then you claim
            USDC here.
          </p>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--on-surface)',
                marginBottom: '6px',
              }}
            >
              Shares to redeem
            </label>
            <InputField
              value={withdrawShares}
              onChange={(e) => setWithdrawShares(e.target.value)}
              placeholder="0"
              suffix={vaultMeta.symbol}
              type="number"
              error={
                withdrawShares && user && withdrawNum > user.shares
                  ? 'Exceeds your share balance'
                  : undefined
              }
            />
            <div
              style={{
                marginTop: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--on-surface-variant)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>
                Balance: {(user?.shares ?? 0).toLocaleString('en-US', { maximumFractionDigits: 4 })}{' '}
                {vaultMeta.symbol}
              </span>
              {user?.shares > 0 && (
                <button
                  onClick={() => setWithdrawShares(String(user.shares))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-container)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    padding: 0,
                  }}
                >
                  MAX
                </button>
              )}
            </div>
          </div>

          {validWithdraw && (
            <GlassCard level={2} glow={false}>
              <div
                style={{
                  padding: 'var(--spacing-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                  Estimated value at current share price
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--primary-container)',
                  }}
                >
                  ≈ {formatUSD(withdrawNum * sharePrice)}
                </span>
              </div>
            </GlassCard>
          )}

          <TxStatus
            status={withdrawFlow.status}
            step={withdrawFlow.step}
            errorMessage={withdrawFlow.errorMessage}
            txHash={withdrawFlow.txHash}
            successLabel="Redemption requested"
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isConnected || !validWithdraw || withdrawFlow.status === 'pending'}
            loading={withdrawFlow.status === 'pending'}
            onClick={doRequestWithdraw}
          >
            Request Withdrawal
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const HeroStat = ({ label, value, accent = false }) => (
  <div>
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--on-surface-variant)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '4px',
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '24px',
        fontWeight: '700',
        color: accent ? 'var(--primary-container)' : 'var(--primary)',
      }}
    >
      {value}
    </div>
  </div>
);

const PositionLabel = ({ text }) => (
  <div
    style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color: 'var(--on-surface-variant)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '4px',
    }}
  >
    {text}
  </div>
);

const VaultStatCard = ({ label, value, hint, link }) => (
  <GlassCard level={1} glow={false}>
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--on-surface-variant)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--primary)',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--on-surface-variant)',
            marginTop: '4px',
          }}
        >
          {link ? (
            <a href={link} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
              {hint} ↗
            </a>
          ) : (
            hint
          )}
        </div>
      )}
    </div>
  </GlassCard>
);

export default VaultPage;
