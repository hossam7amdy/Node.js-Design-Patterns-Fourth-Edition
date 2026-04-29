import type { DbClient } from './db-client.ts'
import type { Order } from './entities.ts'

export class PizzaTracker {
  #db: DbClient
  constructor(db: DbClient) {
    this.#db = db
  }

  async placeOrder(
    id: string,
    customerName: string,
    pizzaType: string
  ): Promise<Order> {
    const order: Order = {
      id,
      customerName,
      pizzaType,
      status: 'pending',
      eta: null,
    }

    await this.#db.exec(
      'INSERT INTO orders (id, customerName, pizzaType, status) VALUES (?, ?, ?, ?)',
      [id, customerName, pizzaType, order.status]
    )

    return order
  }

  getOrders(): Promise<Order[]> {
    return this.#db.query<Order[]>('SELECT * FROM orders')
  }

  async markAsDelivered(id: string): Promise<void> {
    const status: Order['status'] = 'delivered'

    const result = await this.#db.exec(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    )

    if (result.changes === 0) {
      throw new Error(`Order with id "${id}" is not found`)
    }
  }

  async updateEta(id: string, eta: number): Promise<void> {
    const result = await this.#db.exec(
      'UPDATE orders SET eta = ? WHERE id = ?',
      [eta, id]
    )

    if (result.changes === 0) {
      throw new Error(`Order with id "${id}" is not found`)
    }
  }
}
