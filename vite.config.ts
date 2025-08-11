import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./certs/local-key.pem'),
       cert: fs.readFileSync('./certs/local-cert.pem'),
  },
    host: '0.0.0.0', // Use localhost for camera access over HTTP
    //host: 'localhost', // Use localhost for camera access over HTTP
    port: 5173, // Default Vite port
    strictPort: true, // Fail if port is already in use
    
    // Proxy API requests to avoid CORS during web development only
    // Mobile apps use CapacitorHttp which bypasses CORS naturally
    // This allows web development while keeping mobile implementation unchanged
    proxy: {
      '/api': {
        target: 'https://api.autofish.store',
        changeOrigin: true,
        secure: true,
        headers: {
          'Origin': 'https://api.autofish.store'
        },
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/image-server': {
        target: 'http://31.97.178.131:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/image-server/, '')
      }
    }
  },
})
