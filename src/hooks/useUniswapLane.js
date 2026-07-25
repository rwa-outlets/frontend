import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useConfig } from 'wagmi';
import {
  sendTransaction,
  signTypedData,
  switchChain,
  waitForTransactionReceipt,
} from 'wagmi/actions';
import { parseUnits, formatUnits } from 'viem';
import { useDebouncedValue } from './useDebouncedValue';
import {
  checkApproval,
  fetchQuote,
  fetchSwapTx,
  findPrimaryType,
  getOutputAmountRaw,
  isUniswapXQuote,
  validateSwapTx,
  TradingApiError,
} from '../lib/uniswapTradingApi';
import {
  MAINNET_TWINS,
  MAINNET_USDC,
  UNISWAP_LANE_CHAIN_ID,
} from '../data/uniswapLane';

/** Quote-only calls accept any syntactically valid swapper address. */
const PLACEHOLDER_SWAPPER = '0x000000000000000000000000000000000000dEaD';

function lanePair(assetId, direction) {
  const twin = MAINNET_TWINS[assetId];
  if (!twin) return null;
  return direction === 'exit'
    ? { twin, tokenIn: twin, tokenOut: MAINNET_USDC }
    : { twin, tokenIn: MAINNET_USDC, tokenOut: twin };
}

/**
 * Live Trading API quote for the demo asset's mainnet twin pair, mirroring the
 * amount the user typed into the outlet swap widget. Refreshes inside the
 * ~30 s quote-validity window.
 */
export function useUniswapLaneQuote(assetId, direction, amountInput) {
  const { address } = useAccount();
  const debounced = useDebouncedValue(amountInput, 350);
  const pair = lanePair(assetId, direction);
  const amountNum = Number(debounced);
  const enabled = !!pair && Number.isFinite(amountNum) && amountNum > 0;

  return useQuery({
    queryKey: ['uniswap-lane-quote', assetId, direction, String(debounced), address ?? 'anon'],
    enabled,
    refetchInterval: 20_000,
    retry: (failureCount, err) =>
      failureCount < 2 && (err?.status === 429 || (err?.status ?? 0) >= 500),
    queryFn: async () => {
      const { twin, tokenIn, tokenOut } = pair;
      const amountRaw = parseUnits(String(debounced), tokenIn.decimals).toString();
      try {
        const quote = await fetchQuote({
          swapper: address ?? PLACEHOLDER_SWAPPER,
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          chainId: UNISWAP_LANE_CHAIN_ID,
          amount: amountRaw,
        });
        const out = Number(formatUnits(BigInt(getOutputAmountRaw(quote)), tokenOut.decimals));
        return {
          available: true,
          twin,
          routing: quote.routing,
          gasless: isUniswapXQuote(quote),
          gasFeeUSD: quote.quote?.gasFeeUSD ?? null,
          out,
          // effective USDC per 1 twin token, comparable to the outlet quote rate
          rate: direction === 'exit' ? out / amountNum : amountNum / out,
          raw: quote,
        };
      } catch (e) {
        if (e instanceof TradingApiError && e.status === 404) {
          return { available: false, twin, reason: 'no-route' };
        }
        if (e instanceof TradingApiError && (e.status === 401 || e.status === 403)) {
          return { available: false, twin, reason: 'no-key' };
        }
        throw e;
      }
    },
  });
}

/**
 * Full Trading API execution flow on mainnet, driven by the connected wallet:
 * switch chain → /check_approval (+ approval tx) → fresh /quote → sign
 * permitData when present → /swap → broadcast (CLASSIC) or gasless order
 * submission (UniswapX). Every onchain step is confirmed by the user in their
 * wallet.
 */
export function useUniswapLaneExecute() {
  const config = useConfig();
  const { address } = useAccount();
  const [status, setStatus] = useState('idle'); // idle | pending | success | error
  const [step, setStep] = useState('');
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const run = useCallback(
    async ({ assetId, direction, amountInput }) => {
      const pair = lanePair(assetId, direction);
      if (!pair || !address) return false;
      setStatus('pending');
      setError(null);
      setTxHash(null);

      try {
        const { tokenIn, tokenOut } = pair;
        const amountRaw = parseUnits(String(amountInput), tokenIn.decimals).toString();

        setStep('Switching to Ethereum mainnet…');
        await switchChain(config, { chainId: UNISWAP_LANE_CHAIN_ID });

        setStep('Checking token approval…');
        const { approval } = await checkApproval({
          walletAddress: address,
          token: tokenIn.address,
          amount: amountRaw,
          chainId: UNISWAP_LANE_CHAIN_ID,
        });
        if (approval) {
          setStep(`Approving ${tokenIn.symbol}…`);
          const approvalHash = await sendTransaction(config, {
            to: approval.to,
            data: approval.data,
            value: BigInt(approval.value || '0'),
            chainId: UNISWAP_LANE_CHAIN_ID,
          });
          await waitForTransactionReceipt(config, {
            hash: approvalHash,
            chainId: UNISWAP_LANE_CHAIN_ID,
          });
        }

        setStep('Fetching executable quote…');
        const quote = await fetchQuote({
          swapper: address,
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          chainId: UNISWAP_LANE_CHAIN_ID,
          amount: amountRaw,
        });

        let signature;
        if (quote.permitData && typeof quote.permitData === 'object') {
          setStep(isUniswapXQuote(quote) ? 'Signing Dutch order…' : 'Signing permit…');
          const { domain, types, values } = quote.permitData;
          signature = await signTypedData(config, {
            domain,
            types,
            primaryType: findPrimaryType(types),
            message: values,
          });
        }

        setStep('Building swap via Trading API…');
        const swapResponse = await fetchSwapTx(quote, signature);

        if (swapResponse.swap) {
          validateSwapTx(swapResponse.swap);
          setStep('Executing on Uniswap…');
          const hash = await sendTransaction(config, {
            to: swapResponse.swap.to,
            data: swapResponse.swap.data,
            value: BigInt(swapResponse.swap.value || '0'),
            gas: swapResponse.swap.gasLimit ? BigInt(swapResponse.swap.gasLimit) : undefined,
            chainId: UNISWAP_LANE_CHAIN_ID,
          });
          setTxHash(hash);
          await waitForTransactionReceipt(config, { hash, chainId: UNISWAP_LANE_CHAIN_ID });
        }
        // UniswapX: no tx to send — the signed order was submitted to the
        // filler network by /swap; fillers pay gas.

        setStatus('success');
        return true;
      } catch (e) {
        console.error('uniswap lane execution failed:', e);
        setError(e);
        setStatus('error');
        return false;
      } finally {
        setStep('');
      }
    },
    [config, address],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setStep('');
    setError(null);
    setTxHash(null);
  }, []);

  const errorMessage = error
    ? error.shortMessage || error.message?.split('\n')[0] || 'Uniswap execution failed'
    : null;

  return { run, status, step, error, errorMessage, txHash, reset };
}
