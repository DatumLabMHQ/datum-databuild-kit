# {{title}}

{{description}}

Built with [datum-databuild-kit](https://github.com/DatumLabMHQ/datum-databuild-kit). Every number comes from the
Datum data platform through datum-api; this app holds no data and runs no crons. Without `DATUM_API_KEY` it runs
on labelled sample data.

- `datum.config.ts`: title, the question the overview answers, resources and their column mapping, nav, sources, definitions.
- `lib/data.ts`: turns resources into the normalised shapes in `lib/types.ts` (or returns `lib/sample.ts`).
- `lib/datum.ts`: the server-side platform client. `lib/format.ts`: the formatters every number goes through.
- `app/(app)/`: the shared frame (shadcn dashboard-01 block) and the pages: overview, markets, methodology.
- `components/`: app-sidebar, site-header, status-banner, page-header, section-cards, chart-area-interactive, data-table, site-footer, ThemeToggle; `components/ui/` is shadcn.
- Design rules: `docs/DESIGN.md` in the kit.

```bash
npm install && npm run dev            # sample data
DATUM_API_KEY=... npm run dev          # the platform
npm run typecheck && npm run build     # before a PR
```

Deploy: `vercel link --scope datumlabs1 --project {{slug}}`, add `DATUM_API_URL` and `DATUM_API_KEY`, push to main.
