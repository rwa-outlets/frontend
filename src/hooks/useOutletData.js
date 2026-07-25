import { useQuery } from '@tanstack/react-query';
import { useAccount, useConfig, useReadContract, useReadContracts } from 'wagmi';
import { readContract, readContracts } from 'wagmi/actions';
import { createPublicClient, http, formatUnits, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { LOGS_RPC_URL, LOGS_MAX_RANGE } from '../lib/wagmi';
import {
  ADDRESSES,
  USDC,
  RWA_ASSETS,
  RWA_LIST,
  VAULTS,
  VAULT_LIST,
  POOL_KIND,
  assetByAddress,
} from '../lib/contracts';
import {
  navOracleAbi,
  erc20Abi,
  complianceNftAbi,
  faucetAbi,
  outletRouterAbi,
  curatorVaultAbi,
  redemptionQueueAbi,
  aquaAbi,
} from '../lib/abis';
import { useDebouncedValue } from './useDebouncedValue';

const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const toFloat = (value, decimals) =>
  value === undefined || value === null ? 0 : Number(formatUnits(value, decimals));

// ---------------------------------------------------------------- NAV oracle

/** Live NAV per RWA asset from the NavOracle (1e18, keeper-updated). */
export function useNavs() {
  const result = useReadContracts({
    contracts: RWA_LIST.map((a) => ({
      address: ADDRESSES.NavOracle,
      abi: navOracleAbi,
      functionName: 'navOf',
      args: [a.address],
    })),
    query: { refetchInterval: 30_000 },
  });

  const navs = {};
  RWA_LIST.forEach((a, i) => {
    const r = result.data?.[i];
    navs[a.id] =
      r?.status === 'success'
        ? {
            nav: toFloat(r.result[0], 18),
            nav1e18: r.result[0],
            updatedAt: Number(r.result[1]),
          }
        : null;
  });

  return { navs, isLoading: result.isLoading };
}

// ------------------------------------------------------------- user balances

/** Connected wallet balances for USDC + all RWA demo tokens. */
export function useTokenBalances() {
  const { address } = useAccount();
  const tokens = [USDC, ...RWA_LIST];

  const result = useReadContracts({
    contracts: tokens.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
    })),
    query: { enabled: !!address, refetchInterval: 15_000 },
  });

  const balances = {};
  tokens.forEach((t, i) => {
    const r = result.data?.[i];
    balances[t.id] = {
      raw: r?.status === 'success' ? r.result : 0n,
      value: r?.status === 'success' ? toFloat(r.result, t.decimals) : 0,
    };
  });

  return { balances, isLoading: result.isLoading, refetch: result.refetch };
}

// ---------------------------------------------------------------------- KYC

/** Soulbound ComplianceNFT pass — required by pool programs / gated transfers. */
export function useKyc() {
  const { address } = useAccount();
  const { data, isLoading, refetch } = useReadContract({
    address: ADDRESSES.ComplianceNFT,
    abi: complianceNftAbi,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address, refetchInterval: 30_000 },
  });
  return { hasKyc: (data ?? 0n) > 0n, isLoading, refetch };
}

/** True when the connected wallet can issue KYC passes (ComplianceNFT owner or operator). */
export function useKycAdmin() {
  const { address } = useAccount();
  const { data: owner } = useReadContract({
    address: ADDRESSES.ComplianceNFT,
    abi: complianceNftAbi,
    functionName: 'owner',
  });
  const { data: isOperator } = useReadContract({
    address: ADDRESSES.ComplianceNFT,
    abi: complianceNftAbi,
    functionName: 'isOperator',
    args: [address],
    query: { enabled: !!address },
  });
  const canGrant =
    !!address && (owner?.toLowerCase() === address.toLowerCase() || isOperator === true);
  return { canGrant };
}

// -------------------------------------------------------------------- faucet

/** Faucet claim status (drip() mints demo tokens + the KYC pass). */
export function useFaucetStatus() {
  const { address } = useAccount();
  const { data, isLoading, refetch } = useReadContract({
    address: ADDRESSES.Faucet,
    abi: faucetAbi,
    functionName: 'nextClaimAt',
    args: [address],
    query: { enabled: !!address, refetchInterval: 30_000 },
  });
  const readyAt = data ? Number(data) : 0;
  return {
    readyAt,
    isReady: !!address && readyAt <= Math.floor(Date.now() / 1000),
    isLoading,
    refetch,
  };
}

// --------------------------------------------------------------- live pools

/**
 * Live pools = strategies the CuratorVaults shipped on Aqua (enumerable via
 * poolCount/poolHashes/pools) + any other maker listings on the OutletRouter
 * (shown as resting bids). TVL comes from Aqua rawBalances valued at oracle NAV.
 */
export function useLivePools() {
  const config = useConfig();

  return useQuery({
    queryKey: ['live-pools'],
    refetchInterval: 30_000,
    queryFn: async () => {
      // NAVs (tolerate unset assets)
      const navRes = await readContracts(config, {
        allowFailure: true,
        contracts: RWA_LIST.map((a) => ({
          address: ADDRESSES.NavOracle,
          abi: navOracleAbi,
          functionName: 'navOf',
          args: [a.address],
        })),
      });
      const navByAssetId = {};
      RWA_LIST.forEach((a, i) => {
        navByAssetId[a.id] =
          navRes[i]?.status === 'success' ? toFloat(navRes[i].result[0], 18) : null;
      });

      // Vault pool hashes
      const countRes = await readContracts(config, {
        allowFailure: true,
        contracts: VAULT_LIST.map((v) => ({
          address: v.address,
          abi: curatorVaultAbi,
          functionName: 'poolCount',
        })),
      });

      const hashCalls = [];
      VAULT_LIST.forEach((vault, vi) => {
        const n = countRes[vi]?.status === 'success' ? Number(countRes[vi].result) : 0;
        for (let i = 0; i < n; i++) {
          hashCalls.push({
            vault,
            call: {
              address: vault.address,
              abi: curatorVaultAbi,
              functionName: 'poolHashes',
              args: [BigInt(i)],
            },
          });
        }
      });

      const hashRes = hashCalls.length
        ? await readContracts(config, {
            allowFailure: true,
            contracts: hashCalls.map((h) => h.call),
          })
        : [];
      const vaultPoolRefs = hashCalls
        .map((h, i) => ({
          vault: h.vault,
          hash: hashRes[i]?.status === 'success' ? hashRes[i].result : null,
        }))
        .filter((e) => e.hash);

      // Pool info + Aqua balances (USDC leg first; RWA leg after info resolves)
      const infoRes = vaultPoolRefs.length
        ? await readContracts(config, {
            allowFailure: true,
            contracts: vaultPoolRefs.map((e) => ({
              address: e.vault.address,
              abi: curatorVaultAbi,
              functionName: 'pools',
              args: [e.hash],
            })),
          })
        : [];

      const balanceCalls = [];
      vaultPoolRefs.forEach((e, i) => {
        const info = infoRes[i]?.status === 'success' ? infoRes[i].result : null;
        if (!info) return;
        const [assetAddr] = info;
        balanceCalls.push(
          {
            address: ADDRESSES.Aqua,
            abi: aquaAbi,
            functionName: 'rawBalances',
            args: [e.vault.address, ADDRESSES.AquaSwapVMRouter, e.hash, USDC.address],
          },
          {
            address: ADDRESSES.Aqua,
            abi: aquaAbi,
            functionName: 'rawBalances',
            args: [e.vault.address, ADDRESSES.AquaSwapVMRouter, e.hash, assetAddr],
          },
        );
      });
      const balRes = balanceCalls.length
        ? await readContracts(config, { allowFailure: true, contracts: balanceCalls })
        : [];

      // Router listings (per asset) — anything not owned by a vault is a resting bid
      const listingRes = await readContracts(config, {
        allowFailure: true,
        contracts: RWA_LIST.map((a) => ({
          address: ADDRESSES.OutletRouter,
          abi: outletRouterAbi,
          functionName: 'listingsOf',
          args: [a.address],
        })),
      });
      const listedHashes = new Set();
      const listingAssetByHash = {};
      RWA_LIST.forEach((a, i) => {
        const hashes = listingRes[i]?.status === 'success' ? listingRes[i].result : [];
        hashes.forEach((h) => {
          listedHashes.add(h);
          listingAssetByHash[h] = a;
        });
      });

      const pools = [];
      let balCursor = 0;
      vaultPoolRefs.forEach((e, i) => {
        const info = infoRes[i]?.status === 'success' ? infoRes[i].result : null;
        if (!info) return;
        const [assetAddr, kind, active] = info;
        const usdcRaw =
          balRes[balCursor]?.status === 'success' ? balRes[balCursor].result[0] : 0n;
        const rwaRaw =
          balRes[balCursor + 1]?.status === 'success' ? balRes[balCursor + 1].result[0] : 0n;
        balCursor += 2;

        const asset = assetByAddress(assetAddr);
        if (!asset) return;
        const nav = navByAssetId[asset.id] ?? 1;
        const usdc = toFloat(usdcRaw, USDC.decimals);
        const rwa = toFloat(rwaRaw, asset.decimals);

        pools.push({
          id: e.hash,
          hash: e.hash,
          type: POOL_KIND[Number(kind)] ?? 'express',
          asset,
          vaultId: e.vault.id,
          vaultName: e.vault.name,
          maker: e.vault.address,
          active,
          listed: listedHashes.has(e.hash),
          usdc,
          rwa,
          nav,
          tvl: usdc + rwa * nav,
        });
      });

      // Non-vault listings → resting bids (order params live in the program bytes)
      const vaultHashSet = new Set(pools.map((p) => p.hash));
      listedHashes.forEach((hash) => {
        if (vaultHashSet.has(hash)) return;
        const asset = listingAssetByHash[hash];
        pools.push({
          id: hash,
          hash,
          type: 'bid',
          asset,
          vaultId: null,
          vaultName: 'Pro maker (resting bid)',
          maker: null,
          active: true,
          listed: true,
          usdc: 0,
          rwa: 0,
          nav: navByAssetId[asset.id] ?? 1,
          tvl: 0,
        });
      });

      return pools;
    },
  });
}

// -------------------------------------------------------------- swap quoting

/**
 * Best-of quote through OutletRouter — the exact quote redeemInstant()/buy()
 * executes, across Aqua listings AND the Uniswap v4 fallback venue
 * (quoteInstantAll/quoteBuyAll; non-view but readable via eth_call).
 * direction: 'exit' (RWA→USDC) or 'entry' (USDC→RWA). The connected address is
 * part of the quote: the v4 pool's compliance hook checks it — without a KYC
 * pass the router silently drops the v4 venue and quotes Aqua only.
 */
export function useSwapQuote(assetId, direction, amountInput) {
  const config = useConfig();
  const { address } = useAccount();
  const debounced = useDebouncedValue(amountInput, 350);
  const asset = RWA_ASSETS[assetId];
  const amountNum = Number(debounced);
  const enabled = !!asset && Number.isFinite(amountNum) && amountNum > 0;

  return useQuery({
    queryKey: ['swap-quote', assetId, direction, String(debounced), address ?? 'anon'],
    enabled,
    refetchInterval: 12_000,
    queryFn: async () => {
      const inDecimals = direction === 'exit' ? asset.decimals : USDC.decimals;
      const outDecimals = direction === 'exit' ? USDC.decimals : asset.decimals;
      const amountRaw = parseUnits(String(debounced), inDecimals);

      const [bestHash, bestOut, viaV4] = await readContract(config, {
        address: ADDRESSES.OutletRouter,
        abi: outletRouterAbi,
        functionName: direction === 'exit' ? 'quoteInstantAll' : 'quoteBuyAll',
        args: [
          asset.address,
          amountRaw,
          address ?? '0x000000000000000000000000000000000000dEaD',
        ],
      });

      const out = toFloat(bestOut, outDecimals);
      const executable = bestHash !== ZERO_HASH && bestOut > 0n;
      // effective USDC per 1 RWA
      const rate = executable
        ? direction === 'exit'
          ? out / amountNum
          : amountNum / out
        : 0;

      return { bestHash, bestOutRaw: bestOut, amountRaw, out, rate, executable, viaV4 };
    },
  });
}

// -------------------------------------------------------------- vault (tier)

/** Full CuratorVault view: treasury, share price, pools capital, user position. */
export function useVaultData(vaultId) {
  const config = useConfig();
  const { address: user } = useAccount();
  const vault = VAULTS[vaultId];

  return useQuery({
    queryKey: ['vault', vaultId, user ?? 'anon'],
    enabled: !!vault,
    refetchInterval: 20_000,
    queryFn: async () => {
      const baseCalls = [
        { address: vault.address, abi: curatorVaultAbi, functionName: 'totalAssets' },
        { address: vault.address, abi: curatorVaultAbi, functionName: 'totalSupply' },
        { address: vault.address, abi: curatorVaultAbi, functionName: 'currentEpoch' },
        { address: vault.address, abi: curatorVaultAbi, functionName: 'curator' },
        { address: vault.address, abi: curatorVaultAbi, functionName: 'curatorFeeBps' },
        { address: vault.address, abi: curatorVaultAbi, functionName: 'maxDiscountFloorBps' },
        ...vault.mandateAssets.flatMap((a) => [
          {
            address: vault.address,
            abi: curatorVaultAbi,
            functionName: 'shippedUsdcOf',
            args: [a.address],
          },
          {
            address: vault.address,
            abi: curatorVaultAbi,
            functionName: 'perAssetCap',
            args: [a.address],
          },
          {
            address: vault.address,
            abi: curatorVaultAbi,
            functionName: 'queuedShares',
            args: [a.address],
          },
        ]),
      ];
      const base = await readContracts(config, { allowFailure: true, contracts: baseCalls });
      const at = (i, fallback = 0n) => (base[i]?.status === 'success' ? base[i].result : fallback);

      const totalAssetsRaw = at(0);
      const totalSupplyRaw = at(1);
      const currentEpoch = Number(at(2, 1n));
      const curator = base[3]?.status === 'success' ? base[3].result : null;
      const curatorFeeBps = Number(at(4, 0));
      const maxDiscountFloorBps = Number(at(5, 0));

      const perAsset = vault.mandateAssets.map((a, i) => {
        const o = 6 + i * 3;
        return {
          asset: a,
          shipped: toFloat(at(o), USDC.decimals),
          cap: toFloat(at(o + 1), USDC.decimals),
          queued: toFloat(at(o + 2), a.decimals),
        };
      });

      const totalAssets = toFloat(totalAssetsRaw, USDC.decimals);
      const totalSupplyShares = toFloat(totalSupplyRaw, 18);
      // shares are 18d, USDC 6d; supply 0 → price 1.0 by construction
      const sharePrice = totalSupplyShares > 0 ? totalAssets / totalSupplyShares : 1;

      let userData = null;
      if (user) {
        const userRes = await readContracts(config, {
          allowFailure: true,
          contracts: [
            {
              address: vault.address,
              abi: curatorVaultAbi,
              functionName: 'balanceOf',
              args: [user],
            },
            {
              address: vault.address,
              abi: curatorVaultAbi,
              functionName: 'maxRedeem',
              args: [user],
            },
            {
              address: vault.address,
              abi: curatorVaultAbi,
              functionName: 'pendingRedeemRequest',
              args: [BigInt(currentEpoch), user],
            },
          ],
        });
        const u = (i) => (userRes[i]?.status === 'success' ? userRes[i].result : 0n);
        const sharesRaw = u(0);
        const claimableRaw = u(1);
        userData = {
          sharesRaw,
          shares: toFloat(sharesRaw, 18),
          value: toFloat(sharesRaw, 18) * sharePrice,
          claimableSharesRaw: claimableRaw,
          claimableShares: toFloat(claimableRaw, 18),
          pendingShares: toFloat(u(2), 18),
        };
      }

      return {
        vault,
        totalAssets,
        totalSupplyShares,
        sharePrice,
        currentEpoch,
        curator,
        curatorFeeBps,
        maxDiscountFloorBps,
        perAsset,
        user: userData,
      };
    },
  });
}

// ----------------------------------------------------------- redemption queue

const EPOCH_STATE = { 0: 'Pending', 1: 'Submitted', 2: 'Claimable' };
const MAX_EPOCHS_SHOWN = 24;

/** Full RedemptionQueue view for one asset: batch pipeline + user requests. */
export function useQueueData(assetId) {
  const config = useConfig();
  const { address: user } = useAccount();
  const asset = RWA_ASSETS[assetId];

  return useQuery({
    queryKey: ['queue', assetId, user ?? 'anon'],
    enabled: !!asset,
    refetchInterval: 15_000,
    queryFn: async () => {
      const queue = asset.queue;
      const base = await readContracts(config, {
        allowFailure: true,
        contracts: [
          { address: queue, abi: redemptionQueueAbi, functionName: 'currentEpoch' },
          { address: queue, abi: redemptionQueueAbi, functionName: 'lastSettledEpoch' },
          { address: queue, abi: redemptionQueueAbi, functionName: 'lastSettledNav' },
          { address: queue, abi: redemptionQueueAbi, functionName: 'queueFeeBps' },
          { address: queue, abi: redemptionQueueAbi, functionName: 'issuerWindow' },
          { address: queue, abi: redemptionQueueAbi, functionName: 'totalAssets' },
          ...(user
            ? [
                {
                  address: queue,
                  abi: redemptionQueueAbi,
                  functionName: 'epochsOf',
                  args: [user],
                },
                {
                  address: queue,
                  abi: redemptionQueueAbi,
                  functionName: 'maxRedeem',
                  args: [user],
                },
              ]
            : []),
        ],
      });
      const at = (i, fallback = 0n) => (base[i]?.status === 'success' ? base[i].result : fallback);

      const currentEpoch = Number(at(0, 1n));
      const lastSettledEpoch = Number(at(1));
      const lastSettledNav = toFloat(at(2), 18);
      const queueFeeBps = Number(at(3));
      const issuerWindowSec = Number(at(4));
      const totalAssets = toFloat(at(5), USDC.decimals);
      const userEpochs = user && base[6]?.status === 'success' ? base[6].result.map(Number) : [];
      const claimableSharesRaw = user ? at(7) : 0n;

      // Epoch pipeline (recent window) + every epoch the user touched
      const fromEpoch = Math.max(1, currentEpoch - MAX_EPOCHS_SHOWN + 1);
      const epochNumbers = new Set(userEpochs);
      for (let e = fromEpoch; e <= currentEpoch; e++) epochNumbers.add(e);
      const epochList = [...epochNumbers].sort((a, b) => a - b);

      const infoCalls = epochList.map((e) => ({
        address: queue,
        abi: redemptionQueueAbi,
        functionName: 'epochInfo',
        args: [BigInt(e)],
      }));
      const shareCalls = user
        ? userEpochs.map((e) => ({
            address: queue,
            abi: redemptionQueueAbi,
            functionName: 'sharesAt',
            args: [BigInt(e), user],
          }))
        : [];

      const detail = await readContracts(config, {
        allowFailure: true,
        contracts: [...infoCalls, ...shareCalls],
      });

      const epochInfoByNumber = {};
      epochList.forEach((e, i) => {
        const r = detail[i];
        if (r?.status !== 'success') return;
        const info = r.result;
        epochInfoByNumber[e] = {
          epoch: e,
          state: EPOCH_STATE[Number(info.state)] ?? 'Pending',
          isOpen: e === currentEpoch,
          totalShares: toFloat(info.totalShares, asset.decimals),
          navAtSettle: toFloat(info.navAtSettle, 18),
          submittedAt: Number(info.submittedAt),
          settledAt: Number(info.settledAt),
        };
      });

      const userRequests = [];
      userEpochs.forEach((e, i) => {
        const r = detail[infoCalls.length + i];
        const sharesRaw = r?.status === 'success' ? r.result : 0n;
        if (sharesRaw === 0n) return; // fully claimed or empty
        const info = epochInfoByNumber[e];
        const shares = toFloat(sharesRaw, asset.decimals);
        const settled = info?.state === 'Claimable';
        userRequests.push({
          epoch: e,
          shares,
          sharesRaw,
          status: settled ? 'Claimable' : 'Pending',
          submittedAt: info?.submittedAt || 0,
          settledAt: info?.settledAt || 0,
          navAtSettle: info?.navAtSettle || 0,
          estPayout: settled
            ? shares * (info?.navAtSettle || 0) * (1 - queueFeeBps / 10_000)
            : null,
        });
      });

      return {
        asset,
        currentEpoch,
        lastSettledEpoch,
        lastSettledNav,
        queueFeeBps,
        issuerWindowSec,
        totalAssets,
        epochs: Object.values(epochInfoByNumber).sort((a, b) => b.epoch - a.epoch),
        user: user
          ? {
              requests: userRequests.sort((a, b) => b.epoch - a.epoch),
              claimableSharesRaw,
              claimableShares: toFloat(claimableSharesRaw, asset.decimals),
            }
          : null,
      };
    },
  });
}

// ------------------------------------------------------------- trade history

const tradeEvents = outletRouterAbi.filter(
  (item) => item.type === 'event' && (item.name === 'InstantExit' || item.name === 'Purchase'),
);

// Dedicated client for eth_getLogs — free public RPCs cap ranges (drpc: 10k
// blocks) or gate history entirely (publicnode), so scan in chunks.
const logsClient = createPublicClient({
  chain: sepolia,
  transport: http(LOGS_RPC_URL, { batch: true }),
});
const LOG_CHUNKS = 3; // ~3 × 9.5k blocks ≈ 4 days of Sepolia history

/** Recent InstantExit/Purchase fills from OutletRouter logs (bounded window). */
export function useTradeHistory(limit = 15) {
  return useQuery({
    queryKey: ['trade-history', limit],
    refetchInterval: 30_000,
    queryFn: async () => {
      try {
        const client = logsClient;
        const latest = await client.getBlockNumber();

        // newest chunk first, stop early once we have enough fills
        const logs = [];
        for (let i = 0; i < LOG_CHUNKS && logs.length < limit; i++) {
          const toBlock = latest - LOGS_MAX_RANGE * BigInt(i);
          if (toBlock <= 0n) break;
          const fromBlock =
            toBlock > LOGS_MAX_RANGE ? toBlock - LOGS_MAX_RANGE + 1n : 0n;
          const chunk = await client.getLogs({
            address: ADDRESSES.OutletRouter,
            events: tradeEvents,
            fromBlock,
            toBlock,
          });
          logs.unshift(...chunk);
        }

        const recent = logs.slice(-limit).reverse();
        const blockNumbers = [...new Set(recent.map((l) => l.blockNumber))];
        const blocks = await Promise.all(
          blockNumbers.map((bn) => client.getBlock({ blockNumber: bn })),
        );
        const tsByBlock = Object.fromEntries(
          blocks.map((b) => [String(b.number), Number(b.timestamp)]),
        );

        return recent
          .map((log) => {
            const asset = assetByAddress(log.args.asset);
            if (!asset) return null;
            const isExit = log.eventName === 'InstantExit';
            const rwaAmount = toFloat(
              isExit ? log.args.assetIn : log.args.assetOut,
              asset.decimals,
            );
            const usdcAmount = toFloat(
              isExit ? log.args.usdcOut : log.args.usdcIn,
              USDC.decimals,
            );
            return {
              id: `${log.transactionHash}-${log.logIndex}`,
              direction: isExit ? 'exit' : 'entry',
              asset,
              user: log.args.user,
              orderHash: log.args.orderHash,
              rwaAmount,
              usdcAmount,
              rate: rwaAmount > 0 ? usdcAmount / rwaAmount : 0,
              timestamp: tsByBlock[String(log.blockNumber)] ?? null,
              txHash: log.transactionHash,
            };
          })
          .filter(Boolean);
      } catch (err) {
        console.warn('trade history unavailable:', err);
        return [];
      }
    },
  });
}
