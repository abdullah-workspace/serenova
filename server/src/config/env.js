import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().url().default('mongodb://localhost:27017/serenova'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(1).default('change-me'),
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
