import { config } from "dotenv";
import { net } from "electron";
import { Logger } from "../app/utils/logger";

const ATC_PROTOCOL_NAME = 'atc';

config({ path: '.env' });

/**
 * Protocol handler for atc:// URLs that proxies requests to Cloudflare R2 CDN
 * Format: atc:///path/to/file.opus
 * @param request The incoming request with atc:// protocol
 * @returns Response from the CDN source
 */
export const atcProtocolHandler = async (request: GlobalRequest): Promise<Response> => {
  const CDN_URL = process.env.CLOUDFLARE_CDN_URL;

  if (!CDN_URL) {
    Logger.error("CLOUDFLARE_CDN_URL environment variable is not set.", "atc-protocol");
    return new Response('Internal Server Error: CLOUDFLARE_CDN_URL not configured', { status: 500 });
  }

  // Extract the path part from the atc:// URL
  const pathPart = request.url.substring(ATC_PROTOCOL_NAME.length + 3);
  const baseUrl = CDN_URL;

  const remoteFileUrl = `${baseUrl}${pathPart}`;

  Logger.info(`Proxying ATC request for: ${request.url} to ${remoteFileUrl}`, "atc-protocol");

  try {
    // Use net.fetch to directly fetch the resource from the remote URL
    const response = await net.fetch(remoteFileUrl);

    // Check if the fetch was successful
    if (!response.ok) {
      Logger.error(`Failed to fetch ${remoteFileUrl}: ${response.status} ${response.statusText}`, "atc-protocol");
      // Return a new response indicating the error
      return new Response(`Failed to fetch resource: ${response.statusText}`, {
        status: response.status,
        statusText: response.statusText,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Return the fetched response directly. Electron will handle the stream.
    return response;

  } catch (error) {
    Logger.exception(error, `Error fetching ${remoteFileUrl}`, "atc-protocol");
    return new Response(`Internal Server Error: ${error.message || 'Unknown error'}`, { status: 500 });
  }
}