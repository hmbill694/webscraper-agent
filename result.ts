export type Err = { success: false, error: string }
export type Ok<T> = { success: true, data: T }
export type ResultType<T> = Ok<T> | Err

export class Result<T> {
  private result: ResultType<T>

  private constructor(result: ResultType<T>) {
    this.result = result
  }

  static Err(message: string): Result<never> {
    return new Result({
      success: false,
      error: message
    })
  }

  static Ok<T>(data: T): Result<T> {
    return new Result({
      success: true,
      data
    })
  }

  static async fromAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
      const res = await fn()
      return this.Ok(res)
    } catch (e: unknown) {
      return this.Err(`${e}`)
    }
  }

  map<U>(fn: (data: T) => U): Result<U> {
    if (this.result.success) {
      return Result.Ok(fn(this.result.data))
    } else {
      return Result.Err(this.result.error)
    }
  }

  flatMap<U>(fn: (data: T) => Result<U>): Result<U> {
    if (this.result.success) {
      return fn(this.result.data)
    } else {
      return Result.Err(this.result.error)
    }
  }

  getOrThrow(): T {
    if (!this.result.success) {
      throw new Error(this.result.error)
    }

    return this.result.data
  }
}
