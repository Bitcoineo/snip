import { createClient } from "@libsql/client";
import { readMigrationFiles } from "drizzle-orm/migrator";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const migrationsFolder = "./drizzle";
const migrationsTable = "__drizzle_migrations";

async function main() {
  console.log("Running migrations...");

  const migrations = readMigrationFiles({ migrationsFolder });

  // Create migrations table with correct SQLite DDL.
  // The built-in drizzle migrator uses SERIAL PRIMARY KEY (Postgres syntax)
  // which Turso rejects with HTTP 400.
  // See: https://github.com/drizzle-team/drizzle-orm/issues/1227
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "${migrationsTable}" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at NUMERIC
    )
  `);

  const applied = await client.execute(
    `SELECT id, hash, created_at FROM "${migrationsTable}" ORDER BY created_at DESC LIMIT 1`
  );
  const lastMigration = applied.rows[0];

  let pending = 0;
  for (const migration of migrations) {
    if (
      !lastMigration ||
      Number(lastMigration.created_at) < migration.folderMillis
    ) {
      // Run all statements for this migration in a batch (transactional)
      const statements = migration.sql.map((stmt) => stmt);
      statements.push(
        `INSERT INTO "${migrationsTable}" ("hash", "created_at") VALUES('${migration.hash}', ${migration.folderMillis})`
      );
      await client.batch(statements, "write");
      pending++;
    }
  }

  if (pending > 0) {
    console.log(`Applied ${pending} migration(s).`);
  } else {
    console.log("No pending migrations.");
  }

  console.log("Migrations complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
