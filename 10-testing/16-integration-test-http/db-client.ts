import { DatabaseSync } from 'node:sqlite'
import type { SQLInputValue } from 'node:sqlite'
import { setImmediate } from 'node:timers/promises'

export class DbClient {
  #dbPath: string
  #db: DatabaseSync | null

  constructor(dbPath: string) {
    this.#db = null
    this.#dbPath = dbPath
  }

  async #connect(): Promise<DatabaseSync> {
    await setImmediate()
    if (this.#db) {
      return this.#db
    }
    this.#db = new DatabaseSync(this.#dbPath)
    return this.#db
  }

  async query<T>(sql: string, params: SQLInputValue[] = []): Promise<T> {
    const db = await this.#connect()
    const statement = db.prepare(sql)
    const result = statement.all(...params)
    return structuredClone(result) as T
  }

  async close(): Promise<void> {
    await setImmediate()
    this.#db?.close()
    this.#db = null
  }
}
