import { vi } from 'vitest';

vi.mock('../../src/config/prisma', () => {
  const { mockDeep } = require('vitest-mock-extended');
  return {
    default: mockDeep(),
  };
});
