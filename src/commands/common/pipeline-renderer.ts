import cliSpinners from 'cli-spinners';
import logUpdate from 'log-update';
import { Pipeline, PipelineStep } from '../../pipeline/index.ts';
import { createTable } from '../../utils/table.ts';
import { Inputs } from './inputs.ts';

export class PipelineRenderer {
  private spinner_frame_index = 0;

  public async confirmPipeline(pipeline: Pipeline, autoApprove: boolean): Promise<void> {
    if (autoApprove) {
      return;
    }
    Inputs.assertInteractiveShell('Use the flag \'--auto-approve\' to skip interactive approval');
    this.renderPipeline(pipeline);
    const shouldContinue = await Inputs.promptForContinuation('Do you want to apply the above changes?');
    if (!shouldContinue) {
      Deno.exit(0);
    }
  }

  /**
   * Render the executable graph and the status of each resource
   */
  public renderPipeline(
    pipeline: Pipeline,
    options?: { clear?: boolean; message?: string; disableSpinner?: boolean },
  ): void {
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
            Math.floor(((step.status.endTime || Date.now()) - (step.status.startTime || Date.now())) / 1000) + 's',
            step.status.message || '',
          );

          return row;
        }),
    );

    if (options?.clear && Inputs.isInteractiveShell()) {
      const spinner = cliSpinners.dots.frames[this.spinner_frame_index];
      this.spinner_frame_index = ++this.spinner_frame_index % cliSpinners.dots.frames.length;
      const message = !options.disableSpinner
        ? spinner + ' ' + (options.message || 'Applying changes') + '\n' + table.toString()
        : table.toString();
      if (options.disableSpinner) {
        logUpdate.clear();
      }
      logUpdate(message);
    } else {
      console.log(table.toString());
    }
  }

  /**
   * Helper method to indicate the rendering pipeline is complete
   */
  public doneRenderingPipeline(): void {
    logUpdate.done();
  }
}
