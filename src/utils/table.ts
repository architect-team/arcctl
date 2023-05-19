import Table from 'cli-table';

type TableOptions = {
  colWidths: number[];
  colAligns: Array<'left' | 'middle' | 'right'>;
  head: string[];
};

export const createTable = (options: Partial<TableOptions> = {}): Table =>
  new Table({
    ...options,
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: '   ',
    },
    style: { 'padding-left': 0, 'padding-right': 0 },
  });
