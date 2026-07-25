/**
 * Static pool-type descriptions, aligned with docs/01-architecture.md and the
 * deployed SwapVM programs (NavExtruction FixedSpread / DutchDecay / NavBand).
 */
export const poolTypes = {
  express: {
    id: 'express',
    name: 'Express',
    description:
      'High-liquidity RWAs with short settlement. Instant USDC at NAV minus a tight fixed spread, quoted by a NAV-oracle-anchored SwapVM program.',
    icon: '⚡',
    typicalSpread: '5–25 bps',
    settlementTime: 'Instant (asset redeems T+7)',
    riskLevel: 'Low',
    yieldSource: 'Redemption spreads + Aqua capital reuse',
    suitableFor: 'Blue-chip T-bills, MMF shares (rwaTBILL)',
  },
  patient: {
    id: 'patient',
    name: 'Patient',
    description:
      'Longer-dated / less liquid RWAs. Instant USDC via a Dutch-decay auction: the discount starts tight and decays toward a floor until a fill clears — onchain price discovery replacing RFQ bidding.',
    icon: '⏳',
    typicalSpread: '30 → 300 bps decay',
    settlementTime: 'Instant (asset redeems T+90)',
    riskLevel: 'Medium',
    yieldSource: 'Auction discounts + NAV capture via the queue',
    suitableFor: 'Private credit, longer issuer windows (rwaCREDIT)',
  },
  market: {
    id: 'market',
    name: 'Market',
    description:
      'Two-sided constant-product AMM (xyc over shipped Aqua balances) quoting both exits and entries, with an optional NAV-band sanity check.',
    icon: '💱',
    typicalSpread: '30 bps swap fee',
    settlementTime: 'Instant',
    riskLevel: 'Medium',
    yieldSource: 'Swap fees + capital reuse',
    suitableFor: 'All supported RWAs, both directions',
  },
  bid: {
    id: 'bid',
    name: 'Resting Bid',
    description:
      'An isolated maker strategy shipped with exactly the bid size at a hand-picked discount — the onchain analog of an RFQ bid. Quoted by the router alongside the pools.',
    icon: '🎯',
    typicalSpread: 'maker-set',
    settlementTime: 'Instant',
    riskLevel: 'Maker-priced',
    yieldSource: 'NAV capture on filled inventory',
    suitableFor: 'Pro makers (B2B)',
  },
};

export const poolTypeName = (type, assetSymbol) => {
  const info = poolTypes[type] ?? poolTypes.express;
  return `${info.name} — ${assetSymbol}`;
};
