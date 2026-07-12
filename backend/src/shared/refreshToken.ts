import crypto from 'crypto';

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyRefreshToken = (plainToken: string, hashedToken: string): boolean => {
  const hash = hashRefreshToken(plainToken);
  // Prevent timing attacks by comparing buffers of equal length
  const hashBuffer = Buffer.from(hash);
  const targetBuffer = Buffer.from(hashedToken);

  if (hashBuffer.length !== targetBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, targetBuffer);
};
