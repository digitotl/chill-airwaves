import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getLastVisitDate,
  getSessionStartTime,
  getStreakCount,
  setLastVisitDate,
  setSessionStartTime,
  incrementStreak,
  resetStreak,
  setStreakCount
} from '../store/userPreferences/userPreferencesSlice';

const MIN_SESSION_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export const useStreakCounter = () => {
  const dispatch = useDispatch();
  const streakCount = useSelector(getStreakCount);
  const lastVisitDate = useSelector(getLastVisitDate);
  const sessionStartTime = useSelector(getSessionStartTime);

  // Initialize session start time and streak count when the app opens
  useEffect(() => {
    // Start session time tracking
    if (!sessionStartTime) {
      dispatch(setSessionStartTime(Date.now()));
    }

    // Make sure the streak count is a valid number
    if (streakCount === undefined || streakCount === null || isNaN(streakCount)) {
      // Initialize with 1 since counter should start at 1 even before 15 min is reached
      dispatch(setStreakCount(1));
      console.log("Initializing streak count to 1");
    } else if (streakCount === 0) {
      // If streak was explicitly reset to 0, start it at 1 again when app is opened
      dispatch(setStreakCount(1));
      console.log("Resetting streak count from 0 to 1");
    }
  }, [dispatch, sessionStartTime, streakCount]);

  // Check and update streak on app load
  useEffect(() => {
    const checkStreak = () => {
      const today = new Date().toDateString();

      // If no lastVisitDate, this is the first time or the streak was reset
      if (!lastVisitDate) {
        // No need to set streakCount to 1 here as we do it in the initialization effect
        return;
      }

      try {
        const lastDate = new Date(lastVisitDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if the last recorded visit was yesterday
        if (lastDate.toDateString() === yesterday.toDateString()) {
          // Increment streak (if it hasn't been incremented yet for today)
          if (today !== lastVisitDate) {
            const newStreak = Number(streakCount) + 1;
            dispatch(setStreakCount(newStreak));
            dispatch(setLastVisitDate(today));
            console.log("Incrementing streak to", newStreak);
          }
        }
        // If last visit wasn't yesterday, reset streak except if it's still today
        else if (lastDate.toDateString() !== today) {
          dispatch(resetStreak());
          // Start at 1 again (counter should always start at 1 when opened)
          dispatch(setStreakCount(1));
          console.log("Resetting streak and starting at 1");
        }
      } catch (error) {
        console.error("Error processing date in streak counter:", error);
        dispatch(resetStreak());
        dispatch(setStreakCount(1));
      }
    };

    checkStreak();
  }, [dispatch, lastVisitDate, streakCount]);

  // Set up an interval to check for 15 minute threshold and save progress
  useEffect(() => {
    const checkSessionTime = () => {
      if (!sessionStartTime) return;

      const currentTime = Date.now();
      const sessionTime = currentTime - sessionStartTime;
      const today = new Date().toDateString();

      console.log("Session time:", Math.floor(sessionTime / 1000 / 60), "minutes");

      // If user has been active for 15+ minutes, record today's date
      if (sessionTime >= MIN_SESSION_TIME && today !== lastVisitDate) {
        dispatch(setLastVisitDate(today));
        console.log("15 minute threshold reached, saving date:", today);
      }
    };

    // Check every minute
    const intervalId = setInterval(checkSessionTime, 60 * 1000);

    // Also run immediately
    checkSessionTime();

    // Check when component unmounts (app closes)
    return () => {
      clearInterval(intervalId);
      checkSessionTime();
    };
  }, [dispatch, lastVisitDate, sessionStartTime]);

  return streakCount;
};