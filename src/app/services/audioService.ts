import { MIN_VOLUME, MAX_VOLUME } from '../constants/appConstants';

/**
 * Service for handling audio-related operations
 */
export class AudioService {
  /**
   * Validates and normalizes a volume value to be within acceptable bounds
   * @param volume Volume value to normalize
   * @returns Volume value within the valid range
   */
  static normalizeVolume(volume: number): number {
    if (isNaN(volume)) return MIN_VOLUME;
    return Math.min(Math.max(volume, MIN_VOLUME), MAX_VOLUME);
  }

  /**
   * Converts a percentage (0-100) to a decimal value (0-1)
   * @param percentage Volume as a percentage
   * @returns Volume as a decimal value
   */
  static percentageToDecimal(percentage: number): number {
    return this.normalizeVolume(percentage) / 100;
  }

  /**
   * Converts a decimal value (0-1) to a percentage (0-100)
   * @param decimal Volume as a decimal value
   * @returns Volume as a percentage
   */
  static decimalToPercentage(decimal: number): number {
    return Math.round(decimal * 100);
  }

  /**
   * Creates an audio element with the given source URL
   * @param sourceUrl URL of the audio source
   * @param volume Initial volume (0-100)
   * @returns An HTMLAudioElement configured with the source
   */
  static createAudioElement(sourceUrl: string, volume = 50): HTMLAudioElement {
    const audio = new Audio(sourceUrl);
    audio.volume = this.percentageToDecimal(volume);
    return audio;
  }

  /**
   * Sets the volume of an audio element
   * @param audioElement The audio element
   * @param volume Volume level (0-100)
   */
  static setVolume(audioElement: HTMLAudioElement, volume: number): void {
    audioElement.volume = this.percentageToDecimal(volume);
  }
}