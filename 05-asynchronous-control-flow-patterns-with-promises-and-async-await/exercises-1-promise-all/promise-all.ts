function isNotIterable(obj: unknown): boolean {
  // biome-ignore lint/suspicious/noExplicitAny: accepts any random type
  return !obj || typeof (obj as any)[Symbol.iterator] !== 'function'
}

export function promiseAll<T>(
  promises: Iterable<T | PromiseLike<T>>
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if (isNotIterable(promises)) {
      return reject(new TypeError(`object ${promises} is not iterable`))
    }

    let count = 0
    const results: T[] = []
    const promisesArr = Array.from(promises)

    if (promisesArr.length === 0) {
      return resolve(results)
    }

    for (let i = 0; i < promisesArr.length; i++) {
      Promise.resolve(promisesArr[i]).then(
        r => {
          count++
          results[i] = r as T
          if (count === promisesArr.length) {
            resolve(results)
          }
        },
        e => {
          reject(e)
        }
      )
    }
  })
}
