// Loads the normalised shapes the pages read. From the platform when DATUM_API_KEY is set,
// otherwise from lib/sample.ts, labelled as sample on every page.
import { config } from '@/datum.config';
import { hasKey, health, query } from './datum';
import { sampleOverview, sampleMarket, SAMPLE_AS_OF } from './sample';
import { num } from './format';
import type { Market, MarketDetail, Overview, Point, Share } from './types';

export type PlatformStatus = { sample: boolean; ok: boolean | null; asOf: string | null };

export async function platformStatus(): Promise<PlatformStatus> {
  if (!hasKey()) return { sample: true, ok: null, asOf: SAMPLE_AS_OF };
  try { const h = await health(); return { sample: false, ok: h.ok, asOf: h.last_build ? h.last_build.slice(0, 16).replace('T', ' ') : null }; }
  catch { return { sample: false, ok: null, asOf: null }; }
}

const F = config.fields;
const scale = config.fractions ? 100 : 1;
const risk = (u: number): Market['risk'] => (u > 85 ? 'high' : u > 70 ? 'moderate' : 'safe');

function toMarket(r: Record<string, unknown>, i: number): Market {
  const supplied = num(r[F.supplied]), borrowed = num(r[F.borrowed]);
  const util = r[F.utilization] !== undefined ? num(r[F.utilization]) * scale : supplied ? (borrowed / supplied) * 100 : 0;
  return {
    id: String(r[F.id] ?? i), protocol: String(r[F.protocol] ?? config.product), chain: String(r[F.chain] ?? ''),
    collateral: String(r[F.collateral] ?? ''), loan: String(r[F.loan] ?? ''), supplied, borrowed, utilization: util,
    supply_apy: num(r[F.supply_apy]), borrow_apy: num(r[F.borrow_apy]), lltv: num(r[F.lltv]) * scale, risk: risk(util),
  };
}
function sumBy(markets: Market[], key: 'chain' | 'protocol'): Share[] {
  const m = new Map<string, number>();
  markets.forEach((x) => m.set(x[key], (m.get(x[key]) ?? 0) + x.supplied));
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export async function loadOverview(): Promise<Overview> {
  if (!hasKey()) return sampleOverview();
  const m = config.resources.markets, h = config.resources.history;
  const [latest, hist] = await Promise.all([
    query(m.product, m.name, { ...config.filters, limit: 1000 }),
    query(h.product, h.name, { ...config.filters, ...h.params, limit: 100000 }),
  ]);
  const markets = latest.rows.map(toMarket).sort((a, b) => b.supplied - a.supplied);
  // Daily history: sum of supplied and borrowed, weighted supply APY.
  const days = new Map<string, { supply: number; borrow: number; apyW: number }>();
  hist.rows.forEach((r) => {
    const d = String(r[F.day] ?? '').slice(0, 10); if (!d) return;
    const row = days.get(d) ?? { supply: 0, borrow: 0, apyW: 0 };
    const s = num(r[F.supplied]); row.supply += s; row.borrow += num(r[F.borrowed]); row.apyW += num(r[F.supply_apy]) * s; days.set(d, row);
  });
  const history: Point[] = [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, v]) => ({ day, supply: v.supply, borrow: v.borrow }));
  const rates: Point[] = [...days.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, v]) => ({ day, supply_apy: v.supply ? v.apyW / v.supply : 0 }));
  const last = history[history.length - 1], prev = history[Math.max(0, history.length - 8)];
  const supplied = markets.reduce((a, x) => a + x.supplied, 0), borrowed = markets.reduce((a, x) => a + x.borrowed, 0);
  return {
    asOf: latest.as_of?.slice(0, 10) ?? latest.day ?? 'n/a', sample: false,
    kpis: {
      supplied, borrowed,
      suppliedChange7d: last && prev && num(prev.supply) ? (num(last.supply) / num(prev.supply) - 1) * 100 : 0,
      borrowedChange7d: last && prev && num(prev.borrow) ? (num(last.borrow) / num(prev.borrow) - 1) * 100 : 0,
      markets: markets.length, utilization: supplied ? (borrowed / supplied) * 100 : 0,
      supplyApy: supplied ? markets.reduce((a, x) => a + x.supply_apy * x.supplied, 0) / supplied : 0,
    },
    history, rates, byChain: sumBy(markets, 'chain'), byProtocol: sumBy(markets, 'protocol'), markets, reconciliation: null,
  };
}

/** One market for the detail page. On the platform: the market's own history rows; facts and
 *  holders come from the resources named in datum.config.ts when they exist, else stay empty. */
export async function loadMarket(id: string): Promise<MarketDetail | null> {
  if (!hasKey()) return sampleMarket(id);
  const o = await loadOverview();
  const market = o.markets.find((m) => m.id === id);
  if (!market) return null;
  const h = config.resources.history;
  const hist = await query(h.product, h.name, { ...config.filters, ...h.params, [F.id]: id, limit: 10000 });
  const rows = hist.rows.map((r) => ({ day: String(r[F.day] ?? '').slice(0, 10), supplied: num(r[F.supplied]), borrowed: num(r[F.borrowed]), sa: num(r[F.supply_apy]), ba: num(r[F.borrow_apy]) })).filter((r) => r.day).sort((a, b) => a.day.localeCompare(b.day));
  const history: Point[] = rows.map((r) => ({ day: r.day, supply: r.supplied, borrow: r.borrowed }));
  const rates: Point[] = rows.map((r) => ({ day: r.day, supply_apy: r.sa, borrow_apy: r.ba, utilization: r.supplied ? (r.borrowed / r.supplied) * 100 : 0 }));
  const facts = [
    { label: 'Liquidation LTV', value: `${market.lltv}%`, note: 'Loan to value at which a position can be liquidated' },
    { label: 'Market address', value: market.address ?? 'n/a' },
  ];
  return { asOf: o.asOf, sample: false, market, history, rates, facts, suppliers: [], healthBands: [] };
}
