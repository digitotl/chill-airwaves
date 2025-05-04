import { createSelector, createSlice } from "@reduxjs/toolkit";
import { listenerMiddleware } from "../middlewares/listener";
import { RootState } from "..";
import { airports } from "../../../settings/liveatc";
import { ATC_RECORDS_COUNT } from "../../constants/appConstants";
import { AtcApiService } from "../../services/atcApiService";
import { addError } from "../appState/appSlice";
import { Logger } from "../../utils/logger";
import { EnvironmentService } from "../../services/environmentService";

export const startAppListening = listenerMiddleware.startListening

export interface TrackHistoryRecord {
  track: string;
  progress: number;
}

export interface AirportsState {
  selectedAirportIata: string | null;
  atcPlaylist: {
    tracks: string[];
    currentTrackIndex: number;
  };
  trackHistory: TrackHistoryRecord[];
}

export const atcSlice = createSlice({
  name: 'atc',
  initialState: {
    selectedAirportIata: null,
    atcPlaylist: {
      tracks: [],
      currentTrackIndex: 0,
    },
  } as AirportsState,
  reducers: {
    setSelectedAirportIata(state, action) {
      state.selectedAirportIata = action.payload;
    },
    setAtcPlaylist(state, action) {
      state.atcPlaylist.tracks = action.payload.tracks;
      state.atcPlaylist.currentTrackIndex = 0;
    },
    nextTrack(state) {
      const nextIndex = state.atcPlaylist.currentTrackIndex + 1;
      if (nextIndex < state.atcPlaylist.tracks.length) {
        state.atcPlaylist.currentTrackIndex = nextIndex;
      } else {
        state.atcPlaylist.currentTrackIndex = 0; // Loop back to the start
      }
    },
  },
  selectors: {
    getSelectedAirport: (state: AirportsState) => state.selectedAirportIata,
  },
});


export const getCurrentAtcTrack = createSelector(
  (state: RootState) => state.atc.atcPlaylist.tracks,
  (state: RootState) => state.atc.atcPlaylist.currentTrackIndex,
  (tracks, currentTrackIndex) => tracks[currentTrackIndex]
)

export const { setSelectedAirportIata, setAtcPlaylist, nextTrack } = atcSlice.actions;
export const { getSelectedAirport } = atcSlice.selectors;


startAppListening({
  actionCreator: setSelectedAirportIata,
  effect: async (_, { dispatch, getState }) => {
    try {
      const state = getState() as RootState;
      const selectedAirportIata = state.atc.selectedAirportIata;

      if (!selectedAirportIata) {
        throw new Error('No airport selected');
      }

      const selectedAirport = airports.find(airport => airport.iata === selectedAirportIata);

      if (!selectedAirport) {
        throw new Error(`Airport with IATA code ${selectedAirportIata} not found`);
      }

      Logger.info(`Fetching ATC playlist for ${selectedAirport.name} (${selectedAirportIata})`, 'atc');

      try {
        // Try to build the ATC playlist from available files in R2 storage
        const atcUrls = await AtcApiService.buildAtcPlaylistFromAvailable(
          selectedAirport
        );

        Logger.info(`Generated ATC playlist for ${selectedAirport.name} (${selectedAirportIata}) with ${atcUrls.length} tracks`, 'atc');
        Logger.debug('ATC playlist URLs:', 'atc', atcUrls);

        dispatch(setAtcPlaylist({ tracks: atcUrls }));
      } catch (playlistError) {
        // If fetching available files fails, fall back to the original method
        Logger.warn(`Failed to fetch available files, falling back to generated playlist: ${playlistError.message}`, 'atc');

        //const fallbackUrls = AtcApiService.buildAtcPlaylist(
        //  cdnUrl,
        //  selectedAirport
        //);

        Logger.info(`Generated fallback ATC playlist for ${selectedAirport.name} (${selectedAirportIata})`, 'atc');
        //dispatch(setAtcPlaylist({ tracks: fallbackUrls }));
      }
    } catch (error) {
      Logger.exception(error, 'ATC playlist generation', 'atc');

      dispatch(addError({
        code: 'ATC_PLAYLIST_GENERATION_ERROR',
        message: 'Failed to generate ATC playlist',
        details: error instanceof Error ? error.message : String(error)
      }));
    }
  }
});

