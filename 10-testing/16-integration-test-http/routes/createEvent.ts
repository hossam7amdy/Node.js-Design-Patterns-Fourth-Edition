import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { createEvent } from '../booking.ts'
import type { DbClient } from '../db-client.ts'

const options: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'totalSeats'],
      properties: {
        name: { type: 'string' },
        totalSeats: { type: 'integer' },
      },
    },
  },
}

export function createEventRoute(fastify: FastifyInstance) {
  fastify.post<{
    Body: { name: string; totalSeats: number }
  }>('/events', options, async (request, reply) => {
    const { name, totalSeats } = request.body
    const db = fastify.getDecorator<DbClient>('db')
    const eventId = await createEvent(db, name, totalSeats)
    return reply.status(201).send({ success: true, eventId })
  })
}
