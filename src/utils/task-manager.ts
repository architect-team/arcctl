import logUpdate from 'log-update';
import { Observable } from 'rxjs';

export interface Task<T> {
  title: string;
  action: () => Observable<T>;
  finished: boolean;
}

// This class has a slight hack. It assumes that one of the initial promises
// will last for the entire duration of all processes added after the fact.
export default class TaskManager<T> {
  private readonly frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;

  constructor(private readonly tasks: Task<T>[]) {}

  private render(): void {
    const output: string[] = [];
    for (const [index, task] of this.tasks.entries()) {
      if (task.finished) continue;
      const prefix =
        index === 0 ? ` ${this.frames[this.frameIndex++]} ` : '   ';
      if (this.frameIndex >= this.frames.length) {
        this.frameIndex = 0;
      }
      output.push(
        `${prefix}${task.title}`.substring(0, Deno.consoleSize().columns),
      );
    }
    if (output.length > 0) {
      logUpdate(output.join('\n'));
    }
  }

  private runTask(task: Task<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      task.action().subscribe({
        complete: () => {
          task.finished = true;
          resolve();
        },
        error: reject,
      });
    });
  }

  public async run(): Promise<void> {
    const promises = this.tasks.map((task) => {
      return this.runTask(task);
    });
    const intervalId = setInterval(this.render.bind(this), 80);
    await Promise.all(promises);
    clearInterval(intervalId);
    logUpdate.clear();
  }

  public add(task: Task<T>): void {
    this.tasks.push(task);
    this.runTask(task);
  }
}
