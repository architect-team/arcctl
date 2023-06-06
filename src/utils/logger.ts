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

const Logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [new transports.Stream({ stream: createEmptyWriteStream() })],
});

export const getLogger = (name: string): winston.Logger => {
  return Logger.child({ name });
};

export const enableDebugLogger = (): void => {
  Logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
};
