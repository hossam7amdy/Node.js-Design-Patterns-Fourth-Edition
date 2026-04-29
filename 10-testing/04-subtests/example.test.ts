import { test } from 'node:test'

test('Top Level Test', t => {
  t.test('SubTest 1', async () => {
    // ..
  })

  t.test('SubTest 2', _t => {
    // ..
  })
})
