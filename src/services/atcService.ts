import { Station } from "../settings/liveatc";
import https from 'https';

export function formatAirportPath(airportIcao: string, station: Station) {
  return `${airportIcao}/${station.path}`;
}

/**
 * Fetches available ATC audio files from the R2 bucket for a specific airport/station.
 * This runs in the Electron main process (no CORS).
 * @param cdnUrl The base Cloudflare CDN URL
 * @param directoryPath The airport directory (e.g. KSFO_Gnd2)
 * @param maxFiles Max number of files to return
 * @returns Promise<string[]> List of available file names (not full URLs)
 */
export async function fetchAvailableAtcFilesFromR2(cdnUrl: string, directoryPath: string, maxFiles: number = 10): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const listUrl = `${cdnUrl}/${directoryPath}/?list-type=2`;
    let data = '';
    https.get(listUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch directory listing: ${res.statusCode}`));
        return;
      }
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        // Simple regex-based XML parsing for file names
        const fileRegex = /<Key>(.*?\.opus)<\/Key>/g;
        const matches = [...data.matchAll(fileRegex)];
        const fileNames = matches.map(match => match[1]).filter(f => f.endsWith('.opus')).sort().reverse();
        resolve(fileNames.slice(0, maxFiles));
      });
    }).on('error', reject);
  });
}
