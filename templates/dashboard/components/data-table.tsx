'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
// The markets table: shadcn's data-table recipe (TanStack Table v9 with sorting, filtering, column
// visibility and paging in the shadcn Table) fed by our normalised Market rows. Row selection,
// drag-to-reorder, tabs and the row drawer from the stock block are gone: a read-only dashboard
// does not need them.
import * as React from 'react';
import {
  columnFilteringFeature, columnVisibilityFeature, createColumnHelper, createFilteredRowModel, createPaginatedRowModel,
  createSortedRowModel, FlexRender, rowPaginationFeature, rowSortingFeature, tableFeatures, useTable,
  type Column, type ColumnFiltersState, type ColumnVisibilityState, type FilterFn, type SortingState,
} from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, Columns3Icon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { pct, usd } from '@/lib/format';
import type { Market } from '@/lib/types';

// TanStack v9: declare the features the table uses; anything not listed is left out of the bundle.
// Filter functions are registered by name (v9 keeps unused ones out of the bundle). `marketSearch`
// matches the collateral or the loan asset, so "USDC" finds every market that lends USDC.
const marketSearch: FilterFn<any, Market> = (row, _columnId, value) => {
  const q = String(value ?? '').trim().toLowerCase();
  if (!q) return true;
  return `${row.original.collateral} ${row.original.loan} ${row.original.protocol} ${row.original.chain}`.toLowerCase().includes(q);
};
const features = tableFeatures({
  columnFilteringFeature, columnVisibilityFeature, rowPaginationFeature, rowSortingFeature,
  filteredRowModel: createFilteredRowModel(), paginatedRowModel: createPaginatedRowModel(), sortedRowModel: createSortedRowModel(),
  filterFns: { marketSearch },
});
const col = createColumnHelper<typeof features, Market>();

const LABELS: Record<string, string> = { collateral: 'Market', protocol: 'Protocol', chain: 'Chain', supplied: 'Supplied', borrowed: 'Borrowed', utilization: 'Utilisation', lltv: 'LLTV', supply_apy: 'Supply APY', borrow_apy: 'Borrow APY' };
const NUMERIC = new Set(['supplied', 'borrowed', 'utilization', 'lltv', 'supply_apy', 'borrow_apy']);
const RISK_CLASS: Record<Market['risk'], string> = { safe: 'text-(--green)', moderate: 'text-(--yellow)', high: 'text-(--red)' };

// A sortable header: a ghost button that cycles the sort and shows its direction.
function SortHeader<TValue>({ column, label }: { column: Column<typeof features, Market, TValue>; label: string }) {
  const dir = column.getIsSorted();
  const Icon = dir === 'asc' ? ArrowUpIcon : dir === 'desc' ? ArrowDownIcon : ArrowUpDownIcon;
  return (
    <Button variant="ghost" size="sm" className="-mr-3 h-8 px-2 data-[state=open]:bg-accent" onClick={column.getToggleSortingHandler()}>
      {label}<Icon className={dir ? 'text-foreground' : 'text-muted-foreground'} />
    </Button>
  );
}

const columns = col.columns([
  col.accessor('collateral', {
    header: 'Market', enableHiding: false, filterFn: 'marketSearch',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-md text-[9px] font-semibold text-white" style={{ background: `var(--chart-${(row.index % 8) + 1})` }}>{row.original.collateral.slice(0, 2).toUpperCase()}</span>
        <div className="leading-tight"><div className="font-medium">{row.original.collateral}</div><div className="text-xs text-muted-foreground">{row.original.loan} loan</div></div>
      </div>
    ),
  }),
  col.accessor('protocol', { header: 'Protocol', cell: ({ row }) => <Badge variant="outline" className="px-1.5 text-muted-foreground">{row.original.protocol}</Badge> }),
  col.accessor('chain', { header: 'Chain', cell: ({ row }) => <span className="text-muted-foreground">{row.original.chain}</span> }),
  col.accessor('supplied', { header: ({ column }) => <SortHeader column={column} label="Supplied" />, cell: ({ row }) => <span className="tabular-nums">{usd(row.original.supplied)}</span> }),
  col.accessor('borrowed', { header: ({ column }) => <SortHeader column={column} label="Borrowed" />, cell: ({ row }) => <span className="tabular-nums">{usd(row.original.borrowed)}</span> }),
  col.accessor('utilization', {
    header: ({ column }) => <SortHeader column={column} label="Utilisation" />,
    cell: ({ row }) => <Badge variant="outline" className={`px-1.5 tabular-nums ${RISK_CLASS[row.original.risk]}`}><span className="size-1.5 rounded-full bg-current" />{pct(row.original.utilization, 1)}</Badge>,
  }),
  col.accessor('lltv', { header: 'LLTV', cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{pct(row.original.lltv, 1)}</span> }),
  col.accessor('supply_apy', { header: ({ column }) => <SortHeader column={column} label="Supply APY" />, cell: ({ row }) => <span className="tabular-nums">{pct(row.original.supply_apy)}</span> }),
  col.accessor('borrow_apy', { header: ({ column }) => <SortHeader column={column} label="Borrow APY" />, cell: ({ row }) => <span className="tabular-nums">{pct(row.original.borrow_apy)}</span> }),
]);

export function DataTable({ data, title, caption, pageSize = 10 }: { data: Market[]; title: string; caption: React.ReactNode; pageSize?: number }) {
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'supplied', desc: true }]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize });
  const table = useTable({
    features, data, columns,
    state: { sorting, columnVisibility, columnFilters, pagination },
    getRowId: (row) => row.id,
    onSortingChange: setSorting, onColumnFiltersChange: setColumnFilters, onColumnVisibilityChange: setColumnVisibility, onPaginationChange: setPagination,
  });
  const total = table.getFilteredRowModel().rows.length;
  return (
    <div className="flex w-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-none">{title}</h2>
          <p className="mt-1.5 max-w-[80ch] text-sm text-muted-foreground">{caption}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Filter markets" className="h-8 w-40" value={(table.getColumn('collateral')?.getFilterValue() as string) ?? ''} onChange={(e) => table.getColumn('collateral')?.setFilterValue(e.target.value)} />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <Columns3Icon data-icon="inline-start" />Columns<ChevronDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table.getAllColumns().filter((c) => typeof c.accessorFn !== 'undefined' && c.getCanHide()).map((c) => (
                <DropdownMenuCheckboxItem key={c.id} checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(!!v)}>{LABELS[c.id] ?? c.id}</DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} colSpan={h.colSpan} className={NUMERIC.has(h.column.id) ? 'text-right' : ''}>
                    {h.isPlaceholder ? null : <FlexRender header={h} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().filter((c) => c.column.getIsVisible()).map((cell) => (
                  <TableCell key={cell.id} className={NUMERIC.has(cell.column.id) ? 'text-right' : ''}><FlexRender cell={cell} /></TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No markets match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">{total} market{total === 1 ? '' : 's'}</div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
            <Select value={`${table.state.pagination.pageSize}`} onValueChange={(v) => { if (v !== null) table.setPageSize(Number(v)); }} items={[10, 20, 50].map((n) => ({ label: `${n}`, value: `${n}` }))}>
              <SelectTrigger size="sm" className="w-20" id="rows-per-page"><SelectValue placeholder={table.state.pagination.pageSize} /></SelectTrigger>
              <SelectContent side="top"><SelectGroup>{[10, 20, 50].map((n) => <SelectItem key={n} value={`${n}`}>{n}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">Page {table.state.pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}</div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><span className="sr-only">First page</span><ChevronsLeftIcon /></Button>
            <Button variant="outline" className="size-8" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><span className="sr-only">Previous page</span><ChevronLeftIcon /></Button>
            <Button variant="outline" className="size-8" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><span className="sr-only">Next page</span><ChevronRightIcon /></Button>
            <Button variant="outline" className="hidden size-8 lg:flex" size="icon" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><span className="sr-only">Last page</span><ChevronsRightIcon /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
