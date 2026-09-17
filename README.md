# datum-databuild-kit

The standard way to build data work at Datum. Two commands, one repository.

```bash
bin/datum new product <slug> --adapter rest|graphql|defillama   # a new product in the platform
bin/datum new dashboard <slug>                                    # a new dashboard on the platform
bin/datum sync <slug>                                             # copy the kit files forward into a dashboard
```

`new product` writes the whole platform side into your local clones of `datum-models`, `datum-context` and
`datum-api`: raw migration with provenance columns, an hourly ingest script with run logging and freshness,
staging and marts in house units, tests, the hourly workflow step, the tiering entry, the product descriptor,
and the API/MCP resource rows. Done means the product shows in `/api/v1/products` and `/api/v1/health`.

`new dashboard` creates a Next.js app from `templates/dashboard`: the reference dashboard. It carries the Datum
design system (tokens, one aesthetic, shadcn/ui components and charts on Recharts 3), a typed client for
datum-api (key stays server-side), and three pages that run on labelled sample data until a key is set. Edit
`datum.config.ts` and the pages under `app/`. The rules live in `docs/DESIGN.md`. Every page but the overview sits behind
a sign-in gate (name, email, occupation) that feeds the Datum Labs list; see DESIGN.md §5a.

This is the only dashboard kit. The HTML kit (`DL-Dashboard`) and the `datumlabs-sdk` monorepo were archived on
16 September 2026; pages still on the HTML kit migrate here when next touched.

The reference dashboard is live on sample data at https://datum-reference-lake.vercel.app (Datum Labs Vercel account, project `datum-reference`, redeployed on every push to `main`).
Read `docs/GUIDE.md` before the first one, `docs/DESIGN.md` before the first page and `docs/CHARTS.md` before the first chart. Dashboards built with the kit, all on the Datum Labs Vercel account and draft until their briefs are signed:
`robinhood-lending` (State of Lending on Robinhood Chain, https://robinhood-lending.vercel.app),
`rwa-terminal-dashboard` (RWA Terminal, https://rwa-terminal-dashboard.vercel.app), `morpho-terminal-dashboard`
(Morpho Research Terminal, https://morpho-terminal-dashboard.vercel.app), `sui-lending-dashboard` (State of Lending on
Sui, https://sui-lending-dashboard-neon.vercel.app), `aave-dashboard-next` (Aave Dashboard,
https://aave-dashboard-next.vercel.app) and `centrifuge-rwa-next` (Centrifuge RWA Terminal,
https://centrifuge-rwa-next.vercel.app). Every page but the overview sits behind the sign-in gate.

CI: `.github/workflows/check.yml` typechecks, lints, builds and smoke-tests the template on every push, and
generates a dashboard with `bin/datum` to prove the scaffolder still works.
