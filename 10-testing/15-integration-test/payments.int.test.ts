import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { DbClient } from "./db-client.ts";
import { createTables } from "./db-setup.ts";
import {
  canPayWithVouchers,
  getActiveVouchers,
  type Voucher,
} from "./payments.ts";

function addTestUser(db: DbClient, id: string, name: string): Promise<void> {
  return db.query(
    `INSERT INTO users (id, name)
       VALUES (?, ?)`,
    [id, name],
  );
}

async function addTestVoucher(
  db: DbClient,
  id: string,
  userId: string,
  balance: number,
  expiresAt?: string,
): Promise<Voucher> {
  const record = {
    id,
    userId,
    balance,
    expiresAt: expiresAt ?? new Date(Date.now() + 1000).toISOString(),
  };
  await db.query(
    `INSERT INTO vouchers (id, userId, balance, expiresAt)
        VALUES (?, ?, ?, ?)`,
    [record.id, record.userId, record.balance, record.expiresAt],
  );
  return record;
}

suite("activeVouchers", { concurrency: true, timeout: 500 }, () => {
  test("queries for active vouchers", async () => {
    const expected: Voucher[] = [];
    const db = new DbClient(":memory:");
    await createTables(db);
    await addTestUser(db, "user1", "Test User 1");
    await addTestUser(db, "user2", "Test User 2");
    expected.push(await addTestVoucher(db, "voucher1", "user1", 10));
    expected.push(await addTestVoucher(db, "voucher2", "user1", 5));
    expected.push(await addTestVoucher(db, "voucher3", "user1", 3));
    // expired
    await addTestVoucher(
      db,
      "voucher4",
      "user1",
      10,
      new Date(Date.now() - 1000).toISOString(),
    );
    // different user
    await addTestVoucher(db, "voucher5", "user2", 10);
    // zero balance
    await addTestVoucher(db, "voucher6", "user1", 0);

    const activeVouchers = await getActiveVouchers(db, "user1");

    db.close();
    assert.deepEqual(activeVouchers, expected);
  });
});

suite("canPayWithVouchers", { concurrency: true, timeout: 500 }, () => {
  test("Returns true if balance is enough", async () => {
    const db = new DbClient(":memory:");
    await createTables(db);
    await addTestUser(db, "user1", "Test User 1");
    await addTestVoucher(db, "voucher1", "user1", 10);
    await addTestVoucher(db, "voucher2", "user1", 5);
    await addTestVoucher(db, "voucher3", "user1", 3);

    const result = await canPayWithVouchers(db, "user1", 18);

    db.close();
    assert.equal(result, true);
  });

  test("Returns false if balance is not enough", async () => {
    const db = new DbClient(":memory:");
    await createTables(db);
    await addTestUser(db, "user1", "Test User 1");
    await addTestVoucher(db, "voucher1", "user1", 10);
    await addTestVoucher(db, "voucher2", "user1", 5);
    await addTestVoucher(db, "voucher3", "user1", 3);

    const result = await canPayWithVouchers(db, "user1", 19);

    db.close();
    assert.equal(result, false);
  });
});
