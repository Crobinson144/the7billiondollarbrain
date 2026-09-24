import { afterEach, describe, expect, it } from "vitest";
import { pgConfig } from "../src/db/config";

const SUPABASE = "postgresql://postgres.abcd:p%40ss@aws-0-us-east-1.pooler.supabase.com:6543/postgres";

describe("pgConfig", () => {
  afterEach(() => { delete process.env.DATABASE_CA_CERT; });

  it("connects to local databases without TLS", () => {
    expect(pgConfig("postgresql://bdb:bdb@localhost:5432/bdb").ssl).toBe(false);
    expect(pgConfig("postgresql://127.0.0.1/bdb").ssl).toBe(false);
  });

  it("encrypts remote connections and verifies only when a CA is supplied", () => {
    expect(pgConfig(SUPABASE)).toEqual({ connectionString: SUPABASE, ssl: { rejectUnauthorized: false } });
    process.env.DATABASE_CA_CERT = "-----BEGIN CERTIFICATE-----\\nabc\\n-----END CERTIFICATE-----";
    expect(pgConfig(SUPABASE).ssl).toEqual({ ca: "-----BEGIN CERTIFICATE-----\nabc\n-----END CERTIFICATE-----", rejectUnauthorized: true });
  });

  it("strips sslmode so it can't override the TLS settings", () => {
    expect(pgConfig(`${SUPABASE}?sslmode=require`).connectionString).toBe(SUPABASE);
    expect(pgConfig(`${SUPABASE}?sslmode=require&application_name=x`).connectionString).toBe(`${SUPABASE}?application_name=x`);
    expect(pgConfig(`${SUPABASE}?application_name=x&sslmode=require`).connectionString).toBe(`${SUPABASE}?application_name=x`);
  });

  it("honours sslmode=disable", () => {
    expect(pgConfig("postgresql://u:p@db.example.com/x?sslmode=disable")).toEqual({ connectionString: "postgresql://u:p@db.example.com/x", ssl: false });
  });

  it("finds the host even when the password isn't URL-encoded", () => {
    expect(pgConfig("postgresql://u:p#ss@localhost:5432/x").ssl).toBe(false);
  });
});
