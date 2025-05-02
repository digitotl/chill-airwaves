import { Airport } from '../../settings/liveatc';
import { ATC_RECORDS_COUNT } from '../constants/appConstants';
import { EnvironmentService } from './environmentService';

/**
 * Service for handling ATC (Air Traffic Control) API operations
 */
export class AtcApiService {
  /**
   * Builds a playlist of ATC audio URLs for a given airport
   * @param protocol The protocol to use (http/https)
   * @param airport The airport to get audio for
   * @param recordsCount Number of records to include in the playlist
   * @returns Array of ATC audio URLs
   */
  static buildAtcPlaylist(
    protocol: string,
    airport: Airport,
    recordsCount = ATC_RECORDS_COUNT
  ): string[] {
    if (!airport) {
      throw new Error('Airport is required to build ATC playlist');
    }

    const atcUrls: string[] = [];

    // Generate URLs for each record
    for (let i = recordsCount; i > 0; i--) {
      const url = this.buildAtcUrl(protocol, airport, recordsCount - i + 1);
      atcUrls.push(url);
    }

    return atcUrls;
  }

  /**
   * Fetches available ATC audio files from the storage bucket for a specific airport
   * @param airport The airport to get audio files for
   * @param maxFiles Maximum number of files to retrieve (defaults to ATC_RECORDS_COUNT)
   * @returns Promise that resolves to array of available file URLs
   */
  static async fetchAvailableFiles(
    airport: Airport,
    protocol: string,
    maxFiles = ATC_RECORDS_COUNT
  ): Promise<string[]> {
    try {
      // Get the CDN URL from environment
      const cdnUrl = await EnvironmentService.getEnv('CLOUDFLARE_CDN_URL');
      if (!cdnUrl) {
        throw new Error('CLOUDFLARE_CDN_URL environment variable is not set');
      }

      // Construct the airport's directory path
      const directoryPath = `${airport.icao}_${airport.stations[0].path}`;
      const listUrl = `${cdnUrl}/${directoryPath}/?list-type=2`; // Using S3-compatible list request

      console.log(`Fetching directory listing from ${listUrl}`);

      // Fetch the directory listing
      const response = await fetch(listUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch directory listing: ${response.status} ${response.statusText}`);
      }

      // Parse XML response to extract file names
      const xmlText = await response.text();

      // Simple regex-based XML parsing for file names
      // This is a basic implementation; consider using a proper XML parser for production
      const fileRegex = /<Key>(.*?\.opus)<\/Key>/g;
      const matches = [...xmlText.matchAll(fileRegex)];

      // Extract file names and sort by name (which should order them by date for our file naming convention)
      const fileNames = matches
        .map(match => match[1])
        .filter(fileName => fileName.endsWith('.opus'))
        .sort()
        .reverse(); // Most recent first

      // Limit the number of files
      const limitedFiles = fileNames.slice(0, maxFiles);

      // Convert to protocol URLs
      return limitedFiles.map(fileName =>
        `${protocol}${directoryPath}/${fileName}`
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
   * @param protocol The protocol to use (http/https)
   * @param airport The airport to get audio for
   * @param offset Number of 30-minute timeframes to go back
   * @returns URL to the ATC audio file
   */
  static buildAtcUrl(protocol: string, airport: Airport, offset = 1): string {
    if (!Number.isInteger(offset) || offset < 1) {
      throw new Error("Offset must be a positive integer");
    }

    // Get the timeframe based on current time and offset
    const timeframe = this.getMostRecentTimeframe(new Date(), offset);

    // Format the date for the filename
    const formattedDate = this.formatTimeframeForFileName(timeframe);

    return `${protocol}${airport.icao}_${airport.stations[0].path}/${formattedDate}.opus`;
  }

  /**
   * Builds a playlist of ATC audio URLs for a given airport by checking available files
   * @param protocol The protocol to use (http/https)
   * @param airport The airport to get audio for
   * @param recordsCount Maximum number of records to include in the playlist
   * @returns Promise that resolves to an array of available ATC audio URLs
   */
  static async buildAtcPlaylistFromAvailable(
    protocol: string,
    airport: Airport,
    recordsCount = ATC_RECORDS_COUNT
  ): Promise<string[]> {
    if (!airport) {
      throw new Error('Airport is required to build ATC playlist');
    }

    try {
      // Fetch available files
      const availableFiles = await this.fetchAvailableFiles(airport, protocol, recordsCount);

      if (availableFiles.length > 0) {
        console.log(`Found ${availableFiles.length} available ATC files for ${airport.icao}`);
        return availableFiles;
      } else {
        console.warn(`No available ATC files found for ${airport.icao}, falling back to generated URLs`);
        // Fallback to generated file paths
        return this.buildAtcPlaylist(protocol, airport, recordsCount);
      }
    } catch (error) {
      console.error('Error building ATC playlist from available files:', error);
      // Fallback to generated file paths
      return this.buildAtcPlaylist(protocol, airport, recordsCount);
    }
  }
}