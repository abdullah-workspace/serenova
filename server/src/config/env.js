import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().url().default('mongodb://localhost:27017/serenova'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32).default('development-secret-change-me-please-32'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
  REFRESH_TTL_REMEMBER_DAYS: z.coerce.number().int().positive().default(30),
  MAX_FAILED_LOGINS: z.coerce.number().int().positive().default(5),
  LOCK_MINUTES: z.coerce.number().int().positive().default(15),
  BCRYPT_COST: z.coerce.number().int().min(4).max(31).default(12),
  RESET_TOKEN_MINUTES: z.coerce.number().int().positive().default(60),
  SEED_DEMO_PASSWORD: z.string().min(8).default('DemoPassword123!'),
  AUTH_COOKIE_SECURE: z.string().default('false').transform((value) => value === 'true'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  CLINIC_TIMEZONE: z.string().default('Asia/Karachi'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  BOOKING_MAX_DAYS_AHEAD: z.coerce.number().int().positive().default(60),
  MIN_NOTICE_HOURS: z.coerce.number().nonnegative().default(2),
  CANCEL_CUTOFF_HOURS: z.coerce.number().nonnegative().default(2),
  CLINIC_NAME: z.string().default('Serenova Clinic'),
  CLINIC_EMAIL: z.string().email().default('hello@serenova.example'),
  EMAIL_FROM: z.string().default('Serenova Clinic <hello@serenova.example>')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

if (env.NODE_ENV === 'production' &&
    (env.JWT_SECRET.length < 32 || env.JWT_SECRET === 'development-secret-change-me-please-32' || env.JWT_SECRET === 'change-me')) {
  throw new Error('JWT_SECRET must be a strong, unique value of at least 32 characters in production');
}
