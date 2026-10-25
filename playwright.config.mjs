import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.mjs",
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 2,
  use: {
    baseURL: "http://127.0.0.1:4173/ui-design-atlas/",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/serve.mjs --dist --base=/ui-design-atlas/",
    url: "http://127.0.0.1:4173/ui-design-atlas/",
    reuseExistingServer: false,
  },
  reporter: "list",
});
