import { EventEmitter } from 'node:events'

type Task<T = unknown> = () => Promise<T>

export class TaskQueue extends EventEmitter {
  #concurrency: number
  #running: number
  #queue: Task[]

  constructor(concurrency: number) {
    super()
    this.#concurrency = concurrency
    this.#running = 0
    this.#queue = []
  }

  pushTask(task: Task): this {
    this.#queue.push(task)
    process.nextTick(this.next.bind(this))
    return this
  }

  next(): void {
    if (this.#running === 0 && this.#queue.length === 0) {
      this.emit('empty')
      return
    }

    while (this.#running < this.#concurrency && this.#queue.length > 0) {
      this.#running++
      const task = this.#queue.shift()

      task?.()
        .catch(e => {
          this.emit('taskError', e)
        })
        .finally(() => {
          this.#running--
          this.next()
        })
    }
  }

  stats(): { running: number; scheduled: number } {
    return {
      running: this.#running,
      scheduled: this.#queue.length,
    }
  }
}
