# datum-databuild-kit

The standard way to build data work at Datum. Two commands, one repository.

```bash
bin/datum new product <slug> --adapter rest|graphql|defillama   # a new product in the platform
bin/datum new dashboard <slug>                                    # a new dashboard on the platform
```

`new product` writes the whole platform side into your local clones of `datum-models`, `datum-context` and
`datum-api`: raw migration with provenance columns, an hourly ingest script with run logging and freshness,
staging and marts in house units, tests, the hourly workflow step, the tiering entry, the product descriptor,
and the API/MCP resource rows. Done means the product shows in `/api/v1/products` and `/api/v1/health`.

`new dashboard` creates a Next.js app from `templates/dashboard`: the reference dashboard. It carries the Datum
design system (tokens, one aesthetic, shadcn/ui components and charts on Recharts 3), a typed client for
datum-api (key stays server-side), and three pages that run on labelled sample data until a key is set. Edit
`datum.config.ts` and the pages under `app/`. The rules live in `docs/DESIGN.md`.

This is the only dashboard kit. The HTML kit (`DL-Dashboard`) and the `datumlabs-sdk` monorepo were archived on
16 September 2026; pages still on the HTML kit migrate here when next touched.

Read `docs/GUIDE.md` before the first one, `docs/DESIGN.md` before the first page and `docs/CHARTS.md` before the first chart. The first dashboard built with the kit is
`DatumLabMHQ/robinhood-lending`: State of Lending on Robinhood Chain.
