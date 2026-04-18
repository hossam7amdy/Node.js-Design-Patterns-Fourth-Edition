import type { DbClient } from "./db-client.ts";

export interface Voucher {
  id: string;
  userId: string;
  balance: number;
  expiresAt: string;
}

export async function getActiveVouchers(
  db: DbClient,
  userId: string,
): Promise<Voucher[]> {
  const vouchers = await db.query<Voucher[]>(
    `SELECT * FROM vouchers 
       WHERE userId = ? AND 
       balance > 0 AND
       expiresAt > strftime('%FT%T:%fZ', 'now')`,
    [userId],
  );

  return vouchers;
}

export async function canPayWithVouchers(
  db: DbClient,
  userId: string,
  amount: number,
): Promise<boolean> {
  const vouchers = await getActiveVouchers(db, userId);
  const availableBalance = vouchers.reduce((acc, v) => acc + v.balance, 0);

  return availableBalance >= amount;
}
