import { describe, it, expect } from 'vitest';
import { generateRefreshToken, hashRefreshToken, verifyRefreshToken } from '../../src/shared/refreshToken';

describe('Refresh Token Utility', () => {
  it('should generate a 40 byte hex string', () => {
    const token = generateRefreshToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(80); // 40 bytes = 80 hex chars
  });

  it('should hash consistently and verify', () => {
    const token = 'my-super-secret-refresh-token';
    const hash = hashRefreshToken(token);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(token);
    
    const isValid = verifyRefreshToken(token, hash);
    expect(isValid).toBe(true);
  });

  it('should fail verification for incorrect token', () => {
    const token = 'correct-token';
    const hash = hashRefreshToken(token);
    
    const isValid = verifyRefreshToken('wrong-token', hash);
    expect(isValid).toBe(false);
  });
});
