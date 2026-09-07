# Building data work at Datum

Every product goes through five gates, in this order, and the kit enforces the first one:

1. **Brief.** `bin/datum new brief <slug> --owner <name>` opens the research document in datum-context/briefs.
   It holds the questions to ask the owner, the research on the protocol or category, the sources probed live
   with a date, the ground truth captured, and what the platform already has. Nothing is scaffolded until the
   owner changes its Status line to "signed off by <name> on <date>". `new product` and `new dashboard` refuse
   otherwise (`--no-brief` exists for throwaway prototypes and nothing that will be shared).
2. **Data.** Existing resources, or a new product via `new product`.
3. **Door.** Nothing per product; the API and MCP read the registry.
4. **Page.** `new dashboard`, then the pages.
5. **Verify.** `bin/datum check <slug>` must print READY: brief signed, descriptor present, every resource the
   page reads present in the registry, platform health ok, and a reconciliation row in the divergence log.
   Only then is a page embedded, linked or shared. Until then its config carries `status: 'draft'` and the
   page says so.

## 0. One-time setup

Clone the four repositories side by side: `datum-databuild-kit`, `datum-models`, `datum-context`, `datum-api`. The kit
finds the others next to it (or set `DATUM_ROOT`). You need Python 3.12, Node 22 and the platform
credentials in `~/.config/datum/.env` (ask Olusegun for the read-only URL and the API key).

## 1. Is the data already there?

Check before collecting anything. `GET /api/v1/products` on datum-api lists every resource, and the MCP
tool `list_products` does the same inside Claude. Sui, RWA, Morpho (14 chains), Aave (20 chains), Centrifuge
and DefiLlama TVL for 24 protocols are already snapshotted hourly. "State of Lending on Robinhood Chain"
needed no new collection at all: Morpho on chain 4663 plus the DefiLlama layer covered it.

## 2. New data: `bin/datum new product <slug> --adapter rest|graphql|defillama`

Writes into the three clones: the raw migration (provenance columns, append-only), the hourly ingest with
run logging and freshness, staging in house units, a daily mart (incremental, last value of the day), tests,
the hourly step, the tiering entry, the product descriptor, and the API resource row.

You edit two things: `fetch_rows()` in the ingest script (the real endpoint and field mapping) and, if the
source's units differ, the staging model. Then:

```bash
cd ../datum-models
python scripts/migrate.py && python scripts/ingest_<schema>.py
dbt build --target dev --select <schema>           # builds into your own dev schema
```

Open a pull request on datum-models. CI builds the whole project into a throwaway schema with every test.
Merge, then push the datum-context descriptor and the datum-api registry row. Done means the product is in
`/api/v1/products` and its job shows in `/api/v1/health`.

House rules that the templates already follow, and that reviews check: raw rows are never edited; every row
carries run_id, source_id, fetched_at; rates in percent, money in USD; daily grain is the last observation of
the UTC day; our own count is the headline and DefiLlama is stored beside it; disagreements go in
`datum-context/evals/divergence-log.md` with a cause.

## 3. A page: `bin/datum new dashboard <slug>`

Creates a Next.js app from `templates/dashboard`. You edit `datum.config.ts` (product, resources, questions,
default filters, nav) and the pages under `app/`. `lib/datum.ts` is the client: `query(product, resource,
params)`, `ask(question_id)`, `health()`, plus `usd`, `pct`, `day` formatters. The API key stays server-side.

Deploy on the Datum Labs Vercel account:

```bash
gh repo create DatumLabMHQ/<slug> --public --source .
vercel link --scope datumlabs1 --project <slug>
printf '%s' "$DATUM_API_KEY" | vercel env add DATUM_API_KEY production
git push -u origin main
```

Cron jobs stay off on every dashboard; a dashboard holds no data. Anything on a schedule lives in the
platform or in a Cloudflare Worker.

## 4. Monitoring comes for free

Setnel's platform monitor reads `ops.sync_runs` and `ops.source_freshness`, so a new product's job errors
and stale sources raise incidents the hour they happen. Add a content-signal rule in
`setnel/scripts/detectors/content.mjs` when the product has a number worth writing about.

## Worked example

`DatumLabMHQ/robinhood-lending` was generated with `new dashboard`, then three pages were written against
existing resources: overview (KPIs, DefiLlama chain series, our own Morpho series, protocol table with the
reconciliation note), markets (listed and unlisted), vaults. About two hours from empty folder to live.
