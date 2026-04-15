export interface Basket {
  items: {
    name: string
    unitPrice: number
    quantity: number
  }[]
}

export function calculateBasketTotal(basket: Basket): number {
  return basket.items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  )
}
