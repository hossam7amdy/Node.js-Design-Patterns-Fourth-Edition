import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'
import { DbClient } from './db-client.ts'
import { createTables } from './db-setup.ts'
import type { Order } from './entities.ts'
import { PizzaTracker } from './pizza-tracker.ts'

describe('PizzaTracker', () => {
  let db: DbClient

  beforeEach(async () => {
    db = new DbClient(':memory:')
    await createTables(db)
  })

  afterEach(async () => {
    await db.close()
  })

  it('Should place new orders', async () => {
    const expected: Order[] = []
    const tracker = new PizzaTracker(db)
    expected.push(await tracker.placeOrder('order1', 'Hossam', 'Classic'))
    expected.push(await tracker.placeOrder('order2', 'Hamdy', 'Cheese'))
    expected.push(await tracker.placeOrder('order3', 'Ahmed', 'Meat'))

    const orders = await tracker.getOrders()

    assert.deepEqual(orders, expected)
  })

  it('Should verify that `placeOrder` correctly inserts data into the database', async () => {
    const expected: Order[] = []
    const tracker = new PizzaTracker(db)
    expected.push(await tracker.placeOrder('order1', 'Hossam', 'Classic'))
    expected.push(await tracker.placeOrder('order2', 'Hamdy', 'Cheese'))

    const orders = await tracker.getOrders()

    assert.deepEqual(orders, expected)
  })

  it('Should Verify that `updateEta` successfully modifies the ETA of an existing order', async () => {
    const tracker = new PizzaTracker(db)
    const order = await tracker.placeOrder('order1', 'Hossam', 'Classic')
    const orderEta = Date.now() + 1000
    order.eta = orderEta
    await tracker.updateEta(order.id, orderEta)

    const orders = await tracker.getOrders()

    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0], order)
  })

  it("Should verify that `markAsDelivered` successfully changes an order's status.", async () => {
    const tracker = new PizzaTracker(db)
    const order = await tracker.placeOrder('order1', 'Hossam', 'Classic')
    order.status = 'delivered'
    await tracker.markAsDelivered(order.id)

    const orders = await tracker.getOrders()

    assert.equal(orders.length, 1)
    assert.deepEqual(orders[0], order)
  })
})
