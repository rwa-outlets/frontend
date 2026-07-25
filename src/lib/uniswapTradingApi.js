/**
 * Uniswap Trading API client (https://trade-api.gateway.uniswap.org/v1).
 *
 * All calls go through the same-origin `/api/uniswap` proxy (vite.config.js in
 * dev, a rewrite rule in prod) which injects the `x-api-key` and
 * `x-universal-router-version` headers server-side — the API key never reaches
 * the browser bundle, and the proxy sidesteps the API's missing CORS preflight
 * support (OPTIONS returns 415).
 *
 * Flow per the Uniswap Developer Platform docs:
 *   POST /check_approval → POST /quote → POST /swap
 */

const API_BASE = '/api/uniswap';

export class TradingApiError extends Error {
  constructor(message, { status, detail } = {}) {
    super(message);
    this.name = 'TradingApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new TradingApiError(
      data.detail || data.errorCode || `Trading API error ${res.status}`,
      { status: res.status, detail: data },
    );
  }
  return data;
}

/** Step 1 — returns `{ approval }`; `approval === null` means already approved. */
export function checkApproval({ walletAddress, token, amount, chainId }) {
  return post('/check_approval', { walletAddress, token, amount, chainId });
}

/** Step 2 — chain ids must be STRINGS per the API schema. */
export function fetchQuote({
  swapper,
  tokenIn,
  tokenOut,
  chainId,
  amount,
  type = 'EXACT_INPUT',
  slippageTolerance = 0.5,
}) {
  return post('/quote', {
    swapper,
    tokenIn,
    tokenOut,
    tokenInChainId: String(chainId),
    tokenOutChainId: String(chainId),
    amount,
    type,
    slippageTolerance,
    routingPreference: 'BEST_PRICE',
  });
}

/** UniswapX (gasless, filler-executed) routings have a different quote shape. */
export function isUniswapXQuote(q) {
  return q.routing === 'DUTCH_V2' || q.routing === 'DUTCH_V3' || q.routing === 'PRIORITY';
}

/**
 * Output amount as a raw base-unit string, across routing types: CLASSIC has
 * `quote.output.amount`; UniswapX has `orderInfo.outputs[0].startAmount`
 * (best-case fill; `endAmount` is the auction-decay floor).
 */
export function getOutputAmountRaw(q) {
  if (isUniswapXQuote(q)) {
    const out = q.quote?.orderInfo?.outputs?.[0];
    if (!out) throw new TradingApiError('UniswapX quote has no outputs');
    return out.startAmount;
  }
  const amount = q.quote?.output?.amount;
  if (!amount) throw new TradingApiError(`Unrecognized quote shape for routing ${q.routing}`);
  return amount;
}

/**
 * Step 3 request body: the quote response is SPREAD into the body (never
 * wrapped in `{quote}`), and `permitData` handling is routing-aware — CLASSIC
 * needs signature+permitData together, UniswapX signs permitData locally but
 * must NOT send it to /swap (the order is already in `encodedOrder`).
 */
export function prepareSwapRequest(quoteResponse, signature) {
  // eslint-disable-next-line no-unused-vars
  const { permitData, permitTransaction, ...cleanQuote } = quoteResponse;
  const request = { ...cleanQuote };

  if (isUniswapXQuote(quoteResponse)) {
    if (signature) request.signature = signature;
  } else if (signature && permitData && typeof permitData === 'object') {
    request.signature = signature;
    request.permitData = permitData;
  }
  return request;
}

/**
 * Step 3 — returns `{ swap }` (a ready-to-sign tx) for CLASSIC routes; UniswapX
 * submissions return order tracking fields instead of a tx.
 */
export function fetchSwapTx(quoteResponse, signature) {
  return post('/swap', prepareSwapRequest(quoteResponse, signature));
}

/** Pre-broadcast validation: an empty `data` means the quote expired. */
export function validateSwapTx(swap) {
  if (!swap?.data || swap.data === '0x' || swap.data === '') {
    throw new TradingApiError('swap.data is empty — quote expired, re-fetch and retry');
  }
  if (!/^0x[0-9a-fA-F]*$/.test(swap.data) || !/^0x[0-9a-fA-F]{40}$/.test(swap.to || '')) {
    throw new TradingApiError('Malformed swap transaction from Trading API');
  }
}

/**
 * EIP-712 primary type for `permitData` signing: the one type key that no
 * other type references (e.g. PermitSingle for Permit2, the order type for
 * UniswapX Dutch orders).
 */
export function findPrimaryType(types) {
  const referenced = new Set();
  for (const fields of Object.values(types)) {
    for (const field of fields) referenced.add(field.type.replace('[]', ''));
  }
  return Object.keys(types).find((k) => k !== 'EIP712Domain' && !referenced.has(k));
}
