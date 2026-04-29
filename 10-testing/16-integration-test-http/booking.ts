import { randomUUID } from 'node:crypto'
import type { DbClient } from './db-client.ts'

export interface Event {
  id: string
  name: string
  totalSeats: number
}

export interface Reservation {
  id: string
  eventId: string
  userId: string
}

export async function reserveSeat(
  db: DbClient,
  eventId: string,
  userId: string
) {
  const [event] = await db.query<Event[]>('SELECT * FROM events WHERE id = ?', [
    eventId,
  ])
  if (!event) {
    throw new Error('Event not found')
  }

  const [existing] = await db.query<{ count: number }[]>(
    'SELECT COUNT(*) AS count FROM reservations WHERE eventId = ?',
    [eventId]
  )

  if (existing && existing.count >= event.totalSeats) {
    throw new Error('Event is fully booked')
  }

  const reservationId = randomUUID()

  await db.query(
    'INSERT INTO reservations (id, eventId, userId) VALUES (?, ?, ?)',
    [reservationId, eventId, userId]
  )

  return reservationId
}

export async function createEvent(
  db: DbClient,
  name: string,
  totalSeats: number
) {
  const eventId = randomUUID()
  await db.query('INSERT INTO events (id, name, totalSeats) VALUES (?, ?, ?)', [
    eventId,
    name,
    totalSeats,
  ])
  return eventId
}
