import { Table } from 'cliffy/table/mod.ts';
import { colors } from 'cliffy/ansi/colors.ts';

type TableOptions = {
  minWidth: number;
  maxWidth: number;
  alignment: 'left' | 'center' | 'right';
  head: string[];
};

export const createTable = (options: Partial<TableOptions> = {}): Table => {
  let table = new Table()
    .chars({
      top: '',
      topMid: '',
      topLeft: '',
      topRight: '',
      bottom: '',
      bottomMid: '',
      bottomLeft: '',
      bottomRight: '',
      left: '',
      leftMid: '',
      mid: '',
      midMid: '',
      right: '',
      rightMid: '',
      middle: '   ',
    })
    .indent(2)
    .padding(2);

  if (options.head) {
    // Color header red
    table = table.header(options.head.map((s) => colors.red(s)));
  }
  if (options.alignment) {
    table = table.align(options.alignment);
  }
  if (options.minWidth) {
    table = table.minColWidth(options.minWidth);
  }
  if (options.maxWidth) {
    table = table.maxColWidth(options.maxWidth);
  }

  return table;
};
