// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  testMatch: "**/*.spec.ts",

  outputDir: "./test-results",

  timeout: 30_000,

  expect: {
    timeout: 5_000,
  },

  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,

  reporter: [["list"]],

  use: {
    baseURL: "http://localhost:3000",

    browserName: "chromium",
    headless: true,

    locale: "fa-IR",
    timezoneId: "Asia/Tehran",

    viewport: {
      width: 1920,
      height: 1080,
    },

    deviceScaleFactor: 1,

    colorScheme: "light",

    screenshot: "off",
    trace: "retain-on-failure",
    video: "off",

    testIdAttribute: "data-testid",

    launchOptions: {
      args: ["--force-device-scale-factor=1"],
    },
  },

  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
