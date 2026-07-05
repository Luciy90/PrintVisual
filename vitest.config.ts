import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: ["default", "json", "junit"],
    outputFile: {
      json: "./reports/tests/results.json",
      junit: "./reports/tests/junit.xml"
    },
    coverage: {
      provider: "v8",
      reportsDirectory: "./reports/coverage",
      reporter: ["text", "json-summary"],
      include: [
        "src/schemas.ts",
        "src/services/address.ts",
        "src/services/printerService.ts",
        "src/services/networkScanner.ts"
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      }
    }
  }
});
