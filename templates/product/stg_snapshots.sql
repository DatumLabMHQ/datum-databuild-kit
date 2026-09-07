-- Staging: house units and names. Rates in percent, amounts in USD, day = UTC date of the fetch.
select snapshot_id, run_id, source_id, fetched_at, (fetched_at at time zone 'UTC')::date as day,
       entity_id, entity_name, lower(chain) as chain, value_usd, secondary_usd, rate_pct, payload
from {{ source('{{schema}}_raw', 'raw_snapshots') }}
