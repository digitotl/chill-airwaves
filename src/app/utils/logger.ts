/**
 * Log levels for the application
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Centralized logging utility to standardize logging across the application
 */
export class Logger {
  private static readonly PROD_ENV = process.env.NODE_ENV === 'production';
  private static readonly DEFAULT_NAMESPACE = 'app';

  /**
   * Get the current timestamp in ISO format
   */
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format a log message with timestamp and namespace
   */
  private static formatMessage(namespace: string, message: string): string {
    return `[${this.getTimestamp()}][${namespace}] ${message}`;
  }

  /**
   * Log a message at the DEBUG level (development only)
   * @param message Log message
   * @param namespace Optional namespace to categorize logs
   * @param data Optional data to include in the log
   */
  static debug(message: string, namespace = this.DEFAULT_NAMESPACE, ...data: any[]): void {
    if (!this.PROD_ENV) {
      console.debug(this.formatMessage(namespace, message), ...data);
    }
  }

  /**
   * Log a message at the INFO level
   * @param message Log message
   * @param namespace Optional namespace to categorize logs
   * @param data Optional data to include in the log
   */
  static info(message: string, namespace = this.DEFAULT_NAMESPACE, ...data: any[]): void {
    console.info(this.formatMessage(namespace, message), ...data);
  }

  /**
   * Log a message at the WARN level
   * @param message Log message
   * @param namespace Optional namespace to categorize logs
   * @param data Optional data to include in the log
   */
  static warn(message: string, namespace = this.DEFAULT_NAMESPACE, ...data: any[]): void {
    console.warn(this.formatMessage(namespace, message), ...data);
  }

  /**
   * Log a message at the ERROR level
   * @param message Log message
   * @param namespace Optional namespace to categorize logs
   * @param data Optional data to include in the log
   */
  static error(message: string, namespace = this.DEFAULT_NAMESPACE, ...data: any[]): void {
    console.error(this.formatMessage(namespace, message), ...data);
  }

  /**
   * Log an exception (error object) with stack trace
   * @param error Error object
   * @param context Additional context about where the error occurred
   * @param namespace Optional namespace to categorize logs
   */
  static exception(error: unknown, context = 'Unknown context', namespace = this.DEFAULT_NAMESPACE): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : 'No stack trace available';

    console.error(this.formatMessage(namespace, `Exception in ${context}: ${errorMessage}`));
    console.error(stack);
  }
}