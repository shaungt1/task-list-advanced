/**
 * Logger utility for consistent logging across the application
 * Provides structured logging with timestamps and log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Set minimum log level based on environment
const MIN_LOG_LEVEL: LogLevel = import.meta.env.VITE_DEV_MODE === 'true' ? 'debug' : 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatLog(entry: LogEntry): string {
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}] ${entry.message}`;
}

function createLogEntry(level: LogLevel, module: string, message: string, data?: unknown): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    data,
  };
}

export function createLogger(module: string) {
  return {
    debug: (message: string, data?: unknown) => {
      if (!shouldLog('debug')) return;
      const entry = createLogEntry('debug', module, message, data);
      console.debug(formatLog(entry), data ?? '');
    },

    info: (message: string, data?: unknown) => {
      if (!shouldLog('info')) return;
      const entry = createLogEntry('info', module, message, data);
      console.info(formatLog(entry), data ?? '');
    },

    warn: (message: string, data?: unknown) => {
      if (!shouldLog('warn')) return;
      const entry = createLogEntry('warn', module, message, data);
      console.warn(formatLog(entry), data ?? '');
    },

    error: (message: string, data?: unknown) => {
      if (!shouldLog('error')) return;
      const entry = createLogEntry('error', module, message, data);
      console.error(formatLog(entry), data ?? '');
    },
  };
}

// Pre-configured loggers for common modules
export const authLogger = createLogger('Auth');
export const dbLogger = createLogger('Database');
export const apiLogger = createLogger('API');