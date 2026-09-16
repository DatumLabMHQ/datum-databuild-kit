import { config } from '@/datum.config';
import { PageHeader } from '@/components/page-header';
import { Separator } from '@/components/ui/separator';
import { platformStatus } from '@/lib/data';

export const metadata = { title: 'Methodology' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

export default async function Methodology() {
  const s = await platformStatus();
  return (
    <>
      <PageHeader eyebrow="Methodology" question="Where do these numbers come from?"
        answer="What this dashboard measures, which sources it reads, how the terms are defined, and what it leaves out." />
      <div className="flex max-w-[76ch] flex-col gap-6 px-4 lg:px-6">
        <Section title="What it measures">
          <p>{config.description} The overview answers one question: {config.question.charAt(0).toLowerCase() + config.question.slice(1)} Every other page is a drill-down on that.</p>
        </Section>
        <Separator />
        <Section title="Sources">
          <ul className="list-disc space-y-1.5 pl-5">{config.sources.map((x) => <li key={x.name}><span className="font-medium">{x.name}.</span> {x.detail}</li>)}</ul>
        </Section>
        <Separator />
        <Section title="Definitions">
          <dl className="space-y-3">{config.definitions.map((x) => <div key={x.term}><dt className="font-medium">{x.term}</dt><dd className="text-muted-foreground">{x.text}</dd></div>)}</dl>
        </Section>
        <Separator />
        <Section title="Freshness and status">
          <p>{s.sample
            ? 'This instance runs on labelled sample data because no platform key is set. Nothing on it is a live number.'
            : `Snapshots are taken hourly and the pages revalidate every five minutes. The platform last built at ${s.asOf ?? 'n/a'} UTC.`}
            {' '}{config.status === 'draft' ? 'The dashboard is a draft: the brief is not signed off and the reconciliation is not logged, so it is not embedded or shared yet.' : 'The brief is signed off and the reconciliation is logged.'}</p>
        </Section>
        <Separator />
        <Section title="Reconciliation">
          <p>Our own count is the headline. Where another source publishes the same figure it is stored beside ours, and any disagreement is logged in datum-context with a cause, never hidden or averaged away.</p>
        </Section>
      </div>
    </>
  );
}
