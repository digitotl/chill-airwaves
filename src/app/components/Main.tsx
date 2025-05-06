import React, { FC, useEffect, useState } from "react";
import { MusicProvider } from "../context/MusicContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { persistor, store } from "../store";
import { HashRouter, Route, Routes } from "react-router-dom"; // Changed from BrowserRouter to HashRouter
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Player } from "./screens/Player";
import { Splashscreen } from "./screens/Splashscreen";
import { Login } from "./screens/Login";
import { ModalProvider } from "../context/ModalContext";
import { PersistGate } from "redux-persist/integration/react";

export const Main: FC = () => {
  const [downloadsPath, setDownloadsPath] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    // Use the exposed environment variables from preload script instead of import.meta.env directly
    // This ensures it works in both development and production builds
    const clientId = window.electronAPI.env.VITE_GOOGLE_CLIENT_ID;
    setGoogleClientId(clientId);

    setTimeout(() => {
      setIsInitialLoading(false);
    }, 4000);
  }, []);


  //if (isInitialLoading) {
  //  return <Splashscreen />
  //}


  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <MusicProvider>
          {googleClientId && <GoogleOAuthProvider clientId={googleClientId}>
            {/*<BackgroundImageOverlay backgroundImageUrl="image://alaska.png" />*/}
            <ModalProvider>
              <HashRouter> {/* Changed from BrowserRouter to HashRouter */}
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Player />} />
                    <Route path="/auth" element={<Login />} />
                  </Routes>
                </AnimatePresence>
              </HashRouter>

              <Toaster
                position="bottom-right"
                reverseOrder={false}
                containerClassName="notification-container"

                toastOptions={{
                  className: 'notification',
                  style: {
                    padding: 0,
                    margin: 0,
                  }
                }}
              />
            </ModalProvider>
          </GoogleOAuthProvider>}
        </MusicProvider>
      </PersistGate>
    </Provider>
  );
}