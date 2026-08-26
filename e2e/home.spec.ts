import { expect, test } from "@playwright/test";

test("Home tetap dapat dirender dan dinavigasi setelah refresh/HMR", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.getByText("BARAKA", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("navigation")).toBeVisible();

  await page.reload();
  await expect(page.getByText("BARAKA", { exact: true }).first()).toBeVisible();
  await expect(page.locator('a[href^="/produk/"]').first()).toBeVisible();

  await page.getByRole("link", { name: "Pesanan" }).click();
  await expect(page).toHaveURL(/\/pesanan$/);

  await page.getByRole("link", { name: "Beranda" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("BARAKA", { exact: true }).first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});