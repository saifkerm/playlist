import { expect, test } from '@playwright/test';

test('home -> playlist -> episode flow with audio default and toggle', async ({ page }) => {
  await page.goto('/#/');

  await expect(page.getByRole('heading', { name: 'Playlists YouTube en mode podcast + vidéo' })).toBeVisible();
  await page.getByRole('link', { name: 'Ouvrir la playlist' }).first().click();

  await expect(page.getByRole('heading', { name: 'O MESSENGER', exact: true })).toBeVisible();
  await page.locator('.timeline-link').first().click();

  await expect(page.getByRole('tab', { name: 'Podcast' })).toBeVisible();
  await expect(page.locator('.mode-btn.is-active')).toContainText('Podcast');

  await page.getByRole('tab', { name: 'Vidéo' }).click();
  await expect(page.locator('.mode-btn.is-active')).toContainText('Vidéo');
});
