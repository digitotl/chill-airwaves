import { Airport } from '../../settings/liveatc';
import { ATC_RECORDS_COUNT } from '../constants/appConstants';
import { EnvironmentService } from './environmentService';

/**
 * Service for handling ATC (Air Traffic Control) API operations
 */
export class AtcApiService {
  /**
   * Builds a playlist of ATC audio URLs for a given airport
   * @param cdnUrl The base CDN URL
   * @param airport The airport to get audio for
   * @param recordsCount Number of records to include in the playlist
   * @returns Array of ATC audio URLs
   */
  static buildAtcPlaylist(
    cdnUrl: string,
    airport: Airport,
    recordsCount = ATC_RECORDS_COUNT
  ): string[] {
    if (!airport) {
      throw new Error('Airport is required to build ATC playlist');
    }

    const atcUrls: string[] = [];

    // Generate URLs for each record
    for (let i = recordsCount; i > 0; i--) {
      const url = this.buildAtcUrl(cdnUrl, airport, recordsCount - i + 1);
      atcUrls.push(url);
    }

    return atcUrls;
  }

  /**
   * Fetches available ATC audio files from the storage bucket for a specific airport
   * @param airport The airport to get audio files for
   * @param cdnUrl The base CDN URL
   * @param maxFiles Maximum number of files to retrieve (defaults to ATC_RECORDS_COUNT)
   * @returns Promise that resolves to array of available file URLs
   */
  static async fetchAvailableFiles(
    airport: Airport,
    cdnUrl: string,
    maxFiles = ATC_RECORDS_COUNT
  ): Promise<string[]> {
    try {
      if (!cdnUrl) {
        throw new Error('CDN URL is required to fetch available ATC files');
      }

      // Construct the airport's directory path
      const directoryPath = `${airport.icao}_${airport.stations[0].path}`;

      // Use Electron API to fetch available files via main process (no CORS)
      const fileNames = await (window as any).electronAPI.fetchAvailableAtcFiles(cdnUrl, directoryPath, maxFiles);

      // Convert to direct CDN URLs
      return fileNames.map((fileName: string) =>
        `${cdnUrl}/${directoryPath}/${fileName}`
      );
    } catch (error) {
      console.error('Error fetching available ATC files:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * Gets the most recent timeframe for ATC records based on current time and offset
   * @param date Current date or specific date to calculate from
   * @param offset Number of 30-minute timeframes to go back
   * @returns Date object adjusted to the start of the requested timeframe
   */
  static getMostRecentTimeframe(date = new Date(), offset = 1): Date {
    // Clone the date to avoid modifying the input
    const timeframe = new Date(date);

    // Set seconds and milliseconds to 0
    timeframe.setUTCSeconds(0);
    timeframe.setUTCMilliseconds(0);

    // Calculate total minutes to subtract (offset * 30)
    const minutesToSubtract = offset * 30;
    timeframe.setUTCMinutes(timeframe.getUTCMinutes() - minutesToSubtract);

    // Round down to the nearest 30-minute interval
    const minutes = timeframe.getUTCMinutes();
    timeframe.setUTCMinutes(minutes < 30 ? 0 : 30);

    return timeframe;
  }

  /**
   * Formats a date for ATC file naming according to the format: YYYY-MM-DD_HHMM
   * @param date The date to format
   * @returns Formatted date string
   */
  static formatTimeframeForFileName(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}_${hours}${minutes}`;
  }

  /**
   * Builds a single ATC audio URL
   * @param cdnUrl The base CDN URL
   * @param airport The airport to get audio for
   * @param offset Number of 30-minute timeframes to go back
   * @returns URL to the ATC audio file
   */
  static buildAtcUrl(cdnUrl: string, airport: Airport, offset = 1): string {
    if (!Number.isInteger(offset) || offset < 1) {
      throw new Error("Offset must be a positive integer");
    }

    // Get the timeframe based on current time and offset
    const timeframe = this.getMostRecentTimeframe(new Date(), offset);

    // Format the date for the filename
    const formattedDate = this.formatTimeframeForFileName(timeframe);

    return `${cdnUrl}/${airport.icao}_${airport.stations[0].path}/${formattedDate}.opus`;
  }

  /**
   * Builds a playlist of ATC audio URLs for a given airport by checking available files
   * @param cdnUrl The base CDN URL
   * @param airport The airport to get audio for
   * @param recordsCount Maximum number of records to include in the playlist
   * @returns Promise that resolves to an array of available ATC audio URLs
   */
  static async buildAtcPlaylistFromAvailable(
    cdnUrl: string,
    airport: Airport,
    recordsCount = ATC_RECORDS_COUNT
  ): Promise<string[]> {
    if (!airport) {
      throw new Error('Airport is required to build ATC playlist');
    }

    try {
      // Fetch available files
      const availableFiles = await this.fetchAvailableFiles(airport, cdnUrl, recordsCount);

      if (availableFiles.length > 0) {
        console.log(`Found ${availableFiles.length} available ATC files for ${airport.icao}`);
        console.log('Available files:', availableFiles);
        return availableFiles;
      } else {
        console.warn(`No available ATC files found for ${airport.icao}, falling back to generated URLs`);
        // Fallback to generated file paths
        return this.buildAtcPlaylist(cdnUrl, airport, recordsCount);
      }
    } catch (error) {
      console.error('Error building ATC playlist from available files:', error);
      // Fallback to generated file paths
      return this.buildAtcPlaylist(cdnUrl, airport, recordsCount);
    }
  }
}