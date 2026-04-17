export class DbClient {
  async query<T>(sql: string, params: unknown[]): Promise<T> {
    throw new Error("Not implemented");
  }
}
