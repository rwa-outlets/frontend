# Uniswap Developer Platform — Integration Feedback

**Project:** RWA Outlets — an instant-liquidity market for tokenized real-world assets
(1inch Aqua/SwapVM pools + ERC-7540 redemption queues + an AI curator agent), with **Uniswap as
the secondary-market lane**: a v4 RWA/USDC pool gated by a compliance hook onchain, and the
**Uniswap Trading API** as the routing/execution rail for the assets' production twins with real
mainnet liquidity.

**What we integrated** (see README → "Uniswap API integration" for exact files/lines):

- Trading API `check_approval → quote → swap` flow, routing-aware (CLASSIC vs UniswapX
  DUTCH_V2/V3/PRIORITY), driven from a React frontend through a same-origin proxy that injects
  `x-api-key` server-side.
- Live quote comparison: for every exit/entry the user prices on our own onchain venues, we quote
  the same size through the Trading API against the asset's mainnet twin (USDY, USDe) and show
  which venue wins, in bps.
- Full wallet execution of the API-built swap: chain switch → approval tx from `/check_approval` →
  fresh `/quote` → EIP-712 `permitData` signing → `/swap` → broadcast (or gasless UniswapX order
  submission).
- Onchain, the same architecture runs a Uniswap **v4 pool with a custom hook** (compliance gate +
  TWAP oracle) and a router that arbitrates between our AMM pools and Uniswap
  (`rwa-outlet-contracts-core`: `RWAGateHook.sol`, `V4Venue.sol`, `OutletRouter.sol`).

## What worked well

1. **The 3-step flow is genuinely simple.** `/check_approval` returning a ready-to-send approval
   transaction (with the correct spender for the routing type) removed a whole class of
   Permit2-vs-router approval bugs we expected to have.
2. **Routing abstraction.** Getting UniswapX (gasless, MEV-protected) fills through the same
   endpoint as CLASSIC AMM routing, with no extra integration work beyond signing the order,
   is a standout. `BEST_PRICE` doing the venue arbitration for us mirrors exactly what our own
   onchain router does across Aqua pools — it made the "best-of both worlds" UX trivial.
3. **Quotes are fast and honest.** `gasFeeUSD` on CLASSIC quotes is directly displayable; not
   having to maintain our own gas-price × ETH-price estimation was appreciated.

## Friction points (ranked by time lost)

1. **No CORS support.** The API returns `415` on `OPTIONS` preflight, so any browser integration
   is forced through a proxy. That's workable in dev (Vite proxy) but adds real deployment
   surface in production. Per-key domain allowlisting with proper CORS headers would remove the
   proxy entirely for frontend-only teams.
2. **Response-shape divergence between routing types.** CLASSIC exposes `quote.output.amount`;
   UniswapX exposes `quote.orderInfo.outputs[0].startAmount` (and no `quote.output`). Code that
   was tested against CLASSIC crashes the first time `BEST_PRICE` returns `DUTCH_V2`. A
   normalized top-level field (e.g. `quote.outputAmount` on every routing type) would eliminate
   this class of bug.
3. **Misleading validation errors around `permitData`.** Sending `permitData` with a UniswapX
   `/swap` body fails with `"quote" does not match any of the allowed types` — the error points
   at the wrong field. Similarly `permitData: null` (which `/quote` itself returns!) is rejected
   if echoed back. The rule "strip nulls, include permitData only for CLASSIC" cost us the most
   debugging time of the whole integration.
4. **Inconsistent chain-id typing.** `/quote` wants `tokenInChainId` as a *string*, while
   `/check_approval` takes `chainId` as a *number*. Harmonizing these (or accepting both
   everywhere) would remove a silent 400.
5. **No testnet routing for custom tokens.** Our demo RWAs live on Sepolia, where the API has
   nothing to route — reasonable, but it forces hackathon projects into "mainnet twin" patterns
   like ours. A sandbox mode (even mainnet-fork-backed quotes marked non-executable) would let
   teams demo end-to-end against their own tokens.
6. **Discovery for tokenized RWAs / stocks.** The platform now supports tokenized stocks — but we
   found no endpoint to *enumerate* routable tokenized assets/pairs. We hardcoded USDY/USDe after
   trial-and-error 404s from `/quote`. A `GET /tokens?category=rwa|stocks` discovery endpoint
   would have decided our asset mapping in minutes instead of hours, and it is exactly what
   agent-based integrations (our curator agent) need to expand coverage autonomously.

## Wishlist

- Webhook / SSE order-status for UniswapX fills (we currently have no clean way to confirm a
  gasless fill from the frontend without polling).
- Quote-level route transparency for v4 pools with hooks (whether a hooked pool was considered,
  and if it was excluded, why) — relevant to anyone shipping compliance-gated RWA pools.
- First-class support for permissioned/allowlisted tokens: RWA tokens frequently gate transfers;
  a way to declare "this swapper is allowlisted" so routing doesn't silently drop those pools.

— RWA Outlets team, ETHGlobal hackathon submission
