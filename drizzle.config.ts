import type { Config } from 'drizzle-kit';

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || '';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: DATABASE_URL,
  },
  verbose: true,
  strict: true,
} as Config;
