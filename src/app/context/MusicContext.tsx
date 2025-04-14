import React, { useEffect } from "react";
import { YOUTUBE_API_URL, YOUTUBE_SCRIPT_LOAD_TIMEOUT } from "../constants/appConstants";
import { YouTubeErrorHandler } from "../utils/youtubeErrorHandler";

export interface VideoInfo {
  title: string;
  author_name: string;
  author_url: string;
  thumbnail_url: string;
}

export type MusicContextType = {
  youtubePlayer: any;
  videoInfo: VideoInfo | null;
  volume: number;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  pauseTrack: () => void;
  playTrack: () => void;
  isPlayng: boolean;
  isBuffering: boolean;
}

export const MusicContext = React.createContext<MusicContextType | null>(null);

interface MusicProviderProps {
  children: React.ReactNode;
}

function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11}).*$/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

const fetchVideoInfo = async (url: any) => {
  const response = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch video info');
  }

  const data: VideoInfo = await response.json();
  console.log(data);
  return data;
};

const loadYoutubeIrfameAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = YOUTUBE_API_URL;

    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    const timeout = setTimeout(() => {
      reject(new Error('Script load timeout'));
    }, YOUTUBE_SCRIPT_LOAD_TIMEOUT);

    tag.onload = () => {
      clearTimeout(timeout);
      resolve();
    };

    tag.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Script load error'));
    };
  });
}

const createYoutubePlayer = (playlistId: string, onPlayerReady: CallableFunction, onPlayerStateChange?: CallableFunction) => {
  return new Promise((resolve, reject) => {
    const player = new window.YT.Player('youtube-player', {
      height: '390',
      width: '640',
      playerVars: {
        listType: 'playlist',
        list: playlistId,
        loop: 1,
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
      },
      events: {
        onReady: (event: any) => {
          resolve(player)
          onPlayerReady(event)
        },
        onStateChange: onPlayerStateChange,
        onError: (event: any) => {
          console.error(event);
          reject(event);
        }
      }
    });
  })
}


export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [youtubePlayer, setYoutubePlayer] = React.useState<any>(null);
  const [videoInfo, setVideoInfo] = React.useState<VideoInfo | null>(null);
  const [volume, setVolume] = React.useState<number>(5);
  const [isPlayng, setIsPlaying] = React.useState<boolean>(false);
  const [playlistId, setPlaylistId] = React.useState<string | null>(null);
  const [isBuffering, setIsBuffering] = React.useState<boolean>(false);

  useEffect(() => {
    window.electronAPI.getEnv('YOUTUBE_PLAYLIST_ID').then((playlistId: string) => {
      setPlaylistId(playlistId);
    })
  }, []);

  const nextTrack = () => {
    youtubePlayer.nextVideo()
  }

  const previousTrack = () => {
    youtubePlayer.previousVideo()
  }

  const pauseTrack = () => {
    youtubePlayer.pauseVideo()
  }

  const playTrack = () => {
    youtubePlayer.playVideo()
    setIsPlaying(true);
  }

  const onPlayerReady = (event: any) => {
    event.target.playVideo();
    setIsPlaying(true);
  }

  async function onPlayerStateChange(event: any) {
    switch (event.data) {
      case -1:
        console.log('Unstarted');
        break;
      case 0:
        console.log('Video ended');
        setIsBuffering(false);
        break;
      case 1:
        updateVideoInfo(youtubePlayer);
        setIsPlaying(true);
        setIsBuffering(false);
        console.log('Video playing');
        break;
      case 2:
        setIsPlaying(false);
        console.log('Video paused');
        break;
      case 3:
        setIsBuffering(true);
        console.log('Video buffering');
        break;
      case 5:
        console.log('Video cued');
        break;
    }
  }

  const updateVideoInfo = async (youtubePlayer: any) => {
    try {
      const currentUrl = youtubePlayer.getVideoUrl()
      const videoInfo = await fetchVideoInfo(currentUrl)
      setVideoInfo(videoInfo);
    } catch (error) {
      playTrack();
      console.error('Error fetching video info:', error);
    }

  }

  const onError = (event: any) => {
    const errorCode = event.data;
    const errorMessage = YouTubeErrorHandler.getErrorMessage(errorCode);
    console.error(`YouTube Error (${errorCode}): ${errorMessage}`);

    // For recoverable errors, automatically skip to the next track
    if (YouTubeErrorHandler.isRecoverableError(errorCode)) {
      console.log('Attempting recovery by playing next track');
      nextTrack();
    }
  }

  useEffect(() => {
    async function createYoutubeIframe() {
      await loadYoutubeIrfameAPI()
      window.onYouTubeIframeAPIReady = async () => {
        const youtubePlayer: any = await createYoutubePlayer(playlistId, onPlayerReady)
        setYoutubePlayer(youtubePlayer);
      }
    }

    if (playlistId) createYoutubeIframe()

    return () => {
      youtubePlayer?.destroy();
      youtubePlayer?.removeEventListener('onStateChange', onPlayerStateChange)
      youtubePlayer?.removeEventListener('onError', onError)
    }
  }, [playlistId]);

  useEffect(() => {
    if (youtubePlayer) {
      youtubePlayer.setShuffle(true);
      youtubePlayer.nextVideo()
      youtubePlayer.addEventListener('onStateChange', onPlayerStateChange)
      youtubePlayer.addEventListener('onError', onError)
      youtubePlayer.setVolume(volume)
    }
  }, [youtubePlayer]);

  useEffect(() => {
    if (youtubePlayer) {
      youtubePlayer.setVolume(volume)
    }
  }, [volume])

  return (
    <MusicContext.Provider value={{ youtubePlayer, videoInfo, isPlayng, volume, setVolume, nextTrack, previousTrack, pauseTrack, playTrack, isBuffering }}>
      {children}
    </MusicContext.Provider>
  )
}