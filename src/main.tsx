import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
// import '@ionic/react/css/palettes/dark.always.css';
// import '@ionic/react/css/palettes/dark.class.css';
import '@ionic/react/css/palettes/dark.system.css';

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
