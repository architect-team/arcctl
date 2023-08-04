import cliSpinners from 'cli-spinners';
import logUpdate from 'log-update';

export type SpinnerOptions = {
  type?: cliSpinners.SpinnerName;
  message?: string;
};

type OnFulfilledCb<T> =
  | ((reason: any) => T | PromiseLike<T>)
  | null
  | undefined;

type OnRejectedCb<T> = ((reason: any) => T | PromiseLike<T>) | null | undefined;

type OnFinallyCb = (() => void) | null | undefined;

export class Spinner<T> implements Promise<T> {
  private type: cliSpinners.SpinnerName;
  private message?: string;
  private spinner_frame_index = 0;
  private interval: number;
  private promise: Promise<T>;
  private onFullfilled?: OnFulfilledCb<any>;
  private onRejected?: OnRejectedCb<any>;
  private onFinally?: OnFinallyCb;

  constructor(
    executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void,
    options?: SpinnerOptions,
  ) {
    this.type = options?.type || 'dots';
    this.message = options?.message;
    this.interval = setInterval(() => {
      const spinner = cliSpinners.dots.frames[this.spinner_frame_index];
      this.spinner_frame_index = ++this.spinner_frame_index % cliSpinners.dots.frames.length;

      let message = spinner;
      if (this.message) {
        message += ' ' + this.message;
      }

      logUpdate(message);
    }, cliSpinners[this.type].interval);

    this.promise = new Promise<T>(executor);
    this.promise.then((data: T) => {
      clearInterval(this.interval);
      logUpdate.clear();

      if (this.onFullfilled) {
        this.onFullfilled(data);
      }
    }).catch((data: any) => {
      clearInterval(this.interval);
      logUpdate.clear();

      if (this.onRejected) {
        this.onRejected(data);
      }
    }).finally(() => {
      if (this.onFinally) {
        this.onFinally();
      }
    });
  }

  static all<A extends readonly unknown[] | []>(
    values: A,
    options?: SpinnerOptions,
  ): Promise<{ -readonly [P in keyof A]: Awaited<A[P]> }> {
    return new Spinner((resolve, reject) => {
      Promise.all(values).then(resolve).catch(reject);
    }, options);
  }

  get [Symbol.toStringTag]() {
    return 'Spinner';
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: OnFulfilledCb<TResult1>,
    onrejected?: OnRejectedCb<TResult2>,
  ): Promise<TResult1 | TResult2> {
    this.onFullfilled = onfulfilled;
    this.onRejected = onrejected;
    return this as Promise<TResult1 | TResult2>;
  }

  catch<TResult = never>(
    onrejected?: OnRejectedCb<TResult>,
  ): Promise<T | TResult> {
    this.onRejected = onrejected;
    return this;
  }

  finally(onfinally?: OnFinallyCb): Promise<T> {
    this.onFinally = onfinally;
    return this;
  }
}
