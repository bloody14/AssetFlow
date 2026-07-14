import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/helpers/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 60,
        branches: 60,
        functions: 60,
        statements: 60,
      }
    },
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
});
