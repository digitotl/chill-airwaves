// This file is kept as a placeholder for potential future audio processing needs.
// FFmpeg functionality has been removed as ATC audio files are now streamed directly from CDN pre-processed.

// This empty export is kept to maintain file structure in case we need to reintroduce audio processing in the future.
export const removeSilence = async (): Promise<void> => {
  console.warn('removeSilence function is deprecated as ATC files are now streamed pre-processed from CDN');
};