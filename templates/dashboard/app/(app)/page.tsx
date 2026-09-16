// Overview. Step 3 of the rebuild: KPI row and the supplied/borrowed chart read our data. The
// table is still the stock block content; step 4 replaces it.
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { loadOverview } from '@/lib/data';
import data from '@/lib/block-data.json';

export const revalidate = 300;

export default async function Overview() {
  const d = await loadOverview();
  return (
    <>
      <SectionCards kpis={d.kpis} asOf={d.asOf} />
      <div className="px-4 lg:px-6"><ChartAreaInteractive data={d.history} asOf={d.asOf} /></div>
      <DataTable data={data} />
    </>
  );
}
