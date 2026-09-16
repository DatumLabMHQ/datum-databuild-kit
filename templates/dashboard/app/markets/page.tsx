import { loadOverview } from '@/lib/data';
import { usd, pct } from '@/lib/format';
import { PageHeader, Panel } from '@/components/Panel';
import { DataTable, Asset } from '@/components/DataTable';
import { Pill, riskTone } from '@/components/Pill';
import type { Market } from '@/lib/types';

export const revalidate = 300;
export const metadata = { title: 'Markets' };

export default async function Markets() {
  const d = await loadOverview();
  const high = d.markets.filter((m) => m.risk === 'high').length;
  return (
    <>
      <PageHeader title="Markets" subtitle={<>Every listed market, largest first. {high === 0 ? 'No market is above 85% utilisation.' : `${high} ${high === 1 ? 'market is' : 'markets are'} above 85% utilisation, where withdrawals start to queue.`}</>} />
      <Panel title="All markets" badge={`${d.markets.length} markets · ${d.asOf}`} flush
        caption={<><b>Per-market risk.</b> Utilisation above 85% means suppliers may wait to withdraw; LLTV is the loan-to-value at which a position can be liquidated.</>}>
        <DataTable<Market> rows={d.markets} rowKey={(r) => r.id} cols={[
          { key: 'collateral', label: 'Market', render: (r) => <Asset symbol={r.collateral} sub={`${r.loan} loan`} color={`var(--chart-${(d.markets.indexOf(r) % 8) + 1})`} /> },
          { key: 'protocol', label: 'Protocol', dim: true },
          { key: 'chain', label: 'Chain', hideSm: true, dim: true },
          { key: 'supplied', label: 'Supplied', num: true, render: (r) => usd(r.supplied) },
          { key: 'borrowed', label: 'Borrowed', num: true, render: (r) => usd(r.borrowed) },
          { key: 'utilization', label: 'Utilisation', num: true, render: (r) => <Pill tone={riskTone(r.risk)}>{pct(r.utilization, 1)}</Pill> },
          { key: 'lltv', label: 'LLTV', num: true, hideSm: true, render: (r) => pct(r.lltv, 1) },
          { key: 'supply_apy', label: 'Supply APY', num: true, hideSm: true, render: (r) => pct(r.supply_apy) },
          { key: 'borrow_apy', label: 'Borrow APY', num: true, hideSm: true, render: (r) => pct(r.borrow_apy) },
        ]} />
      </Panel>
    </>
  );
}
