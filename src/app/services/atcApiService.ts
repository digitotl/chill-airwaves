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
      const url = this.buildAtcUrl(protocol, airport, i);
      atcUrls.push(url);
    }

    return atcUrls;
  }

  /**
   * Builds a single ATC audio URL
   * @param protocol The protocol to use (http/https)
   * @param airport The airport to get audio for
   * @param recordIndex The index of the record
   * @returns URL to the ATC audio file
   */
  static buildAtcUrl(protocol: string, airport: Airport, recordIndex: number): string {
    if (!airport || !airport.stations || airport.stations.length === 0) {
      throw new Error('Airport must have at least one station');
    }

    const primaryStation = airport.stations[0];
    const basePath = primaryStation.path;
    const formattedIndex = recordIndex.toString().padStart(2, '0');

    return `${protocol}${airport.icao}_${basePath}/${formattedIndex}.mp3`;
  }
}