import { useAccount } from 'wagmi';
import Chip from '../ui/Chip';
import { useKyc } from '../../hooks/useOutletData';

/** Compliance status chip — green when the wallet holds the soulbound KYC NFT. */
const KycBadge = () => {
  const { isConnected } = useAccount();
  const { hasKyc, isLoading } = useKyc();

  if (!isConnected || isLoading) return null;

  return (
    <Chip
      variant="default"
      size="sm"
      value={hasKyc ? 'KYC ✓' : 'No KYC'}
      style={
        hasKyc
          ? {
              background: 'rgba(0, 255, 163, 0.1)',
              borderColor: 'rgba(0, 255, 163, 0.5)',
              color: '#00ffa3',
            }
          : {
              background: 'rgba(255, 180, 171, 0.1)',
              borderColor: 'rgba(255, 180, 171, 0.5)',
              color: '#ffb4ab',
            }
      }
    />
  );
};

export default KycBadge;
