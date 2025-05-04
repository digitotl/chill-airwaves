import React, { useEffect, useState } from "react";
import BannerAd from "./common/BannerAd";

export const AdWrapper = () => {
  const [adKey, setAdKey] = useState<number>(0);

  useEffect(() => {
    const getRandomInterval = () => Math.floor(Math.random() * (360000 - 180000) + 180000); // Random between 3-6 minutes in ms

    const interval = setInterval(() => {
      // Change the key to force remount
      setAdKey(prev => prev + 1);
    }, getRandomInterval());

    return () => clearInterval(interval);
  }, []);

  return <BannerAd key={adKey} />;
};
