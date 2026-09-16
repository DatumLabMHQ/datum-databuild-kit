import Link from 'next/link';
import { config } from '@/datum.config';
import { loadOverview } from '@/lib/data';
import { usd, pct, count } from '@/lib/format';
import { PageHeader, Panel } from '@/components/Panel';
import { Kpi, Kpis } from '@/components/Kpi';
import { DataTable, Asset } from '@/components/DataTable';
import { Pill, riskTone } from '@/components/Pill';
import { AreaChart, BarChart, Donut, LineChart } from '@/components/Charts';
import type { Market } from '@/lib/types';

export const revalidate = 300;

export default async function Overview() {
  const d = await loadOverview();
  const k = d.kpis;
  const top = d.markets.slice(0, 8);
  return (
    <>
      <PageHeader title={config.title} subtitle={<>{config.question} {usd(k.supplied)} is supplied across {k.markets} markets, {pct(k.utilization, 1)} of it borrowed, as of {d.asOf}.</>} />

      <Kpis>
        <Kpi label="Supplied" value={usd(k.supplied)} change={k.suppliedChange7d} sub="over 7 days" />
        <Kpi label="Borrowed" value={usd(k.borrowed)} change={k.borrowedChange7d} sub="over 7 days" />
        <Kpi label="Utilisation" value={pct(k.utilization, 1)} sub="borrowed over supplied" />
        <Kpi label="Supply APY, weighted" value={pct(k.supplyApy, 2)} sub="by supplied value" />
        <Kpi label="Markets" value={count(k.markets)} sub="listed and tracked" />
      </Kpis>

      <div className="grid-2">
        <Panel title="Supplied and borrowed, 90 days" badge={`daily · ${d.asOf}`}
          caption={<><b>Whether the book is growing.</b> Supplied is the ceiling, borrowed is the demand; the gap between them is the idle liquidity that sets rates.</>}>
          <AreaChart data={d.history} series={[{ key: 'supply', label: 'Supplied' }, { key: 'borrow', label: 'Borrowed' }]} unit="usd" height={260} legend />
        </Panel>
        <Panel title="Where the supply sits" badge={`${d.byChain.length} chains`}
          caption={<><b>Concentration by chain.</b> One chain usually carries most of the book; the tail is where new markets appear first.</>}>
          <BarChart data={d.byChain} x="name" series={[{ key: 'value', label: 'Supplied' }]} unit="usd" horizontal labels height={260} />
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Share by protocol" badge="supplied value"
          caption={<><b>Who holds the liquidity.</b> A hover isolates one protocol; the centre shows its share of the total.</>}>
          <Donut items={d.byProtocol} unit="usd" height={220} centerLabel="supplied" />
        </Panel>
        <Panel title="Rates, 90 days" badge="percent, annualised"
          caption={<><b>What suppliers earn and borrowers pay.</b> The spread between the two lines is the protocol&rsquo;s take plus idle liquidity.</>}>
          <LineChart data={d.rates} series={[{ key: 'supply_apy', label: 'Supply APY' }, ...(d.rates[0]?.borrow_apy !== undefined ? [{ key: 'borrow_apy', label: 'Borrow APY' }] : [])]} unit="pct" height={220} legend />
        </Panel>
      </div>

      <Panel title="Largest markets" badge={<Link href="/markets">all {d.markets.length} markets →</Link>} flush
        caption={<><b>Where the money actually is.</b> Eight markets carry most of the supply; their utilisation is the per-market risk that the aggregate hides.</>}
        note={d.reconciliation ? <><b>Reconciliation.</b> Our own count of supplied value is {usd(d.reconciliation.ours)}; {d.reconciliation.theirsSource} reports {usd(d.reconciliation.theirs)}. {d.reconciliation.note}</> : undefined}>
        <DataTable<Market> rows={top} rowKey={(r) => r.id} cols={[
          { key: 'collateral', label: 'Market', render: (r) => <Asset symbol={r.collateral} sub={`${r.loan} loan · ${r.protocol}`} color={`var(--chart-${(top.indexOf(r) % 8) + 1})`} /> },
          { key: 'chain', label: 'Chain', hideSm: true, dim: true },
          { key: 'supplied', label: 'Supplied', num: true, render: (r) => usd(r.supplied) },
          { key: 'borrowed', label: 'Borrowed', num: true, render: (r) => usd(r.borrowed) },
          { key: 'utilization', label: 'Utilisation', num: true, render: (r) => <Pill tone={riskTone(r.risk)}>{pct(r.utilization, 1)}</Pill> },
          { key: 'supply_apy', label: 'Supply APY', num: true, hideSm: true, render: (r) => pct(r.supply_apy) },
          { key: 'borrow_apy', label: 'Borrow APY', num: true, hideSm: true, render: (r) => pct(r.borrow_apy) },
        ]} />
      </Panel>
    </>
  );
}
