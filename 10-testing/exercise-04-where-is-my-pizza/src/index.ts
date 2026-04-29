import { randomUUID } from 'node:crypto'
import { DbClient } from './db-client.ts'
import { createTables } from './db-setup.ts'
import { PizzaTracker } from './pizza-tracker.ts'

const db = new DbClient(':memory:')

await createTables(db)

const pizzaTracker = new PizzaTracker(db)

const order = await pizzaTracker.placeOrder(randomUUID(), 'Hossam', 'Classic')
console.log('order created:', order)

await pizzaTracker.updateEta(order.id, Date.now())
console.log('order eta updated')

await pizzaTracker.markAsDelivered(order.id)
console.log('order delivered')

const orders = await pizzaTracker.getOrders()
console.log(orders)

await db.close()
