import { config } from '@/datum.config';
import { platformStatus } from '@/lib/data';
import { PageHeader } from '@/components/Panel';

export const metadata = { title: 'Methodology' };

export default async function Methodology() {
  const s = await platformStatus();
  return (
    <div className="prose-page">
      <PageHeader title="Methodology" subtitle="What this dashboard measures, where the numbers come from, and what they leave out." />
      <h2>What it measures</h2>
      <p>{config.description} The overview answers one question: {config.question.toLowerCase()} Every other page is a drill-down on that.</p>
      <h2>Sources</h2>
      <ul>{config.sources.map((x) => <li key={x.name}><b>{x.name}.</b> {x.detail}</li>)}</ul>
      <h2>Definitions</h2>
      <dl>{config.definitions.map((x) => <div key={x.term}><dt>{x.term}</dt><dd>{x.text}</dd></div>)}</dl>
      <h2>Freshness and status</h2>
      <p>{s.sample
        ? 'This instance is running on labelled sample data because no platform key is set. Nothing on it is a live number.'
        : `Snapshots are taken hourly; the page revalidates every five minutes. Platform last built ${s.asOf ?? 'n/a'} UTC.`}
        {' '}{config.status === 'draft' ? 'The dashboard is a draft: the brief is not signed off and the reconciliation is not logged, so it is not embedded or shared yet.' : 'The brief is signed off and the reconciliation is logged.'}</p>
      <h2>Reconciliation</h2>
      <p>Our own count is the headline. Where another source publishes the same figure it is stored beside ours and any disagreement is logged in datum-context with a cause, never hidden or averaged away.</p>
    </div>
  );
}
