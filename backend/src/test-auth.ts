import app from './app';
import { prisma } from './config/prisma';
import { hashPassword } from './shared/password';
import { HTTP_STATUS } from './constants/httpStatus';

const PORT = 3000;

async function runTests() {
  const server = app.listen(PORT);
  console.log(`Test server running on port ${PORT}`);

  try {
    // 1. Setup Test User
    await prisma.session.deleteMany();
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    const hashedPassword = await hashPassword('password123');
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: hashedPassword,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      },
    });

    console.log('--- EXECUTING AUTHENTICATION SCENARIOS ---');

    // SCENARIO 1: Valid Login
    let res = await fetch(`http://localhost:${PORT}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    let data = await res.json();
    console.log('1. Valid Login:', res.status === HTTP_STATUS.OK ? 'PASS' : `FAIL (${res.status})`);
    const cookies = res.headers.get('set-cookie');
    const refreshTokenCookie = cookies ? cookies.split(';')[0] : '';
    const accessToken = data.data.accessToken;

    // SCENARIO 2: Invalid Credentials
    res = await fetch(`http://localhost:${PORT}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    });
    console.log(
      '2. Invalid Credentials:',
      res.status === HTTP_STATUS.UNAUTHORIZED ? 'PASS' : `FAIL (${res.status})`
    );

    // SCENARIO 3: Missing Credentials
    res = await fetch(`http://localhost:${PORT}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    console.log(
      '3. Missing Credentials (Validation):',
      res.status === HTTP_STATUS.BAD_REQUEST ? 'PASS' : `FAIL (${res.status})`
    );

    // SCENARIO 4: Valid Token to /me
    res = await fetch(`http://localhost:${PORT}/api/v1/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(
      '4. Valid Access Token (/me):',
      res.status === HTTP_STATUS.OK ? 'PASS' : `FAIL (${res.status})`
    );

    // SCENARIO 5: Invalid/Missing Access Token to /me
    res = await fetch(`http://localhost:${PORT}/api/v1/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer invalid_token` },
    });
    console.log(
      '5. Invalid Access Token:',
      res.status === HTTP_STATUS.UNAUTHORIZED ? 'PASS' : `FAIL (${res.status})`
    );

    // SCENARIO 6: Refresh Token Flow
    res = await fetch(`http://localhost:${PORT}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: refreshTokenCookie },
    });
    data = await res.json();
    console.log(
      '6. Refresh Token Flow:',
      res.status === HTTP_STATUS.OK ? 'PASS' : `FAIL (${res.status})`
    );
    const newAccessToken = data.data?.accessToken;
    const newCookies = res.headers.get('set-cookie');
    const newRefreshTokenCookie = newCookies ? newCookies.split(';')[0] : '';

    // SCENARIO 7: Logout
    res = await fetch(`http://localhost:${PORT}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newAccessToken}`, Cookie: newRefreshTokenCookie },
    });
    console.log('7. Logout:', res.status === HTTP_STATUS.OK ? 'PASS' : `FAIL (${res.status})`);

    // SCENARIO 8: Try refreshing logged out session
    res = await fetch(`http://localhost:${PORT}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: newRefreshTokenCookie },
    });
    console.log(
      '8. Reused Revoked Refresh Token (Replay Attack check):',
      res.status === HTTP_STATUS.UNAUTHORIZED ? 'PASS' : `FAIL (${res.status})`
    );

    // Cleanup
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  } catch (error) {
    console.error('Test failed', error);
  } finally {
    server.close();
    await prisma.$disconnect();
    console.log('Tests finished.');
  }
}

runTests();
