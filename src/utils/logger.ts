export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function shouldLog(level: LogLevel) {
  const env = process.env.NODE_ENV ?? 'development';
  if (env === 'test') return false;
  if (env === 'production') return level !== 'debug';
  return true;
}

export const logger = {
  debug: (...args: unknown[]) => shouldLog('debug') && console.debug(...args),
  info: (...args: unknown[]) => shouldLog('info') && console.info(...args),
  warn: (...args: unknown[]) => shouldLog('warn') && console.warn(...args),
  error: (...args: unknown[]) => shouldLog('error') && console.error(...args),
};

