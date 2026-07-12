"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(5000),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(64, 'JWT_SECRET must be at least 64 bytes of entropy for HS256'),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_ISSUER: zod_1.z.string().default('assetflow-api'),
    JWT_AUDIENCE: zod_1.z.string().default('assetflow-client'),
    JWT_KEY_ID: zod_1.z.string().default('k1-2026'),
    BCRYPT_SALT_ROUNDS: zod_1.z.coerce.number().default(12),
    CLIENT_URL: zod_1.z.string().url(),
    LOG_LEVEL: zod_1.z.string().default('info'),
    APP_NAME: zod_1.z.string().default('AssetFlow'),
    API_VERSION: zod_1.z.string().default('v1'),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format());
    process.exit(1);
}
exports.env = parsedEnv.data;
