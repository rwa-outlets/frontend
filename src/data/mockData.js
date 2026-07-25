/**
 * Mock Data for Aetheric Outlets
 * 
 * Realistic mock data based on the architecture specification:
 * - 3 Pool types: Express, Patient, Market
 * - Assets: rwaTBILL, rwaCREDIT, USDC
 * - Redemption Queue with ERC-7540 requests
 * - CuratorVault with tier-based positions
 */

// ===========================================================================
// ASSETS
// ===========================================================================

export const assets = {
  USDC: {
    id: 'USDC',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    logo: '💵',
    type: 'stablecoin',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  rwaTBILL: {
    id: 'rwaTBILL',
    name: 'Tokenized T-Bill Fund',
    symbol: 'rwaTBILL',
    decimals: 18,
    logo: '🏛️',
    type: 'rwa',
    category: 'T-Bill',
    settlement: 'T+7',
    currentNAV: 1.0012,
    issuanceAPY: 0.0525, // 5.25%
    address: '0x1234567890123456789012345678901234567890',
    issuer: 'Franklin Templeton',
    riskTier: 'express',
  },
  rwaCREDIT: {
    id: 'rwaCREDIT',
    name: 'Private Credit Fund',
    symbol: 'rwaCREDIT',
    decimals: 18,
    logo: '🏢',
    type: 'rwa',
    category: 'Private Credit',
    settlement: 'T+90',
    currentNAV: 1.0432,
    issuanceAPY: 0.085, // 8.5%
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    issuer: 'Goldman Sachs',
    riskTier: 'patient',
  },
  rwaREAL: {
    id: 'rwaREAL',
    name: 'Real Estate Token',
    symbol: 'rwaREAL',
    decimals: 18,
    logo: '🏠',
    type: 'rwa',
    category: 'Real Estate',
    settlement: 'T+30',
    currentNAV: 1.0250,
    issuanceAPY: 0.065, // 6.5%
    address: '0x9876543210987654321098765432109876543210',
    issuer: 'RealT',
    riskTier: 'patient',
  },
  RWAT: {
    id: 'RWAT',
    name: 'RWA Index Token',
    symbol: 'RWAT',
    decimals: 18,
    logo: '📈',
    type: 'rwa',
    category: 'Index',
    settlement: 'T+14',
    currentNAV: 1.0185,
    issuanceAPY: 0.048, // 4.8%
    address: '0x543210987654321098765432109876543210',
    issuer: 'TokenSoft',
    riskTier: 'express',
  },
};

// ===========================================================================
// POOLS
// ===========================================================================

export const pools = [
  {
    id: 'express-tbill',
    name: 'Express - T-Bill Pool',
    type: 'express',
    assetId: 'rwaTBILL',
    asset: assets.rwaTBILL,
    spread: 15, // 15 bps
    spreadMin: 5,
    spreadMax: 25,
    tvl: 420000, // $420,000
    volume24h: 85000,
    volume7d: 485000,
    utilization: 0.72, // 72%
    activeMakers: 12,
    capacity: 600000,
    isActive: true,
    createdAt: '2026-07-01T10:00:00Z',
    lastTrade: '2026-07-25T14:30:00Z',
    description: 'High-liquidity pool for tokenized T-Bills with tight spreads',
    riskParameters: {
      maxDiscount: 30, // 30 bps
      maxPositionSize: 50000,
      minCollateralRatio: 1.1,
    },
  },
  {
    id: 'express-index',
    name: 'Express - RWA Index',
    type: 'express',
    assetId: 'RWAT',
    asset: assets.RWAT,
    spread: 20, // 20 bps
    spreadMin: 10,
    spreadMax: 30,
    tvl: 315000, // $315,000
    volume24h: 62000,
    volume7d: 358000,
    utilization: 0.68, // 68%
    activeMakers: 8,
    capacity: 500000,
    isActive: true,
    createdAt: '2026-07-05T14:00:00Z',
    lastTrade: '2026-07-25T13:45:00Z',
    description: 'Diversified RWA index with rapid settlement',
    riskParameters: {
      maxDiscount: 40, // 40 bps
      maxPositionSize: 75000,
      minCollateralRatio: 1.05,
    },
  },
  {
    id: 'patient-credit',
    name: 'Patient - Private Credit',
    type: 'patient',
    assetId: 'rwaCREDIT',
    asset: assets.rwaCREDIT,
    spreadInitial: 50, // 50 bps starting
    spreadFloor: 30, // 30 bps floor
    spreadDecayRate: 0.5, // bps per minute
    spreadDecayInterval: 60, // seconds
    tvl: 150000, // $150,000
    volume24h: 22000,
    volume7d: 112000,
    utilization: 0.45, // 45%
    activeMakers: 6,
    capacity: 350000,
    isActive: true,
    createdAt: '2026-07-10T09:00:00Z',
    lastTrade: '2026-07-25T11:20:00Z',
    description: 'Longer-dated credit pool with Dutch-decay auction pricing',
    riskParameters: {
      maxDiscount: 300, // 300 bps (3%)
      maxPositionSize: 100000,
      minCollateralRatio: 1.25,
    },
  },
  {
    id: 'patient-real',
    name: 'Patient - Real Estate',
    type: 'patient',
    assetId: 'rwaREAL',
    asset: assets.rwaREAL,
    spreadInitial: 40, // 40 bps starting
    spreadFloor: 25, // 25 bps floor
    spreadDecayRate: 0.3, // bps per minute
    spreadDecayInterval: 60, // seconds
    tvl: 95000, // $95,000
    volume24h: 8500,
    volume7d: 42000,
    utilization: 0.32, // 32%
    activeMakers: 4,
    capacity: 300000,
    isActive: true,
    createdAt: '2026-07-15T16:00:00Z',
    lastTrade: '2026-07-24T09:15:00Z',
    description: 'Real estate backed pool with 30-day settlement',
    riskParameters: {
      maxDiscount: 200, // 200 bps (2%)
      maxPositionSize: 80000,
      minCollateralRatio: 1.2,
    },
  },
  {
    id: 'market-all',
    name: 'Market - All RWAs',
    type: 'market',
    assetId: null,
    assets: [assets.rwaTBILL, assets.rwaCREDIT, assets.rwaREAL, assets.RWAT],
    fee: 30, // 30 bps fee
    tvl: 280000, // $280,000
    volume24h: 156000,
    volume7d: 892000,
    utilization: 0.85, // 85%
    activeMakers: 20,
    capacity: 400000,
    isActive: true,
    createdAt: '2026-07-01T08:00:00Z',
    lastTrade: '2026-07-25T15:00:00Z',
    description: 'Two-sided AMM for all supported RWAs',
    riskParameters: {
      maxPositionSize: 150000,
      minCollateralRatio: 1.0,
    },
    poolStats: {
      rwaTBILL: { reserve: 120000, price: 0.9995 },
      rwaCREDIT: { reserve: 80000, price: 0.9950 },
      rwaREAL: { reserve: 50000, price: 0.9970 },
      RWAT: { reserve: 30000, price: 0.9985 },
    },
  },
];

// ===========================================================================
// POOL TYPE INFORMATION
// ===========================================================================

export const poolTypes = {
  express: {
    id: 'express',
    name: 'Express',
    description: 'High-liquidity RWAs with short settlement periods. Instant USDC at NAV minus a tight spread (5-25 bps).',
    icon: '⚡',
    color: 'primary',
    typicalSpread: '5-25 bps',
    settlementTime: 'T+1 to T+7',
    riskLevel: 'Low',
    yieldSource: 'Redemption spreads + capital reuse',
    suitableFor: 'Blue-chip T-bills, MMF shares, high-liquidity assets',
  },
  patient: {
    id: 'patient',
    name: 'Patient',
    description: 'Longer-dated / less liquid RWAs. Instant USDC via Dutch-decay auction starting tight and decaying to floor.',
    icon: '⏳',
    color: 'secondary',
    typicalSpread: '50-300 bps',
    settlementTime: 'T+14 to T+180',
    riskLevel: 'Medium',
    yieldSource: 'Auction discounts + capital reuse + NAV capture',
    suitableFor: 'Private credit, real estate, longer settlement assets',
  },
  market: {
    id: 'market',
    name: 'Market',
    description: 'Two-sided constant-product AMM. Quotes both exits and entries, turning outlets into a full market.',
    icon: '💱',
    color: 'tertiary',
    typicalSpread: '30 bps fee',
    settlementTime: 'Instant',
    riskLevel: 'Medium',
    yieldSource: 'Swap fees + capital reuse',
    suitableFor: 'All supported RWAs',
  },
};

// ===========================================================================
// TRADE HISTORY
// ===========================================================================

export const trades = [
  {
    id: 'trade_001',
    poolId: 'express-tbill',
    poolName: 'Express - T-Bill Pool',
    assetId: 'rwaTBILL',
    direction: 'exit', // exit = sell RWA for USDC, entry = buy RWA with USDC
    amount: 25000,
    amountToken: 24965.03, // rwaTBILL tokens
    rate: 1.0012, // NAV
    spread: 15, // bps
    effectivePrice: 0.99975, // 1.0012 * (1 - 0.0015)
    usdcReceived: 24987.52,
    timestamp: '2026-07-25T14:30:00Z',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    maker: '0xMaker1234567890abcdef1234567890abcdef12345678',
    status: 'settled',
  },
  {
    id: 'trade_002',
    poolId: 'market-all',
    poolName: 'Market - All RWAs',
    assetId: 'rwaCREDIT',
    direction: 'exit',
    amount: 15000,
    amountToken: 14374.87, // rwaCREDIT tokens at NAV 1.0432
    rate: 1.0432,
    spread: 0, // Market pool uses fee instead
    fee: 30, // bps
    effectivePrice: 1.040109, // Adjusted for fee
    usdcReceived: 14942.14,
    timestamp: '2026-07-25T14:25:00Z',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
    maker: '0xMakerABCDEFABCDEFABCDEFABCDEFABCDEFABCDEF',
    status: 'settled',
  },
  {
    id: 'trade_003',
    poolId: 'express-index',
    poolName: 'Express - RWA Index',
    assetId: 'RWAT',
    direction: 'entry', // Buying RWA with USDC
    amount: 30000,
    amountToken: 29465.45, // RWAT tokens at NAV 1.0185
    rate: 1.0185,
    spread: 20,
    effectivePrice: 1.0204, // 1.0185 * (1 + 0.0020)
    usdcSpent: 30000,
    timestamp: '2026-07-25T14:20:00Z',
    txHash: '0x901234567890abcdef901234567890abcdef901234567890abcdef',
    maker: '0xMaker901234567890abcdef901234567890abcdef',
    status: 'settled',
  },
  {
    id: 'trade_004',
    poolId: 'patient-credit',
    poolName: 'Patient - Private Credit',
    assetId: 'rwaCREDIT',
    direction: 'exit',
    amount: 50000,
    amountToken: 47929.57, // rwaCREDIT tokens
    rate: 1.0432,
    spread: 125, // Decayed from initial to somewhere in between
    effectivePrice: 1.03005, // After spread
    usdcReceived: 49502.50,
    timestamp: '2026-07-25T13:45:00Z',
    txHash: '0x567890abcdef1234567890abcdef567890abcdef1234567890abcdef',
    maker: '0xMaker567890abcdef567890abcdef567890abcdef',
    status: 'settled',
  },
  {
    id: 'trade_005',
    poolId: 'market-all',
    poolName: 'Market - All RWAs',
    assetId: 'rwaTBILL',
    direction: 'entry',
    amount: 45000,
    amountToken: 44928.75, // rwaTBILL tokens
    rate: 1.0012,
    spread: 0,
    fee: 30,
    effectivePrice: 1.004236,
    usdcSpent: 45000,
    timestamp: '2026-07-25T13:15:00Z',
    txHash: '0xdef1234567890abcdefdef1234567890abcdefdef1234567890',
    maker: '0xMakerDEF1234567890abcdefDEF1234567890',
    status: 'settled',
  },
  {
    id: 'trade_006',
    poolId: 'patient-real',
    poolName: 'Patient - Real Estate',
    assetId: 'rwaREAL',
    direction: 'exit',
    amount: 18000,
    amountToken: 17551.02, // rwaREAL tokens
    rate: 1.0250,
    spread: 85,
    effectivePrice: 1.015575,
    usdcReceived: 17890.92,
    timestamp: '2026-07-25T11:20:00Z',
    txHash: '0xabc123def4567890abcdef1234567890abcdef1234567890abcdef',
    maker: '0xMakerABC123DEF4567890abcdef1234567890',
    status: 'settled',
  },
  {
    id: 'trade_007',
    poolId: 'express-tbill',
    poolName: 'Express - T-Bill Pool',
    assetId: 'rwaTBILL',
    direction: 'exit',
    amount: 62000,
    amountToken: 61877.31, // rwaTBILL tokens
    rate: 1.0012,
    spread: 18, // Slightly higher due to utilization
    effectivePrice: 0.9994,
    usdcReceived: 61796.20,
    timestamp: '2026-07-25T10:30:00Z',
    txHash: '0x111222333444555666777888999000111222333444555666777888',
    maker: '0xMaker111222333444555666777888999000',
    status: 'settled',
  },
  {
    id: 'trade_008',
    poolId: 'market-all',
    poolName: 'Market - All RWAs',
    assetId: 'RWAT',
    direction: 'exit',
    amount: 22000,
    amountToken: 21602.56, // RWAT tokens
    rate: 1.0185,
    spread: 0,
    fee: 30,
    effectivePrice: 1.015445,
    usdcReceived: 21829.80,
    timestamp: '2026-07-25T09:45:00Z',
    txHash: '0x222333444555666777888999000111222333444555666777888',
    maker: '0xMaker222333444555666777888999000',
    status: 'settled',
  },
  {
    id: 'trade_009',
    poolId: 'express-index',
    poolName: 'Express - RWA Index',
    assetId: 'RWAT',
    direction: 'exit',
    amount: 38000,
    amountToken: 37327.89, // RWAT tokens
    rate: 1.0185,
    spread: 22,
    effectivePrice: 0.996266,
    usdcReceived: 37312.54,
    timestamp: '2026-07-25T08:15:00Z',
    txHash: '0x333444555666777888999000111222333444555666777888',
    maker: '0xMaker333444555666777888999000111',
    status: 'settled',
  },
  {
    id: 'trade_010',
    poolId: 'patient-credit',
    poolName: 'Patient - Private Credit',
    assetId: 'rwaCREDIT',
    direction: 'exit',
    amount: 42000,
    amountToken: 40264.32, // rwaCREDIT tokens
    rate: 1.0432,
    spread: 98,
    effectivePrice: 1.033466,
    usdcReceived: 41542.73,
    timestamp: '2026-07-24T17:30:00Z',
    txHash: '0x444555666777888999000111222333444555666',
    maker: '0xMaker444555666777888999000111',
    status: 'settled',
  },
];

// ===========================================================================
// REDEMPTION QUEUE REQUESTS
// ===========================================================================

export const queueRequests = [
  {
    id: 'queue_001',
    user: '0xUser11111111111111111111111111111111111111',
    assetId: 'rwaTBILL',
    asset: assets.rwaTBILL,
    amountTokens: 10000,
    amountUSDC: 10012.00, // At NAV
    epoch: 12345,
    status: 'Pending', // Pending, Submitted, Claimable, Claimed
    submittedAt: '2026-07-25T14:00:00Z',
    expectedNAV: 1.0012,
    expectedSettlement: '2026-07-26T14:00:00Z', // T+7 for T-Bills
    queueFee: 0.0005, // 5 bps
    yieldAccrued: 0.0012, // From NAV increase while waiting
    txHash: '0xaaaabbbbccccdddd1111222233334444aaaa',
    requestType: 'standard',
  },
  {
    id: 'queue_002',
    user: '0xUser22222222222222222222222222222222222222',
    assetId: 'rwaCREDIT',
    asset: assets.rwaCREDIT,
    amountTokens: 5000,
    amountUSDC: 5216.00, // At NAV 1.0432
    epoch: 12345,
    status: 'Pending',
    submittedAt: '2026-07-25T13:30:00Z',
    expectedNAV: 1.0432,
    expectedSettlement: '2026-08-24T13:30:00Z', // T+90 for Private Credit
    queueFee: 0.0005, // 5 bps
    yieldAccrued: 0.0021, // ~90 days * 5.3% / 365
    txHash: '0xbbbbccccdddd1111222233334444bbbb',
    requestType: 'standard',
  },
  {
    id: 'queue_003',
    user: '0xUser33333333333333333333333333333333333333',
    assetId: 'rwaTBILL',
    asset: assets.rwaTBILL,
    amountTokens: 8000,
    amountUSDC: 8009.60, // At NAV
    epoch: 12344,
    status: 'Claimable', // Ready to claim
    submittedAt: '2026-07-18T10:00:00Z',
    expectedNAV: 1.0012,
    expectedSettlement: '2026-07-25T10:00:00Z', // T+7 - just became claimable
    queueFee: 0.0005,
    yieldAccrued: 0.0009, // ~7 days * 5.25% / 365
    txHash: '0xccccdddd1111222233334444cccc',
    claimedAt: null,
    requestType: 'standard',
  },
  {
    id: 'queue_004',
    user: '0xUser44444444444444444444444444444444444444',
    assetId: 'rwaREAL',
    asset: assets.rwaREAL,
    amountTokens: 3000,
    amountUSDC: 3075.00, // At NAV 1.0250
    epoch: 12343,
    status: 'Claimable',
    submittedAt: '2026-07-24T08:00:00Z',
    expectedNAV: 1.0250,
    expectedSettlement: '2026-07-25T08:00:00Z', // T+30 - just became claimable
    queueFee: 0.0005,
    yieldAccrued: 0.0018, // ~1 day * 6.5% / 365
    txHash: '0xdddd1111222233334444dddd',
    claimedAt: null,
    requestType: 'standard',
  },
  {
    id: 'queue_005',
    user: '0xUser55555555555555555555555555555555555555',
    assetId: 'rwaTBILL',
    asset: assets.rwaTBILL,
    amountTokens: 12000,
    amountUSDC: 12014.40, // At NAV
    epoch: 12342,
    status: 'Claimed', // Already claimed
    submittedAt: '2026-07-17T15:00:00Z',
    settledAt: '2026-07-24T15:00:00Z',
    expectedNAV: 1.0012,
    queueFee: 0.0005,
    yieldAccrued: 0.0015,
    usdcReceived: 12025.42, // Final amount received
    txHash: '0x1111222233334444dddd55556666',
    claimedAt: '2026-07-24T15:05:00Z',
    requestType: 'standard',
  },
  {
    id: 'queue_006',
    user: '0xUser66666666666666666666666666666666666666',
    assetId: 'RWAT',
    asset: assets.RWAT,
    amountTokens: 7000,
    amountUSDC: 7129.50, // At NAV 1.0185
    epoch: 12345,
    status: 'Pending',
    submittedAt: '2026-07-25T12:00:00Z',
    expectedNAV: 1.0185,
    expectedSettlement: '2026-07-26T12:00:00Z', // T+14
    queueFee: 0.0005,
    yieldAccrued: 0.0006,
    txHash: '0x2222333344445555666677778888',
    requestType: 'standard',
  },
];

// ===========================================================================
// CURATOR VAULT DATA
// ===========================================================================

export const vaults = [
  {
    id: 'express-tier',
    name: 'Express Tier Vault',
    type: 'express',
    description: 'Vault for high-liquidity, short-settlement RWAs',
    totalAssets: 850000, // $850,000
    totalDeposits: 850000,
    sharePrice: 1.0025, // Accrued yield increases share price
    depositToken: assets.USDC,
    shareToken: {
      symbol: 'expressVault',
      decimals: 6,
    },
    apy: 0.058, // 5.8%
    apy7d: 0.055, // 5.5% 7-day
    apy30d: 0.061, // 6.1% 30-day
    utilization: 0.82,
    maxCapacity: 2000000, // $2M
    curator: {
      address: '0xCuratorExpress11111111111111111111111111',
      name: 'AI Curator Agent - Express',
      status: 'active',
      lastAction: '2026-07-25T14:30:00Z',
    },
    mandate: {
      allowedAssets: ['rwaTBILL', 'RWAT'],
      maxAllocationPerAsset: 0.6, // 60%
      riskParameters: {
        maxLeverage: 1.0,
        minCollateralRatio: 1.1,
      },
    },
    positions: [
      { assetId: 'rwaTBILL', amount: 320000, allocated: 280000, yield: 0.0525 },
      { assetId: 'RWAT', amount: 180000, allocated: 150000, yield: 0.048 },
    ],
    createdAt: '2026-06-01T10:00:00Z',
    lastRebalance: '2026-07-24T09:00:00Z',
  },
  {
    id: 'patient-tier',
    name: 'Patient Tier Vault',
    type: 'patient',
    description: 'Vault for intermediate risk, longer-settlement RWAs',
    totalAssets: 420000, // $420,000
    totalDeposits: 420000,
    sharePrice: 1.0048, // Higher yield accrual
    depositToken: assets.USDC,
    shareToken: {
      symbol: 'patientVault',
      decimals: 6,
    },
    apy: 0.082, // 8.2%
    apy7d: 0.079, // 7.9% 7-day
    apy30d: 0.085, // 8.5% 30-day
    utilization: 0.65,
    maxCapacity: 1500000, // $1.5M
    curator: {
      address: '0xCuratorPatient22222222222222222222222222',
      name: 'AI Curator Agent - Patient',
      status: 'active',
      lastAction: '2026-07-25T13:15:00Z',
    },
    mandate: {
      allowedAssets: ['rwaCREDIT', 'rwaREAL'],
      maxAllocationPerAsset: 0.5, // 50%
      riskParameters: {
        maxLeverage: 0.8,
        minCollateralRatio: 1.25,
      },
    },
    positions: [
      { assetId: 'rwaCREDIT', amount: 220000, allocated: 150000, yield: 0.085 },
      { assetId: 'rwaREAL', amount: 100000, allocated: 95000, yield: 0.065 },
    ],
    createdAt: '2026-06-01T10:00:00Z',
    lastRebalance: '2026-07-23T14:00:00Z',
  },
];

// ===========================================================================
// USER VAULT POSITIONS (Mock user data)
// ===========================================================================

export const userVaultPositions = [
  {
    id: 'vault_pos_001',
    vaultId: 'express-tier',
    vault: vaults[0],
    user: '0xCurrentUser11111111111111111111111111',
    shares: 25000, // 25,000 shares
    valueUSDC: 25062.50, // shares * sharePrice
    depositAmount: 25000,
    depositedAt: '2026-07-01T15:30:00Z',
    apy: 0.058,
    accruedYield: 62.50, // $62.50 accrued
    pendingWithdrawal: {
      amountShares: 5000,
      amountUSDC: 5012.50,
      requestedAt: '2026-07-24T10:00:00Z',
      status: 'pending', // pending, processing, completed
      expectedCompletion: '2026-07-26T10:00:00Z',
      epoch: 12345,
    },
    history: [
      { type: 'deposit', amount: 10000, timestamp: '2026-07-01T10:00:00Z', txHash: '0xaaa111' },
      { type: 'deposit', amount: 15000, timestamp: '2026-07-15T14:00:00Z', txHash: '0xbbb222' },
      { type: 'yield', amount: 62.50, timestamp: '2026-07-25T00:00:00Z' },
    ],
  },
  {
    id: 'vault_pos_002',
    vaultId: 'patient-tier',
    vault: vaults[1],
    user: '0xCurrentUser11111111111111111111111111',
    shares: 12000, // 12,000 shares
    valueUSDC: 12057.60, // shares * sharePrice
    depositAmount: 12000,
    depositedAt: '2026-07-10T11:00:00Z',
    apy: 0.082,
    accruedYield: 57.60, // $57.60 accrued
    pendingWithdrawal: null,
    history: [
      { type: 'deposit', amount: 12000, timestamp: '2026-07-10T11:00:00Z', txHash: '0xccc333' },
      { type: 'yield', amount: 57.60, timestamp: '2026-07-25T00:00:00Z' },
    ],
  },
];

// ===========================================================================
// DASHBOARD STATISTICS
// ===========================================================================

export const dashboardStats = {
  totalTVL: 1550000, // Sum of all pool TVLs
  volume24h: 401000, // Sum of all pool 24h volumes
  volume7d: 2173000,
  activePools: 5,
  totalPools: 5,
  activeMakers: 28,
  totalMakers: 45,
  averageAPY: 0.073, // Weighted average
  totalQueueRequests: 6,
  queueTVL: 76000, // Sum of all pending queue requests
  yieldStreams: {
    spreads: 0.045, // 4.5% from spreads
    capitalReuse: 0.018, // 1.8% from capital reuse
    navCapture: 0.010, // 1.0% from NAV capture
  },
  recentActivity: [
    { type: 'trade', pool: 'express-tbill', amount: 25000, timestamp: '2026-07-25T14:30:00Z' },
    { type: 'deposit', vault: 'express-tier', amount: 10000, timestamp: '2026-07-25T14:15:00Z' },
    { type: 'settlement', queue: 'queue_003', amount: 8009.60, timestamp: '2026-07-25T10:00:00Z' },
    { type: 'rebalance', vault: 'patient-tier', timestamp: '2026-07-25T09:00:00Z' },
    { type: 'trade', pool: 'market-all', amount: 15000, timestamp: '2026-07-25T14:25:00Z' },
  ],
};

// ===========================================================================
// YIELD BREAKDOWN DATA
// ===========================================================================

export const yieldBreakdown = [
  {
    source: 'Redemption Spreads',
    value: 0.045, // 4.5%
    description: 'Earned from instant exit discounts',
    color: 'primary',
  },
  {
    source: 'Capital Reuse',
    value: 0.018, // 1.8%
    description: 'Earned from Aqua capital efficiency',
    color: 'secondary',
  },
  {
    source: 'NAV Capture',
    value: 0.010, // 1.0%
    description: 'Earned from inventory settlement at full NAV',
    color: 'tertiary',
  },
];

// ===========================================================================
// PRICING DATA
// ===========================================================================

export const pricing = {
  oracle: {
    lastUpdate: '2026-07-25T15:00:00Z',
    nextUpdate: '2026-07-25T16:00:00Z',
    sources: ['Chainlink', 'Pyth', 'Band'],
    confidence: 'high',
  },
  navOracle: {
    rwaTBILL: 1.0012,
    rwaCREDIT: 1.0432,
    rwaREAL: 1.0250,
    RWAT: 1.0185,
    lastUpdate: '2026-07-25T15:00:00Z',
  },
  historical: {
    rwaTBILL: [
      { timestamp: '2026-07-24T15:00:00Z', value: 1.0010 },
      { timestamp: '2026-07-23T15:00:00Z', value: 1.0008 },
      { timestamp: '2026-07-22T15:00:00Z', value: 1.0005 },
    ],
    rwaCREDIT: [
      { timestamp: '2026-07-24T15:00:00Z', value: 1.0428 },
      { timestamp: '2026-07-23T15:00:00Z', value: 1.0421 },
      { timestamp: '2026-07-22T15:00:00Z', value: 1.0415 },
    ],
  },
};

// ===========================================================================
// CURATOR AGENT DATA
// ===========================================================================

export const curatorAgents = [
  {
    id: 'agent-express',
    address: '0xCuratorExpress11111111111111111111111111',
    name: 'Express Curator Agent',
    vaultId: 'express-tier',
    status: 'active',
    lastDecision: '2026-07-25T14:30:00Z',
    decisionLog: [
      {
        timestamp: '2026-07-25T14:30:00Z',
        action: 'rebalance',
        from: { rwaTBILL: 300000, RWAT: 150000 },
        to: { rwaTBILL: 320000, RWAT: 180000 },
        reason: 'Increased T-Bill allocation based on spread opportunity',
        query: 'SELECT * FROM pools WHERE type = "express" AND utilization > 0.7',
        gasUsed: 150000,
      },
      {
        timestamp: '2026-07-25T10:00:00Z',
        action: 'trigger_settlement',
        requestId: 'queue_003',
        reason: 'T+7 settlement window reached for rwaTBILL',
        query: 'SELECT * FROM queue WHERE status = "Pending" AND expectedSettlement <= NOW()',
        gasUsed: 80000,
      },
    ],
    performance: {
      totalReturn: 0.058,
      sharpeRatio: 2.45,
      maxDrawdown: 0.012,
    },
  },
  {
    id: 'agent-patient',
    address: '0xCuratorPatient22222222222222222222222222',
    name: 'Patient Curator Agent',
    vaultId: 'patient-tier',
    status: 'active',
    lastDecision: '2026-07-25T13:15:00Z',
    decisionLog: [
      {
        timestamp: '2026-07-25T13:15:00Z',
        action: 'rebalance',
        from: { rwaCREDIT: 200000, rwaREAL: 80000 },
        to: { rwaCREDIT: 220000, rwaREAL: 100000 },
        reason: 'Increased Private Credit exposure based on yield opportunity',
        query: 'SELECT * FROM pools WHERE type = "patient" ORDER BY apy DESC LIMIT 2',
        gasUsed: 120000,
      },
      {
        timestamp: '2026-07-24T16:00:00Z',
        action: 'adjust_spread',
        poolId: 'patient-credit',
        from: 50,
        to: 45,
        reason: 'Reduced initial spread based on increased maker participation',
        query: 'SELECT COUNT(*) FROM makers WHERE poolId = "patient-credit" AND status = "active"',
        gasUsed: 60000,
      },
    ],
    performance: {
      totalReturn: 0.082,
      sharpeRatio: 1.89,
      maxDrawdown: 0.021,
    },
  },
];

// ===========================================================================
// NOTIFICATIONS (Mock)
// ===========================================================================

export const notifications = [
  {
    id: 'notif_001',
    type: 'success',
    title: 'Trade Executed',
    message: 'Your exit from Express T-Bill Pool was filled',
    amount: '$24,987.52',
    timestamp: '2026-07-25T14:30:00Z',
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
    read: false,
  },
  {
    id: 'notif_002',
    type: 'info',
    title: 'Queue Request Ready',
    message: 'Your rwaTBILL redemption is now claimable',
    amount: '$8,009.60',
    timestamp: '2026-07-25T10:00:00Z',
    read: false,
  },
  {
    id: 'notif_003',
    type: 'success',
    title: 'Yield Accrued',
    message: 'Your vault positions earned yield',
    amount: '$120.10',
    timestamp: '2026-07-25T00:00:00Z',
    read: true,
  },
];

// ===========================================================================
// MAIN EXPORTS
// ===========================================================================

export default {
  assets,
  pools,
  poolTypes,
  trades,
  queueRequests,
  vaults,
  userVaultPositions,
  dashboardStats,
  yieldBreakdown,
  pricing,
  curatorAgents,
  notifications,
};
