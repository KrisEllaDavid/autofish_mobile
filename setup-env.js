import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create .env file with the backend server configuration
const envContent = `# AutoFish Mobile App Environment Configuration\nVITE_API_BASE_URL=https://api.autofish.online\n\n# Development settings\nNODE_ENV=production\n`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file (.env) created successfully!');
  console.log('📝 Backend server configured to: https://api.autofish.online');
  console.log('🚀 You can now run the app with: npm run dev');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('📝 Please manually create a .env file with:');
  console.log('VITE_API_BASE_URL=https://api.autofish.online');
} 