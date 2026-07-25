import { useState } from 'react';
import { isAddress } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import TxStatus from './TxStatus';
import { ADDRESSES } from '../../lib/contracts';
import { complianceNftAbi } from '../../lib/abis';
import { useTxFlow } from '../../hooks/useTxFlow';

/**
 * KycGrantCard — compliance desk, rendered only when the connected wallet is
 * the ComplianceNFT owner or an operator. Mints the soulbound KYC pass to any
 * address so it can use the delayed (queue / NAV settlement) redemption lane.
 */
const KycGrantCard = () => {
  const [target, setTarget] = useState('');
  const { run, status, step, errorMessage, txHash } = useTxFlow();
  const queryClient = useQueryClient();

  const valid = isAddress(target);

  const grant = async () => {
    if (!valid) return;
    const ok = await run(async ({ writeAndWait, read }) => {
      const balance = await read({
        address: ADDRESSES.ComplianceNFT,
        abi: complianceNftAbi,
        functionName: 'balanceOf',
        args: [target],
      });
      if (balance > 0n) throw new Error('Address already holds the KYC pass');
      await writeAndWait('Minting KYC pass…', {
        address: ADDRESSES.ComplianceNFT,
        abi: complianceNftAbi,
        functionName: 'mint',
        args: [target],
      });
    });
    if (ok) {
      setTarget('');
      queryClient.invalidateQueries();
    }
  };

  return (
    <GlassCard level={1} glow={false}>
      <div style={{ padding: 'var(--spacing-lg)' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: '700',
            color: 'var(--on-surface)',
          }}
        >
          Compliance desk
        </div>
        <p
          className="text-body-md"
          style={{ color: 'var(--on-surface-variant)', margin: '4px 0 var(--spacing-md)' }}
        >
          Your wallet operates the ComplianceNFT. Grant the soulbound KYC pass an address needs
          for delayed (queue) redemptions.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <InputField
              value={target}
              onChange={(e) => setTarget(e.target.value.trim())}
              placeholder="0x… address to verify"
              error={target && !valid ? 'Not a valid address' : undefined}
            />
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={!valid || status === 'pending'}
            loading={status === 'pending'}
            onClick={grant}
          >
            Grant KYC
          </Button>
        </div>
        {status !== 'idle' && (
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <TxStatus
              status={status}
              step={step}
              errorMessage={errorMessage}
              txHash={txHash}
              successLabel="KYC pass minted"
            />
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default KycGrantCard;
