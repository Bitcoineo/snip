import { createClient } from "@libsql/client";
import { readMigrationFiles } from "drizzle-orm/migrator";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const MIGRATIONS_FOLDER = "./drizzle";
const MIGRATIONS_TABLE = "__drizzle_migrations";

async function main() {
  console.log("Running migrations...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "set" : "NOT SET");
  console.log("DATABASE_AUTH_TOKEN:", process.env.DATABASE_AUTH_TOKEN ? "set" : "NOT SET");

  // Create migrations tracking table with correct SQLite DDL.
  // The built-in drizzle migrator uses "id SERIAL PRIMARY KEY" (Postgres syntax)
  // which Turso rejects with HTTP 400.
  // See: https://github.com/drizzle-team/drizzle-orm/issues/1227
  const createTableSQL = `CREATE TABLE IF NOT EXISTS \`${MIGRATIONS_TABLE}\` (\`id\` INTEGER PRIMARY KEY AUTOINCREMENT, \`hash\` TEXT NOT NULL, \`created_at\` INTEGER)`;
  console.log("[migrate] Creating migrations table...");
  console.log("[migrate] SQL:", createTableSQL);
  await client.execute(createTableSQL);
  console.log("[migrate] Migrations table ready.");

  // Check last applied migration
  const applied = await client.execute(
    `SELECT \`id\`, \`hash\`, \`created_at\` FROM \`${MIGRATIONS_TABLE}\` ORDER BY \`created_at\` DESC LIMIT 1`
  );
  const lastMigration = applied.rows[0];
  if (lastMigration) {
    console.log(`[migrate] Last applied migration: hash=${lastMigration.hash}, created_at=${lastMigration.created_at}`);
  } else {
    console.log("[migrate] No migrations applied yet.");
  }

  // Read migration files from drizzle/ folder
  const migrations = readMigrationFiles({ migrationsFolder: MIGRATIONS_FOLDER });
  console.log(`[migrate] Found ${migrations.length} migration file(s).`);

  let applied_count = 0;
  for (const migration of migrations) {
    if (
      lastMigration &&
      Number(lastMigration.created_at) >= migration.folderMillis
    ) {
      console.log(`[migrate] Skipping already-applied migration (${migration.hash.slice(0, 8)}...)`);
      continue;
    }

    // Clean up statements: trim whitespace, filter empties
    const statements = migration.sql
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`[migrate] Applying migration (${migration.hash.slice(0, 8)}...) with ${statements.length} statement(s):`);

    // Execute each statement individually for clear error isolation
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`[migrate]   [${i + 1}/${statements.length}] ${stmt.slice(0, 80)}${stmt.length > 80 ? "..." : ""}`);
      try {
        await client.execute(stmt);
      } catch (err) {
        console.error(`[migrate] FAILED on statement ${i + 1}:`);
        console.error(`[migrate] Full SQL: ${stmt}`);
        throw err;
      }
    }

    // Record the migration as applied
    await client.execute({
      sql: `INSERT INTO \`${MIGRATIONS_TABLE}\` (\`hash\`, \`created_at\`) VALUES (?, ?)`,
      args: [migration.hash, migration.folderMillis],
    });

    applied_count++;
    console.log(`[migrate] Migration applied successfully.`);
  }

  if (applied_count > 0) {
    console.log(`Applied ${applied_count} migration(s).`);
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
