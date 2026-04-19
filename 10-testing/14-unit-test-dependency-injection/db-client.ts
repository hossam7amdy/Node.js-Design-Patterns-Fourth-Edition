export class DbClient {
  async query<T>(_sql: string, _params: unknown[]): Promise<T> {
    throw new Error('Not implemented')
  }
}
