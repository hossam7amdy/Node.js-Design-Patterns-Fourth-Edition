import { DatabaseSync, type SupportedValueType } from 'node:sqlite'

export class DbClient {
  #db: DatabaseSync | null
  #dbPath: string

  constructor(dbPath: string) {
    this.#dbPath = dbPath
    this.#db = null
  }

  async #connect(): Promise<DatabaseSync> {
    return new Promise(resolve => {
      if (this.#db) {
        resolve(this.#db)
      } else {
        this.#db = new DatabaseSync(this.#dbPath)
        resolve(this.#db)
      }
    })
  }

  async exec(
    sql: string,
    params: SupportedValueType[] = []
  ): Promise<{ changes: number }> {
    const db = await this.#connect()
    const statement = db.prepare(sql)
    const result = statement.run(...params)
    return result as { changes: number }
  }

  async query<T>(sql: string, params: SupportedValueType[] = []): Promise<T> {
    const db = await this.#connect()
    const statement = db.prepare(sql)
    const result = statement.all(...params)
    return structuredClone(result) as T
  }

  async close(): Promise<void> {
    return new Promise(resolve => {
      this.#db?.close()
      this.#db = null
      resolve()
    })
  }
}
