// config/env.ts — Validação de variáveis de ambiente no boot

const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_EXPIRES_IN', 'ROOT_ADMIN_TOKEN'] as const;

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[env] Variáveis faltando: ${missing.join(', ')}`);
  process.exit(1);
}

export const env = {
  NODE_ENV:        process.env.NODE_ENV || 'development',
  PORT:            parseInt(process.env.PORT ?? '4000', 10),
  DATABASE_URL:    process.env.DATABASE_URL!,
  JWT_SECRET:      process.env.JWT_SECRET!,
  JWT_EXPIRES_IN:  process.env.JWT_EXPIRES_IN!,
  ROOT_ADMIN_TOKEN:process.env.ROOT_ADMIN_TOKEN!,
  CRON_TIMEZONE:   process.env.CRON_TIMEZONE || 'America/Sao_Paulo',
  BOT_INTERNAL_URL:process.env.BOT_INTERNAL_URL || 'http://bot:3001',
};
