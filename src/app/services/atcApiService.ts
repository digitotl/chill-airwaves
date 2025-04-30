import { Airport } from '../../settings/liveatc';
import { ATC_RECORDS_COUNT } from '../constants/appConstants';

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
}