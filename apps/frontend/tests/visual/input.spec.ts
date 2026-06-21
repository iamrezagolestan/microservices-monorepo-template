import { test, expect } from "@playwright/test";

test.describe('Input', () => {
    test.beforeEach(
        async ({ page }) => {
            await page.goto('/devportal/kitchen-sink')
            await expect(page.locator('html')).toHaveAttribute("dir", "rtl")
        }
    )

    test(
        'default input should render correctly', async ({ page }) => {
            const input = page.getByTestId("input-default")

            await expect(input).toBeVisible()
            await expect(input).toBeEnabled()
        }
    )

    test(
        "filled input should contain value", async ({page}) => {
            const input = page.getByTestId('input-filled')

            await expect(input).toBeVisible()
            await expect(input).toBeEnabled()

            await expect(input).toHaveValue("")
        }
    )

    test(
        "focused input should be focusable", async ({page}) => {
            const input = page.getByTestId("input-focused")

            await expect(input).toBeVisible()
            await input.focus()
            await expect(input).toBeFocused()
        }
    )

    test(
        "disabled input should be disabled", async ({page}) => {
            const input = page.getByTestId("input-disabled")

            expect(input).toBeVisible()
            expect(input).toBeDisabled()
        }
    )
})
