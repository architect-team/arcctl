import { assertEquals } from 'std/testing/asserts.ts';
import { describe, it } from 'std/testing/bdd.ts';
import { EmptyProviderStore } from '../../@providers/index.ts';
import { PipelineStep } from '../step.ts';

describe('PipelineStep', () => {
  it('should do nothing if status is no-op', () => {
    const step = new PipelineStep({
      name: 'test',
      type: 'database',
      action: 'no-op',
      color: 'blue',
      inputs: {
        name: 'test',
        databaseCluster: 'test-cluster',
        databaseType: 'postgres',
        databaseVersion: '13',
        type: 'database',
        account: 'test-account',
      },
    });

    const originalStep = new PipelineStep(step);

    step.apply({
      providerStore: new EmptyProviderStore(),
    }).subscribe({
      next: () => {
        throw new Error('should not have emitted');
      },
      complete: () => {
        assertEquals(step, originalStep);
      },
      error: () => {
        throw new Error('should not have errored');
      },
    });
  });

  it('should error with invalid account', () => {
    const step = new PipelineStep({
      name: 'test',
      type: 'database',
      action: 'create',
      color: 'blue',
      inputs: {
        name: 'test',
        databaseCluster: 'test-cluster',
        databaseType: 'postgres',
        databaseVersion: '13',
        type: 'database',
        account: 'test-account',
      },
    });

    step.apply({
      providerStore: new EmptyProviderStore(),
    }).subscribe({
      next: () => {
        throw new Error('should not have emitted');
      },
      complete: () => {
        throw new Error('should not have completed');
      },
      error: (err) => {
        assertEquals(err.message, `Invalid account: ${step.inputs?.account}`);
      },
    });
  });
});
