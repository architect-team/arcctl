import ansiEscapes from 'ansi-escapes';
import cliSpinners from 'cli-spinners';
import logUpdate from 'log-update';
import { Pipeline, PipelineStep } from '../../pipeline/index.ts';
import { createTable } from '../../utils/table.ts';
import { Inputs } from './inputs.ts';

export class PipelineRendererOptions {
  clear?: boolean;
  message?: string;
  disableSpinner?: boolean;
}

export class PipelineRenderer {
  private spinner_frame_index = 0;
  private finished_steps: string[] = [];
  private last_rendered_nontinteractive = 0;
  private current_pipeline?: Pipeline;

  private getDuration(step: PipelineStep): string {
    return Math.floor(((step.status.endTime || Date.now()) - (step.status.startTime || Date.now())) / 1000) + 's';
  }

  private pipelineToTableOutput(pipeline: Pipeline): string {
    const headers = ['Name', 'Type'];
    const showEnvironment = pipeline.steps.some((s) => s.environment);
    const showComponent = pipeline.steps.some((s) => s.component);

    if (showComponent) {
      headers.push('Component');
    }

    if (showEnvironment) {
      headers.push('Environment');
    }

    headers.push('Action', 'Status', 'Time');
    const table = createTable({
      head: headers,
    });

    table.push(
      ...pipeline.steps
        .sort(
          (first: PipelineStep, second: PipelineStep) =>
            second.environment?.localeCompare(first.environment || '') ||
            second.component?.localeCompare(first.component || '') ||
            0,
        )
        .map((step: PipelineStep) => {
          const row = [step.name, step.type];

          if (showComponent) {
            row.push(step.component || '');
          }

          if (showEnvironment) {
            row.push(step.environment || '');
          }

          row.push(
            step.action,
            step.status.state,
            this.getDuration(step),
            step.status.message || '',
          );

          return row;
        }),
    );

    return table.toString();
  }

  public async confirmPipeline(
    pipeline: Pipeline,
    autoApprove?: boolean,
  ): Promise<void> {
    if (!Inputs.isInteractiveShell()) {
      const tableStr = this.pipelineToTableOutput(pipeline);
      console.log(tableStr);
    }
    if (autoApprove) {
      return;
    }
    const tableStr = this.pipelineToTableOutput(pipeline);
    console.log(tableStr);
    Inputs.assertInteractiveShell('Use the flag \'--auto-approve\' to skip interactive approval');
    const shouldContinue = await Inputs.promptForContinuation('Do you want to apply the above changes?');
    if (!shouldContinue) {
      Deno.exit(0);
    }

    console.log(ansiEscapes.eraseLines(tableStr.split('\n').length + 2) + ansiEscapes.cursorMove(0, -1));
  }

  private renderPipelineNonInteractive(pipeline: Pipeline, forcePrint = false) {
    this.current_pipeline = pipeline;
    const error_steps = pipeline.steps.filter((step) => step.status.state === 'error');
    for (const step of error_steps) {
      if (this.finished_steps.includes(step.id)) {
        continue;
      }
      this.finished_steps.push(step.id);
      console.log(`${step.id}: failed with error [ ${step.status.message} ]`);
    }
    if (!forcePrint && Date.now() - this.last_rendered_nontinteractive < 5000) {
      return;
    }
    this.last_rendered_nontinteractive = Date.now();
    if (error_steps.length > 0) {
      return;
    }
    const running_steps = pipeline.steps.filter((step) => step.status.state === 'applying');
    const completed_steps = pipeline.steps.filter((step) => step.status.state === 'complete');
    for (const step of completed_steps) {
      if (this.finished_steps.includes(step.id)) {
        continue;
      }
      this.finished_steps.push(step.id);
      const action = step.action === 'delete' ? 'deleting' : 'applying';
      console.log(`${step.id}: Finished ${action} in ${this.getDuration(step)}`);
    }
    for (const step of running_steps) {
      const action = step.action === 'delete' ? 'deleting' : 'applying';
      console.log(`${step.id}: Still ${action}... [${this.getDuration(step)} elapsed]`);
    }
  }

  public renderPipelineTable(
    pipeline: Pipeline,
    options?: PipelineRendererOptions,
  ) {
    const tableStr = this.pipelineToTableOutput(pipeline);
    if (options?.clear && Inputs.isInteractiveShell()) {
      const spinner = cliSpinners.dots.frames[this.spinner_frame_index];
      this.spinner_frame_index = ++this.spinner_frame_index % cliSpinners.dots.frames.length;
      const message = !options.disableSpinner
        ? spinner + ' ' + (options.message || 'Applying changes') + '\n' + tableStr
        : tableStr;
      if (options.disableSpinner) {
        logUpdate.clear();
      }
      logUpdate(message);
    } else {
      console.log(tableStr);
    }
  }

  /**
   * Render the executable graph and the status of each resource
   */
  public renderPipeline(
    pipeline: Pipeline,
    options?: { clear?: boolean; message?: string; disableSpinner?: boolean },
  ): void {
    if (Inputs.isInteractiveShell()) {
      this.renderPipelineTable(pipeline, options);
    } else {
      this.renderPipelineNonInteractive(pipeline);
    }
  }

  /**
   * Helper method to indicate the rendering pipeline is complete
   */
  public doneRenderingPipeline(): void {
    if (!Inputs.isInteractiveShell() && this.current_pipeline) {
      this.renderPipelineNonInteractive(this.current_pipeline!, true);
      this.current_pipeline = undefined;
    }
    this.finished_steps = [];
    this.last_rendered_nontinteractive = 0;
    logUpdate.done();
  }
}
