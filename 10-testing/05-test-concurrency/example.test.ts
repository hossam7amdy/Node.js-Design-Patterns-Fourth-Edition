import { test } from 'node:test'
import { setTimeout } from 'node:timers'
import { setTimeout as delay } from 'node:timers/promises'

test('Top Level Test', { concurrency: true }, t => {
  t.test('SubTest 1', async () => {
    await delay(1000)
  })

  t.test('SubTest 2', (_t, done) => {
    setTimeout(done, 1000)
  })
})
