import { Airport } from '../../settings/liveatc';
import { ATC_RECORDS_COUNT } from '../constants/appConstants';
import { EnvironmentService } from './environmentService';

const ATC_PROTOCOL = 'atc://';

/**
 * Service for handling ATC (Air Traffic Control) API operations
 */
export class AtcApiService {

  static async fetchAvailableFiles(
    airport: Airport,
  ): Promise<string[]> {
    try {
      // Construct the airport's directory path
      const stationPath = `${airport.icao}_${airport.stations[0].path}`;

      // Use Electron API to fetch available files via main process (no CORS)
      const fileNames = await (window as any).electronAPI.fetchAvailableAtcFiles(stationPath);

      // Convert to direct CDN URLs
      return fileNames.map((fileName: string) =>
        `${ATC_PROTOCOL}${stationPath}/${fileName}`
      );
    } catch (error) {
      console.error('Error fetching available ATC files:', error);
      return []; // Return empty array on error
    }
  }


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


  static formatTimeframeForFileName(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}_${hours}${minutes}`;
  }


  static async buildAtcPlaylistFromAvailable(
    airport: Airport,
    recordsCount = ATC_RECORDS_COUNT
  ): Promise<string[]> {
    if (!airport) {
      throw new Error('Airport is required to build ATC playlist');
    }

    const availableFiles = await this.fetchAvailableFiles(airport);
    console.log(`Found ${availableFiles.length} available ATC files for ${airport.icao}`);
    console.log('Available files:', availableFiles);
    return availableFiles;
  }
}