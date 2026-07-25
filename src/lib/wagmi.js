import { http, createConfig, fallback } from 'wagmi';
import { sepolia } from 'wagmi/chains';
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

const rpcUrls = [
  import.meta.env.VITE_RPC_URL,
  'https://ethereum-sepolia-rpc.publicnode.com',
  'https://sepolia.drpc.org',
  'https://1rpc.io/sepolia',
].filter(Boolean);

export const CHAIN = sepolia;

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: fallback(rpcUrls.map((url) => http(url, { batch: true }))),
  },
});
