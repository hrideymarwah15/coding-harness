import pino from "pino";

export type Logger = pino.Logger;

export function createLogger(level: string = "info"): Logger {
  const isDev = process.env.NODE_ENV !== "production";
  return pino({
    level,
    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            ignore: "pid,hostname",
            translateTime: "HH:MM:ss Z"
          }
        }
      : undefined
  });
}
