import { createSlice } from "@reduxjs/toolkit";
import { AppTheme } from "../userPreferences/userPreferencesSlice";

/**
 * Represents an application error
 */
export interface AppError {
  /** Error code identifier */
  code: string;
  /** User-friendly error message */
  message: string;
  /** Additional error details for debugging */
  details?: unknown;
  /** Timestamp when the error occurred */
  timestamp: number;
}

/**
 * Represents the application state
 */
export interface AppState {
  /** User's email address */
  userEmail: string;
  /** Current version of the application */
  appVersion: string;
  /** Whether premium features are unlocked */
  isUnlocked: boolean;
  /** Available themes in the application */
  themes: AppTheme[];
  /** Current application errors */
  errors: AppError[];
}

export const appSlice = createSlice({
  name: 'app',
  initialState: {
    userEmail: '',
    appVersion: '1.0.0',
    isUnlocked: false,
    themes: [],
    errors: []
  } as AppState,
  reducers: {
    setUserEmail(state, action) {
      state.userEmail = action.payload;
    },
    setIsUnlocked(state, action) {
      state.isUnlocked = action.payload;
    },
    setThemes(state, action) {
      state.themes = action.payload;
    },
    addError(state, action) {
      state.errors.push({
        ...action.payload,
        timestamp: Date.now()
      });
    },
    clearErrors(state) {
      state.errors = [];
    },
    removeError(state, action) {
      const errorIndex = state.errors.findIndex(error =>
        error.code === action.payload.code &&
        error.timestamp === action.payload.timestamp
      );
      if (errorIndex !== -1) {
        state.errors.splice(errorIndex, 1);
      }
    }
  },
  selectors: {
    getUserEmail: (state: AppState) => state.userEmail,
    getIsUnlocked: (state: AppState) => state.isUnlocked,
    getThemes: (state: AppState) => state.themes,
    getErrors: (state: AppState) => state.errors,
    hasErrors: (state: AppState) => state.errors.length > 0
  }
})

export const { setUserEmail, setIsUnlocked, setThemes, addError, clearErrors, removeError } = appSlice.actions;
export const { getUserEmail, getIsUnlocked, getThemes, getErrors, hasErrors } = appSlice.selectors;