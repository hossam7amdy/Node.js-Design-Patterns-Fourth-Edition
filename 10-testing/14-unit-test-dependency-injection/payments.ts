import type { DbClient } from './db-client.ts'

export interface Voucher {
  id: number
  userId: string
  balance: number
  expiresAt: Date
}

export async function canPayWithVouchers(
  db: DbClient,
  userId: string,
  amount: number
): Promise<boolean> {
  const vouchers = await db.query<Voucher[]>(
    `SELECT * FROM vouchers
      WHERE userId = ? AND 
            balance > 0 AND
            expiresAt > NOW()
    `,
    [userId]
  )
  const availableBalance = vouchers.reduce((acc, v) => acc + v.balance, 0)
  return availableBalance >= amount
}
