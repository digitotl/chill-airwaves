import { Station } from "../settings/liveatc";
import dotenv from 'dotenv';
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Load environment variables
dotenv.config();

export function formatAirportPath(airportIcao: string, station: Station) {
  return `${airportIcao}/${station.path}`;
}

/**
 * Fetches available ATC audio files from the R2 bucket for a specific station.
 * This runs in the Electron main process (no CORS).
 * @param stationPath The station path (e.g. KSFO_Gnd2)
 * @returns Promise<string[]> List of available file names (not full URLs)
 */
export async function fetchAvailableAtcFilesFromR2(stationPath: string): Promise<string[]> {
  try {
    const apiUrl = import.meta.env.VITE_CLOUDFLARE_API_URL;
    const accessKeyId = import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY;
    const bucketName = import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME;
    const maxFiles = Number(process.env.ATC_RECORDS_COUNT || '24');

    if (!apiUrl) {
      throw new Error('VITE_CLOUDFLARE_API_URL environment variable is not set');
    }

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Cloudflare R2 credentials are not configured');
    }

    if (!bucketName) {
      throw new Error('VITE_CLOUDFLARE_BUCKET_NAME environment variable is not set');
    }

    console.log(`Fetching ATC files for station: ${stationPath} from R2 bucket`);

    // Create an S3 client configured to use Cloudflare R2
    const s3Client = new S3Client({
      region: 'auto', // Cloudflare R2 uses 'auto' region
      endpoint: apiUrl,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Create a ListObjectsV2Command to list objects with the stationPath prefix
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: stationPath + '/',
      MaxKeys: maxFiles * 2, // Fetch more than needed to ensure we have enough after filtering
    });

    const response = await s3Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log(`No files found for station: ${stationPath}`);
      return [];
    }

    // Extract filenames, filter for .mp3 files instead of .opus, sort in reverse chronological order
    const fileNames = response.Contents
      .map(item => item.Key?.split('/').pop() || '') // Get just the filename
      .filter(filename => filename && filename.endsWith('.mp3'))
      .sort()
      .reverse();

    console.log(`Found ${fileNames.length} MP3 audio files for station: ${stationPath}`);

    // Return limited number of files
    return fileNames.slice(0, maxFiles);
  } catch (error) {
    console.error('Error fetching ATC files from R2:', error);
    throw error;
  }
}
