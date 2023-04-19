const DEFAULT_RETRIES = 20;
const DEFAULT_INTERVAL = 1000;
const DEFAULT_ALGORITHM = 'linearRetry';

/**
 * Retries an action that returns a promise
 * @param {Function} func is called until the number of retries is reached or it succeeds
 * @param {Object} options retries, interval, alg
 */
async function retry(
  func,
  {
    retries = DEFAULT_RETRIES,
    interval = DEFAULT_INTERVAL,
    algorithm = DEFAULT_ALGORITHM,
  } = {},
) {
  let lastErr;
  const start = Date.now();
  let currentRetry = 0;
  while (currentRetry < retries) {
    currentRetry += 1;
    /* eslint-disable no-await-in-loop */
    try {
      return await func(currentRetry);
    } catch (e) {
      let sleep;
      if (algorithm === 'exponentialBackOff') {
        sleep = currentRetry * interval;
      } else if (algorithm === 'linearRetry') {
        sleep = interval;
      }
      // Left for debugging purposes
      // console.log(
      //   new Date().toISOString(),
      //   `Retry using ${algorithm}. Retry count: ${currentRetry}`
      // );
      if (currentRetry === retries) lastErr = e;
      // wait for a bit before retrying...
      await new Promise((accept) => setTimeout(accept, sleep));
    }
  }
  /* eslint-enable no-await-in-loop */

  console.error(`Failed to resolve promise after ${retries} attempts over ${Date.now()
    - start} ms`);
  throw lastErr;
}
module.exports = retry;
