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

export const trace = <T>(val: T) => {
  console.log(val)
  return val
}