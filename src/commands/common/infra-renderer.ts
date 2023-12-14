import ansiEscapes from 'ansi-escapes';
import cliSpinners from 'cli-spinners';
import logUpdate from 'log-update';
import { InfraGraph, InfraGraphNode } from '../../graphs/index.ts';
import { createTable } from '../../utils/table.ts';
import { Inputs } from './inputs.ts';

export class InfraRendererOptions {
  clear?: boolean;
  message?: string;
  disableSpinner?: boolean;
}

export class InfraRenderer {
  private spinner_frame_index = 0;
  private finished_nodes: string[] = [];
  private last_rendered_nontinteractive = 0;
  private current_graph?: InfraGraph;

  private getDuration(node: InfraGraphNode): string {
    return Math.floor(((node.status.endTime || Date.now()) - (node.status.startTime || Date.now())) / 1000) + 's';
  }

  private graphToTableOutput(graph: InfraGraph): string {
    const headers = ['Name'];
    const showEnvironment = graph.nodes.some((s) => s.environment);
    const showComponent = graph.nodes.some((s) => s.component);

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
      ...graph.nodes
        .sort(
          (first: InfraGraphNode, second: InfraGraphNode) =>
            second.environment?.localeCompare(first.environment || '') ||
            second.component?.localeCompare(first.component || '') ||
            0,
        )
        .map((node: InfraGraphNode) => {
          const row = [node.name];

          if (showComponent) {
            row.push(node.component || '');
          }

          if (showEnvironment) {
            row.push(node.environment || '');
          }

          row.push(
            node.action,
            node.status.state,
            this.getDuration(node),
            node.status.message || '',
          );

          return row;
        }),
    );

    return table.toString();
  }

  public async confirmGraph(
    graph: InfraGraph,
    autoApprove?: boolean,
  ): Promise<void> {
    if (!Inputs.isInteractiveShell()) {
      const tableStr = this.graphToTableOutput(graph);
      console.log(tableStr);
    }
    if (autoApprove) {
      return;
    }
    const tableStr = this.graphToTableOutput(graph);
    console.log(tableStr);
    Inputs.assertInteractiveShell('Use the flag \'--auto-approve\' to skip interactive approval');
    const shouldContinue = await Inputs.promptForContinuation('Do you want to apply the above changes?');
    if (!shouldContinue) {
      Deno.exit(0);
    }

    console.log(ansiEscapes.eraseLines(tableStr.split('\n').length + 2) + ansiEscapes.cursorMove(0, -1));
  }

  private renderGraphNonInteractive(graph: InfraGraph, forcePrint = false) {
    this.current_graph = graph;
    const error_nodes = graph.nodes.filter((node) => node.status.state === 'error');
    for (const node of error_nodes) {
      if (this.finished_nodes.includes(node.getId())) {
        continue;
      }
      this.finished_nodes.push(node.getId());
      console.log(`${node.getId()}: failed with error [ ${node.status.message} ]`);
    }
    if (!forcePrint && Date.now() - this.last_rendered_nontinteractive < 5000) {
      return;
    }
    this.last_rendered_nontinteractive = Date.now();
    if (error_nodes.length > 0) {
      return;
    }
    const running_nodes = graph.nodes.filter((node) => node.status.state === 'applying');
    const completed_nodes = graph.nodes.filter((node) => node.status.state === 'complete');
    for (const node of completed_nodes) {
      if (this.finished_nodes.includes(node.getId())) {
        continue;
      }
      this.finished_nodes.push(node.getId());
      const action = node.action === 'delete' ? 'deleting' : 'applying';
      console.log(`${node.getId()}: Finished ${action} in ${this.getDuration(node)}`);
    }
    for (const node of running_nodes) {
      const action = node.action === 'delete' ? 'deleting' : 'applying';
      console.log(`${node.getId()}: Still ${action}... [${this.getDuration(node)} elapsed]`);
    }
  }

  public renderGraphTable(
    graph: InfraGraph,
    options?: InfraRendererOptions,
  ) {
    const tableStr = this.graphToTableOutput(graph);
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
  public renderGraph(
    graph: InfraGraph,
    options?: { clear?: boolean; message?: string; disableSpinner?: boolean },
  ): void {
    if (Inputs.isInteractiveShell()) {
      this.renderGraphTable(graph, options);
    } else {
      this.renderGraphNonInteractive(graph);
    }
  }

  /**
   * Helper method to indicate the rendering pipeline is complete
   */
  public doneRenderingGraph(): void {
    if (!Inputs.isInteractiveShell() && this.current_graph) {
      this.renderGraphNonInteractive(this.current_graph!, true);
      this.current_graph = undefined;
    }
    this.finished_nodes = [];
    this.last_rendered_nontinteractive = 0;
    logUpdate.done();
  }
}
