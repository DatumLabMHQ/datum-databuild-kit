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
  product: 'morpho',
  // Resources are product/name pairs from GET /api/v1/products on datum-api.
  resources: {
    markets: { product: 'morpho', name: 'markets' },
    history: { product: 'morpho', name: 'markets', params: { since_days: 90 } as Record<string, string | number> },
  },
  // Column names in the markets resource for each normalised field (lib/types.ts Market).
  fields: {
    id: 'market_id', protocol: 'protocol', chain: 'chain', collateral: 'collateral_symbol', loan: 'loan_symbol',
    supplied: 'supply_assets_usd', borrowed: 'borrow_assets_usd', utilization: 'utilization', supply_apy: 'supply_apy', borrow_apy: 'borrow_apy', lltv: 'lltv', day: 'day',
  },
  // Set when the resource stores utilisation and LLTV as fractions (0.85) rather than percent (85).
  fractions: false,
  // Default filters applied to every resource read (a chain, a protocol...).
  filters: {} as Record<string, string>,
  nav: [
    { href: '/', label: 'Overview' },
    { href: '/markets', label: 'Markets' },
    { href: '/methodology', label: 'Methodology' },
  ],
  // Shown on the methodology page. Keep them honest: what is read, how often, what it excludes.
  sources: [
    { name: 'Datum data platform', detail: 'Hourly snapshots of every listed market, read through datum-api. Daily grain is the last observation of the UTC day.' },
    { name: 'DefiLlama', detail: 'Stored beside our own count for reconciliation only; never the headline.' },
  ],
  definitions: [
    { term: 'Supplied', text: 'USD value of assets supplied to listed markets at the snapshot, valued at the platform price feed.' },
    { term: 'Borrowed', text: 'USD value of outstanding debt in listed markets.' },
    { term: 'Utilisation', text: 'Borrowed divided by supplied, per market and in aggregate.' },
    { term: 'Supply APY', text: 'The rate the protocol reports for suppliers at the snapshot, annualised, in percent.' },
  ],
};
export type DatumConfig = typeof config;
