'use client';
// Charts: Recharts 3 in the shadcn/ui chart recipes, on the Datum tokens. Every chart fills its
// container's width; pass a height. Series colours default to --chart-1..8 in order.
import * as React from 'react';
import * as R from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { byUnit, shortDay, type Unit } from '@/lib/format';
import type { Point, Share } from '@/lib/types';

export type Series = { key: string; label: string; color?: string };
const colorOf = (s: Series, i: number) => s.color ?? `var(--chart-${(i % 8) + 1})`;
const toConfig = (series: Series[]): ChartConfig => Object.fromEntries(series.map((s, i) => [s.key, { label: s.label, color: colorOf(s, i) }]));
const fmtX = (v: unknown) => { const s = String(v); return /^\d{4}-\d{2}-\d{2}/.test(s) ? shortDay(s) : s; };

/** Tooltip row in the shadcn layout with a formatted value. */
function Row({ color, label, value }: { color?: string; label: React.ReactNode; value: string }) {
  return (
    <>
      <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: color }} />
      <div className="flex flex-1 items-center justify-between gap-4 leading-none">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">{value}</span>
      </div>
    </>
  );
}
function tooltipFormatter(config: ChartConfig, f: (v: unknown) => string, total?: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (value: any, name: any, item: any, index: number, payload: any) => {
    const last = total && index === total.length - 1;
    const sum = last ? total.reduce((a, k) => a + (Number(payload?.[k]) || 0), 0) : 0;
    return (
      <div className="flex w-full flex-col gap-1.5">
        <div className="flex items-center gap-2"><Row color={item?.color ?? item?.payload?.fill} label={config[String(name)]?.label ?? String(name)} value={f(value)} /></div>
        {last ? <div className="mt-1 flex items-center justify-between gap-4 border-t pt-1.5 leading-none"><span className="font-medium">Total</span><span className="font-medium tabular-nums">{f(sum)}</span></div> : null}
      </div>
    );
  };
}

export function AreaChart({ data, x = 'day', series, stacked = false, expand = false, unit = 'usd', height = 280, legend = false, curve = 'natural', gradient = true, format }: {
  data: Point[]; x?: string; series: Series[]; stacked?: boolean; expand?: boolean; unit?: Unit; height?: number; legend?: boolean;
  curve?: 'natural' | 'monotone' | 'linear' | 'step'; gradient?: boolean; format?: (v: unknown) => string;
}) {
  const config = toConfig(series); const f = format ?? byUnit[unit]; const id = React.useId().replace(/:/g, '');
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <R.AreaChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }} stackOffset={expand ? 'expand' : 'none'} accessibilityLayer>
        <defs>{series.map((s, i) => (
          <linearGradient key={s.key} id={`f-${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colorOf(s, i)} stopOpacity={0.8} /><stop offset="95%" stopColor={colorOf(s, i)} stopOpacity={0.1} />
          </linearGradient>))}</defs>
        <R.CartesianGrid vertical={false} />
        <R.XAxis dataKey={x} tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={fmtX} />
        <R.YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={4} width={56} domain={expand ? [0, 1] : undefined} ticks={expand ? [0, 0.25, 0.5, 0.75, 1] : undefined}
          tickFormatter={expand ? (v: number) => `${Math.round(v * 100)}%` : (v: number) => f(v)} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" labelFormatter={(l) => fmtX(l)} formatter={tooltipFormatter(config, expand ? (v) => `${(Number(v) * 100).toFixed(1)}%` : f, stacked && !expand ? series.map((s) => s.key) : undefined)} />} />
        {series.map((s, i) => (
          <R.Area key={s.key} dataKey={s.key} type={curve} stroke={colorOf(s, i)} strokeWidth={2} fill={gradient ? `url(#f-${id}-${i})` : colorOf(s, i)}
            fillOpacity={gradient ? 0.4 : stacked ? 0.4 : 0.12} stackId={stacked ? 'a' : undefined} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />))}
        {legend ? <ChartLegend content={<ChartLegendContent />} /> : null}
      </R.AreaChart>
    </ChartContainer>
  );
}

export function LineChart({ data, x = 'day', series, unit = 'usd', height = 280, legend = false, dots = false, curve = 'monotone', format }: {
  data: Point[]; x?: string; series: Series[]; unit?: Unit; height?: number; legend?: boolean; dots?: boolean; curve?: 'natural' | 'monotone' | 'linear' | 'step'; format?: (v: unknown) => string;
}) {
  const config = toConfig(series); const f = format ?? byUnit[unit];
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <R.LineChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 0 }} accessibilityLayer>
        <R.CartesianGrid vertical={false} />
        <R.XAxis dataKey={x} tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={fmtX} />
        <R.YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={4} width={56} tickFormatter={(v: number) => f(v)} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator={series.length === 1 ? 'line' : 'dot'} labelFormatter={(l) => fmtX(l)} formatter={tooltipFormatter(config, f)} />} />
        {series.map((s, i) => (
          <R.Line key={s.key} dataKey={s.key} type={curve} stroke={colorOf(s, i)} strokeWidth={2} dot={dots ? { fill: colorOf(s, i), r: 3, strokeWidth: 0 } : false} activeDot={{ r: 5 }} isAnimationActive={false} />))}
        {legend ? <ChartLegend content={<ChartLegendContent />} /> : null}
      </R.LineChart>
    </ChartContainer>
  );
}

export function BarChart({ data, x = 'day', series, stacked = false, horizontal = false, unit = 'usd', height = 260, legend = false, labels = false, format, categoryWidth = 96 }: {
  data: Point[] | Share[]; x?: string; series: Series[]; stacked?: boolean; horizontal?: boolean; unit?: Unit; height?: number; legend?: boolean; labels?: boolean; format?: (v: unknown) => string; categoryWidth?: number;
}) {
  const config = toConfig(series); const f = format ?? byUnit[unit];
  const last = series.length - 1;
  const radius = (i: number): number | [number, number, number, number] => {
    if (!stacked) return 6;
    if (horizontal) return i === 0 ? [4, 0, 0, 4] : i === last ? [0, 4, 4, 0] : 0;
    return i === 0 ? [0, 0, 4, 4] : i === last ? [4, 4, 0, 0] : 0;
  };
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <R.BarChart data={data as Point[]} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ left: 0, right: labels && horizontal ? 56 : 12, top: labels && !horizontal ? 20 : 8, bottom: 0 }} accessibilityLayer>
        <R.CartesianGrid vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (<>
          <R.XAxis type="number" hide />
          <R.YAxis dataKey={x} type="category" tickLine={false} axisLine={false} tickMargin={8} width={categoryWidth} />
        </>) : (<>
          <R.XAxis dataKey={x} tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} tickFormatter={fmtX} />
          <R.YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={4} width={56} tickFormatter={(v: number) => f(v)} />
        </>)}
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator={stacked ? 'dot' : 'dashed'} hideLabel={horizontal} labelFormatter={(l) => fmtX(l)} formatter={tooltipFormatter(config, f, stacked ? series.map((s) => s.key) : undefined)} />} />
        {legend ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {series.map((s, i) => (
          <R.Bar key={s.key} dataKey={s.key} fill={colorOf(s, i)} stackId={stacked ? 'a' : undefined} radius={radius(i)} isAnimationActive={false}>
            {labels ? <R.LabelList dataKey={s.key} position={horizontal ? 'right' : 'top'} offset={8} fontSize={11} className="fill-muted-foreground" formatter={(v: unknown) => f(v)} /> : null}
          </R.Bar>))}
      </R.BarChart>
    </ChartContainer>
  );
}

/** Donut with an expanding active sector, a centre readout and a side legend. */
export function Donut({ items, unit = 'usd', height = 220, centerLabel = 'total', legend = true, thickness = 28, format }: {
  items: Share[]; unit?: Unit; height?: number; centerLabel?: string; legend?: boolean; thickness?: number; format?: (v: unknown) => string;
}) {
  const f = format ?? byUnit[unit];
  const [hover, setHover] = React.useState<number | null>(null);
  const data = items.filter((d) => d.value > 0).map((d, i) => ({ ...d, fill: d.color ?? `var(--chart-${(i % 8) + 1})` }));
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const config: ChartConfig = Object.fromEntries(data.map((d) => [d.name, { label: d.name, color: d.fill }]));
  const focus = hover !== null ? data[hover] : null;
  const outer = height / 2 - 8; const inner = Math.max(0, outer - thickness);
  return (
    <div className="donut">
      <ChartContainer config={config} className="aspect-square shrink-0" style={{ height, width: height }}>
        <R.PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={tooltipFormatter(config, f)} />} />
          <R.Pie data={data} dataKey="value" nameKey="name" innerRadius={inner} outerRadius={outer} strokeWidth={4} stroke="var(--surface)" isAnimationActive={false}
            onMouseEnter={(_, i) => setHover(i)} onMouseLeave={() => setHover(null)}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            activeShape={(p: any) => <R.Sector {...p} outerRadius={(p.outerRadius ?? outer) + 6} />}>
            <R.Label content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
              const cx = Number(viewBox.cx), cy = Number(viewBox.cy);
              return (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={cx} y={cy - 4} className="chart-center-value">{focus ? f(focus.value) : f(total)}</tspan>
                  <tspan x={cx} y={cy + 16} className="chart-center-label">{focus ? `${((focus.value / total) * 100).toFixed(0)}%` : centerLabel}</tspan>
                </text>
              );
            }} />
          </R.Pie>
        </R.PieChart>
      </ChartContainer>
      {legend ? (
        <div className="donut-legend">
          {data.map((d, i) => (
            <div key={d.name} className={`donut-legend-item${hover !== null && hover !== i ? ' muted' : ''}`} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <span className="swatch" style={{ background: d.fill }} /><span className="donut-legend-name">{d.name}</span><span className="donut-legend-value">{f(d.value)}</span>
            </div>))}
        </div>
      ) : null}
    </div>
  );
}

/** One value against a maximum, as a progress ring with the value in the centre. */
export function RadialChart({ value, max = 100, label, height = 200, color = 'var(--chart-1)', format }: {
  value: number; max?: number; label: string; height?: number; color?: string; format?: (v: unknown) => string;
}) {
  const f = format ?? ((v: unknown) => `${Number(v).toFixed(0)}%`);
  const config: ChartConfig = { value: { label, color } };
  return (
    <ChartContainer config={config} className="aspect-square mx-auto" style={{ height, width: height }}>
      <R.RadialBarChart data={[{ name: label, value, fill: color }]} startAngle={90} endAngle={-270} innerRadius="66%" outerRadius="90%">
        <R.PolarAngleAxis type="number" domain={[0, max]} tick={false} axisLine={false} />
        <R.RadialBar dataKey="value" background cornerRadius={8} isAnimationActive={false} className="[&_.recharts-radial-bar-background-sector]:fill-muted" />
        <R.PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <R.Label content={({ viewBox }) => {
            if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null;
            const cx = Number(viewBox.cx), cy = Number(viewBox.cy);
            return <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"><tspan x={cx} y={cy - 4} className="chart-center-value">{f(value)}</tspan><tspan x={cx} y={cy + 16} className="chart-center-label">{label}</tspan></text>;
          }} />
        </R.PolarRadiusAxis>
      </R.RadialBarChart>
    </ChartContainer>
  );
}
