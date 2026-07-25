/**
 * Deployed contract addresses — Ethereum Sepolia (11155111).
 * Source of truth: rwa-outlet-contracts-core/deployments/11155111.json
 */

export const CHAIN_ID = 11155111;

export const ADDRESSES = {
  Aqua: '0xA787Dd5eF559569b068283D2617e0D8484C08e9B',
  AquaSwapVMRouter: '0xc4D05Fc049B819DAAf2753d5a0D32402b8a76d47',
  ComplianceNFT: '0x82E0649Ec0783985FeB4201f126783bD4fC31031',
  CuratorVault_Express: '0x4AaAB2c212dA4d261E5F50F5A97B5d2d3892E204',
  CuratorVault_Patient: '0x4C299f2cE2D07C77e8280a286241e0a30EaD9ae9',
  Faucet: '0xE78E87D994358D17aaf4653d8398f22C93fb758A',
  NavExtruction: '0xFD8C2d242e82F7Ba28a2a038461C45481EA3849A',
  NavOracle: '0x49f587A7203C2CE7765CAcdD0D5bf912BF52a692',
  OutletRouter: '0x9C352AE4df4853D25F2691c9183c336E0c112289',
  RWAGateHook: '0x06Ae6eeAfC42d4Ca4158Bd3BddC4B14Cc54948C0',
  RedemptionQueue_rwaCREDIT: '0xb12EE4D7f546C5B6Cb3EcC2b770B9b6780354502',
  RedemptionQueue_rwaTBILL: '0xBf14ed0b9E2d3A167f9119082440A91C9C810472',
  TestUSDC: '0x062b2F19C852e486b4b913933420957018d1db31',
  rwaCREDIT: '0xFbca2B3334138C109D51f5101343DE0A35a0eDD9',
  rwaTBILL: '0x5456E52531085291a35CF0d902aE72D6616b665D',
};

export const EXPLORER_URL = 'https://sepolia.etherscan.io';

/** USDC settlement token (TestUSDC, 6 decimals). */
export const USDC = {
  id: 'USDC',
  symbol: 'USDC',
  name: 'Test USD Coin',
  decimals: 6,
  logo: '💵',
  address: ADDRESSES.TestUSDC,
};

/**
 * Live RWA assets. Issuer windows are compressed for the demo
 * (60 s ≙ T+7, 90 s ≙ T+90 — see contracts README).
 */
export const RWA_ASSETS = {
  rwaTBILL: {
    id: 'rwaTBILL',
    symbol: 'rwaTBILL',
    name: 'Tokenized T-Bill Fund',
    decimals: 18,
    logo: '🏛️',
    category: 'T-Bill',
    settlement: 'T+7',
    riskTier: 'express',
    address: ADDRESSES.rwaTBILL,
    queue: ADDRESSES.RedemptionQueue_rwaTBILL,
  },
  rwaCREDIT: {
    id: 'rwaCREDIT',
    symbol: 'rwaCREDIT',
    name: 'Private Credit Fund',
    decimals: 18,
    logo: '🏢',
    category: 'Private Credit',
    settlement: 'T+90',
    riskTier: 'patient',
    address: ADDRESSES.rwaCREDIT,
    queue: ADDRESSES.RedemptionQueue_rwaCREDIT,
  },
};

export const RWA_LIST = Object.values(RWA_ASSETS);

export const assetByAddress = (address) =>
  RWA_LIST.find((a) => a.address.toLowerCase() === String(address).toLowerCase());

/** CuratorVaults — one per risk tier. */
export const VAULTS = {
  express: {
    id: 'express',
    name: 'Express Tier Vault',
    symbol: 'roEXP',
    description:
      'USDC vault operating high-liquidity, short-settlement RWAs (rwaTBILL) through Express pools.',
    address: ADDRESSES.CuratorVault_Express,
    mandateAssets: [RWA_ASSETS.rwaTBILL],
  },
  patient: {
    id: 'patient',
    name: 'Patient Tier Vault',
    symbol: 'roPAT',
    description:
      'USDC vault operating longer-dated RWAs (rwaCREDIT) through Dutch-decay Patient pools.',
    address: ADDRESSES.CuratorVault_Patient,
    mandateAssets: [RWA_ASSETS.rwaCREDIT],
  },
};

export const VAULT_LIST = Object.values(VAULTS);

/** CuratorVault.PoolKind enum → UI pool type. */
export const POOL_KIND = { 0: 'express', 1: 'patient', 2: 'market' };
