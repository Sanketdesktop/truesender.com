import { Pool } from "pg";

let pool;
let migrated = false;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS domains (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  ingest_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain)
);
CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  org_name TEXT,
  report_id TEXT,
  date_begin TIMESTAMPTZ,
  date_end TIMESTAMPTZ,
  policy_published JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(domain_id, org_name, report_id)
);
CREATE TABLE IF NOT EXISTS report_records (
  id BIGSERIAL PRIMARY KEY,
  report_pk BIGINT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  source_ip TEXT NOT NULL,
  source_name TEXT,
  msg_count INT NOT NULL DEFAULT 1,
  disposition TEXT,
  eval_spf TEXT,
  eval_dkim TEXT,
  header_from TEXT,
  date_begin TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_records_domain_date ON report_records(domain_id, date_begin);
CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS dns_snapshots (
  id BIGSERIAL PRIMARY KEY,
  domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  value TEXT,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(domain_id, kind)
);
CREATE TABLE IF NOT EXISTS alerts_sent (
  id BIGSERIAL PRIMARY KEY,
  domain_id BIGINT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  detail TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export async function query(text, params) {
  const p = getPool();
  if (!migrated) {
    migrated = true;
    await p.query(SCHEMA);
  }
  return p.query(text, params);
}
