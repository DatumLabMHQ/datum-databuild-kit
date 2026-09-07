# {{title}}

{{description}}

Built with [datum-kit](https://github.com/DatumLabMHQ/datum-kit). Every number comes from the Datum data platform
through datum-api; this app holds no data and runs no crons.

- `datum.config.ts`: product, resources, questions, default filters, nav.
- `lib/datum.ts`: the server-side client (`query`, `ask`, `health`) and formatters.
- `app/`: pages. `components/`: Kpi, DataTable, TimeSeries, Shell.

Env: `DATUM_API_URL` (default the Datum Labs API), `DATUM_API_KEY` (server-side only).
Deploy: `vercel link --scope datumlabs1 --project {{slug}}`, add the two env vars, push to main.
