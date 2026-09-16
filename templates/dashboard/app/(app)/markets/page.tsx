import { DataTable } from '@/components/data-table';
import { loadOverview } from '@/lib/data';
import { pct } from '@/lib/format';

export const revalidate = 300;
export const metadata = { title: 'Markets' };

export default async function Markets() {
  const d = await loadOverview();
  const high = d.markets.filter((m) => m.risk === 'high').length;
  return (
    <>
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Markets</h1>
        <p className="mt-1 max-w-[72ch] text-sm text-muted-foreground">
          Every listed market, largest first, as of {d.asOf}. {high === 0 ? 'No market is above 85% utilisation.' : `${high} ${high === 1 ? 'market is' : 'markets are'} above 85% utilisation, where withdrawals start to queue.`} Aggregate utilisation is {pct(d.kpis.utilization, 1)}.
        </p>
      </div>
      <DataTable data={d.markets} title="All markets" pageSize={20}
        caption={<><b className="font-medium text-foreground">Per-market risk.</b> Utilisation above 85% means suppliers may wait to withdraw; LLTV is the loan-to-value at which a position can be liquidated.</>} />
    </>
  );
}
