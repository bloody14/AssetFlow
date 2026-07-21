import { z } from 'zod';
import dotenv from 'dotenv';
import { logger } from '../shared/logger';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET must be at least 64 bytes of entropy for HS256'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_ISSUER: z.string().default('assetflow-api'),
  JWT_AUDIENCE: z.string().default('assetflow-client'),
  JWT_KEY_ID: z.string().default('k1-2026'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  CLIENT_URL: z.string().url(),
  LOG_LEVEL: z.string().default('info'),
  APP_NAME: z.string().default('AssetFlow'),
  API_VERSION: z.string().default('v1'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error('Invalid environment variables', {
    errors: parsedEnv.error.format(),
    module: 'System',
    operation: 'Startup',
  });
  process.exit(1);
}

export const env = parsedEnv.data;
