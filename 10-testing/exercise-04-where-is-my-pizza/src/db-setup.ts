import type { DbClient } from './db-client.ts'

export async function createTables(db: DbClient): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customerName TEXT NOT NULL,
      pizzaType TEXT NOT NULL,
      status TEXT NOT NULL,
      eta INTEGER NULL
    ) STRICT
  `)
}
