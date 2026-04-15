export interface Basket {
  items: {
    name: string
    unitPrice: number
    quantity: number
  }[]
}

export function calculateBasketTotal(basket: Basket): number {
  let total = 0
  for (const item of basket.items) {
    total += item.unitPrice * item.quantity
  }
  return total
}
