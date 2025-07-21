import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // https: {
     //  key: fs.readFileSync('./certs/local-key.pem'),
    //   cert: fs.readFileSync('./certs/local-cert.pem'),
  // },
    //host: '0.0.0.0', // Use localhost for camera access over HTTP
    host: 'localhost', // Use localhost for camera access over HTTP
    port: 5173, // Default Vite port
    strictPort: true, // Fail if port is already in use
  },
})
