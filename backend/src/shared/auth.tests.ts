import test from 'node:test';
import assert from 'node:assert';
import { hashPassword, comparePassword } from './password';
import { generateAccessToken, verifyAccessToken, decodeAccessToken } from './jwt';
import { generateRefreshToken, hashRefreshToken, verifyRefreshToken } from './refreshToken';
import { getRefreshTokenCookieOptions } from './cookie';
import { AppError } from './appError';

test('Password Utility', async (t) => {
  await t.test('should hash and verify password correctly', async () => {
    const password = 'StrongPassword123!';
    const hash = await hashPassword(password);

    assert.notStrictEqual(password, hash);

    const isValid = await comparePassword(password, hash);
    assert.strictEqual(isValid, true);

    const isInvalid = await comparePassword('WrongPassword!', hash);
    assert.strictEqual(isInvalid, false);
  });
});

test('JWT Utility', async (t) => {
  const payload = { sub: '123', role: 'ADMIN', sid: 'abc', type: 'access' as const };

  await t.test('should generate and verify valid token with standard claims', () => {
    const token = generateAccessToken(payload);
    assert.ok(token);

    const verified = verifyAccessToken(token);
    assert.strictEqual(verified.sub, payload.sub);
    assert.strictEqual(verified.role, payload.role);
    assert.strictEqual(verified.sid, payload.sid);
    assert.strictEqual(verified.type, payload.type);
    assert.ok(verified.jti);
    assert.ok(verified.iss);
    assert.ok(verified.aud);
  });

  await t.test('should decode token without verification', () => {
    const token = generateAccessToken(payload);
    const decoded = decodeAccessToken(token);
    assert.ok(decoded);
    assert.strictEqual(decoded.sub, payload.sub);
  });

  await t.test('should throw AppError on invalid token verification', () => {
    assert.throws(() => {
      verifyAccessToken('invalid.token.here');
    }, AppError);
  });
});

test('Refresh Token Utility', async (t) => {
  await t.test('should generate secure refresh token', () => {
    const token = generateRefreshToken();
    assert.ok(token.length >= 80);
  });

  await t.test('should hash refresh token consistently', () => {
    const token = 'my-secret-refresh-token';
    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);
    assert.strictEqual(hash1, hash2);
  });

  await t.test('should verify refresh token correctly (timing safe)', () => {
    const plainToken = generateRefreshToken();
    const hashed = hashRefreshToken(plainToken);

    const isValid = verifyRefreshToken(plainToken, hashed);
    assert.strictEqual(isValid, true);

    const isInvalid = verifyRefreshToken('wrong-token', hashed);
    assert.strictEqual(isInvalid, false);
  });
});

test('Cookie Utility', async (t) => {
  await t.test('should generate secure cookie options for refresh token', () => {
    const options = getRefreshTokenCookieOptions();
    assert.strictEqual(options.httpOnly, true);
    assert.strictEqual(options.path, '/api/v1/auth/refresh');
    assert.ok(options.maxAge > 0);
  });
});
