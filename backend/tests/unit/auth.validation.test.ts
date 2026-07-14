import { describe, it, expect } from 'vitest';
import { loginSchema } from '../../src/modules/auth/validations/auth.validation';

describe('Auth Validation - Zod Schemas', () => {
  describe('loginSchema', () => {
    it('should validate a correct payload', () => {
      const payload = { email: 'admin@example.com', password: 'password123' };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject an invalid email', () => {
      const payload = { email: 'not-an-email', password: 'password123' };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email');
      }
    });

    it('should reject missing fields', () => {
      const payload = { email: 'admin@example.com' };
      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
