import { dirname, join } from 'node:path'
import fastifyFormbody from '@fastify/formbody'
import fastifyView from '@fastify/view'
import ejs from 'ejs'
import Fastify, { type FastifyInstance } from 'fastify'

const __dirname = dirname(import.meta.dirname)

interface SubscribeBody {
  email: string
}

export function buildApp(opts = {}): FastifyInstance {
  const app = Fastify(opts)

  app.register(fastifyFormbody)
  app.register(fastifyView, {
    engine: { ejs },
    root: join(__dirname, 'templates'),
  })

  app.get('/', (_request, reply) => {
    return reply.view('index.ejs')
  })

  app.get('/subscribe', (_request, reply) => {
    return reply.view('subscribe.ejs')
  })

  app.post<{ Body: SubscribeBody }>('/subscribe', (request, reply) => {
    const { email } = request.body
    return reply.view('confirmation.ejs', { email })
  })

  return app
}

// Start the server when run directly
const app = buildApp({ logger: true })

try {
  await app.listen({ port: 3000 })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
