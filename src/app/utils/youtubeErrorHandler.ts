/**
 * Helper class to manage YouTube player errors with better error messages
 */
export class YouTubeErrorHandler {
  /**
   * Provides a human-readable error message for YouTube player error codes
   * @param errorCode The error code from the YouTube player
   * @returns A descriptive error message
   */
  static getErrorMessage(errorCode: number): string {
    switch (errorCode) {
      case 2:
        return 'Invalid parameter - The request contains an invalid parameter value';
      case 5:
        return 'HTML5 player error - The requested content cannot be played in HTML5 player';
      case 100:
        return 'Video not found - The video requested was not found or has been removed';
      case 101:
      case 150:
        return 'Video not playable - The owner of the requested video does not allow it to be played in embedded players';
      default:
        return `Unknown YouTube player error (code: ${errorCode})`;
    }
  }

  /**
   * Determines if an error is recoverable (can be fixed by skipping to next track)
   * @param errorCode The error code from the YouTube player
   * @returns True if the error is recoverable
   */
  static isRecoverableError(errorCode: number): boolean {
    return [101, 150].includes(errorCode);
  }
}