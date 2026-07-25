import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import StatusDot from '../components/ui/StatusDot';
import InputField from '../components/ui/InputField';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import { formatUSD, formatPercent, formatTokenAmount, formatTimeAgo, formatDate } from '../utils/formatters';
import { queueRequests, assets, pools } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { tokens, statusColors } from '../theme/tokens';

/**
 * QueuePage
 * 
 * Redemption Queue interface with:
 * - Create Request section
 * - My Requests table
 * - Queue Stats
 */

const QueuePage = () => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('rwaTBILL');
  const [requestAmount, setRequestAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('my-requests');

  // User's requests (filter by mock user address)
  const userAddress = '0xCurrentUser11111111111111111111111111';
  const userRequests = queueRequests.filter(r => r.user === userAddress);
  const allRequests = queueRequests;

  // Queue stats
  const queueStats = {
    totalBacklog: queueRequests.filter(r => r.status === 'Pending').length,
    averageSettlementTime: '~45 days',
    nextEpoch: 12346,
    nextEpochTime: '2026-07-26T14:00:00Z',
    totalValue: queueRequests.reduce((sum, r) => sum + r.amountUSDC, 0),
  };

  // Asset options for create request
  const assetOptions = Object.values(assets).filter(a => a.type === 'rwa');

  // Request table columns
  const requestColumns = [
    { key: 'asset', header: 'Asset', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, align: 'right' },
    { key: 'status', header: 'Status', sortable: true },
    { key: 'submitted', header: 'Submitted', sortable: true, align: 'right' },
    { key: 'settlement', header: 'Settlement', sortable: true, align: 'right' },
    { key: 'actions', header: 'Actions', sortable: false },
  ];

  // Create new request
  const handleCreateRequest = async () => {
    if (!selectedAsset || !requestAmount || isNaN(requestAmount) || Number(requestAmount) <= 0) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsCreateModalOpen(false);
    setRequestAmount('');
    setSelectedAsset('rwaTBILL');
    
    // In a real app, you would add the new request to the list
    alert('Request submitted successfully!');
  };

  // Claim request
  const handleClaim = (request) => {
    if (request.status !== 'Claimable') {
      return;
    }
    
    // In a real app, you would call the smart contract
    alert(`Claimed ${request.amountUSDC} USDC from request ${request.id}`);
  };

  return (
    <div className="page-content stagger-children">
      {/* Header */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--spacing-lg)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-lg)',
        }}>
          <div>
            <h1 className="text-headline-lg">Redemption Queue</h1>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Queue for NAV settlement and earn the price of patience
            </p>
          </div>
          <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
            + Create Request
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xl)',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: 'var(--spacing-md)',
        }}>
          <Button
            variant={activeTab === 'my-requests' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('my-requests')}
          >
            My Requests ({userRequests.length})
          </Button>
          <Button
            variant={activeTab === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            All Requests ({allRequests.length})
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
            {userRequests.length === 0 ? (
              <GlassCard level={1} glow={false}>
                <div style={{
                  padding: 'var(--spacing-xl)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: 'var(--spacing-md)',
                    color: 'var(--on-surface-variant)',
                    opacity: 0.5,
                  }}>
                    📄
                  </div>
                  <h3 className="text-headline-lg" style={{
                    fontSize: '20px',
                    marginBottom: 'var(--spacing-sm)',
                  }}>
                    No Requests Yet
                  </h3>
                  <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                    Your queued redemption requests will appear here.
                  </p>
                  <Button 
                    variant="primary" 
                    size="md" 
                    style={{ marginTop: 'var(--spacing-lg)' }}
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create Your First Request
                  </Button>
                </div>
              </GlassCard>
            ) : (
              <GlassCard level={1} glow={false} padding="0">
                <DataTable
                  columns={requestColumns}
                  data={(activeTab === 'my-requests' ? userRequests : allRequests).map(request => ({
                    id: request.id,
                    asset: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{request.asset.logo}</span>
                        <Chip variant="asset" value={request.asset.symbol} size="sm" />
                      </div>
                    ),
                    amount: (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          {formatTokenAmount(request.amountTokens, '', 2)} {request.asset.symbol}
                        </div>
                        <div style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '11px', 
                          color: 'var(--on-surface-variant)' 
                        }}>
                          ≈ {formatUSD(request.amountUSDC)}
                        </div>
                      </div>
                    ),
                    status: (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StatusDot status={request.status.toLowerCase()} size="sm" />
                        <span style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: '11px',
                          color: statusColors[request.status.toLowerCase()]?.text || 'var(--on-surface-variant)'
                        }}>
                          {request.status}
                        </span>
                      </div>
                    ),
                    submitted: formatDate(request.submittedAt),
                    settlement: formatDate(request.expectedSettlement),
                    actions: request.status === 'Claimable' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleClaim(request)}
                      >
                        Claim
                      </Button>
                    ),
                  }))}
                />
              </GlassCard>
            )}
          </>
        )}

        {activeTab === 'all' && (
          <GlassCard level={1} glow={false} padding="0">
            <DataTable
              columns={requestColumns}
              data={allRequests.map(request => ({
                id: request.id,
                asset: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{request.asset.logo}</span>
                    <Chip variant="asset" value={request.asset.symbol} size="sm" />
                  </div>
                ),
                amount: (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      {formatTokenAmount(request.amountTokens, '', 2)} {request.asset.symbol}
                    </div>
                    <div style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '11px', 
                      color: 'var(--on-surface-variant)' 
                    }}>
                      ≈ {formatUSD(request.amountUSDC)}
                    </div>
                  </div>
                ),
                status: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusDot status={request.status.toLowerCase()} size="sm" />
                    <span style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '11px',
                      color: statusColors[request.status.toLowerCase()]?.text || 'var(--on-surface-variant)'
                    }}>
                      {request.status}
                    </span>
                  </div>
                ),
                submitted: formatDate(request.submittedAt),
                settlement: formatDate(request.expectedSettlement),
                actions: null,
              }))}
            />
          </GlassCard>
        )}

        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
            <GlassCard level={1} glow={false}>
              <div style={{ padding: 'var(--spacing-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '500', color: 'var(--on-surface)', marginBottom: 'var(--spacing-md)' }}>
                  Total Backlog
                </h3>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
                  {queueStats.totalBacklog}
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                  pending requests
                </p>
              </div>
            </GlassCard>

            <GlassCard level={1} glow={false}>
              <div style={{ padding: 'var(--spacing-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '500', color: 'var(--on-surface)', marginBottom: 'var(--spacing-md)' }}>
                  Total Value
                </h3>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
                  {formatUSD(queueStats.totalValue)}
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                  across all requests
                </p>
              </div>
            </GlassCard>

            <GlassCard level={1} glow={false}>
              <div style={{ padding: 'var(--spacing-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '500', color: 'var(--on-surface)', marginBottom: 'var(--spacing-md)' }}>
                  Avg. Settlement Time
                </h3>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
                  {queueStats.averageSettlementTime}
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                  from submission to claim
                </p>
              </div>
            </GlassCard>

            <GlassCard level={1} glow={false}>
              <div style={{ padding: 'var(--spacing-lg)' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '500', color: 'var(--on-surface)', marginBottom: 'var(--spacing-md)' }}>
                  Next Epoch
                </h3>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', color: 'var(--primary)' }}>
                  #{queueStats.nextEpoch}
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                  {formatDate(queueStats.nextEpochTime)}
                </p>
              </div>
            </GlassCard>
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
            Queue your RWAs for settlement at full NAV. You'll earn yield while waiting,
            and the price of patience is paid by instant exiters.
          </p>

          {/* Asset Selection */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--on-surface)',
              marginBottom: '6px',
            }}>
              Select Asset
            </label>
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-sm)',
              flexWrap: 'wrap',
            }}>
              {assetOptions.map((asset) => (
                <Button
                  key={asset.id}
                  variant={selectedAsset === asset.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedAsset(asset.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{asset.logo}</span>
                  <span>{asset.symbol}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--on-surface)',
              marginBottom: '6px',
            }}>
              Amount
            </label>
            <InputField
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              placeholder="0"
              suffix={assets[selectedAsset]?.symbol || ''}
              type="number"
            />
            <div style={{
              marginTop: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--on-surface-variant)',
            }}>
              Balance: {assets[selectedAsset]?.symbol ? `100 ${assets[selectedAsset].symbol}` : '0'}
            </div>
          </div>

          {/* Selected Asset Info */}
          {selectedAsset && assets[selectedAsset] && (
            <GlassCard level={2} glow={false}>
              <div style={{
                padding: 'var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{assets[selectedAsset].logo}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: '600' }}>
                    {assets[selectedAsset].name}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                    Current NAV
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '500' }}>
                    {formatUSD(assets[selectedAsset].currentNAV)}
                  </div>
                </div>
              </div>
              <div style={{
                padding: 'var(--spacing-md)',
                borderTop: '1px solid var(--border-glass)',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                }}>
                  <span style={{ color: 'var(--on-surface-variant)' }}>Settlement</span>
                  <span>{assets[selectedAsset].settlement}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  <span style={{ color: 'var(--on-surface-variant)' }}>Queue Fee</span>
                  <span>5 bps</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  <span style={{ color: 'var(--on-surface-variant)' }}>Issuance APY</span>
                  <span>{formatPercent(assets[selectedAsset].issuanceAPY, 2)}</span>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedAsset || !requestAmount || isNaN(requestAmount) || Number(requestAmount) <= 0 || isSubmitting}
            loading={isSubmitting}
            onClick={handleCreateRequest}
          >
            Submit to Queue
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default QueuePage;
