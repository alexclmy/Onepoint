/**
 * Centralized logging utility for the Onepoint AI Consulting Tool
 *
 * Features:
 * - Environment-based debug mode control
 * - Structured logging with different levels
 * - Colored console output for better readability
 * - Automatic timestamp and context inclusion
 *
 * Usage:
 * - logger.debug('message', data) - Only shown in development or when DEBUG=true
 * - logger.info('message', data) - General information
 * - logger.warn('message', data) - Warnings
 * - logger.error('message', data) - Errors
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  module?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Check if debug mode is enabled
 * Debug logs are shown only in development or when DEBUG env var is true
 */
const isDebugEnabled = (): boolean => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
  }
  return false;
};

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level: LogLevel, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const levelUpper = level.toUpperCase();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${levelUpper}]${contextStr} ${message}`;
};

/**
 * Get emoji icon for log level
 */
const getIcon = (level: LogLevel): string => {
  switch (level) {
    case 'debug': return '🔍';
    case 'info': return 'ℹ️';
    case 'warn': return '⚠️';
    case 'error': return '❌';
  }
};

/**
 * Logger class with level-based methods
 */
class Logger {
  /**
   * Debug logs - only shown in development mode or when DEBUG=true
   * Use for detailed debugging information
   */
  debug(message: string, context?: LogContext): void {
    if (!isDebugEnabled()) return;

    const icon = getIcon('debug');
    if (context && Object.keys(context).length > 0) {
      console.log(`${icon} ${message}`, context);
    } else {
      console.log(`${icon} ${message}`);
    }
  }

  /**
   * Info logs - general information
   * Use for normal application flow
   */
  info(message: string, context?: LogContext): void {
    const icon = getIcon('info');
    if (context && Object.keys(context).length > 0) {
      console.info(`${icon} ${message}`, context);
    } else {
      console.info(`${icon} ${message}`);
    }
  }

  /**
   * Warning logs - potential issues
   * Use for recoverable errors or important notices
   */
  warn(message: string, context?: LogContext): void {
    const icon = getIcon('warn');
    if (context && Object.keys(context).length > 0) {
      console.warn(`${icon} ${message}`, context);
    } else {
      console.warn(`${icon} ${message}`);
    }
  }

  /**
   * Error logs - critical errors
   * Use for errors that need attention
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const icon = getIcon('error');
    const errorInfo = error instanceof Error ? error.message : String(error);

    if (context && Object.keys(context).length > 0) {
      console.error(`${icon} ${message}`, errorInfo, context);
    } else if (error) {
      console.error(`${icon} ${message}`, errorInfo);
    } else {
      console.error(`${icon} ${message}`);
    }

    // Log stack trace in debug mode
    if (error instanceof Error && isDebugEnabled()) {
      console.error('Stack trace:', error.stack);
    }
  }

  /**
   * Group related logs together
   */
  group(label: string): void {
    if (isDebugEnabled()) {
      console.group(label);
    }
  }

  /**
   * End a log group
   */
  groupEnd(): void {
    if (isDebugEnabled()) {
      console.groupEnd();
    }
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Create a logger with a specific module context
 * Useful for adding module name to all logs from a file
 *
 * @example
 * const log = createModuleLogger('HybridOrchestrator');
 * log.debug('Starting analysis', { actionCount: 3 });
 */
export const createModuleLogger = (module: string) => {
  return {
    debug: (message: string, context?: Omit<LogContext, 'module'>) =>
      logger.debug(message, { module, ...context }),
    info: (message: string, context?: Omit<LogContext, 'module'>) =>
      logger.info(message, { module, ...context }),
    warn: (message: string, context?: Omit<LogContext, 'module'>) =>
      logger.warn(message, { module, ...context }),
    error: (message: string, error?: Error | unknown, context?: Omit<LogContext, 'module'>) =>
      logger.error(message, error, { module, ...context }),
  };
};
