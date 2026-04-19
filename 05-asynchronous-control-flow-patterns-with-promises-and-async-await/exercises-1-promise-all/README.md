# promiseAll

Custom implementation of `Promise.all()` in TypeScript.

## What it does

Takes any iterable of values or promises and returns a single promise that:
- Resolves with an array of all resolved values (in original order)
- Rejects immediately with the reason of the first rejected promise

## Usage

```typescript
import { promiseAll } from './promise-all.ts'

const results = await promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  3, // non-promise values are wrapped automatically
])
// => [1, 2, 3]
```

Accepts any iterable — arrays, Sets, strings, generators, etc.

```typescript
const set = new Set([Promise.resolve('a'), 'b'])
await promiseAll(set) // => ['a', 'b']
```

Rejects on first failure:

```typescript
await promiseAll([
  Promise.resolve(1),
  Promise.reject(new Error('boom')),
  Promise.resolve(3),
])
// => throws Error('boom')
```

## Run tests

```bash
node --test promise-all.test.ts
```
