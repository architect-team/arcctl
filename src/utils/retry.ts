export const simpleRetry = async (func: Function, max_intervals = 60): Promise<any> => {
  const interval = 1000;
  let current_intervals = 0;
  while (current_intervals < max_intervals) {
    try {
      await new Promise((f) => setTimeout(f, interval));
      return await func();
    } catch (err) {
      current_intervals++;
      if (current_intervals === max_intervals) {
        console.log('Timed out retrying function');
        throw err;
      }
    }
  }
};
