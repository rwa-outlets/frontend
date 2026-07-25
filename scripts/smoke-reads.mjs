/* Smoke test: exercises the frontend's onchain read paths against live Sepolia.
 * Run: node scripts/smoke-reads.mjs
 */
import { createPublicClient, http, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import {
  navOracleAbi,
  outletRouterAbi,
  curatorVaultAbi,
  redemptionQueueAbi,
  faucetAbi,
  erc20Abi,
  aquaAbi,
} from '../src/lib/abis.js';
import { ADDRESSES, RWA_LIST, VAULT_LIST, USDC } from '../src/lib/contracts.js';

const client = createPublicClient({
  chain: sepolia,
  transport: http('https://ethereum-sepolia-rpc.publicnode.com', { batch: true }),
});

const results = [];
const check = async (name, fn) => {
  try {
    const value = await fn();
    results.push([name, 'ok', value]);
  } catch (e) {
    results.push([name, 'FAIL', e.shortMessage || e.message]);
  }
};

// NAV oracle
for (const a of RWA_LIST) {
  await check(`navOf(${a.id})`, () =>
    client.readContract({
      address: ADDRESSES.NavOracle,
      abi: navOracleAbi,
      functionName: 'navOf',
      args: [a.address],
    }),
  );
}

// Router listings + quotes (quote may legitimately return zero hash)
for (const a of RWA_LIST) {
  await check(`listingsOf(${a.id})`, () =>
    client.readContract({
      address: ADDRESSES.OutletRouter,
      abi: outletRouterAbi,
      functionName: 'listingsOf',
      args: [a.address],
    }),
  );
  await check(`quoteInstant(${a.id}, 1)`, () =>
    client.readContract({
      address: ADDRESSES.OutletRouter,
      abi: outletRouterAbi,
      functionName: 'quoteInstant',
      args: [a.address, parseUnits('1', a.decimals)],
    }),
  );
  await check(`quoteBuy(${a.id}, 1 USDC)`, () =>
    client.readContract({
      address: ADDRESSES.OutletRouter,
      abi: outletRouterAbi,
      functionName: 'quoteBuy',
      args: [a.address, parseUnits('1', USDC.decimals)],
    }),
  );
}

// Vaults
for (const v of VAULT_LIST) {
  await check(`${v.symbol}.totalAssets`, () =>
    client.readContract({ address: v.address, abi: curatorVaultAbi, functionName: 'totalAssets' }),
  );
  await check(`${v.symbol}.totalSupply`, () =>
    client.readContract({ address: v.address, abi: curatorVaultAbi, functionName: 'totalSupply' }),
  );
  await check(`${v.symbol}.currentEpoch`, () =>
    client.readContract({ address: v.address, abi: curatorVaultAbi, functionName: 'currentEpoch' }),
  );
  await check(`${v.symbol}.poolCount`, () =>
    client.readContract({ address: v.address, abi: curatorVaultAbi, functionName: 'poolCount' }),
  );
  await check(`${v.symbol}.curator`, () =>
    client.readContract({ address: v.address, abi: curatorVaultAbi, functionName: 'curator' }),
  );
  for (const a of v.mandateAssets) {
    await check(`${v.symbol}.shippedUsdcOf(${a.id})`, () =>
      client.readContract({
        address: v.address,
        abi: curatorVaultAbi,
        functionName: 'shippedUsdcOf',
        args: [a.address],
      }),
    );
    await check(`${v.symbol}.perAssetCap(${a.id})`, () =>
      client.readContract({
        address: v.address,
        abi: curatorVaultAbi,
        functionName: 'perAssetCap',
        args: [a.address],
      }),
    );
  }
  await check(`${v.symbol}.pendingRedeemRequest(1, deployer)`, () =>
    client.readContract({
      address: v.address,
      abi: curatorVaultAbi,
      functionName: 'pendingRedeemRequest',
      args: [1n, '0x8b7699EddbdE63f199c9629Ec8C88e3F704100f7'],
    }),
  );
}

// Queues
for (const a of RWA_LIST) {
  const q = a.queue;
  await check(`queue(${a.id}).currentEpoch`, () =>
    client.readContract({ address: q, abi: redemptionQueueAbi, functionName: 'currentEpoch' }),
  );
  await check(`queue(${a.id}).queueFeeBps`, () =>
    client.readContract({ address: q, abi: redemptionQueueAbi, functionName: 'queueFeeBps' }),
  );
  await check(`queue(${a.id}).issuerWindow`, () =>
    client.readContract({ address: q, abi: redemptionQueueAbi, functionName: 'issuerWindow' }),
  );
  await check(`queue(${a.id}).epochInfo(1)`, () =>
    client.readContract({
      address: q,
      abi: redemptionQueueAbi,
      functionName: 'epochInfo',
      args: [1n],
    }),
  );
  await check(`queue(${a.id}).epochsOf(deployer)`, () =>
    client.readContract({
      address: q,
      abi: redemptionQueueAbi,
      functionName: 'epochsOf',
      args: ['0x8b7699EddbdE63f199c9629Ec8C88e3F704100f7'],
    }),
  );
  await check(`queue(${a.id}).maxRedeem(deployer)`, () =>
    client.readContract({
      address: q,
      abi: redemptionQueueAbi,
      functionName: 'maxRedeem',
      args: ['0x8b7699EddbdE63f199c9629Ec8C88e3F704100f7'],
    }),
  );
}

// Faucet
await check('faucet.allTokens', () =>
  client.readContract({ address: ADDRESSES.Faucet, abi: faucetAbi, functionName: 'allTokens' }),
);
await check('faucet.nextClaimAt(deployer)', () =>
  client.readContract({
    address: ADDRESSES.Faucet,
    abi: faucetAbi,
    functionName: 'nextClaimAt',
    args: ['0x8b7699EddbdE63f199c9629Ec8C88e3F704100f7'],
  }),
);
await check('faucet.cooldown', () =>
  client.readContract({ address: ADDRESSES.Faucet, abi: faucetAbi, functionName: 'cooldown' }),
);

// Tokens
for (const t of [USDC, ...RWA_LIST]) {
  await check(`${t.id}.decimals`, () =>
    client.readContract({ address: t.address, abi: erc20Abi, functionName: 'decimals' }),
  );
}

// Aqua rawBalances (arbitrary probe — zero balance is fine, decoding must work)
await check('aqua.rawBalances(probe)', () =>
  client.readContract({
    address: ADDRESSES.Aqua,
    abi: aquaAbi,
    functionName: 'rawBalances',
    args: [
      VAULT_LIST[0].address,
      ADDRESSES.AquaSwapVMRouter,
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      USDC.address,
    ],
  }),
);

// Event scan (same chunked window as useTradeHistory, via the logs RPC)
await check('router getLogs (3 × 9.5k chunks via drpc)', async () => {
  const logsClient = createPublicClient({
    chain: sepolia,
    transport: http('https://sepolia.drpc.org', { batch: true }),
  });
  const latest = await logsClient.getBlockNumber();
  const events = outletRouterAbi.filter(
    (i) => i.type === 'event' && (i.name === 'InstantExit' || i.name === 'Purchase'),
  );
  let count = 0;
  for (let i = 0; i < 3; i++) {
    const toBlock = latest - 9_500n * BigInt(i);
    const fromBlock = toBlock - 9_500n + 1n;
    const logs = await logsClient.getLogs({
      address: ADDRESSES.OutletRouter,
      events,
      fromBlock,
      toBlock,
    });
    count += logs.length;
  }
  return `${count} fills`;
});

let failed = 0;
for (const [name, status, value] of results) {
  if (status === 'FAIL') failed++;
  const printable =
    typeof value === 'bigint'
      ? value.toString()
      : Array.isArray(value) || (value && typeof value === 'object')
        ? JSON.stringify(value, (_, v) => (typeof v === 'bigint' ? v.toString() : v)).slice(0, 100)
        : String(value);
  console.log(`${status === 'ok' ? '  ok ' : ' FAIL'} ${name}: ${printable}`);
}
console.log(failed === 0 ? '\nALL READS OK' : `\n${failed} FAILURES`);
process.exit(failed === 0 ? 0 : 1);
