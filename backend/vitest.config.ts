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
        lines: 30,
        branches: 30,
        functions: 30,
        statements: 30,
      }
    },
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
});
