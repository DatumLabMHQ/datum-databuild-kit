'use client';
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpenIcon, ExternalLinkIcon, LayoutDashboardIcon, TableIcon } from 'lucide-react';
import { config } from '@/datum.config';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

// Navigation is data. Pages come from datum.config.ts; icons are matched here by route.
const ICONS: Record<string, React.ReactNode> = { '/': <LayoutDashboardIcon />, '/markets': <TableIcon />, '/methodology': <BookOpenIcon /> };

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const items = config.nav.map((n) => ({ title: n.label, url: n.href, icon: ICONS[n.href] ?? <LayoutDashboardIcon /> }));
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!" render={<Link href="/" />}>
              <Image src="/brand/datum-mark.png" alt="" width={20} height={20} className="size-5 rounded-[5px]" priority />
              <span className="text-base font-semibold">datum<span className="text-(--brand-blue)">labs</span></span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} />
        <NavSecondary className="mt-auto" items={[{ title: 'datumlab.xyz', url: 'https://www.datumlab.xyz', icon: <ExternalLinkIcon /> }]} />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-xs text-muted-foreground">{config.title}</div>
      </SidebarFooter>
    </Sidebar>
  );
}
