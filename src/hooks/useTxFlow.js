import { useState, useCallback } from 'react';
import { useConfig } from 'wagmi';
import { writeContract, waitForTransactionReceipt, readContract } from 'wagmi/actions';
import { erc20Abi } from '../lib/abis';

/**
 * useTxFlow — runs a multi-step onchain flow (e.g. approve → deposit) with
 * per-step status reporting for the UI.
 *
 * const { run, status, step, errorMessage, txHash, reset } = useTxFlow();
 * await run(async ({ writeAndWait, ensureAllowance }) => { ... });
 */
export function useTxFlow() {
  const config = useConfig();
  const [status, setStatus] = useState('idle'); // idle | pending | success | error
  const [step, setStep] = useState('');
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const run = useCallback(
    async (flow) => {
      setStatus('pending');
      setError(null);
      setTxHash(null);

      const writeAndWait = async (label, request) => {
        setStep(label);
        const hash = await writeContract(config, request);
        setTxHash(hash);
        const receipt = await waitForTransactionReceipt(config, { hash });
        if (receipt.status !== 'success') {
          throw new Error(`${label} reverted onchain`);
        }
        return receipt;
      };

      /** Approves `spender` for `amount` of `token` when the current allowance is short. */
      const ensureAllowance = async ({ token, owner, spender, amount, symbol = 'token' }) => {
        const allowance = await readContract(config, {
          address: token,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [owner, spender],
        });
        if (allowance < amount) {
          await writeAndWait(`Approving ${symbol}…`, {
            address: token,
            abi: erc20Abi,
            functionName: 'approve',
            args: [spender, amount],
          });
        }
      };

      try {
        const result = await flow({
          writeAndWait,
          ensureAllowance,
          read: (request) => readContract(config, request),
        });
        setStatus('success');
        return result ?? true;
      } catch (e) {
        console.error('tx flow failed:', e);
        setError(e);
        setStatus('error');
        return false;
      } finally {
        setStep('');
      }
    },
    [config],
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setStep('');
    setError(null);
    setTxHash(null);
  }, []);

  const errorMessage = error
    ? error.shortMessage || error.message?.split('\n')[0] || 'Transaction failed'
    : null;

  return { run, status, step, error, errorMessage, txHash, reset };
}
