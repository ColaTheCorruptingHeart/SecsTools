import { expect, test } from '@playwright/test'

test('uses the edge-aligned main scrollbar without a nested home scrollbar', async ({ page }) => {
  await page.setViewportSize({ width: 1512, height: 882 })
  await page.goto('/home')
  await page.waitForLoadState('networkidle')

  const main = page.locator('main.el-main')
  const home = page.getByTestId('home-page')

  await expect(main).toBeVisible()
  await expect(home).toBeVisible()

  const layout = await page.evaluate(() => {
    const mainElement = document.querySelector<HTMLElement>('main.el-main')
    const homeElement = document.querySelector<HTMLElement>('[data-testid="home-page"]')

    if (!mainElement || !homeElement) {
      throw new Error('Home layout elements are missing')
    }

    return {
      mainRight: mainElement.getBoundingClientRect().right,
      viewportWidth: window.innerWidth,
      mainCanScroll: mainElement.scrollHeight > mainElement.clientHeight,
      homeOverflowY: getComputedStyle(homeElement).overflowY
    }
  })

  expect(layout.mainRight).toBe(layout.viewportWidth)
  expect(layout.mainCanScroll).toBe(true)
  expect(layout.homeOverflowY).toBe('visible')
})
