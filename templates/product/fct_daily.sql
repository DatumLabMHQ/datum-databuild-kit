{{ config(materialized='incremental', unique_key=['day', 'entity_id'], incremental_strategy='delete+insert', on_schema_change='append_new_columns') }}
-- One row per entity per UTC day: the last snapshot of the day (house rule). Incremental so the
-- nightly move of raw rows older than 60 days to R2 never shortens this table's history.
with ranked as (
  select *, row_number() over (partition by entity_id, day order by fetched_at desc) as rn
  from {{ ref('stg_{{schema}}__snapshots') }}
  {% if is_incremental() %} where day >= current_date - 3 {% endif %}
)
select day, fetched_at as as_of, entity_id, entity_name, chain, value_usd, secondary_usd, rate_pct
from ranked where rn = 1
