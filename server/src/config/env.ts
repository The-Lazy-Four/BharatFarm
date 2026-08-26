import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load .env from the root workspace (three levels up from server/src/config/)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  openRouterApiKey: process.env.OPENROUTER_API_KEY || process.env.AI_PROVIDER_API_KEY || '',
  aiProviderApiKey: process.env.OPENROUTER_API_KEY || process.env.AI_PROVIDER_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'google/gemini-2.5-flash',
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  useMockData: process.env.USE_MOCK_DATA === 'true'
};
