import Chip from './Chip';

/** EXIT (sell RWA → USDC) / ENTRY (buy RWA) label used in trade tables. */
const DirectionChip = ({ direction }) => (
  <Chip
    variant="default"
    value={direction.toUpperCase()}
    size="sm"
    style={{
      background: direction === 'exit' ? 'rgba(0, 255, 163, 0.1)' : 'rgba(112, 0, 255, 0.1)',
      borderColor: direction === 'exit' ? '#00ffa3' : '#7000ff',
      color: direction === 'exit' ? '#00ffa3' : '#d1bcff',
    }}
  />
);

export default DirectionChip;
