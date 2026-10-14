import { expect, test } from '@playwright/test'

const navigationLog = `01:00:00 SEND S2F41 W
<L,2
  <A 'START'>
  <L,0
  >
>.

01:00:01 SEND S7F20
<L,0
>.

01:00:02 SEND S2F41 W
<L,2
  <A 'STOP'>
  <L,0
  >
>.`

test('highlights the current timeline item and supports directional keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/tools/log-timeline-analyzer')
  await page.waitForLoadState('networkidle')

  await page.locator('input[type="file"][accept=".log,.txt"]').setInputFiles({
    name: 'keyboard-navigation.log',
    mimeType: 'text/plain',
    buffer: Buffer.from(navigationLog)
  })

  await expect(page.locator('.el-loading-mask')).toHaveCount(0)
  const timeline = page.getByRole('listbox', { name: 'SECS 日志时间线' })
  const items = page.getByTestId('timeline-item')
  await expect(items).toHaveCount(3)
  await expect(page.getByTestId('timeline-item-sequence')).toHaveText(['#1', '#2', '#3'])

  await items.nth(0).click()
  await expect(timeline).toBeFocused()
  await expect(items.nth(0)).toHaveAttribute('aria-selected', 'true')
  await expect(items.nth(0)).toHaveClass(/timeline-item--current/)

  await timeline.press('ArrowDown')
  await expect(items.nth(1)).toHaveAttribute('aria-selected', 'true')

  await timeline.press('ArrowUp')
  await expect(items.nth(0)).toHaveAttribute('aria-selected', 'true')

  await timeline.press('Control+ArrowDown')
  await expect(items.nth(2)).toHaveAttribute('aria-selected', 'true')

  await timeline.press('Control+ArrowUp')
  await expect(items.nth(0)).toHaveAttribute('aria-selected', 'true')

  await items.nth(0).locator('input[type="checkbox"]').focus()
  await page.keyboard.press('ArrowDown')
  await expect(items.nth(1)).toHaveAttribute('aria-selected', 'true')
})
