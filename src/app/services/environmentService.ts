import { Logger } from '../utils/logger';

/**
 * Service for managing access to environment variables
 */
export class EnvironmentService {
  /**
   * Cache for environment variable values to reduce calls to electronAPI
   */
  private static envCache: Record<string, string> = {};

  /**
   * Get an environment variable value
   * @param key The environment variable name
   * @param defaultValue Optional default value if the environment variable is not set
   * @returns The environment variable value or the default value
   */
  static async getEnv(key: string, defaultValue?: string): Promise<string> {
    try {
      // Return from cache if available
      if (this.envCache[key]) {
        return this.envCache[key];
      }

      // Get from electron API
      if (window.electronAPI?.getEnv) {
        const value = await window.electronAPI.getEnv(key);

        if (value) {
          // Cache the value for future use
          this.envCache[key] = value;
          return value;
        }
      }

      // Fall back to default value
      if (defaultValue !== undefined) {
        Logger.warn(`Environment variable "${key}" not found, using default value`, 'env');
        return defaultValue;
      }

      // No value found and no default provided
      throw new Error(`Environment variable "${key}" not found`);
    } catch (error) {
      Logger.exception(error, `Getting environment variable "${key}"`, 'env');
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * Clear the environment variable cache
   */
  static clearCache(): void {
    this.envCache = {};
    Logger.debug('Environment variable cache cleared', 'env');
  }

  /**
   * Check if we're running in a development environment
   * @returns True if running in development mode
   */
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Check if we're running in a production environment
   * @returns True if running in production mode
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}