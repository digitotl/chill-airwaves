import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getStreakCount, getSelectedTheme, defaultTheme } from '../../store/userPreferences/userPreferencesSlice';
import { Fire } from '@phosphor-icons/react';

const StreakCounter: React.FC = () => {
  const streakCount = useSelector(getStreakCount);
  const appTheme = useSelector(getSelectedTheme) || defaultTheme;

  // Debug: Log the streakCount value
  useEffect(() => {
    console.log("Current streak count:", streakCount, typeof streakCount);
  }, [streakCount]);

  // The counter should always display, starting from 1, even if 15 min is not achieved yet
  // Only hide it if it's explicitly 0 or invalid
  if (streakCount === 0 || streakCount === null || isNaN(streakCount)) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-1 text-white rounded-full px-3 py-1 shadow-md cursor-default"
      style={{
        background: `linear-gradient(to right, ${appTheme.colors.primary}, ${appTheme.colors.secondary})`
      }}
      title={`${streakCount} day streak! Keep it going by using the app for at least 15 minutes each day.`}
    >
      <Fire className="text-yellow-300" size={20} weight="fill" />
      <span className="font-bold">{streakCount}</span>
    </div>
  );
};

export default StreakCounter;