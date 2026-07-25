import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { ADDRESSES } from '../../lib/contracts';
import { faucetAbi } from '../../lib/abis';
import { useTxFlow } from '../../hooks/useTxFlow';
import { useFaucetStatus, useKyc } from '../../hooks/useOutletData';

/**
 * FaucetButton — one click mints demo USDC + rwaTBILL + rwaCREDIT and, when
 * missing, the soulbound ComplianceNFT KYC pass (all inside Faucet.drip()).
 */
const FaucetButton = ({ size = 'sm', fullWidth = false }) => {
  const { isConnected } = useAccount();
  const { isReady, readyAt, refetch } = useFaucetStatus();
  const { hasKyc, refetch: refetchKyc } = useKyc();
  const { run, status, step } = useTxFlow();
  const queryClient = useQueryClient();

  if (!isConnected) return null;

  const onDrip = async () => {
    await run(async ({ writeAndWait }) => {
      await writeAndWait('Dripping demo tokens…', {
        address: ADDRESSES.Faucet,
        abi: faucetAbi,
        functionName: 'drip',
      });
    });
    refetch();
    refetchKyc();
    queryClient.invalidateQueries();
  };

  const cooldownLabel = () => {
    const secs = readyAt - Math.floor(Date.now() / 1000);
    if (secs <= 0) return '';
    if (secs < 3600) return ` (${Math.ceil(secs / 60)}m)`;
    return ` (${Math.ceil(secs / 3600)}h)`;
  };

  return (
    <Button
      variant="ghost"
      size={size}
      fullWidth={fullWidth}
      loading={status === 'pending'}
      disabled={!isReady}
      onClick={onDrip}
      title={
        hasKyc
          ? 'Mint demo USDC + RWA tokens'
          : 'Mint demo tokens + your ComplianceNFT KYC pass'
      }
    >
      <span>🚰</span>
      <span>
        {status === 'pending' && step
          ? step
          : isReady
            ? hasKyc
              ? 'Faucet'
              : 'Faucet + KYC'
            : `Faucet${cooldownLabel()}`}
      </span>
    </Button>
  );
};

export default FaucetButton;
