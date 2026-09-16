// Sample data. Used when DATUM_API_KEY is not set, so the template runs as the reference
// dashboard out of the box. Deterministic (seeded), clearly labelled on the page, never shipped
// as a live number. Shapes match what lib/data.ts returns from the platform.
import type { Market, Point, Share, Overview } from './types';

function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export const SAMPLE_AS_OF = '2026-09-15';
const PROTOCOLS = ['Aave', 'Morpho', 'Compound'];
const CHAINS = ['Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Avalanche'];
const ASSETS: [string, string][] = [['wstETH', 'USDC'], ['WETH', 'USDC'], ['WBTC', 'USDC'], ['cbBTC', 'USDT'], ['weETH', 'WETH'], ['USDe', 'USDC'], ['sUSDe', 'DAI'], ['rETH', 'WETH'], ['LINK', 'USDC'], ['ezETH', 'WETH'], ['PT-sUSDe', 'USDC'], ['tBTC', 'WBTC']];

function daysBack(n: number, asOf: string): string[] {
  const end = new Date(asOf + 'T00:00:00Z'); const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) { const d = new Date(end); d.setUTCDate(end.getUTCDate() - i); out.push(d.toISOString().slice(0, 10)); }
  return out;
}

export function sampleOverview(): Overview {
  const r = rng(7);
  const days = daysBack(90, SAMPLE_AS_OF);
  let supply = 6.1e9, borrow = 3.4e9;
  const history: Point[] = days.map((d, i) => {
    supply *= 1 + (r() - 0.47) * 0.012 + (i > 60 ? 0.002 : 0);
    borrow *= 1 + (r() - 0.48) * 0.014 + (i > 60 ? 0.0025 : 0);
    return { day: d, supply: Math.round(supply), borrow: Math.round(borrow) };
  });
  const rates: Point[] = days.map((d, i) => ({ day: d, supply_apy: +(3.2 + Math.sin(i / 11) * 0.6 + r() * 0.3).toFixed(2), borrow_apy: +(5.4 + Math.sin(i / 9) * 0.8 + r() * 0.4).toFixed(2) }));
  const byChain: Share[] = CHAINS.map((name, i) => ({ name, value: Math.round([3.6e9, 1.1e9, 0.7e9, 0.35e9, 0.25e9][i] * (0.9 + r() * 0.2)) }));
  const byProtocol: Share[] = PROTOCOLS.map((name, i) => ({ name, value: Math.round([3.1e9, 2.2e9, 0.8e9][i] * (0.9 + r() * 0.2)) }));
  const markets: Market[] = ASSETS.map(([collateral, loan], i) => {
    const s = Math.round((1.4e9 / (i + 1.3)) * (0.8 + r() * 0.4)); const u = 0.55 + r() * 0.35;
    return { id: `${collateral}-${loan}-${i}`, protocol: PROTOCOLS[i % 3], chain: CHAINS[i % 5], collateral, loan, supplied: s, borrowed: Math.round(s * u), utilization: +(u * 100).toFixed(1), supply_apy: +(2.4 + u * 2.5 + r()).toFixed(2), borrow_apy: +(4 + u * 4 + r()).toFixed(2), lltv: [86, 86, 86, 91.5, 94.5, 77, 86, 94.5, 77, 91.5, 91.5, 94.5][i], risk: (u > 0.85 ? 'high' : u > 0.7 ? 'moderate' : 'safe') as Market['risk'] };
  }).sort((a, b) => b.supplied - a.supplied);
  const last = history[history.length - 1], prev = history[history.length - 8];
  return {
    asOf: SAMPLE_AS_OF, sample: true,
    kpis: {
      supplied: last.supply as number, borrowed: last.borrow as number,
      suppliedChange7d: ((last.supply as number) / (prev.supply as number) - 1) * 100,
      borrowedChange7d: ((last.borrow as number) / (prev.borrow as number) - 1) * 100,
      markets: markets.length, utilization: ((last.borrow as number) / (last.supply as number)) * 100,
      supplyApy: rates[rates.length - 1].supply_apy as number,
    },
    history, rates, byChain, byProtocol, markets,
    reconciliation: { ours: last.supply as number, theirs: Math.round((last.supply as number) * 1.04), theirsSource: 'DefiLlama', note: 'The gap is unlisted markets and idle vault balances, both stored and neither in the headline.' },
  };
}
