import { parseAbi } from 'viem';

/**
 * Minimal ABIs for the deployed RWA Outlets stack, transcribed from
 * rwa-outlet-contracts-core/src (Sepolia deployment) and the faucet repo.
 */

export const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
]);

export const navOracleAbi = parseAbi([
  'function navOf(address asset) view returns (uint256 nav1e18, uint40 updatedAt)',
  'event NavUpdated(address indexed asset, uint256 nav, uint256 timestamp)',
]);

export const complianceNftAbi = parseAbi([
  'function balanceOf(address holder) view returns (uint256)',
  'function owner() view returns (address)',
  'function isOperator(address operator) view returns (bool)',
  'function mint(address to) returns (uint256)',
]);

export const faucetAbi = parseAbi([
  'function drip()',
  'function dripTo(address to)',
  'function nextClaimAt(address to) view returns (uint256)',
  'function cooldown() view returns (uint256)',
  'struct Token { address token; uint256 amount; }',
  'function allTokens() view returns (Token[])',
  'event Dripped(address indexed to, address indexed caller, uint256 timestamp)',
]);

export const outletRouterAbi = parseAbi([
  'function quoteInstant(address asset, uint256 amount) view returns (bytes32 bestHash, uint256 bestOut)',
  'function quoteBuy(address asset, uint256 usdcIn) view returns (bytes32 bestHash, uint256 bestOut)',
  // non-view (the v4 quoter simulates via revert) but readable through eth_call —
  // the exact quote redeemInstant()/buy() executes, INCLUDING the Uniswap v4 venue
  'function quoteInstantAll(address asset, uint256 amount, address user) returns (bytes32 bestHash, uint256 bestOut, bool viaV4)',
  'function quoteBuyAll(address asset, uint256 usdcIn, address user) returns (bytes32 bestHash, uint256 bestOut, bool viaV4)',
  'function redeemInstant(address asset, uint256 amount, uint256 minOut) returns (uint256 usdcOut)',
  'function buy(address asset, uint256 usdcIn, uint256 minOut) returns (uint256 assetOut)',
  'function enqueue(address asset, uint256 amount) returns (uint256 epoch)',
  'function listingsOf(address asset) view returns (bytes32[])',
  'function assetOf(bytes32 orderHash) view returns (address)',
  'function queueOf(address asset) view returns (address)',
  'event StrategyRegistered(address indexed asset, bytes32 indexed orderHash, address indexed maker, address registrar)',
  'event StrategyDelisted(address indexed asset, bytes32 indexed orderHash)',
  'event InstantExit(address indexed asset, address indexed user, bytes32 indexed orderHash, uint256 assetIn, uint256 usdcOut)',
  'event Purchase(address indexed asset, address indexed user, bytes32 indexed orderHash, uint256 usdcIn, uint256 assetOut)',
]);

export const redemptionQueueAbi = parseAbi([
  // ERC-7540 request + claim legs
  'function requestRedeem(uint256 shares, address controller, address owner) returns (uint256 requestId)',
  'function redeem(uint256 shares, address receiver, address controller) returns (uint256 assets)',
  'function pendingRedeemRequest(uint256 requestId, address controller) view returns (uint256)',
  'function claimableRedeemRequest(uint256 requestId, address controller) view returns (uint256)',
  'function maxRedeem(address controller) view returns (uint256)',
  'function setOperator(address operator, bool approved) returns (bool)',
  // queue state
  'function currentEpoch() view returns (uint256)',
  'function lastSettledEpoch() view returns (uint256)',
  'function lastSettledNav() view returns (uint256)',
  'function queueFeeBps() view returns (uint16)',
  'function issuerWindow() view returns (uint256)',
  'function totalAssets() view returns (uint256)',
  'struct Epoch { uint8 state; uint256 totalShares; uint256 navAtSettle; uint256 submittedAt; uint256 settledAt; }',
  'function epochInfo(uint256 epoch) view returns (Epoch memory)',
  'function epochsOf(address controller) view returns (uint256[])',
  'function sharesAt(uint256 epoch, address controller) view returns (uint256)',
  // events
  'event RedeemRequest(address indexed controller, address indexed owner, uint256 indexed requestId, address sender, uint256 shares)',
  'event Submitted(uint256 indexed epoch, uint256 totalShares)',
  'event Settled(uint256 indexed epoch, uint256 navAtSettle, uint256 assetsIn)',
  'event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
]);

export const curatorVaultAbi = parseAbi([
  // ERC-20 share
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function symbol() view returns (string)',
  // ERC-4626 deposit leg
  'function deposit(uint256 assets, address receiver) returns (uint256 shares)',
  'function totalAssets() view returns (uint256)',
  'function convertToShares(uint256 assets) view returns (uint256)',
  // ERC-7540 async redeem leg
  'function requestRedeem(uint256 shares, address controller, address owner) returns (uint256 requestId)',
  'function redeem(uint256 shares, address receiver, address controller) returns (uint256 assets)',
  'function pendingRedeemRequest(uint256 requestId, address controller) view returns (uint256)',
  'function claimableRedeemRequest(uint256 requestId, address controller) view returns (uint256)',
  'function maxRedeem(address controller) view returns (uint256)',
  'function currentEpoch() view returns (uint256)',
  // curator/pool surface
  'function poolCount() view returns (uint256)',
  'function poolHashes(uint256 index) view returns (bytes32)',
  'function pools(bytes32 strategyHash) view returns (address asset, uint8 kind, bool active)',
  'function shippedUsdcOf(address asset) view returns (uint256)',
  'function perAssetCap(address asset) view returns (uint256)',
  'function queuedShares(address asset) view returns (uint256)',
  'function curator() view returns (address)',
  'function curatorFeeBps() view returns (uint16)',
  'function maxDiscountFloorBps() view returns (uint16)',
  // events
  'event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)',
  'event RedeemRequest(address indexed controller, address indexed owner, uint256 indexed requestId, address sender, uint256 shares)',
  'event Withdraw(address indexed sender, address indexed receiver, address indexed controller, uint256 assets, uint256 shares)',
  'event PoolCreated(bytes32 indexed strategyHash, address indexed asset, uint8 kind, uint256 usdcShipped, uint256 rwaShipped, bytes params)',
  'event EpochFulfilled(uint256 indexed epoch, uint256 shares, uint256 assets)',
]);

export const aquaAbi = parseAbi([
  'function rawBalances(address maker, address app, bytes32 strategyHash, address token) view returns (uint248 balance, uint8 tokensCount)',
]);
