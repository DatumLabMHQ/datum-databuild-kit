// Every route renders on sample data with no console errors, and the pieces a reader relies on
// are there. Fails loudly on a broken page, a missing caption, or a server-side render error.
import { expect, test, type Page } from '@playwright/test';

// Every route except the overview sits behind the sign-in gate. The routes below are checked signed
// in (the flag the gate stores); the gate itself has its own test at the end.
test.beforeEach(async ({ page }) => { await page.addInitScript(() => localStorage.setItem('datum_gate_unlocked', '1')); });

const ROUTES = [
  { path: '/', h1: /Where does lending activity sit/i, checks: async (p: Page) => {
    await expect(p.locator('[data-slot=card]').first()).toBeVisible();
    await expect(p.locator('svg.recharts-surface').first()).toBeVisible();
    await expect(p.locator('table tbody tr')).toHaveCount(8);
    await expect(p.getByText('Sample data').first()).toBeVisible();
  } },
  { path: '/markets', h1: /Which markets carry the risk/i, checks: async (p: Page) => {
    await expect(p.locator('table tbody tr')).toHaveCount(12);
    await p.getByPlaceholder('Filter markets').fill('usdc');
    await expect(p.locator('table tbody tr')).toHaveCount(6);
  } },
  { path: '/markets/wsteth-usdc', h1: /wstETH \/ USDC/, checks: async (p: Page) => {
    await expect(p.locator('[data-slot=resizable-handle]')).toBeVisible();
    await expect(p.locator('[data-slot=item]').first()).toBeVisible();
    await expect(p.locator('svg.recharts-surface')).toHaveCount(4);
  } },
  { path: '/methodology', h1: /Where do these numbers come from/i, checks: async (p: Page) => {
    for (const title of ['Sources', 'Freshness and status', 'Definitions', 'Reconciliation']) await expect(p.locator('[data-slot=card-title]', { hasText: title })).toBeVisible();
    await expect(p.locator('table tbody tr')).toHaveCount(7);
    await expect(p.locator('[data-slot=item]')).toHaveCount(7);
  } },
  { path: '/kit/charts', h1: /Which chart, when/i, checks: async (p: Page) => {
    await expect(p.locator('svg.recharts-surface')).toHaveCount(8);
  } },
];

for (const r of ROUTES) {
  test(`${r.path} renders clean`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    const res = await page.goto(r.path);
    expect(res?.status(), 'HTTP status').toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: r.h1 })).toBeVisible();
    await r.checks(page);
    // Every chart or table card carries a description (the caption rule).
    const cards = page.locator('[data-slot=card]:has(svg.recharts-surface), [data-slot=card]:has(table)');
    for (let i = 0; i < await cards.count(); i++) await expect(cards.nth(i).locator('[data-slot=card-description]').first()).toHaveText(/.{20,}/);
    expect(errors, 'console errors').toEqual([]);
  });
}

test('a wrong market id shows the on-brand not-found page', async ({ page }) => {
  const res = await page.goto('/markets/does-not-exist');
  // notFound() inside a route with a loading.tsx streams: the status is already 200 by the time the
  // boundary renders. The page is what matters; the status is 404 only when nothing streamed first.
  expect([200, 404]).toContain(res?.status());
  await expect(page.getByRole('heading', { level: 1, name: /nothing at this address/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Back to the overview/i })).toBeVisible();
});

test('a table row opens its market and the palette finds it', async ({ page }) => {
  await page.goto('/');
  await page.locator('table tbody tr').first().click();
  await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+$/);
  await page.keyboard.press('Meta+k');
  await page.getByPlaceholder('Search pages and markets').fill('weth');
  await expect(page.locator('[data-slot=command-item]:visible, [cmdk-item]:visible').first()).toBeVisible();
});

test('phone width: no horizontal scroll on the overview', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const wider = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(wider).toBe(false);
});

test('the sign-in gate: overview open, markets behind the form, and the form opens it', async ({ page, context }) => {
  await context.addInitScript(() => localStorage.removeItem('datum_gate_unlocked'));
  await page.goto('/');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await page.goto('/markets');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: /Sign in to open the full dashboard/i })).toBeVisible();
  await expect(page.locator('main div[inert]')).toHaveCount(1);
  await expect(dialog.getByRole('link', { name: /Back to the overview/i })).toBeVisible();
  await page.route('**/api/gate', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await dialog.getByLabel('Full name').fill('Ada Lovelace');
  await dialog.getByLabel('Email').fill('ada@example.com');
  await dialog.getByLabel('What you do').fill('Analyst');
  await dialog.getByRole('button', { name: /Open the dashboard/i }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('main div[inert]')).toHaveCount(0);
  await expect(page.locator('table tbody tr')).toHaveCount(12);
  await page.goto('/methodology');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
