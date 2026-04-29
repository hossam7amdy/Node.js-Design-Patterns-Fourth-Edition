import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { slugify } from './slugify.ts'

describe('slugify', { concurrency: true }, () => {
  const testCases = [
    {
      input: 'Hello World!',
      expectedOutput: 'hello-world',
      description: 'should convert all characters into lower case letters',
    },
    {
      input: 'Hello (#@!$%^&*) World!',
      expectedOutput: 'hello-world',
      description: 'should remove any special characters',
    },
    {
      input: '  Hello -- World  ',
      expectedOutput: 'hello-world',
      description: 'should remove any special characters',
    },
    {
      input: 'مرحبا بك فى عالمنا',
      expectedOutput: 'مرحبا-بك-فى-عالمنا',
      description: 'should work with non-latin characters',
    },
    {
      input: 'سماعات 🎧 بلوتوث (جديدة)   ',
      expectedOutput: 'سماعات-بلوتوث-جديدة',
      description: 'should work with mixing non-latin and emoji characters',
    },
  ]

  for (const c of testCases) {
    it(c.description, () => {
      const output = slugify(c.input)
      assert.equal(output, c.expectedOutput)
    })
  }
})
