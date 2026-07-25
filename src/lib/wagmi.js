import { http, createConfig, fallback } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

/**
 * Wagmi configuration — Ethereum Sepolia only.
 *
 * The whole RWA Outlets stack (official 1inch Aqua + AquaSwapVMRouter redeploys,
 * NavOracle, OutletRouter, RedemptionQueues, CuratorVaults, Faucet) lives on
 * Sepolia — see rwa-outlet-contracts-core/deployments/11155111.json.
 *
 * Set VITE_RPC_URL to pin a private RPC; public endpoints are the fallback.
 */

// Verified working + CORS-enabled (publicnode drops connections for some
// clients; 1rpc.io free tier is rate-limit-exhausted).
const rpcUrls = [
  import.meta.env.VITE_RPC_URL,
  'https://sepolia.drpc.org',
  'https://sepolia.gateway.tenderly.co',
  'https://eth-sepolia.api.onfinality.io/public',
].filter(Boolean);

/**
 * eth_getLogs needs different endpoints than plain reads: publicnode gates
 * historical logs behind a token, while drpc allows ≤10k-block ranges free.
 */
export const LOGS_RPC_URL = import.meta.env.VITE_RPC_URL || 'https://sepolia.drpc.org';
export const LOGS_MAX_RANGE = 9_500n;

export const CHAIN = sepolia;

export const wagmiConfig = createConfig({
  // mainnet is only used by the Uniswap Trading API lane (see
  // hooks/useUniswapLane.js) — the outlet stack itself is Sepolia-only.
  chains: [sepolia, mainnet],
  connectors: [injected()],
  transports: {
    [sepolia.id]: fallback(rpcUrls.map((url) => http(url, { batch: true }))),
    [mainnet.id]: http(),
  },
});
