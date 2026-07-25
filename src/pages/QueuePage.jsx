import { useState } from 'react';
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
import Modal from '../components/ui/Modal';
import TxStatus from '../components/wallet/TxStatus';
import FaucetButton from '../components/wallet/FaucetButton';
import KycGrantCard from '../components/wallet/KycGrantCard';
import { formatUSD, formatTimeAgo } from '../utils/formatters';
import { RWA_ASSETS, RWA_LIST, EXPLORER_URL } from '../lib/contracts';
import { redemptionQueueAbi } from '../lib/abis';
import {
  useQueueData,
  useNavs,
  useTokenBalances,
  useKyc,
  useKycAdmin,
} from '../hooks/useOutletData';
import { useTxFlow } from '../hooks/useTxFlow';
import { statusColors } from '../theme/tokens';

/**
 * QueuePage — the ERC-7540 RedemptionQueue per asset.
 *
 * Patient exit: escrow RWA into the current issuer batch epoch
 * (requestRedeem), wait for the curator to submit + the issuer to settle at
 * NAV, then claim USDC (redeem — standard 4626 claim leg, FIFO epochs).
 */

const QueuePage = () => {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  const [selectedAsset, setSelectedAsset] = useState('rwaTBILL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [activeTab, setActiveTab] = useState('my-requests');
  const [claimingAsset, setClaimingAsset] = useState(null);

  const asset = RWA_ASSETS[selectedAsset];
  // Both queues at once — "My Requests" aggregates every delayed redemption item
  const queueByAsset = {
    rwaTBILL: useQueueData('rwaTBILL'),
    rwaCREDIT: useQueueData('rwaCREDIT'),
  };
  const { data: queue } = queueByAsset[selectedAsset];
  const { navs } = useNavs();
  const { balances } = useTokenBalances();
  // Product rule: instant pool exits are open to everyone; the delayed
  // (queue / NAV settlement) lane is the compliance lane and needs the pass.
  const { hasKyc } = useKyc();
  const { canGrant } = useKycAdmin();
  const requestFlow = useTxFlow();
  const claimFlow = useTxFlow();

  const nav = navs[selectedAsset]?.nav ?? 0;
  const balance = balances[selectedAsset]?.value ?? 0;
  const amountNum = Number(requestAmount);
  const validAmount = Number.isFinite(amountNum) && amountNum > 0 && amountNum <= balance;

  // Every delayed redemption item across both queues, claimables first
  const allRequests = RWA_LIST.flatMap((a) => {
    const q = queueByAsset[a.id].data;
    return (q?.user?.requests ?? []).map((r) => ({ ...r, asset: a }));
  }).sort(
    (x, y) =>
      (x.status === 'Claimable' ? 0 : 1) - (y.status === 'Claimable' ? 0 : 1) ||
      (y.settledAt || y.submittedAt) - (x.settledAt || x.submittedAt) ||
      y.epoch - x.epoch,
  );
  const requestsLoading = queueByAsset.rwaTBILL.isLoading || queueByAsset.rwaCREDIT.isLoading;

  const submitRequest = async () => {
    if (!validAmount || !address || !hasKyc) return;
    const sharesRaw = parseUnits(String(requestAmount), asset.decimals);

    const ok = await requestFlow.run(async ({ writeAndWait, ensureAllowance }) => {
      await ensureAllowance({
        token: asset.address,
        owner: address,
        spender: asset.queue,
        amount: sharesRaw,
        symbol: asset.symbol,
      });
      await writeAndWait(`Queueing ${asset.symbol} for NAV settlement…`, {
        address: asset.queue,
        abi: redemptionQueueAbi,
        functionName: 'requestRedeem',
        args: [sharesRaw, address, address],
      });
    });

    if (ok) {
      setRequestAmount('');
      queryClient.invalidateQueries();
      setTimeout(() => {
        setIsCreateModalOpen(false);
        requestFlow.reset();
      }, 2000);
    }
  };

  const claimAll = async (claimAsset, claimQueue) => {
    if (!claimQueue?.user?.claimableSharesRaw || !address) return;
    setClaimingAsset(claimAsset.id);
    const ok = await claimFlow.run(async ({ writeAndWait }) => {
      await writeAndWait(`Claiming settled USDC from the ${claimAsset.symbol} queue…`, {
        address: claimAsset.queue,
        abi: redemptionQueueAbi,
        functionName: 'redeem',
        args: [claimQueue.user.claimableSharesRaw, address, address],
      });
    });
    if (ok) queryClient.invalidateQueries();
  };

  const requestColumns = [
    { key: 'asset', header: 'Asset', sortable: false },
    { key: 'epoch', header: 'Epoch', sortable: false },
    { key: 'amount', header: 'Amount', sortable: false, align: 'right' },
    { key: 'status', header: 'Status', sortable: false },
    { key: 'settlement', header: 'Settlement', sortable: false, align: 'right' },
    { key: 'payout', header: 'Payout (est.)', sortable: false, align: 'right' },
  ];

  const epochColumns = [
    { key: 'epoch', header: 'Epoch', sortable: false },
    { key: 'state', header: 'State', sortable: false },
    { key: 'shares', header: 'Batched Shares', sortable: false, align: 'right' },
    { key: 'nav', header: 'NAV at Settle', sortable: false, align: 'right' },
    { key: 'timing', header: 'Timing', sortable: false, align: 'right' },
  ];

  return (
    <div className="page-content stagger-children">
      {/* Header */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-lg)',
            flexWrap: 'wrap',
            gap: 'var(--spacing-lg)',
          }}
        >
          <div>
            <h1 className="text-headline-lg">Redemption Queue</h1>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              ERC-7540 issuer-batch epochs — settle at full NAV and earn the price of patience
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              requestFlow.reset();
              setIsCreateModalOpen(true);
            }}
            disabled={!isConnected}
          >
            + Create Request
          </Button>
        </div>
      </motion.div>

      {/* Compliance desk — only for the ComplianceNFT owner/operator wallet */}
      {canGrant && (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          style={{ marginBottom: 'var(--spacing-lg)' }}
        >
          <KycGrantCard />
        </motion.div>
      )}

      {/* Asset (queue) selector */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-lg)',
            flexWrap: 'wrap',
          }}
        >
          {RWA_LIST.map((a) => (
            <Button
              key={a.id}
              variant={selectedAsset === a.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedAsset(a.id)}
            >
              <span>{a.logo}</span>
              <span>{a.symbol} queue</span>
            </Button>
          ))}
          <a
            href={`${EXPLORER_URL}/address/${asset.queue}`}
            target="_blank"
            rel="noreferrer"
            style={{
              alignSelf: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--on-surface-variant)',
              textDecoration: 'none',
            }}
          >
            contract ↗
          </a>
        </div>
      </motion.div>

      {/* Claimable banners — one per queue with settled shares */}
      {RWA_LIST.map((a) => {
        const q = queueByAsset[a.id].data;
        const claimable = q?.user?.claimableShares ?? 0;
        if (claimable <= 0) return null;
        return (
          <motion.div
            key={`claim-${a.id}`}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            style={{ marginBottom: 'var(--spacing-md)' }}
          >
            <GlassCard level={1} glow={true}>
              <div
                style={{
                  padding: 'var(--spacing-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-md)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'var(--primary)',
                    }}
                  >
                    {a.logo} {a.symbol} settlement ready to claim
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--on-surface-variant)',
                      marginTop: '4px',
                    }}
                  >
                    {claimable.toLocaleString('en-US', { maximumFractionDigits: 4 })} {a.symbol}{' '}
                    settled — pays NAV at settlement minus {q?.queueFeeBps ?? 5} bps queue fee
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  loading={claimFlow.status === 'pending' && claimingAsset === a.id}
                  disabled={claimFlow.status === 'pending'}
                  onClick={() => claimAll(a, q)}
                >
                  Claim USDC
                </Button>
              </div>
              {claimFlow.status !== 'idle' && claimingAsset === a.id && (
                <div style={{ padding: '0 var(--spacing-lg) var(--spacing-lg)' }}>
                  <TxStatus
                    status={claimFlow.status}
                    step={claimFlow.step}
                    errorMessage={claimFlow.errorMessage}
                    txHash={claimFlow.txHash}
                    successLabel="Claimed"
                  />
                </div>
              )}
            </GlassCard>
          </motion.div>
        );
      })}

      {/* Tabs */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            margin: 'var(--spacing-lg) 0 var(--spacing-xl)',
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: 'var(--spacing-md)',
          }}
        >
          <Button
            variant={activeTab === 'my-requests' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('my-requests')}
          >
            All My Redemptions ({allRequests.length})
          </Button>
          <Button
            variant={activeTab === 'epochs' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('epochs')}
          >
            Epoch Pipeline
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('stats')}
          >
            Queue Stats
          </Button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        {activeTab === 'my-requests' && (
          <>
            {!isConnected ? (
              <EmptyState
                icon="👛"
                title="Connect Your Wallet"
                body="Connect a wallet to see and create redemption requests."
              />
            ) : requestsLoading ? (
              <EmptyState icon="⏳" title="Loading" body="Reading queue state from Sepolia…" />
            ) : allRequests.length === 0 ? (
              <EmptyState
                icon="📄"
                title="No Requests Yet"
                body="Queue your RWAs for settlement at full NAV — requests appear here with their epoch status."
                action={
                  <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
                    Create Your First Request
                  </Button>
                }
              />
            ) : (
              <GlassCard level={1} glow={false} padding="0">
                <DataTable
                  columns={requestColumns}
                  data={allRequests.map((request) => ({
                    id: `${request.asset.id}-epoch-${request.epoch}`,
                    asset: (
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600 }}>
                        {request.asset.logo} {request.asset.symbol}
                      </span>
                    ),
                    epoch: (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                        #{request.epoch}
                      </span>
                    ),
                    amount: (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          {request.shares.toLocaleString('en-US', { maximumFractionDigits: 4 })}{' '}
                          {request.asset.symbol}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--on-surface-variant)',
                          }}
                        >
                          ≈ {formatUSD(
                            request.shares *
                              (request.navAtSettle || (navs[request.asset.id]?.nav ?? 0)),
                          )}
                        </div>
                      </div>
                    ),
                    status: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StatusDot status={request.status.toLowerCase()} size="sm" />
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color:
                              statusColors[request.status.toLowerCase()]?.text ||
                              'var(--on-surface-variant)',
                          }}
                        >
                          {request.status}
                        </span>
                      </div>
                    ),
                    settlement:
                      request.status === 'Claimable'
                        ? `settled ${formatTimeAgo(request.settledAt * 1000)}`
                        : request.submittedAt > 0
                          ? `submitted ${formatTimeAgo(request.submittedAt * 1000)}`
                          : `epoch #${request.epoch} open`,
                    payout: request.estPayout
                      ? formatUSD(request.estPayout)
                      : `≈ ${formatUSD(request.shares * (navs[request.asset.id]?.nav ?? 0))} at NAV`,
                  }))}
                />
              </GlassCard>
            )}
          </>
        )}

        {activeTab === 'epochs' && (
          <GlassCard level={1} glow={false} padding="0">
            {(queue?.epochs ?? []).length === 0 ? (
              <EmptyState icon="🗂" title="No Epochs" body="The queue has no batches yet." flat />
            ) : (
              <DataTable
                columns={epochColumns}
                data={queue.epochs.map((e) => ({
                  id: `e-${e.epoch}`,
                  epoch: (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      #{e.epoch}
                      {e.isOpen && (
                        <Chip variant="default" value="open" size="sm" style={{ marginLeft: '8px' }} />
                      )}
                    </span>
                  ),
                  state: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StatusDot
                        status={e.state === 'Claimable' ? 'claimable' : 'pending'}
                        size="sm"
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {e.isOpen ? 'Accepting requests' : e.state}
                      </span>
                    </div>
                  ),
                  shares: `${e.totalShares.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${asset.symbol}`,
                  nav: e.navAtSettle > 0 ? formatUSD(e.navAtSettle, 4) : '—',
                  timing:
                    e.state === 'Claimable'
                      ? `settled ${formatTimeAgo(e.settledAt * 1000)}`
                      : e.submittedAt > 0
                        ? `submitted ${formatTimeAgo(e.submittedAt * 1000)}`
                        : '—',
                }))}
              />
            )}
          </GlassCard>
        )}

        {activeTab === 'stats' && queue && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)',
            }}
          >
            <StatCard
              title="Open Epoch"
              value={`#${queue.currentEpoch}`}
              hint={`${(queue.epochs.find((e) => e.isOpen)?.totalShares ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${asset.symbol} pending`}
            />
            <StatCard
              title="Settlement Cash Held"
              value={formatUSD(queue.totalAssets)}
              hint="claims pay only from received settlement — structurally solvent"
            />
            <StatCard
              title="Last Settled NAV"
              value={queue.lastSettledNav > 0 ? formatUSD(queue.lastSettledNav, 4) : '—'}
              hint={`last settled epoch #${queue.lastSettledEpoch}`}
            />
            <StatCard
              title="Issuer Window"
              value={`${queue.issuerWindowSec}s`}
              hint={`compressed demo of ${asset.settlement} · queue fee ${queue.queueFeeBps} bps`}
            />
          </div>
        )}
      </motion.div>

      {/* Create Request Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Redemption Request"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
            Your {asset.symbol} is escrowed into the current issuer batch epoch. When the issuer
            settles, you claim <strong>full NAV at settlement</strong> minus a{' '}
            {queue?.queueFeeBps ?? 5} bps queue fee.
          </p>

          {/* Delayed lane is compliance-gated; instant pool exits stay open */}
          {isConnected && !hasKyc && (
            <GlassCard level={2} glow={false}>
              <div
                style={{
                  padding: 'var(--spacing-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--spacing-md)',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffb4ab',
                    }}
                  >
                    KYC pass required
                  </div>
                  <div
                    className="text-body-md"
                    style={{ color: 'var(--on-surface-variant)', fontSize: '13px', marginTop: '2px' }}
                  >
                    Settling at full NAV is the compliance lane — your wallet needs the soulbound
                    KYC pass. Instant redemption through the pools stays open without it.
                  </div>
                </div>
                <FaucetButton size="sm" />
              </div>
            </GlassCard>
          )}

          {/* Asset Selection */}
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
              Select Asset
            </label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              {RWA_LIST.map((a) => (
                <Button
                  key={a.id}
                  variant={selectedAsset === a.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedAsset(a.id)}
                >
                  <span>{a.logo}</span>
                  <span>{a.symbol}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
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
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              placeholder="0"
              suffix={asset.symbol}
              type="number"
              error={
                requestAmount && amountNum > balance
                  ? `Insufficient balance (${balance.toLocaleString('en-US', { maximumFractionDigits: 4 })})`
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
                Balance: {balance.toLocaleString('en-US', { maximumFractionDigits: 4 })} {asset.symbol}
              </span>
              {balance > 0 && (
                <button
                  onClick={() => setRequestAmount(String(balance))}
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

          {/* Request preview */}
          <GlassCard level={2} glow={false}>
            <div style={{ padding: 'var(--spacing-md)' }}>
              <PreviewRow label="Current NAV" value={nav ? formatUSD(nav, 4) : '—'} />
              <PreviewRow
                label="Files into epoch"
                value={queue ? `#${queue.currentEpoch}` : '—'}
              />
              <PreviewRow
                label="Issuer window"
                value={`${queue?.issuerWindowSec ?? '—'}s (demo of ${asset.settlement})`}
              />
              <PreviewRow
                label="Est. payout at today's NAV"
                value={
                  validAmount
                    ? formatUSD(amountNum * nav * (1 - (queue?.queueFeeBps ?? 5) / 10_000))
                    : '—'
                }
                last
              />
            </div>
          </GlassCard>

          <TxStatus
            status={requestFlow.status}
            step={requestFlow.step}
            errorMessage={requestFlow.errorMessage}
            txHash={requestFlow.txHash}
            successLabel="Request filed into the epoch"
          />

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isConnected || !hasKyc || !validAmount || requestFlow.status === 'pending'}
            loading={requestFlow.status === 'pending'}
            onClick={submitRequest}
          >
            {!isConnected
              ? 'Connect wallet first'
              : !hasKyc
                ? 'KYC pass required'
                : 'Submit to Queue'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

const EmptyState = ({ icon, title, body, action, flat = false }) => (
  <GlassCard level={flat ? 2 : 1} glow={false}>
    <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-md)', opacity: 0.5 }}>{icon}</div>
      <h3 className="text-headline-lg" style={{ fontSize: '20px', marginBottom: 'var(--spacing-sm)' }}>
        {title}
      </h3>
      <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
        {body}
      </p>
      {action && <div style={{ marginTop: 'var(--spacing-lg)' }}>{action}</div>}
    </div>
  </GlassCard>
);

const StatCard = ({ title, value, hint }) => (
  <GlassCard level={1} glow={false}>
    <div style={{ padding: 'var(--spacing-lg)' }}>
      <h3
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: '500',
          color: 'var(--on-surface)',
          marginBottom: 'var(--spacing-md)',
        }}
      >
        {title}
      </h3>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--primary)',
        }}
      >
        {value}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--on-surface-variant)',
          marginTop: '4px',
        }}
      >
        {hint}
      </p>
    </div>
  </GlassCard>
);

const PreviewRow = ({ label, value, last = false }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
      marginBottom: last ? 0 : '6px',
    }}
  >
    <span style={{ color: 'var(--on-surface-variant)' }}>{label}</span>
    <span style={{ color: 'var(--on-surface)' }}>{value}</span>
  </div>
);

export default QueuePage;
