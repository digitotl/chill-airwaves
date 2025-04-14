import ytpl from 'ytpl';
import ytdl from 'ytdl-core';
import * as fs from 'fs';
import * as path from 'path';

export class AtcDownloadService {
  private channelUrl: string;

  constructor(channelUrl: string) {
    this.channelUrl = channelUrl;
  }

  /**
   * Fetch all playlists from the channel and return the playlist that matches the station name.
   */
  async getPlaylistByStation(stationName: string): Promise<ytpl.Result | null> {
    const channel = await ytpl(this.channelUrl, { pages: 1 });
    const playlist = channel.items.find(
      (item) => item.title.replace(/\s/g, '').toLowerCase() === stationName.replace(/\s/g, '').toLowerCase()
    );
    if (!playlist) return null;
    return ytpl(playlist.url, { pages: 1 });
  }

  /**
   * List all records (videos) in the playlist, sorted from most recent to oldest by filename (assumes YYYY-MM-DD_HHmm format).
   */
  async listRecords(stationName: string): Promise<string[]> {
    const playlist = await this.getPlaylistByStation(stationName);
    if (!playlist) throw new Error('Playlist not found for station: ' + stationName);
    const records = playlist.items
      .map((item) => item.title)
      .filter((title) => /^\d{4}-\d{2}-\d{2}_\d{4}/.test(title))
      .sort((a, b) => b.localeCompare(a)); // Descending order
    console.log('Available records for', stationName + ':');
    records.forEach((r) => console.log(r));
    return records;
  }

  /**
   * Download audio from a specific record (video title) in the playlist.
   */
  async downloadAudio(stationName: string, recordTitle: string, outputDir = './downloads') {
    const playlist = await this.getPlaylistByStation(stationName);
    if (!playlist) throw new Error('Playlist not found for station: ' + stationName);
    const video = playlist.items.find((item) => item.title === recordTitle);
    if (!video) throw new Error('Record not found: ' + recordTitle);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, recordTitle.replace(/[^\w.-]/g, '_') + '.mp3');
    const stream = ytdl(video.url, { filter: 'audioonly' });
    stream.pipe(fs.createWriteStream(outputPath));
    return new Promise((resolve, reject) => {
      stream.on('end', () => {
        console.log('Downloaded:', outputPath);
        resolve(outputPath);
      });
      stream.on('error', reject);
    });
  }
}