import winston, { format, transports } from 'winston';

const createEmptyWriteStream = (): WritableStream => {
  const writableStream = new WritableStream({
    write(_chunk: any) {
      return new Promise((resolve) => {
        resolve();
      });
    },
  });
  return writableStream;
};

export const getLogger = (name: string): winston.Logger => {
  const Logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [new transports.Stream({ stream: createEmptyWriteStream() })],
  });
  return Logger.child({ name });
};

export const enableDebugLogger = (): void => {
  const Logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [new transports.Stream({ stream: createEmptyWriteStream() })],
  });
  Logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
};
