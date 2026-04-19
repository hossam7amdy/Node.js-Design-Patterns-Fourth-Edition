import { createApp } from './app.ts'
import { DbClient } from './db-client.ts'
import { createTables } from './db-setup.ts'

const db = new DbClient('data/db.sqlite')
await createTables(db)

const app = await createApp(db)
app.listen({ port: 3000 })
