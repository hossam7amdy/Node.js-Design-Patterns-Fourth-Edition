import Fastify, { type FastifyInstance } from 'fastify'
import type { DbClient } from './db-client.ts'
import { bookEventRoute } from './routes/bookEvent.ts'
import { createEventRoute } from './routes/createEvent.ts'

export async function createApp(db: DbClient): Promise<FastifyInstance> {
  const app = Fastify()
  app.register(bookEventRoute)
  app.register(createEventRoute)
  app.decorate('db', db)
  return app
}
