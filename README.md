# datum-kit

The standard way to build data work at Datum. Two commands, one repository.

```bash
bin/datum new product <slug> --adapter rest|graphql|defillama   # a new product in the platform
bin/datum new dashboard <slug>                                    # a new dashboard on the platform
```

`new product` writes the whole platform side into your local clones of `datum-models`, `datum-context` and
`datum-api`: raw migration with provenance columns, an hourly ingest script with run logging and freshness,
staging and marts in house units, tests, the hourly workflow step, the tiering entry, the product descriptor,
and the API/MCP resource rows. Done means the product shows in `/api/v1/products` and `/api/v1/health`.

`new dashboard` creates a Next.js app from `templates/dashboard`: a typed client for datum-api (key stays
server-side), the Datum design system, and starter pages. Edit `datum.config.ts` and the pages under `app/`.

Read `docs/GUIDE.md` before the first one. The first dashboard built with the kit is
`DatumLabMHQ/robinhood-lending`: State of Lending on Robinhood Chain.
