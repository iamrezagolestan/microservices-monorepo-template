import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:3000",
    ...devices["Desktop Chrome"],
    channel: "chrome",
  },
});
