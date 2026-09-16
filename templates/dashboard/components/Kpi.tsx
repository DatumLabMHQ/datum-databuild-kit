import { delta as fmtDelta } from '@/lib/format';

export function Kpis({ children }: { children: React.ReactNode }) { return <section className="kpis">{children}</section>; }
export function Kpi({ label, value, sub, change }: { label: string; value: string; sub?: React.ReactNode; change?: number | null }) {
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {(sub || change !== undefined) ? (
        <div className="sub">
          {change !== undefined && change !== null ? <span className={`delta ${change >= 0 ? 'up' : 'down'}`}>{fmtDelta(change)}</span> : null}
          {sub}
        </div>
      ) : null}
    </div>
  );
}
