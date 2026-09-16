import { NA } from '@/lib/format';

export type Col<T> = { key: string; label: string; num?: boolean; hideSm?: boolean; dim?: boolean; render?: (row: T) => React.ReactNode };
export function DataTable<T extends Record<string, unknown>>({ cols, rows, empty = 'No rows.', rowKey }: { cols: Col<T>[]; rows: T[]; empty?: string; rowKey?: (row: T, i: number) => string }) {
  if (!rows.length) return <div className="panel-note">{empty}</div>;
  const cls = (c: Col<T>) => [c.num ? 'num' : '', c.hideSm ? 'col-hide-sm' : '', c.dim ? 'dim' : ''].filter(Boolean).join(' ');
  return (
    <div className="table-wrap">
      <table className="datatable">
        <thead><tr>{cols.map((c) => <th key={c.key} className={cls(c)}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={rowKey ? rowKey(r, i) : i}>
              {cols.map((c) => <td key={c.key} className={cls(c)}>{c.render ? c.render(r) : String(r[c.key] ?? NA)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Asset({ symbol, sub, color }: { symbol: string; sub?: string; color?: string }) {
  return (
    <span className="asset">
      <span className="asset-icon" style={{ background: color ?? 'var(--chart-1)' }}>{symbol.slice(0, 2).toUpperCase()}</span>
      <span><div>{symbol}</div>{sub ? <div className="asset-sub">{sub}</div> : null}</span>
    </span>
  );
}
