import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    env: {
      NEXT_PUBLIC_CODEPREVIEW_ORIGIN: "https://codepreview.example.com",
    },
    setupFiles: ["./src/test/setup.ts"],
    exclude: [...configDefaults.exclude, "playwright/**", "**/.claude/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/shared/components/ui/**",
        "src/shared/lib/auth0.ts",
        "src/shared/lib/api-client.ts",
        "src/shared/lib/react-query.tsx",
        "src/shared/lib/app-insights.tsx",
        "src/shared/lib/signalr/**",
        "src/app/layout.tsx",
        "src/app/opengraph-image.tsx",
        "src/app/twitter-image.tsx",
        "proxy.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
