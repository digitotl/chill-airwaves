import { config } from "dotenv";
import { net } from "electron";


const ATC_PROTOCOL = 'atc'

config({ path: '.env' });


export const atcProtocolHandler = async (request: GlobalRequest): Promise<Response> => {
  const CDN_URL = process.env.CLOUDFLARE_CDN_URL; // Use Cloudflare CDN URL
  if (!CDN_URL) {
    console.error("CLOUDFLARE_CDN_URL environment variable is not set.");
    return new Response('Internal Server Error: CLOUDFLARE_CDN_URL not configured', { status: 500 });
  }

  // Extract the path part from the atc:// URL
  const remoteFilePath = request.url.substring(ATC_PROTOCOL.length + 3);
  const remoteFileUrl = `${CDN_URL}/${remoteFilePath}`; // Construct URL with CDN base

  console.log(`Proxying ATC request for: ${request.url} to ${remoteFileUrl}`);

  try {
    // Use net.fetch to directly fetch the resource from the remote URL
    const response = await net.fetch(remoteFileUrl);

    // Check if the fetch was successful
    if (!response.ok) {
      console.error(`Failed to fetch ${remoteFileUrl}: ${response.status} ${response.statusText}`);
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
    console.error(`Error fetching ${remoteFileUrl}:`, error);
    return new Response(`Internal Server Error: ${error.message || 'Unknown error'}`, { status: 500 });
  }
}