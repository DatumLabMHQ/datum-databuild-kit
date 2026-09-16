import Image from 'next/image';
import { config } from '@/datum.config';
import { platformStatus } from '@/lib/data';
import { Nav } from './Nav';
import { ThemeToggle } from './ThemeToggle';
import { Pill } from './Pill';

export async function Shell({ children }: { children: React.ReactNode }) {
  const s = await platformStatus();
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-left">
          <a className="brand" href="https://www.datumlab.xyz" target="_blank" rel="noreferrer">
            <Image src="/brand/datum-mark.png" alt="" width={22} height={22} priority />
            <span>datum<b>labs</b></span>
          </a>
          <span className="brand-sep" />
          <span className="topbar-title">{config.title}</span>
        </div>
        <Nav />
        <div className="topbar-right">
          {s.sample ? <Pill tone="info" dot>sample data</Pill>
            : s.ok === null ? <Pill tone="bad" dot>platform unreachable</Pill>
            : <Pill tone={s.ok ? 'ok' : 'warn'} dot>{s.ok ? 'platform healthy' : 'platform degraded'}{s.asOf ? ` · ${s.asOf}` : ''}</Pill>}
          <ThemeToggle />
        </div>
      </header>
      {s.sample ? <div className="banner sample"><b>Sample data.</b> No platform key is set, so every number on this page is generated and labelled as such. Set DATUM_API_KEY to read the Datum data platform.</div> : null}
      {config.status === 'draft' && !s.sample ? <div className="banner draft"><b>Draft.</b> Numbers are live from the platform but the brief is not signed off and the reconciliation is not logged. Do not embed or share yet.</div> : null}
      <main className="main">{children}</main>
      <footer className="foot">
        <span>Every number on this page comes from the Datum data platform&rsquo;s curated tables, read through datum-api. Definitions live in datum-context; disagreements with other sources are logged, not hidden.</span>
        <span>{s.sample ? 'Sample data' : `As of ${s.asOf ?? 'n/a'} UTC`} · Datum Labs</span>
      </footer>
    </div>
  );
}
