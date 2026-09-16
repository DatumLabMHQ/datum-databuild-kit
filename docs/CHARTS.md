# Charts: which one, when

The kit ships six charts in `templates/dashboard/components/charts`, each a shadcn/ui chart recipe
(`ChartContainer`, `ChartTooltipContent`, `ChartLegendContent` over Recharts 3) fed with the kit's
shapes and formatters. The rule for each sits at the top of its file and is shown live at `/kit/charts`.
This page is the same rules in one place, so a review can point at a line.

| Chart | Use for | Not for | Shape |
|---|---|---|---|
| `AreaChart` | Totals that accumulate or drift over time: supplied, borrowed, TVL, volume. `stacked` when the series are parts of one whole; `expand` for share over time. | Rates, ratios, anything that crosses zero; a handful of points; categories. | rows `{ day, ...series }` |
| `LineChart` | Rates and ratios read as a level: APYs, utilisation, spreads, prices. Up to four series; `dots` when points are sparse. | Volumes and totals; categories. | rows `{ day, ...series }` |
| `BarChart` | One value per category: by chain, by protocol, by asset. `horizontal` with `labels` for rankings and long names; `stacked` for composition per period when periods are few. | Long time series; more than about twelve categories; shares of one whole. | rows `{ name, ...series }` |
| `DonutChart` | Shares of one whole at one moment, two to six slices. Hover isolates a slice; the centre shows the total. | More than six slices (rank, group the rest as Other); change over time; two wholes side by side. | `[{ name, value }]` |
| `RadarChart` | A profile across four to eight dimensions on one shared scale: a risk scorecard, one thing against another. | Different scales; time series; more than three series; precise reading. | rows `{ axis, ...series }` |
| `RadialChart` | One value against a real maximum: utilisation, a cap x% filled, a target reached. | Several values; totals with no ceiling; trends. | `value`, `max` |

## Rules that apply to every chart

- Every chart sits in a `Card` with a `CardTitle` and a `CardDescription` that says what it shows and
  why it matters to the page's question. No silent visuals.
- Series colours are `--chart-1` to `--chart-8` in order unless a category has a brand colour
  (`--chain-*`), and a series keeps its colour across the whole dashboard.
- Money, percentages and counts go through `lib/format.ts`; the tooltip and the axis use the same
  formatter. Missing values read n/a.
- Time on the x axis is an ISO day; the charts format it as "12 Sep".
- A range control is a native select (Last 3 months, 30 days, 7 days), filtered against the last day
  in the data, never against today.
- Animations stay off; revalidated data must not re-animate.
- Prefer a table when people will read exact values or sort them. Prefer Donut, Area and Bar over
  rows of horizontal bars. Never two y axes on one chart, never 3D, never a pie with a legend of ten.
- A new chart type comes from the shadcn registry (`npx shadcn@latest add chart-<family>-<variant>`),
  is adapted to the kit's shapes, gets its rule comment at the top, an entry here and a card on
  `/kit/charts`. It does not get its own colours or tooltip.
