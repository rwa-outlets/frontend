import { EXPLORER_URL } from '../../lib/contracts';

/**
 * TxStatus — inline feedback for a useTxFlow instance.
 * Shows the current step while pending, the Etherscan link on success,
 * and the revert reason on error.
 */
const TxStatus = ({
  status,
  step,
  errorMessage,
  txHash,
  successLabel = 'Transaction confirmed',
  explorerUrl = EXPLORER_URL,
}) => {
  if (status === 'idle') return null;

  const base = {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    padding: 'var(--spacing-sm) var(--spacing-md)',
    borderRadius: 'var(--rounded-sm, 8px)',
    border: '1px solid',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  };

  if (status === 'pending') {
    return (
      <div
        style={{
          ...base,
          borderColor: 'rgba(0, 255, 163, 0.3)',
          background: 'rgba(0, 255, 163, 0.06)',
          color: 'var(--primary-container)',
        }}
      >
        ⏳ {step || 'Waiting for wallet confirmation…'}
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div
        style={{
          ...base,
          borderColor: 'rgba(0, 255, 163, 0.5)',
          background: 'rgba(0, 255, 163, 0.08)',
          color: '#00ffa3',
        }}
      >
        ✓ {successLabel}
        {txHash && (
          <>
            {' · '}
            <a
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              view tx ↗
            </a>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        ...base,
        borderColor: 'rgba(255, 180, 171, 0.5)',
        background: 'rgba(255, 180, 171, 0.08)',
        color: '#ffb4ab',
      }}
    >
      ✕ {errorMessage || 'Transaction failed'}
    </div>
  );
};

export default TxStatus;
