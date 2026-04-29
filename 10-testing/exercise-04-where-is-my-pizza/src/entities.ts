export interface Order {
  id: string
  customerName: string
  pizzaType: string
  status: 'pending' | 'delivered'
  eta: number | null
}
