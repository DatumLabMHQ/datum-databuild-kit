// Overview. Step 2 of the rebuild: the KPI row reads our data. The chart and table are still the
// stock block content; steps 3 and 4 replace them.
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
      <div className="px-4 lg:px-6"><ChartAreaInteractive /></div>
      <DataTable data={data} />
    </>
  );
}
