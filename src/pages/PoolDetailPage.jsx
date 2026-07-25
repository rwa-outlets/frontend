import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import StatusDot from '../components/ui/StatusDot';
import InputField from '../components/ui/InputField';
import DataTable from '../components/ui/DataTable';
import { formatUSD, formatPercent, formatBps, formatTokenAmount } from '../utils/formatters';
import { pools, trades, assets, poolTypes } from '../data/mockData';
import { useTheme } from '../theme/ThemeContext';
import { tokens } from '../theme/tokens';

/**
 * PoolDetailPage
 * 
 * Single pool detail view with:
 * - Swap interface
 * - Pool stats
 * - Trade history
 * - Pool information
 */

const PoolDetailPage = () => {
  const { poolId } = useParams();
  const { isDark } = useTheme();
  const currentTokens = isDark ? tokens.dark : tokens.light;

  // Find the pool
  const pool = pools.find(p => p.id === poolId);
  const poolType = poolTypes[pool?.type];

  // State for swap interface
  const [sendAmount, setSendAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [direction, setDirection] = useState('exit'); // 'exit' or 'entry'
  const [isCalculating, setIsCalculating] = useState(false);

  if (!pool) {
    return (
      <div className="page-content">
        <h1 className="text-headline-lg">Pool Not Found</h1>
        <p className="text-body-md">The requested pool does not exist.</p>
        <Button variant="primary" style={{ marginTop: 'var(--spacing-lg)' }}>
          <Link to="/pools" style={{ color: 'inherit', textDecoration: 'none' }}>
            Back to Pools
          </Link>
        </Button>
      </div>
    );
  }

  // Safely resolve the pool's primary asset (market pools use assets[] not asset)
  const poolAsset = pool.asset || (pool.assets && pool.assets[0]) || {
    symbol: 'RWA',
    name: 'All RWAs',
    currentNAV: 1.0,
    category: 'Mixed',
    settlement: 'Instant',
    issuer: 'Multiple',
    issuanceAPY: 0,
  };

  // Calculate receive amount based on send amount
  const calculateReceiveAmount = (amount) => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setReceiveAmount('');
      return;
    }

    const numAmount = Number(amount);
    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      if (direction === 'exit') {
        // Exit: sell RWA for USDC
        // Rate = NAV * (1 - spread/10000)
        const nav = poolAsset.currentNAV;
        const spread = pool.type === 'market' ? pool.fee : (pool.spread || pool.spreadInitial || 15);
        const rate = nav * (1 - spread / 10000);
        const receive = numAmount * rate;
        setReceiveAmount(receive.toFixed(6));
      } else {
        // Entry: buy RWA with USDC
        // Rate = NAV * (1 + spread/10000)
        const nav = poolAsset.currentNAV;
        const spread = pool.type === 'market' ? pool.fee : (pool.spread || pool.spreadInitial || 15);
        const rate = nav * (1 + spread / 10000);
        const receive = numAmount / rate;
        setReceiveAmount(receive.toFixed(6));
      }
      setIsCalculating(false);
    }, 300);
  };

  const handleSendAmountChange = (e) => {
    const value = e.target.value;
    setSendAmount(value);
    calculateReceiveAmount(value);
  };

  // Calculate max amount user can send
  const maxSendAmount = direction === 'exit' 
    ? 100 // Mock: user has 100 tokens
    : 50000; // Mock: user has 50k USDC

  // Pool trade history
  const poolTrades = trades.filter(t => t.poolId === pool.id);

  // Trade history columns
  const tradeColumns = [
    { key: 'direction', header: 'Direction', sortable: true },
    { key: 'amount', header: 'Amount', sortable: true, align: 'right' },
    { key: 'rate', header: 'Rate', sortable: true, align: 'right' },
    { key: 'time', header: 'Time', sortable: true, align: 'right' },
    { key: 'status', header: 'Status', sortable: true },
  ];

  return (
    <div className="page-content stagger-children">
      {/* Header */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: 'var(--spacing-lg)',
        }}>
          <Link to="/pools" style={{
            fontSize: '24px',
            color: 'var(--on-surface-variant)',
            textDecoration: 'none',
          }}>
            ←
          </Link>
          <div>
            <h1 className="text-headline-lg" style={{ margin: 0 }}>
              {pool.name}
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '8px',
            }}>
              <Chip variant="pool" value={pool.type} size="md" />
              <StatusDot status={pool.isActive ? 'active' : 'error'} />
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 'var(--spacing-xl)',
        marginBottom: 'var(--outlet-gap)',
      }}>
        {/* Left Column - Swap Interface */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <GlassCard level={1} glow={true}>
            <div style={{
              padding: 'var(--spacing-lg)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--primary)',
                marginBottom: 'var(--spacing-lg)',
              }}>
                Swap
              </h2>

              {/* Direction Toggle */}
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-lg)',
              }}>
                <Button
                  variant={direction === 'exit' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setDirection('exit');
                    setSendAmount('');
                    setReceiveAmount('');
                  }}
                  style={{ flex: 1 }}
                >
                  Exit (Sell {poolAsset.symbol})
                </Button>
                <Button
                  variant={direction === 'entry' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setDirection('entry');
                    setSendAmount('');
                    setReceiveAmount('');
                  }}
                  style={{ flex: 1 }}
                >
                  Entry (Buy {poolAsset.symbol})
                </Button>
              </div>

              {/* You Send */}
              <div style={{
                marginBottom: 'var(--spacing-md)',
              }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--on-surface-variant)',
                  marginBottom: '6px',
                }}>
                  You Send
                </label>
                <div style={{
                  position: 'relative',
                }}>
                  <InputField
                    value={sendAmount}
                    onChange={handleSendAmountChange}
                    placeholder="0"
                    suffix={direction === 'exit' ? poolAsset.symbol : 'USDC'}
                    type="number"
                  />
                  {sendAmount && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSendAmount(maxSendAmount.toString());
                        calculateReceiveAmount(maxSendAmount.toString());
                      }}
                      style={{
                        position: 'absolute',
                        right: '80px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '11px',
                        padding: '4px 8px',
                      }}
                    >
                      MAX
                    </Button>
                  )}
                </div>
                {sendAmount && (
                  <div style={{
                    marginTop: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--on-surface-variant)',
                  }}>
                    {direction === 'exit' ? 'Available: 100 ' + poolAsset.symbol : 'Available: 50,000 USDC'}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                margin: 'var(--spacing-md) 0',
              }}>
                <div style={{
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
                }}>
                  ↓
                </div>
              </div>

              {/* You Receive */}
              <div style={{
                marginBottom: 'var(--spacing-lg)',
              }}>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--on-surface-variant)',
                  marginBottom: '6px',
                }}>
                  You Receive
                </label>
                <InputField
                  value={receiveAmount}
                  onChange={(e) => setReceiveAmount(e.target.value)}
                  placeholder="0"
                  suffix={direction === 'exit' ? 'USDC' : poolAsset.symbol}
                  type="number"
                  disabled
                />
                {receiveAmount && !isCalculating && (
                  <div style={{
                    marginTop: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--on-surface-variant)',
                  }}>
                    Rate: {pool.type === 'market' 
                      ? `${pool.fee} bps fee` 
                      : pool.type === 'patient'
                        ? `NAV ± ${pool.spreadFloor}-${pool.spreadInitial} bps`
                        : `NAV ± ${pool.spreadMin}-${pool.spreadMax} bps`}
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!sendAmount || isCalculating}
                loading={isCalculating}
                style={{ marginBottom: 'var(--spacing-md)' }}
              >
                {direction === 'exit' ? 'Redeem Instantly' : 'Buy RWA'}
              </Button>

              {/* Queue Option */}
              {direction === 'exit' && pool.type !== 'market' && (
                <Button
                  variant="ghost"
                  size="lg"
                  fullWidth
                  disabled={!sendAmount}
                >
                  <Link to="/queue" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Queue Instead (Wait for NAV)
                  </Link>
                </Button>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Right Column - Pool Stats */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)',
          }}>
            {/* Pool Stats Card */}
            <GlassCard level={1} glow={false}>
              <div style={{
                padding: 'var(--spacing-lg)',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  marginBottom: 'var(--spacing-lg)',
                }}>
                  Pool Stats
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-md)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 'var(--spacing-sm)',
                    borderBottom: '1px solid var(--border-glass)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      TVL
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: 'var(--primary)',
                    }}>
                      {formatUSD(pool.tvl)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 'var(--spacing-sm)',
                    borderBottom: '1px solid var(--border-glass)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      Volume (24h)
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: 'var(--primary)',
                    }}>
                      {formatUSD(pool.volume24h)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 'var(--spacing-sm)',
                    borderBottom: '1px solid var(--border-glass)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      Utilization
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: pool.utilization > 0.8 
                        ? 'var(--neon-gold)' 
                        : pool.utilization > 0.5 
                          ? 'var(--primary-container)' 
                          : 'var(--on-surface)',
                    }}>
                      {formatPercent(pool.utilization)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 'var(--spacing-sm)',
                    borderBottom: '1px solid var(--border-glass)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      {pool.type === 'market' ? 'Fee' : 'Spread'}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: 'var(--primary)',
                    }}>
                       {pool.type === 'market' 
                        ? formatBps(pool.fee) 
                        : pool.type === 'patient'
                          ? `${pool.spreadFloor}-${pool.spreadInitial} bps`
                          : `${pool.spreadMin}-${pool.spreadMax} bps`}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--on-surface-variant)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      Active Makers
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: 'var(--primary)',
                    }}>
                      {pool.activeMakers}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Asset Info Card */}
            <GlassCard level={1} glow={false}>
              <div style={{
                padding: 'var(--spacing-lg)',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  marginBottom: 'var(--spacing-lg)',
                }}>
                  {poolAsset.name} ({poolAsset.symbol})
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-md)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--on-surface-variant)',
                    }}>
                      NAV
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: 'var(--primary-container)',
                    }}>
                       {formatUSD(poolAsset.currentNAV)}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--on-surface-variant)',
                    }}>
                      Category
                    </span>
                     <Chip variant="default" value={poolAsset.category} size="sm" />
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--on-surface-variant)',
                    }}>
                      Settlement
                    </span>
                     <Chip variant="default" value={poolAsset.settlement} size="sm" />
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--on-surface-variant)',
                    }}>
                      Issuer
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--on-surface)',
                    }}>
                       {poolAsset.issuer}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--on-surface-variant)',
                    }}>
                      Issuance APY
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      fontWeight: '500',
                      color: 'var(--primary-container)',
                    }}>
                       {formatPercent(poolAsset.issuanceAPY, 2)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>

      {/* Trade History */}
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
        <h2 className="text-headline-lg" style={{
          fontSize: '24px',
          marginBottom: 'var(--spacing-lg)',
        }}>
          Trade History
        </h2>
        <GlassCard level={1} glow={false} padding="0">
          <DataTable
            columns={tradeColumns}
            data={poolTrades.map(trade => ({
              id: trade.id,
              direction: (
                <Chip 
                  variant="default" 
                  value={trade.direction.toUpperCase()} 
                  size="sm"
                  style={{
                    background: trade.direction === 'exit' 
                      ? 'rgba(0, 255, 163, 0.1)' 
                      : 'rgba(112, 0, 255, 0.1)',
                    borderColor: trade.direction === 'exit' 
                      ? '#00ffa3' 
                      : '#7000ff',
                    color: trade.direction === 'exit' 
                      ? '#00ffa3' 
                      : '#d1bcff',
                  }}
                />
              ),
              amount: formatUSD(trade.amount),
              rate: trade.direction === 'exit'
                ? `-${formatPercent((1 - trade.effectivePrice / trade.rate) * 100)}`
                : `+${formatPercent((trade.effectivePrice / trade.rate - 1) * 100)}`,
              time: new Date(trade.timestamp).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              }),
              status: <StatusDot status={trade.status.toLowerCase()} size="sm" />,
            }))}
          />
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default PoolDetailPage;
