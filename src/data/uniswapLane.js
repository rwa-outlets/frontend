/**
 * Uniswap secondary lane — mainnet "production twins" of the Sepolia demo RWAs.
 *
 * The demo tokens (rwaTBILL / rwaCREDIT) live on Sepolia where the Trading API
 * has nothing to route, so each demo asset maps to the real, live tokenized
 * asset it stands in for. The Uniswap API quotes (and can execute) the twin
 * pair against real mainnet liquidity — this is the production path of the
 * OutletRouter's Uniswap fallback venue (docs/02-engine-spec.md §6): on chains
 * where the RWA has genuine secondary liquidity, exits route through the
 * Uniswap API when it beats the outlet pools.
 */

export const UNISWAP_LANE_CHAIN_ID = 1; // Ethereum mainnet
export const UNISWAP_LANE_EXPLORER = 'https://etherscan.io';

export const MAINNET_USDC = {
  symbol: 'USDC',
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  decimals: 6,
};

export const MAINNET_TWINS = {
  rwaTBILL: {
    symbol: 'USDY',
    name: 'Ondo US Dollar Yield',
    issuer: 'Ondo Finance',
    address: '0x96F6eF951840721AdBF46Ac996b59E0235CB985C',
    decimals: 18,
    note: 'Tokenized note backed by short-term US Treasuries — the live counterpart of the rwaTBILL demo asset.',
  },
  rwaCREDIT: {
    symbol: 'USDe',
    name: 'Ethena USDe',
    issuer: 'Ethena',
    address: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
    decimals: 18,
    note: 'Yield-bearing synthetic dollar with deep onchain liquidity — stands in for the rwaCREDIT demo asset.',
  },
};
