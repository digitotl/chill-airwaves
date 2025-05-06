import { config } from "dotenv";
import { net } from "electron";
import { Logger } from "../app/utils/logger";

const CDN_PROTOCOL = 'cdn';

config({ path: '.env' });

/**
 * Protocol handler for cdn:// URLs that proxies requests to Cloudflare R2
 * This allows direct access to CDN assets throughout the application
 * @param request The incoming request with cdn:// protocol
 * @returns Response from the Cloudflare R2 storage
 */
export const cdnProtocolHandler = async (request: GlobalRequest): Promise<Response> => {
  const CDN_URL = process.env.VITE_CLOUDFLARE_CDN_URL;
  if (!CDN_URL) {
    Logger.error("VITE_CLOUDFLARE_CDN_URL environment variable is not set.", "cdn-protocol");
    return new Response('Internal Server Error: VITE_CLOUDFLARE_CDN_URL not configured', { status: 500 });
  }

  // Extract the path part from the cdn:// URL - skip protocol + ://
  const remoteFilePath = request.url.substring(CDN_PROTOCOL.length + 3);

  // Ensure baseUrl ends with a forward slash
  const baseUrl = CDN_URL.endsWith('/') ? CDN_URL : `${CDN_URL}/`;

  const remoteFileUrl = `${baseUrl}${remoteFilePath}`; // Construct URL with CDN base

  Logger.info(`Proxying CDN request for: ${request.url} to ${remoteFileUrl}`, "cdn-protocol");

  try {
    // Use net.fetch to directly fetch the resource from the remote URL
    const response = await net.fetch(remoteFileUrl);

    // Check if the fetch was successful
    if (!response.ok) {
      Logger.error(`Failed to fetch ${remoteFileUrl}: ${response.status} ${response.statusText}`, "cdn-protocol");
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
    Logger.exception(error, `Error fetching ${remoteFileUrl}`, "cdn-protocol");
    return new Response(`Internal Server Error: ${error.message || 'Unknown error'}`, { status: 500 });
  }
}