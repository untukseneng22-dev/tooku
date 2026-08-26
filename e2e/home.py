import asyncio

from playwright.async_api import async_playwright, expect


async def main() -> None:
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        page_errors: list[str] = []
        page.on("pageerror", lambda error: page_errors.append(str(error)))

        await page.goto("http://localhost:8080/", wait_until="networkidle")
        await expect(page.get_by_text("BARAKA", exact=True).first).to_be_visible()
        await expect(page.get_by_role("navigation")).to_be_visible()

        await page.reload(wait_until="networkidle")
        await expect(page.get_by_text("BARAKA", exact=True).first).to_be_visible()
        await expect(page.locator('a[href^="/produk/"]').first).to_be_visible()

        await page.get_by_role("link", name="Pesanan").click()
        await expect(page).to_have_url("http://localhost:8080/pesanan")

        await page.get_by_role("link", name="Beranda").click()
        await expect(page).to_have_url("http://localhost:8080/")
        await expect(page.get_by_text("BARAKA", exact=True).first).to_be_visible()

        assert page_errors == [], page_errors
        await browser.close()


asyncio.run(main())