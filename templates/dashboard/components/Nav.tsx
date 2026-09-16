'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { config } from '@/datum.config';

export function Nav() {
  const p = usePathname();
  return (
    <nav className="nav" aria-label="Pages">
      {config.nav.map((n) => <Link key={n.href} href={n.href} className={p === n.href ? 'on' : ''}>{n.label}</Link>)}
    </nav>
  );
}
