// Logger utility for internal logs. Turn it off if you want silence.

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'LOG';

let enabled = false; // logs are disabled by default
let level: LogLevel = 'INFO';

const LEVELS: Record<LogLevel, number> = {
  'ERROR': 0,
  'WARN': 1,
  'INFO': 2,
  'LOG': 3, // LOG is the most verbose (debug)
};

export function setLoggingEnabled(value: boolean) {
  enabled = value;
}

export function setLogLevel(lvl: LogLevel) {
  level = lvl;
}

function shouldLog(msgLevel: LogLevel): boolean {
  return enabled && LEVELS[msgLevel] <= LEVELS[level];
}

export function log(...args: any[]) {
  if (shouldLog('LOG')) console.log('[LOG]', ...args);
}

export function info(...args: any[]) {
  if (shouldLog('INFO')) console.info('[INFO]', ...args);
}

export function warn(...args: any[]) {
  if (shouldLog('WARN')) console.warn('[WARN]', ...args);
}

export function error(...args: any[]) {
  if (shouldLog('ERROR')) console.error('[ERROR]', ...args);
} 