import React, { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux";
import ATCGridSquare from "./ATCGridSquare";
import { AtcAnimation } from "./AtcAnimation";
import { HiddenVolumeSlider } from "../common/HiddenVolumeSlider";
import LiveUTCClock from "../common/LiveUTCClock";
import { Airport } from "../../../settings/liveatc";
import { defaultTheme, getAtcVolume, getSelectedTheme, setAtcVolume } from "../../../app/store/userPreferences/userPreferencesSlice";

interface RadarProps {
  airport: Airport;
  atcSource: string;
  onTrackEnd: () => void;
  onTrackError: () => void;
  onPaused: () => void;
  onCanPlay?: () => void;
  onLoadStart?: () => void;
}

export const Radar: React.FC<RadarProps> = ({ airport, atcSource, onTrackEnd, onTrackError, onPaused, onCanPlay, onLoadStart }) => {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const volume = useSelector(getAtcVolume);
  const dispatch = useDispatch();
  const appTheme = useSelector(getSelectedTheme) || defaultTheme;
  const lastSourceRef = useRef<string>('');

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Track source changes to avoid unnecessary reloads
  useEffect(() => {
    if (atcSource && atcSource !== lastSourceRef.current) {
      lastSourceRef.current = atcSource;

      if (audioElementRef.current) {
        // Only update src if it's actually changed
        if (decodeURI(atcSource) !== audioElementRef.current.src) {
          console.log(`Setting new audio source: ${atcSource}`);
          audioElementRef.current.src = decodeURI(atcSource);
          audioElementRef.current.load();
        }
      }
    }
  }, [atcSource]);

  const handleVolumeChange = (value: number) => {
    dispatch(setAtcVolume(value));
  }

  // Handle errors gracefully
  const handleError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error(`Audio element error for ${atcSource}:`, e);
    if (onTrackError) onTrackError();
  };

  return (
    <div id="radar-container" className="flex-grow relative" style={{ maxHeight: '300px' }}>
      <audio
        ref={audioElementRef}
        autoPlay
        onLoadStart={() => onLoadStart && onLoadStart()}
        onCanPlay={() => onCanPlay && onCanPlay()}
        onEnded={() => onTrackEnd && onTrackEnd()}
        onError={handleError}
        onPause={() => onPaused && onPaused()}
        hidden
      />

      <div id="radar" className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl" style={{ color: appTheme.colors.primary }}>
        <ATCGridSquare color={appTheme.colors.primary} />

        {atcSource &&
          <AtcAnimation color={appTheme.colors.primary} className="absolute top-0 left-0" audioElement={audioElementRef?.current} />
        }

        <div className="absolute top-4 right-4">
          <HiddenVolumeSlider volume={volume} setVolume={handleVolumeChange} color={appTheme.colors.primary} />
        </div>

        <div className="absolute top-4 left-4 flex items-center space-x-1 uppercase">
          <div>{airport?.iata}</div>
        </div>

        <div className="absolute bottom-4 left-4 text-xs">
          <p>{airport?.location.city}, {airport?.location.country}</p>
        </div>

        <div className="absolute bottom-4 right-4 text-xs">
          <p>Local Time: <LiveUTCClock utcOffset={airport?.location?.UTC} /></p>
        </div>
      </div>
    </div>
  )
}