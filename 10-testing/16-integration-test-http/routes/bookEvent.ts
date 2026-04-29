import type { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { reserveSeat } from '../booking.ts'
import type { DbClient } from '../db-client.ts'

const options: RouteShorthandOptions = {
  schema: {
    params: {
      type: 'object',
      required: ['eventId'],
      properties: {
        eventId: { type: 'string' },
      },
    },
    body: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' },
      },
    },
  },
}

export function bookEventRoute(fastify: FastifyInstance) {
  fastify.post<{
    Body: { userId: string }
    Params: { eventId: string }
  }>('/events/:eventId/reservations', options, async (request, reply) => {
    const { eventId } = request.params
    const { userId } = request.body
    const db = fastify.getDecorator<DbClient>('db')

    try {
      const reservationId = await reserveSeat(db, eventId, userId)
      return reply.status(201).send({ success: true, reservationId })
    } catch (e) {
      const err = e as Error
      if (err.message === 'Event not found') {
        return reply.status(404).send({ error: 'Event not found' })
      }

      if (err.message === 'Event is fully booked') {
        return reply.status(403).send({ error: 'Event is fully booked' })
      }

      fastify.log.error(err)
      return reply.status(500).send({ error: 'Server error' })
    }
  })
}
