export type Err = { success: false, error: string }
export type Ok<T> = { success: true, data: T }

export type Result<T> = Ok<T> | Err

export function Err(message: string): Err {
  return {
    success: false,
    error: message
  }
}

export function Ok<T>(data: T): Ok<T> {
  return {
    success: true,
    data
  }
}

export function getOrThrow<T>(result: Result<T>): T {
  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data
}


export function exponentialBackoff<T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = (retryCount: number) => {
      fn()
        .then(resolve)
        .catch((error) => {
          if (retryCount <= 0) {
            reject(error);
          } else {
            setTimeout(() => {
              attempt(retryCount - 1);
            }, delay * Math.pow(2, retries - retryCount));
          }
        });
    };

    attempt(retries);
  });
}