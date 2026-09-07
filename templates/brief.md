# Brief: {{title}}

**Status:** draft            <!-- becomes "signed off by <name> on <date>"; nothing is scaffolded before that -->
**Owner:** {{owner}}
**Opened:** {{today}}
**Slug:** {{slug}}

A brief is the research and the questions, answered together with the owner, before any code. The kit
refuses to scaffold a dashboard for a slug whose brief is not signed off.

## 1. The question this product answers
One sentence, in the reader's words. Who reads it, and what decision or piece of writing it feeds.

## 2. Questions for the owner (ask, do not assume)
- Which protocol(s), chain(s), asset classes exactly? Name the contracts or markets that must be in.
- What is the headline number, and which definition of it? (See metrics/ in datum-context: tvl-net, tvl-gross, supply-apy, ...)
- Whose number is the reference the reader will compare us to (the protocol's own UI, DefiLlama, a competitor)?
- How far back must history go for the page to be useful? Is "from the day we start" acceptable?
- What cadence matters: hourly, daily, weekly?
- What is explicitly out of scope?
- Who signs off on the numbers before the page is embedded or shared?

## 3. Research (verified, with a date)
- **The protocol / category:** how it works, what its own UI shows and calls the headline number, known quirks.
- **Sources probed live** (endpoint, auth, cadence, units, paging, what broke): ...
- **Ground truth captured:** the protocol's own number(s) on {{today}} with a screenshot or API response saved under `briefs/{{slug}}/`.

## 4. What the platform already has
Output of `GET /api/v1/products` filtered to this scope, with history start dates. Say exactly which resources
cover which part of the question, and which parts are missing.

## 5. What must be built
- Data: new product(s) via `datum new product`, or nothing.
- Definitions: new or changed entries in datum-context/metrics/.
- Page: the resources each page reads.

## 6. Reconciliation plan
Which of our numbers is compared with which reference, how often, and where the differences are logged
(evals/divergence-log.md). A page is not "live" until its first reconciliation row exists.

## 7. Risks and unknowns
What could make the numbers wrong, and how the reader will be told (data-since dates, listed/unlisted flags, method labels).

## Sign-off
Owner reviewed sections 1 to 7. Status line above updated.
