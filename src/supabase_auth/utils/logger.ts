/**
 * Modular Supabase Auth - Logger Utility
 *
 * Provides structured logging for authentication operations.
 * Logs include timestamps, log levels, and module context.
 */

// ============================================================================
// Types
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
}

interface Logger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}

// ============================================================================
// Configuration
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Set minimum log level based on environment
// In development mode, show all logs including debug
// In production, only show info and above
const MIN_LOG_LEVEL: LogLevel = import.meta.env.VITE_DEV_MODE === 'true' ? 'debug' : 'info';

// ============================================================================
// Helper Functions
// ============================================================================

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

// ============================================================================
// Logger Factory
// ============================================================================

/**
 * Create a logger instance for a specific module.
 *
 * @example
 * ```typescript
 * const logger = createLogger('MyComponent');
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Authentication failed', { error: 'Invalid token' });
 * ```
 */
export function createLogger(module: string): Logger {
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

// ============================================================================
// Pre-configured Loggers
// ============================================================================

/**
 * Pre-configured logger for authentication operations.
 * Use this for all auth-related logging.
 */
export const authLogger = createLogger('Auth');

/**
 * Pre-configured logger for database operations.
 */
export const dbLogger = createLogger('Database');

/**
 * Pre-configured logger for API operations.
 */
export const apiLogger = createLogger('API');

export default authLogger;
