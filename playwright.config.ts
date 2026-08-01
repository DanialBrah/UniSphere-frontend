import { defineConfig, devices } from '@playwright/test'

const PORT = 5174
const isCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  // `.only` left in a spec silently shrinks the suite to one test and still passes.
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['html'], ['github']] : 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    // CI tests the production bundle, not the dev server: minification, tree-shaking,
    // React's production build and `import.meta.env` inlining all differ between the
    // two, and only the built output is what actually ships.
    command: isCI
      ? `npm run build && npm run preview -- --port ${PORT} --strictPort`
      : 'npm run dev',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    // A cold `vite build` comfortably exceeds the 60s default.
    timeout: 120_000,
  },
})
