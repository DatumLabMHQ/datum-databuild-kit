// The fundamental container. The caption is required on purpose: every chart and table says in
// one line what it is and why it matters to the page's question. No silent visuals.
export function Panel({ title, badge, caption, flush = false, note, children }: {
  title: string; badge?: React.ReactNode; caption: React.ReactNode; flush?: boolean; note?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title"><span className="bullet" />{title}</h2>
        {badge ? <span className="panel-badge">{badge}</span> : null}
      </div>
      <div className="panel-caption">{caption}</div>
      <div className={`panel-body${flush ? ' flush' : ''}`}>{children}</div>
      {note ? <div className="panel-note">{note}</div> : null}
    </section>
  );
}
export function PageHeader({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return <div className="page-header"><h1 className="page-title">{title}</h1><p className="page-subtitle">{subtitle}</p></div>;
}
