// The only file most dashboards need to edit. Name the product, the platform resources the pages
// read, how their columns map onto the normalised shapes in lib/types.ts, and the navigation.
// lib/data.ts and the components do the rest. Without DATUM_API_KEY the pages run on labelled sample data.

// `datum new dashboard` fills the {{placeholders}}. Until then the template runs as the reference
// dashboard under these fallbacks, so it can be opened and judged as is.
const ph = (v: string, fallback: string) => (v.startsWith('{{') && v.endsWith('}}') ? fallback : v);

export const config = {
  // 'draft' until `datum check <slug>` prints READY and the owner signs the brief; the page says so.
  status: 'draft' as 'draft' | 'live',
  slug: ph('{{slug}}', 'reference-dashboard'),
  title: ph('{{title}}', 'State of lending'),
  description: ph('{{description}}', 'The reference dashboard for Datum Labs: the standard look and structure, running on labelled sample data until a platform key is set.'),
  // The question the overview answers. Pages lead with it.
  question: 'Where does lending activity sit today, and is it growing?',
  // The product the markets belong to, as shown on the page and used for its logo.
  product: { slug: 'morpho', label: 'Morpho', defillamaSlug: 'morpho-blue' },
  // Resources are product/name pairs from GET /api/v1/products on datum-api. `filters` must be
  // filters that resource declares (see /api/v1/products); anything else is ignored by the API.
  resources: {
    // One row per chain, market and UTC day. Latest day by default; `day=` or `since=` for history.
    markets: { product: 'morpho', name: 'markets', filters: { listed: 'true' } as Record<string, string> },
    // DefiLlama's own figure for the same protocol, stored beside ours for the reconciliation note.
    comparison: { product: 'defillama', name: 'tvl', filters: { slug: 'morpho-blue' } as Record<string, string> },
  },
  // Column names in the markets resource for each normalised field (lib/types.ts Market), and
  // which of them the resource stores as fractions (0.86) rather than percent (86).
  fields: {
    id: 'market_id', chain: 'chain_id', collateral: 'collateral_symbol', loan: 'loan_symbol',
    supplied: 'supply_assets_usd', borrowed: 'borrow_assets_usd', utilization: 'utilization', supply_apy: 'supply_apy', borrow_apy: 'borrow_apy', lltv: 'lltv', day: 'day',
    // extra columns shown on the market page when present
    liquidity: 'liquidity_assets_usd', collateralValue: 'collateral_assets_usd', badDebt: 'bad_debt_usd', fee: 'fee_pct', address: 'market_id',
  },
  fractions: ['lltv'] as string[],
  // How far back the overview trend goes, and how often it samples our own count (one API call
  // per point, so weekly points keep it to about a dozen calls).
  trend: { days: 90, stepDays: 7 },
  nav: [
    { href: '/', label: 'Overview' },
    { href: '/markets', label: 'Markets' },
    { href: '/methodology', label: 'Methodology' },
  ],
  // Shown on the methodology page. Keep them honest: what is read, how often, what it excludes.
  sources: [
    { name: 'Datum data platform', detail: 'Hourly snapshots of every listed Morpho market on every chain the platform tracks, read through datum-api. Daily grain is the last observation of the UTC day. The overview trend samples our own count weekly.' },
    { name: 'DefiLlama', detail: 'Stored beside our own count for reconciliation only; never the headline. Its TVL counts collateral, ours counts assets supplied to markets, so the two differ by definition.' },
  ],
  definitions: [
    { term: 'Supplied', text: 'USD value of loan assets supplied to listed markets at the snapshot, valued at the platform price feed.' },
    { term: 'Borrowed', text: 'USD value of outstanding debt in listed markets.' },
    { term: 'Utilisation', text: 'Borrowed divided by supplied, per market and in aggregate.' },
    { term: 'Supply APY', text: 'The rate the protocol reports for suppliers at the snapshot, annualised, in percent. The headline is weighted by supplied value.' },
    { term: 'Listed', text: 'Markets the protocol lists in its own interface. Unlisted markets exist on chain but include dust and fake-price entries, so they are excluded from every number here.' },
  ],
};
export type DatumConfig = typeof config;
