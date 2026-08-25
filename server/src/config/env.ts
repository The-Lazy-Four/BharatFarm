import dotenv from 'dotenv';
dotenv.config();

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
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  useMockData: process.env.USE_MOCK_DATA === 'true'
};
