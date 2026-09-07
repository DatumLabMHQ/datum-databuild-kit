// The only file most dashboards need to edit. Name the product, the platform resources the pages
// read, and the questions to show. The client in lib/datum.ts and the components do the rest.
export const config = {
  slug: '{{slug}}',
  title: '{{title}}',
  description: '{{description}}',
  // Resources are product/name pairs from GET /api/v1/products on datum-api.
  resources: {
    daily: { product: 'morpho', name: 'markets' },
  },
  // Canonical questions (ids from GET /api/v1/questions) shown as headline numbers.
  questions: ['morpho_tvl_total'] as string[],
  // Default filters applied to every resource read (a chain, a protocol...).
  filters: {} as Record<string, string>,
};
export type DatumConfig = typeof config;
