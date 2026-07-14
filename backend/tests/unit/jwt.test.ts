import { describe, it, expect } from 'vitest';
import { generateAccessToken, verifyAccessToken } from '../../src/shared/jwt';
import { env } from '../../src/config/env';

describe('JWT Utility', () => {
  it('should generate and verify an access token successfully', () => {
    const payload = { sub: '123', role: 'ADMIN', sid: 'session1', type: 'access' as const };
    const token = generateAccessToken(payload);
    
    expect(token).toBeDefined();
    
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.sid).toBe(payload.sid);
    expect(decoded.type).toBe(payload.type);
    expect(decoded.iss).toBe(env.JWT_ISSUER);
    expect(decoded.aud).toBe(env.JWT_AUDIENCE);
  });

  it('should throw error on invalid token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });
});
