import * as nodeStream from 'stream';
import winston, { format, transports } from 'winston';

const createEmptyWriteStream = (): nodeStream.Writable => {
  const writableStream = new nodeStream.Writable();
  writableStream._write = (chunk: { toString: () => any; }, _encoding: any, next: () => void) => {
    next();
  };
  return writableStream;
};

const Logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new transports.Stream({ stream: createEmptyWriteStream() }),
  ],
});

export const getLogger = (name: string): winston.Logger => {
  return Logger.child({ name });
};

export const enableDebugLogger = (): void => {
  Logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
    ),
  }));
};
