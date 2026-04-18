import { DatabaseSync, type SupportedValueType } from "node:sqlite";
import { setImmediate } from "node:timers/promises";

export class DbClient {
  #db: DatabaseSync | null;
  #dbPath: string;

  constructor(dbPath: string) {
    this.#dbPath = dbPath;
    this.#db = null;
  }

  async #connect(): Promise<DatabaseSync> {
    await setImmediate();
    if (this.#db) {
      return this.#db;
    }
    this.#db = new DatabaseSync(this.#dbPath);
    return this.#db;
  }

  async query<T>(sql: string, params: SupportedValueType[] = []): Promise<T> {
    const db = await this.#connect();
    const result = db.prepare(sql).all(...params);
    return structuredClone(result) as T;
  }

  async close(): Promise<void> {
    await setImmediate();
    this.#db?.close();
    this.#db = null;
  }
}
