/**
 * RWA Outlets subgraph (The Graph studio, Sepolia).
 *
 * Source: rwa-outlet-contracts-back/subgraph — indexes NavExtruction trades,
 * Aqua strategies, queues, vaults, KYC set and NAV history. Trade entities are
 * sourced from NavExtruction.Trade events, so every pool fill is captured no
 * matter which router routed it.
 */

export const SUBGRAPH_URL =
  import.meta.env.VITE_SUBGRAPH_URL ||
  'https://api.studio.thegraph.com/query/1756992/rwa-outlet-contracts-core/version/latest';

export async function querySubgraph(query, variables = {}) {
  const res = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Subgraph HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? 'Subgraph query error');
  }
  return json.data;
}
