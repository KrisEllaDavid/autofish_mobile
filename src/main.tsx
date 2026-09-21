import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Ionic's optional utility sheets are not used by any screen — the app has
   its own layout layer in src/styles. Importing them only adds specificity
   we then have to fight. */

/* No dark palette is imported: the app ships a single light theme, and
   dark.system.css would otherwise repaint Ionic's hosts from the OS setting
   while every screen stayed light. */

/* App styles last, so they win over Ionic's base. */
import "./index.css";
import App from "./App.tsx";
import { setupIonicReact } from '@ionic/react';

// Suppress browser extension runtime errors
const originalError = console.error;
console.error = (...args) => {
  const errorMessage = args[0];
  if (
    typeof errorMessage === 'string' &&
    (errorMessage.includes('runtime.lastError') ||
     errorMessage.includes('message port closed') ||
     errorMessage.includes('Could not establish connection'))
  ) {
    // Suppress these harmless browser extension errors
    return;
  }
  originalError.apply(console, args);
};

setupIonicReact();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
