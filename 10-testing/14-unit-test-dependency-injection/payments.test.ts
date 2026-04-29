import assert from 'node:assert/strict'
import { mock, suite, test } from 'node:test'
import { setImmediate } from 'node:timers/promises'
import type { DbClient } from './db-client.ts'
import { type Voucher, canPayWithVouchers } from './payments.ts'

const sampleVouchers: Voucher[] = [
  {
    id: 1,
    userId: 'user1',
    balance: 10,
    expiresAt: new Date(Date.now() + 1000),
  },
  {
    id: 2,
    userId: 'user1',
    balance: 5,
    expiresAt: new Date(Date.now() + 1000),
  },
  {
    id: 3,
    userId: 'user1',
    balance: 3,
    expiresAt: new Date(Date.now() + 1000),
  },
]

const createMockedDb = () => {
  return {
    query: mock.fn(async (_sql: string, _args: unknown[]) => {
      await setImmediate()
      return sampleVouchers
    }),
  }
}

suite('canPayWithVouchers', { concurrency: true, timeout: 500 }, () => {
  test('Returns true if balance is enough', async () => {
    const mockDb = createMockedDb()

    const result = await canPayWithVouchers(mockDb as DbClient, 'user1', 18)

    assert.equal(result, true)
    assert.equal(mockDb.query.mock.callCount(), 1)
  })

  test('Returns false if balance is not enough', async () => {
    const mockDb = createMockedDb()

    const result = await canPayWithVouchers(mockDb as DbClient, 'user1', 19)

    assert.equal(result, false)
    assert.equal(mockDb.query.mock.callCount(), 1)
  })
})
