import { config } from '@/datum.config';
import { ask, query, usd, day } from '@/lib/datum';
import { Kpi, Kpis } from '@/components/Kpi';
import { DataTable } from '@/components/DataTable';

export const revalidate = 300;

export default async function Overview() {
  const answers = await Promise.all(config.questions.map((id) => ask(id).catch(() => null)));
  const r = config.resources.daily;
  const latest = await query(r.product, r.name, { ...config.filters, limit: 50 });
  const cols = Object.keys(latest.rows[0] ?? {}).slice(0, 8).map((k) => ({ key: k, label: k.replace(/_/g, ' '), num: typeof latest.rows[0]?.[k] === 'number', fmt: (v: unknown) => (typeof v === 'number' ? (Math.abs(v) > 1000 ? usd(v) : v.toFixed(2)) : k === 'day' ? day(v) : String(v ?? '—')) }));
  return (
    <main>
      <h1>{config.title}</h1>
      <p className="lede">{config.description}</p>
      <Kpis>{answers.map((a, i) => a ? <Kpi key={a.id} label={a.question.replace(/ on \d{4}-\d{2}-\d{2}\?$/, '')} value={a.unit === 'usd' ? usd(a.value) : a.unit === 'percent' ? `${a.value?.toFixed(2)}%` : String(a.value)} sub={`${a.label ? a.label + ' · ' : ''}${a.date}`} /> : <Kpi key={i} label="unavailable" value="—" />)}</Kpis>
      <section className="panel">
        <div className="panel-head"><h2>{r.product}/{r.name}</h2><span className="meta">{latest.count} rows · {latest.day ?? 'latest'}</span></div>
        <DataTable cols={cols} rows={latest.rows} />
      </section>
    </main>
  );
}
