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
import { formatUSD, formatPercent, formatTokenAmount, formatAPY } from '../utils/formatters';
import { vaults, userVaultPositions, pools, poolTypes } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { tokens, poolColors } from '../theme/tokens';

/**
 * VaultPage
 * 
 * CuratorVault interface with:
 * - Tier selector tabs (Express / Patient)
 * - Deposit section
 * - My Position cards
 * - Vault Stats
 * - Active Pools under this vault
 */

const VaultPage = () => {
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;
  
  const [activeTier, setActiveTier] = useState('express-tier');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  // Find current vault and user position
  const currentVault = vaults.find(v => v.id === activeTier);
  const userPosition = userVaultPositions.find(p => p.vaultId === activeTier);

  // Vault stats
  const vaultStats = {
    totalAssets: currentVault?.totalAssets || 0,
    totalDeposits: currentVault?.totalDeposits || 0,
    sharePrice: currentVault?.sharePrice || 1,
    apy: currentVault?.apy || 0,
    utilization: currentVault?.utilization || 0,
    maxCapacity: currentVault?.maxCapacity || 0,
  };

  // Active pools under this vault
  const vaultPools = currentVault?.mandate.allowedAssets 
    ? pools.filter(pool => currentVault.mandate.allowedAssets.includes(pool.assetId))
    : [];

  // Deposit modal
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      return;
    }

    setIsDepositing(true);
    
    // Simulate deposit
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsDepositing(false);
    setIsDepositModalOpen(false);
    setDepositAmount('');
    
    alert(`Deposited ${formatUSD(Number(depositAmount))} successfully!`);
  };

  // Withdraw from vault
  const handleWithdraw = (position) => {
    if (!position.pendingWithdrawal) {
      // In a real app, create withdrawal request
      alert(`Withdrawal request for ${formatUSD(position.valueUSDC)} submitted`);
    } else {
      alert('You already have a pending withdrawal request');
    }
  };

  // Claim withdrawal
  const handleClaimWithdrawal = (position) => {
    if (position.pendingWithdrawal?.status === 'completed') {
      alert(`Claimed ${formatUSD(position.pendingWithdrawal.amountUSDC)}`);
    } else {
      alert('Withdrawal not ready to claim');
    }
  };

  // Tier tabs
  const tierTabs = vaults.map(v => ({
    id: v.id,
    label: v.name,
    apy: v.apy,
  }));

  // Position table columns
  const positionColumns = [
    { key: 'vault', header: 'Vault', sortable: true },
    { key: 'shares', header: 'Shares', sortable: true, align: 'right' },
    { key: 'value', header: 'Value', sortable: true, align: 'right' },
    { key: 'apy', header: 'APY', sortable: true, align: 'right' },
    { key: 'yield', header: 'Accrued Yield', sortable: true, align: 'right' },
    { key: 'actions', header: 'Actions', sortable: false },
  ];

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
            <h1 className="text-headline-lg">Vault</h1>
            <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
              Deposit USDC to earn yield from RWA liquidity provision
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tier Selector Tabs */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xl)',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: 'var(--spacing-md)',
          flexWrap: 'wrap',
        }}>
          {tierTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTier === tab.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTier(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Chip variant="pool" value={tab.id.split('-')[0]} size="sm" />
              <span>{tab.label}</span>
              <Chip variant="default" value={formatPercent(tab.apy, 1)} size="sm" />
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Deposit Section */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <GlassCard level={1} glow={true}>
          <div style={{
            padding: 'var(--spacing-lg)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--spacing-lg)',
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--primary)',
                marginBottom: '4px',
              }}>
                Deposit to {currentVault?.name}
              </h2>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                {currentVault?.description}
              </p>

              <div style={{
                margin: 'var(--spacing-lg) 0',
                display: 'flex',
                gap: 'var(--spacing-xl)',
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--on-surface-variant)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px',
                  }}>
                    Share Price
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                  }}>
                    {formatUSD(vaultStats.sharePrice)}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--on-surface-variant)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px',
                  }}>
                    Your APY
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--primary-container)',
                  }}>
                    {formatPercent(vaultStats.apy)}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--on-surface-variant)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px',
                  }}>
                    Total Assets
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                  }}>
                    {formatUSD(vaultStats.totalAssets)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-md)',
            }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsDepositModalOpen(true)}
              >
                + Deposit USDC
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {}}
              >
                ← Withdraw
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* My Position Section */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={{ marginBottom: 'var(--outlet-gap)' }}>
        <h2 className="text-headline-lg" style={{
          fontSize: '24px',
          marginBottom: 'var(--spacing-lg)',
        }}>
          My Position
        </h2>

        {userPosition ? (
          <GlassCard level={1} glow={false}>
            <div style={{
              padding: 'var(--spacing-lg)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '4px',
                }}>
                  My Shares
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                }}>
                  {formatTokenAmount(userPosition.shares, '', 0)}
                </div>
                <Chip variant="default" value={userPosition.vault.shareToken.symbol} size="sm" />
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '4px',
                }}>
                  Current Value
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--primary-container)',
                }}>
                  {formatUSD(userPosition.valueUSDC)}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                  marginTop: '4px',
                }}>
                  {formatPercent((userPosition.valueUSDC - userPosition.depositAmount) / userPosition.depositAmount * 100)} P&L
                </div>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '4px',
                }}>
                  Accrued Yield
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--neon-green)',
                }}>
                  {formatUSD(userPosition.accruedYield)}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                  marginTop: '4px',
                }}>
                  {formatPercent(userPosition.apy, 2)} APY
                </div>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--on-surface-variant)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '4px',
                }}>
                  Pending Withdrawal
                </div>
                {userPosition.pendingWithdrawal ? (
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px',
                      fontWeight: '700',
                      color: 'var(--neon-gold)',
                    }}>
                      {formatUSD(userPosition.pendingWithdrawal.amountUSDC)}
                    </div>
                    <StatusDot 
                      status={userPosition.pendingWithdrawal.status} 
                      label={userPosition.pendingWithdrawal.status}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleClaimWithdrawal(userPosition)}
                      style={{ marginTop: '8px', width: '100%' }}
                    >
                      Claim
                    </Button>
                  </div>
                ) : (
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--on-surface-variant)',
                  }}>
                    None
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons for position */}
            <div style={{
              padding: 'var(--spacing-lg)',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              gap: 'var(--spacing-md)',
            }}>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsDepositModalOpen(true)}
              >
                + Add More USDC
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => handleWithdraw(userPosition)}
                disabled={!!userPosition?.pendingWithdrawal}
              >
                → Request Withdrawal
              </Button>
            </div>
          </GlassCard>
        ) : (
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
                💰
              </div>
              <h3 className="text-headline-lg" style={{
                fontSize: '20px',
                marginBottom: 'var(--spacing-sm)',
              }}>
                No Position Yet
              </h3>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                Deposit USDC to start earning yield from RWA liquidity provision.
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
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} style={{ marginBottom: 'var(--outlet-gap)' }}>
        <h2 className="text-headline-lg" style={{
          fontSize: '24px',
          marginBottom: 'var(--spacing-lg)',
        }}>
          {currentVault?.name} Stats
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}>
          <GlassCard level={1} glow={false}>
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--on-surface-variant)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '4px',
              }}>
                Total Assets
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--primary)',
              }}>
                {formatUSD(vaultStats.totalAssets)}
              </div>
            </div>
          </GlassCard>

          <GlassCard level={1} glow={false}>
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--on-surface-variant)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '4px',
              }}>
                Total Deposits
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--primary)',
              }}>
                {formatUSD(vaultStats.totalDeposits)}
              </div>
            </div>
          </GlassCard>

          <GlassCard level={1} glow={false}>
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--on-surface-variant)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '4px',
              }}>
                Utilization
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: '700',
                color: vaultStats.utilization > 0.8 
                  ? 'var(--neon-gold)' 
                  : vaultStats.utilization > 0.5 
                    ? 'var(--primary-container)' 
                    : 'var(--on-surface)',
              }}>
                {formatPercent(vaultStats.utilization)}
              </div>
            </div>
          </GlassCard>

          <GlassCard level={1} glow={false}>
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--on-surface-variant)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '4px',
              }}>
                Max Capacity
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--primary)',
              }}>
                {formatUSD(vaultStats.maxCapacity)}
              </div>
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Active Pools under this vault */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <h2 className="text-headline-lg" style={{
          fontSize: '24px',
          marginBottom: 'var(--spacing-lg)',
        }}>
          Active Pools under {currentVault?.name}
        </h2>

        {vaultPools.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)',
          }}>
            {vaultPools.map((pool, index) => (
              <GlassCard key={pool.id} level={1} glow={index === 0}>
                <Link to={`/pools/${pool.id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'block' }}>
                  <div style={{
                    padding: 'var(--spacing-lg)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                  }}>
                    <div style={{ fontSize: '28px' }}>
                      {poolTypes[pool.type].icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}>
                        <h3 style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '16px',
                          fontWeight: '700',
                          color: 'var(--primary)',
                        }}>
                          {pool.name}
                        </h3>
                        <StatusDot status={pool.isActive ? 'active' : 'error'} />
                      </div>
                      <Chip variant="pool" value={pool.type} size="sm" />
                      <div style={{
                        marginTop: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}>
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--on-surface-variant)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}>
                            TVL
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: 'var(--primary)',
                          }}>
                            {formatUSD(pool.tvl)}
                          </div>
                        </div>
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--on-surface-variant)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}>
                            Allocated
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '16px',
                            fontWeight: '700',
                            color: 'var(--neon-green)',
                          }}>
                            {formatUSD(currentVault.positions.find(p => p.assetId === pool.assetId)?.allocated || 0)}
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
            <div style={{
              padding: 'var(--spacing-lg)',
              textAlign: 'center',
            }}>
              <p className="text-body-md" style={{ color: 'var(--on-surface-variant)' }}>
                No active pools yet. The curator agent will create pools as opportunities arise.
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
        title={`Deposit to ${currentVault?.name}`}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <p className="text-body-md" style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
            Deposit USDC to earn {formatPercent(currentVault?.apy)} APY from the {currentVault?.name}.
            Your USDC will be used to provide liquidity to {vaultPools.length} pool{vaultPools.length !== 1 ? 's' : ''}.
          </p>

          {/* Deposit Amount */}
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
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0"
              suffix="USDC"
              type="number"
            />
            <div style={{
              marginTop: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--on-surface-variant)',
            }}>
              Balance: 10,000 USDC
            </div>
          </div>

          {/* You Will Receive */}
          {depositAmount && !isNaN(depositAmount) && Number(depositAmount) > 0 && (
            <GlassCard level={2} glow={false}>
              <div style={{
                padding: 'var(--spacing-md)',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--on-surface-variant)',
                }}>
                  You will receive
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--primary-container)',
                }}>
                  {(Number(depositAmount) / vaultStats.sharePrice).toFixed(2)} {currentVault?.shareToken.symbol}
                </span>
              </div>
            </GlassCard>
          )}

          {/* Submit Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0 || isDepositing}
            loading={isDepositing}
            onClick={handleDeposit}
          >
            Deposit USDC
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default VaultPage;
