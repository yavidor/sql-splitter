import * as logger from './logger-utils.js';

export interface LoggingOptions {
  logs: boolean;
  level: logger.LogLevel;
}

export function setupLogging(options: LoggingOptions): void {
  logger.setLoggingEnabled(options.logs);
  logger.setLogLevel(options.level);
}

export function withTiming<T>(operation: () => Promise<T>, showTime: boolean, label: string): Promise<T> {
  if (showTime) console.time(label);
  return operation().finally(() => {
    if (showTime) console.timeEnd(label);
  });
} 