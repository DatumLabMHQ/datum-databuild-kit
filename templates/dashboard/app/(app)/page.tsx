// Overview. Step 4 of the rebuild: cards, chart and table all read our data.
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { loadOverview } from '@/lib/data';

export const revalidate = 300;

export default async function Overview() {
  const d = await loadOverview();
  return (
    <>
      <SectionCards kpis={d.kpis} asOf={d.asOf} />
      <div className="px-4 lg:px-6"><ChartAreaInteractive data={d.history} asOf={d.asOf} /></div>
      <DataTable data={d.markets} title="Markets" pageSize={8}
        caption={<><b className="font-medium text-foreground">Where the money actually is.</b> A handful of markets carry most of the supply; their utilisation is the per-market risk that the aggregate hides. Largest first.</>} />
    </>
  );
}
